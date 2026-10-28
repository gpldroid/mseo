import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const ownHosts = new Set(['fastseo.site', 'www.fastseo.site', 'gpldroid.github.io', 'mseopro.netlify.app']);
const ignoredFiles = new Set(['404.html', 'article.html', 'pages/admin.html']);
const ignoredDirs = new Set(['.git', 'node_modules', 'dist', 'admin-dashboard']);
const htmlFiles = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) await walk(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      const relative = path.relative(root, fullPath).split(path.sep).join('/');
      if (!ignoredFiles.has(relative)) htmlFiles.push(relative);
    }
  }
}

function attr(tag, name) {
  const match = tag.match(new RegExp('\\b' + name + '\\s*=\\s*(?:"([^"]*)"|\\x27([^\\x27]*)\\x27)', 'i'));
  return match ? (match[1] ?? match[2] ?? '').trim() : '';
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

function anchorText(html) {
  return decodeEntities(html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim());
}

function classify(url, rel, tag) {
  const relTokens = rel.toLowerCase().split(/\s+/).filter(Boolean);
  if (relTokens.includes('sponsored') || /(?:affiliate|[?&]ref=|utm_source=affiliate)/i.test(url.href)) return 'promotional-or-affiliate-review';
  if (relTokens.includes('ugc')) return 'user-generated-content';
  if (relTokens.includes('nofollow')) return 'nofollow-review-destination';
  if (/target\s*=\s*["']_blank["']/i.test(tag) && !/\brel\s*=\s*["'][^"']*\bnoopener\b/i.test(tag)) return 'security-review-missing-noopener';
  if (/wikipedia\.org|developers\.|developer\.|support\.|docs\.|\.gov\b|\.edu\b/i.test(url.hostname)) return 'reference-or-documentation-check';
  if (/facebook\.com|instagram\.com|linkedin\.com|youtube\.com|tiktok\.com|x\.com|twitter\.com/i.test(url.hostname)) return 'social-profile-or-post-check';
  return 'manual-review';
}

const csv = (value) => '"' + String(value ?? '').replace(/"/g, '""').replace(/[\r\n]+/g, ' ') + '"';
await walk(root);
htmlFiles.sort();

const links = [];
for (const file of htmlFiles) {
  const html = await readFile(path.join(root, file), 'utf8');
  for (const match of html.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a\s*>/gi)) {
    const tag = match[0].slice(0, match[0].indexOf('>') + 1);
    const href = decodeEntities(attr(tag, 'href'));
    if (!href || /^(?:#|mailto:|tel:|javascript:|data:)/i.test(href)) continue;

    let url;
    try {
      url = new URL(href, 'https://fastseo.site/' + file);
    } catch {
      continue;
    }
    if (!/^https?:$/.test(url.protocol) || ownHosts.has(url.hostname.toLowerCase())) continue;

    const rel = attr(tag, 'rel');
    const text = anchorText(match[1]) || '[empty/image-only anchor]';
    links.push({
      source: file,
      url: url.href,
      host: url.hostname.toLowerCase(),
      anchor: text,
      rel: rel || '',
      target: attr(tag, 'target') || '',
      classification: classify(url, rel, tag),
    });
  }
}

const counts = new Map();
for (const link of links) counts.set(link.url, (counts.get(link.url) || 0) + 1);

console.error('External-link audit: scanned ' + htmlFiles.length + ' HTML files; found ' + links.length + ' external anchor links across ' + counts.size + ' unique URLs.');
console.error('Static audit only: it does not request external sites, verify redirects/status codes, or determine whether a link is harmful to SEO.');
console.error('Classifications are triage hints, not automatic judgments. No links are modified or removed.');
console.log(['source_file', 'url', 'host', 'anchor_text', 'rel', 'target', 'classification', 'occurrences'].map(csv).join(','));
for (const link of links) {
  console.log([
    link.source,
    link.url,
    link.host,
    link.anchor,
    link.rel,
    link.target,
    link.classification,
    counts.get(link.url),
  ].map(csv).join(','));
}
