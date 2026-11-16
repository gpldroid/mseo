import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const siteBase = new URL(process.env.MSEO_SITE_URL || 'https://fastseo.site/');
const errors = [];
const exists = async relative => {
  try { await access(path.join(root, relative)); return true; }
  catch { return false; }
};

for (const file of ['_redirects', 'robots.txt', 'sitemap.xml', 'feed.xml']) {
  if (!(await exists(file))) errors.push('Missing routing/SEO file: ' + file);
}

const redirects = [];
if (await exists('_redirects')) {
  const source = await readFile(path.join(root, '_redirects'), 'utf8');
  for (const [index, raw] of source.split(/\r?\n/).entries()) {
    const line = raw.replace(/#.*$/, '').trim();
    if (!line) continue;
    const parts = line.split(/\s+/);
    if (parts.length < 3) {
      errors.push('_redirects:' + (index + 1) + ': expected source destination status');
      continue;
    }
    const [from, to, status] = parts;
    if (!from.startsWith('/') || !/^\d{3}$/.test(status)) {
      errors.push('_redirects:' + (index + 1) + ': invalid redirect source or status');
      continue;
    }
    if (from === to) errors.push('_redirects:' + (index + 1) + ': self-redirect detected: ' + from);
    redirects.push({ from, to, line: index + 1 });
  }
}
const exact = new Map(redirects.filter(r => !/[*:]/.test(r.from) && !/[*:]/.test(r.to) && r.to.startsWith('/')).map(r => [r.from, r]));
for (const redirect of exact.values()) {
  const visited = new Set([redirect.from]);
  let destination = redirect.to;
  while (exact.has(destination)) {
    if (visited.has(destination)) {
      errors.push('_redirects:' + redirect.line + ': redirect loop detected from ' + redirect.from);
      break;
    }
    visited.add(destination);
    destination = exact.get(destination).to;
  }
}

if (await exists('robots.txt')) {
  const robots = await readFile(path.join(root, 'robots.txt'), 'utf8');
  const directives = [...robots.matchAll(/^Sitemap:\s*(\S+)\s*$/gim)].map(match => match[1]);
  const expected = new URL('sitemap.xml', siteBase).href;
  if (directives.length !== 1 || directives[0] !== expected) {
    errors.push('robots.txt must contain exactly one Sitemap directive for ' + expected);
  }
}

if (await exists('sitemap.xml')) {
  const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map(match => match[1].trim());
  if (!sitemap.includes('<urlset') || !urls.length) errors.push('sitemap.xml is empty or malformed.');
  const seen = new Set();
  for (const raw of urls) {
    let url;
    try { url = new URL(raw); } catch { errors.push('Invalid sitemap URL: ' + raw); continue; }
    if (url.origin !== siteBase.origin) errors.push('Sitemap URL uses an unexpected host: ' + raw);
    if (seen.has(url.href)) errors.push('Duplicate sitemap URL: ' + raw);
    seen.add(url.href);
  }
}

if (await exists('feed.xml')) {
  const feed = await readFile(path.join(root, 'feed.xml'), 'utf8');
  const urls = [...feed.matchAll(/<guid\s+isPermaLink="true">([\s\S]*?)<\/guid>/gi)].map(match => match[1].trim());
  if (!feed.includes('<rss') || !feed.includes('<channel>')) errors.push('feed.xml is malformed.');
  const seen = new Set();
  for (const raw of urls) {
    let url;
    try { url = new URL(raw); } catch { errors.push('Invalid RSS item URL: ' + raw); continue; }
    if (url.origin !== siteBase.origin) errors.push('RSS item uses an unexpected host: ' + raw);
    if (seen.has(url.href)) errors.push('Duplicate RSS item URL: ' + raw);
    seen.add(url.href);
  }
}
console.log('Routing audit: checked redirects, robots.txt, sitemap.xml and feed.xml.');
if (errors.length) {
  for (const error of errors) console.error('ERROR ' + error);
  process.exitCode = 1;
} else {
  console.log('Routing audit passed: no exact redirect loops or duplicate/foreign feed and sitemap URLs.');
}
