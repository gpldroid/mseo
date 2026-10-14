import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const siteBase = new URL(process.env.MSEO_SITE_URL || 'https://gpldroid.github.io/mseo/');
if (!siteBase.pathname.endsWith('/')) siteBase.pathname += '/';
const ignoredFiles = new Set(['404.html', 'article.html', 'pages/admin.html']);
const ignoredDirs = new Set(['.git', 'node_modules', 'dist', 'admin-dashboard']);
const htmlFiles = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) await walk(path.join(dir, entry.name));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      const relative = path.relative(root, path.join(dir, entry.name)).split(path.sep).join('/');
      if (!ignoredFiles.has(relative)) htmlFiles.push(relative);
    }
  }
}
const attr = (tag, name) => {
  const match = tag.match(new RegExp('\\b' + name + '\\s*=\\s*(?:"([^"]*)"|\\x27([^\\x27]*)\\x27)', 'i'));
  return match ? (match[1] ?? match[2] ?? '') : '';
};
await walk(root);
htmlFiles.sort();
const titlePages = new Map();
const descPages = new Map();
const canonicalPages = new Map();
const critical = [];
const linkWarnings = [];
let externalLinks = 0;
let internalLinks = 0;

for (const file of htmlFiles) {
  const html = await readFile(path.join(root, file), 'utf8');
  // Google Search Console verification files must remain untouched; they are not web pages.
  // Skip only their SEO metadata checks while retaining the normal link audit.
  const isGoogleVerificationFile = /^google[a-f0-9]+\.html$/i.test(path.basename(file));
  if (!isGoogleVerificationFile) {
    const title = (html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const descTag = html.match(/<meta\b(?=[^>]*\bname\s*=\s*["']description["'])[^>]*>/i)?.[0] || '';
    const description = attr(descTag, 'content').trim();
    const canonicalTag = html.match(/<link\b(?=[^>]*\brel\s*=\s*["']canonical["'])[^>]*>/i)?.[0] || '';
    const canonical = attr(canonicalTag, 'href').trim();
    if (!title) critical.push(file + ': missing title');
    if (!description) critical.push(file + ': missing meta description');
    if (!canonical) critical.push(file + ': missing canonical URL');
    else {
      const expectedCanonical = file === 'index.html' ? siteBase.href : new URL(file, siteBase).href;
      if (canonical !== expectedCanonical) critical.push(file + ': canonical mismatch; expected ' + expectedCanonical + ', found ' + canonical);
    }
    if (title) titlePages.set(title, [...(titlePages.get(title) || []), file]);
    if (description) descPages.set(description, [...(descPages.get(description) || []), file]);
    if (canonical) canonicalPages.set(canonical, [...(canonicalPages.get(canonical) || []), file]);
  
  
  }

  for (const match of html.matchAll(/<a\b[^>]*>/gi)) {
    const tag = match[0];
    const href = attr(tag, 'href').trim();
    if (!href || /^(?:#|mailto:|tel:|javascript:|data:)/i.test(href)) continue;
    let url;
    try { url = new URL(href, 'https://mseo-audit.local/' + file); }
    catch { linkWarnings.push(file + ': invalid href ' + href); continue; }
    const isOwn = url.hostname === 'mseo-audit.local' || ['gpldroid.github.io', 'mseopro.netlify.app'].includes(url.hostname);
    if (!isOwn) { if (/^https?:/i.test(href)) externalLinks++; continue; }
    internalLinks++;
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.startsWith('/mseo/')) pathname = pathname.slice('/mseo'.length);
    if (pathname === '/mseo') pathname = '/';
    if (pathname === '/') pathname = '/index.html';
    if (pathname.endsWith('/')) pathname += 'index.html';
    const target = path.join(root, pathname.replace(/^\//, ''));
    try { await access(target); }
    catch { linkWarnings.push(file + ': broken internal link ' + href); }
    const targetHtml = pathname.replace(/^\//, '');
    if (/\.html$/i.test(pathname) && !ignoredFiles.has(targetHtml) && !htmlFiles.includes(targetHtml) && !pathname.startsWith('/admin-dashboard/')) {
      linkWarnings.push(file + ': link target is not in the public HTML inventory: ' + href);
    }
    if (/target\s*=\s*["']_blank["']/i.test(tag) && !/\brel\s*=\s*["'][^"']*\bnoopener\b/i.test(tag)) {
      linkWarnings.push(file + ': target="_blank" link missing rel="noopener": ' + href);
    }
  }
}
const duplicates = (map) => [...map.entries()].filter(([, files]) => files.length > 1);
for (const [title, files] of duplicates(titlePages)) critical.push('duplicate title "' + title + '": ' + files.join(', '));
const duplicateDescriptions = duplicates(descPages);
const duplicateCanonicals = duplicates(canonicalPages);
console.log('SEO audit: ' + htmlFiles.length + ' public HTML pages scanned.');
console.log('Metadata: ' + critical.filter(x => x.includes('missing')).length + ' missing required tags; ' + (critical.length - critical.filter(x => x.includes('missing')).length) + ' duplicate-title errors.');
console.log('Links: ' + internalLinks + ' internal links checked; ' + externalLinks + ' external links found; ' + linkWarnings.length + ' internal/security warnings.');
console.log('Duplicate descriptions: ' + duplicateDescriptions.length + '; duplicate canonical URLs: ' + duplicateCanonicals.length + '.');
for (const warning of linkWarnings.slice(0, 100)) console.warn('WARN ' + warning);
if (linkWarnings.length > 100) console.warn('... ' + (linkWarnings.length - 100) + ' additional link warnings omitted.');
for (const error of critical) console.error('ERROR ' + error);
for (const [url, files] of duplicateCanonicals) console.error('ERROR duplicate canonical "' + url + '": ' + files.join(', '));
if (critical.length || duplicateCanonicals.length) process.exitCode = 1;
