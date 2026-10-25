#!/usr/bin/env node
/**
 * Read-only Google Search Console URL Inspection audit.
 * Uses only Node.js built-ins; never requests indexing or changes Search Console.
 */
import { createSign } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SITE_URL = process.env.SEARCH_CONSOLE_SITE_URL || 'https://fastseo.site/';
const SITEMAP_URL = process.env.SEARCH_CONSOLE_SITEMAP_URL || 'https://fastseo.site/sitemap.xml';
const SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const MAX_URLS = positiveInt(process.env.SEARCH_CONSOLE_MAX_URLS, 2000);
const REPORT_PATH = process.env.SEARCH_CONSOLE_REPORT_PATH || `search-console-audit-${new Date().toISOString().slice(0, 10)}.csv`;
const API_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const INSPECT_URL = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';

function positiveInt(value, fallback) {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
function base64url(value) {
  return Buffer.from(value).toString('base64url');
}
function csv(value) {
  const text = value == null ? '' : String(value);
  return /[",\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function decodeXml(value) {
  return value.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}
function locations(xml) {
  return [...xml.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi)].map(match => decodeXml(match[1].trim()));
}

if (!SERVICE_ACCOUNT_JSON) {
  console.error('Missing GOOGLE_SERVICE_ACCOUNT_JSON. Configure a Google Cloud service-account JSON key as an environment secret.');
  process.exit(2);
}
let serviceAccount;
try {
  serviceAccount = JSON.parse(SERVICE_ACCOUNT_JSON);
} catch {
  console.error('GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON.');
  process.exit(2);
}
if (!serviceAccount.client_email || !serviceAccount.private_key) {
  console.error('Service-account JSON must include client_email and private_key.');
  process.exit(2);
}
const site = new URL(SITE_URL);
if (!SITE_URL.endsWith('/') || !['https:', 'http:'].includes(site.protocol)) {
  console.error('SEARCH_CONSOLE_SITE_URL must be a valid URL-prefix property and include its trailing slash, e.g. https://fastseo.site/.');
  process.exit(2);
}

let accessToken = '';
let tokenExpiresAt = 0;
async function getAccessToken(force = false) {
  if (!force && accessToken && Date.now() < tokenExpiresAt - 60_000) return accessToken;
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: API_SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600
  }));
  const unsigned = header + '.' + claim;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const assertion = unsigned + '.' + signer.sign(serviceAccount.private_key, 'base64url');
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.access_token) {
    throw new Error(`Google OAuth token request failed (${response.status}): ${body.error_description || body.error || 'unknown error'}`);
  }
  accessToken = body.access_token;
  tokenExpiresAt = Date.now() + (Number(body.expires_in) || 3600) * 1000;
  return accessToken;
}

async function fetchSitemap(url, depth = 0, seen = new Set()) {
  if (depth > 4) throw new Error('Sitemap nesting exceeds the safe maximum depth (4).');
  if (seen.has(url)) return [];
  seen.add(url);
  const parsed = new URL(url);
  if (parsed.origin !== site.origin) throw new Error(`Refusing to read a sitemap on another origin: ${url}`);
  const response = await fetch(url, { headers: { 'user-agent': 'FastSEO-SearchConsoleAudit/1.0' }, signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`Sitemap fetch failed (${response.status}): ${url}`);
  const xml = await response.text();
  const locs = locations(xml);
  if (/<sitemapindex\b/i.test(xml)) {
    const nested = await Promise.all(locs.map(child => fetchSitemap(child, depth + 1, seen)));
    return nested.flat();
  }
  return locs;
}

async function inspectUrl(url) {
  let lastError;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const token = await getAccessToken();
      const response = await fetch(INSPECT_URL, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ inspectionUrl: url, siteUrl: SITE_URL, languageCode: 'ar' }),
        signal: AbortSignal.timeout(30_000)
      });
      const body = await response.json().catch(() => ({}));
      if (response.status === 401 && attempt === 0) {
        await getAccessToken(true);
        continue;
      }
      if (response.status === 429 || response.status >= 500) {
        throw Object.assign(new Error(body.error?.message || `Google API returned HTTP ${response.status}`), { retryable: true });
      }
      if (!response.ok) throw new Error(body.error?.message || `Google API returned HTTP ${response.status}`);
      const status = body.inspectionResult?.indexStatusResult || {};
      const page = body.inspectionResult || {};
      return {
        url,
        verdict: status.verdict || '',
        coverageState: status.coverageState || '',
        robotsTxtState: status.robotsTxtState || '',
        indexingState: status.indexingState || '',
        pageFetchState: status.pageFetchState || '',
        lastCrawlTime: status.lastCrawlTime || '',
        googleCanonical: status.googleCanonical || '',
        userCanonical: status.userCanonical || '',
        inspectionResultLink: page.inspectionResultLink || '',
        error: ''
      };
    } catch (error) {
      lastError = error;
      if (!error.retryable || attempt === 3) break;
      await sleep(1000 * (2 ** attempt));
    }
  }
  return {
    url, verdict: '', coverageState: '', robotsTxtState: '', indexingState: '',
    pageFetchState: '', lastCrawlTime: '', googleCanonical: '', userCanonical: '',
    inspectionResultLink: '', error: lastError?.message || 'Unknown inspection error'
  };
}

const rawUrls = await fetchSitemap(SITEMAP_URL);
const urls = [...new Set(rawUrls)].filter(value => {
  try {
    const parsed = new URL(value);
    return parsed.origin === site.origin && parsed.href.startsWith(SITE_URL);
  } catch {
    return false;
  }
});
if (urls.length === 0) {
  console.error('No valid URLs belonging to the configured URL-prefix property were found in the sitemap.');
  process.exit(2);
}
const selected = urls.slice(0, MAX_URLS);
if (urls.length > selected.length) {
  console.warn(`Sitemap contains ${urls.length} eligible URLs; auditing the first ${selected.length} due to SEARCH_CONSOLE_MAX_URLS.`);
}
console.log(`Auditing ${selected.length} sitemap URLs for ${SITE_URL} (read-only; no indexing requests will be sent).`);
const results = [];
for (let i = 0; i < selected.length; i++) {
  const result = await inspectUrl(selected[i]);
  results.push(result);
  if ((i + 1) % 25 === 0 || i + 1 === selected.length) {
    console.log(`Progress: ${i + 1}/${selected.length}`);
  }
  // Keep a conservative request rate and avoid bursts against Search Console quotas.
  if (i + 1 < selected.length) await sleep(300);
}

const fields = ['url','verdict','coverageState','robotsTxtState','indexingState','pageFetchState','lastCrawlTime','googleCanonical','userCanonical','inspectionResultLink','error'];
const csvText = [fields.join(','), ...results.map(row => fields.map(field => csv(row[field])).join(','))].join('\n') + '\n';
const absoluteReportPath = path.resolve(REPORT_PATH);
await mkdir(path.dirname(absoluteReportPath), { recursive: true });
await writeFile(absoluteReportPath, csvText, 'utf8');

const tally = new Map();
for (const row of results) {
  const key = row.error ? 'API errors' : (row.coverageState || row.verdict || 'Unknown');
  tally.set(key, (tally.get(key) || 0) + 1);
}
console.log('\nAudit summary:');
for (const [state, count] of [...tally.entries()].sort((a,b) => b[1] - a[1])) {
  console.log(`- ${state}: ${count}`);
}
console.log(`Report written to: ${absoluteReportPath}`);
if (results.some(row => row.error)) process.exitCode = 1;
