import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const siteBase = new URL(process.env.MSEO_SITE_URL || 'https://fastseo.site/');
if (!siteBase.pathname.endsWith('/')) siteBase.pathname += '/';
const ignoredFiles = new Set(['404.html', 'article.html', 'pages/admin.html', 'partials/header.html', 'partials/footer.html']);
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
  const lines = html.split(/\r?\n/);
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
    const ogUrlTag = html.match(/<meta\b(?=[^>]*\bproperty\s*=\s*["']og:url["'])[^>]*>/i)?.[0] || '';
    const ogUrl = attr(ogUrlTag, 'content').trim();
    if (ogUrl && canonical && ogUrl !== canonical) critical.push(file + ': og:url does not match canonical URL; expected ' + canonical + ', found ' + ogUrl);
    const head = html.match(/<head\b[\s\S]*?<\/head>/i)?.[0] || '';
    const siteNameTag = head.match(/<meta\b(?=[^>]*\bproperty\s*=\s*["']og:site_name["'])[^>]*>/i)?.[0] || '';
    const siteName = attr(siteNameTag, 'content').trim();
    if (siteName !== 'فاست سيو | Fast Seo') critical.push(file + ': og:site_name must be "فاست سيو | Fast Seo"; found "' + siteName + '"');
    if (head.includes('gpldroid.github.io/mseo') || head.includes('mseopro.netlify.app')) critical.push(file + ': retired hosting domain remains in head metadata');
    if (/\bMSEO\b/.test(head)) critical.push(file + ': legacy MSEO brand remains in head metadata');
    const jsonLdScripts = [...html.matchAll(/<script\b(?=[^>]*\btype\s*=\s*["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi)];
    for (const [index, match] of jsonLdScripts.entries()) {
      try { JSON.parse(match[1]); } catch { critical.push(file + ': invalid JSON-LD syntax in structured-data block #' + (index + 1)); }
    }
    if (title) titlePages.set(title, [...(titlePages.get(title) || []), file]);
    if (description) descPages.set(description, [...(descPages.get(description) || []), file]);
    if (canonical) canonicalPages.set(canonical, [...(canonicalPages.get(canonical) || []), file]);
  }

  for (const match of html.matchAll(/<a\b[^>]*>/gi)) {
    const tag = match[0];
    const line = html.slice(0, match.index).split(/\r?\n/).length;
    const href = attr(tag, 'href').trim();
    const targetBlank = /^_blank$/i.test(attr(tag, 'target').trim());
    const rel = attr(tag, 'rel').toLowerCase().split(/\s+/).filter(Boolean);
    const addLinkWarning = (type, detail) => linkWarnings.push({ type, file, line, href, detail });
    if (targetBlank && !rel.includes('noopener')) addLinkWarning('blank-missing-noopener', 'target="_blank" must include rel="noopener"');
    if (targetBlank && !rel.includes('noreferrer')) addLinkWarning('blank-missing-noreferrer', 'consider rel="noreferrer" to suppress referrer data');
    if (!href || /^(?:#|mailto:|tel:|javascript:|data:)/i.test(href)) continue;

    let url;
    try { url = new URL(href, 'https://mseo-audit.local/' + file); }
    catch { addLinkWarning('invalid-href', 'href cannot be parsed'); continue; }

    const isOwn = url.hostname === 'mseo-audit.local' || ['gpldroid.github.io', 'mseopro.netlify.app', 'fastseo.site'].includes(url.hostname);
    if (!isOwn) {
      if (/^https?:/i.test(href)) externalLinks++;
      continue;
    }
    internalLinks++;
    if (/\/index\.html$/i.test(url.pathname)) {
      addLinkWarning('index-html-link', 'candidate for a clean directory URL; verify the target directory and base-path behavior before changing');
    }

    let pathname;
    try { pathname = decodeURIComponent(url.pathname); }
    catch { addLinkWarning('invalid-path-encoding', 'URL path contains invalid percent encoding'); continue; }
    if (pathname.startsWith('/mseo/')) pathname = pathname.slice('/mseo'.length);
    if (pathname === '/mseo') pathname = '/';
    if (pathname === '/') pathname = '/index.html';
    if (pathname.endsWith('/')) pathname += 'index.html';
    const targetPath = path.join(root, pathname.replace(/^\//, ''));
    try { await access(targetPath); }
    catch { addLinkWarning('broken-internal-link', 'target file or directory index does not exist in the repository'); continue; }

    const targetHtml = pathname.replace(/^\//, '');
    if (/\.html$/i.test(pathname) && !ignoredFiles.has(targetHtml) && !htmlFiles.includes(targetHtml) && !pathname.startsWith('/admin-dashboard/')) {
      addLinkWarning('html-not-in-public-inventory', 'target exists but is excluded from the public HTML inventory');
    }
  }
}
const robotsPath = path.join(root, 'robots.txt');
try {
  const robots = await readFile(robotsPath, 'utf8');
  const sitemapDirectives = [...robots.matchAll(/^Sitemap:\s*(\S+)\s*$/gim)].map((match) => match[1]);
  const expectedSitemap = new URL('sitemap.xml', siteBase).href;
  if (sitemapDirectives.length !== 1 || sitemapDirectives[0] !== expectedSitemap) {
    critical.push('robots.txt: expected exactly one Sitemap directive for ' + expectedSitemap);
  }
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  critical.push('robots.txt: missing file');
}

const duplicates = (map) => [...map.entries()].filter(([, files]) => files.length > 1);
for (const [title, files] of duplicates(titlePages)) critical.push('duplicate title "' + title + '": ' + files.join(', '));
const duplicateDescriptions = duplicates(descPages);
const duplicateCanonicals = duplicates(canonicalPages);
console.log('SEO audit: ' + htmlFiles.length + ' public HTML pages scanned.');
const missingRequiredTags = critical.filter((message) => /: missing (?:title|meta description|canonical URL)$/.test(message)).length;
const duplicateTitleErrors = critical.filter((message) => message.startsWith('duplicate title ')).length;
console.log('Metadata: ' + missingRequiredTags + ' missing required tags; ' + duplicateTitleErrors + ' duplicate-title errors; ' + duplicateDescriptions.length + ' duplicate descriptions; ' + duplicateCanonicals.length + ' duplicate canonical URLs.');
console.log('Links: ' + internalLinks + ' internal links checked; ' + externalLinks + ' external HTTP(S) links found; ' + linkWarnings.length + ' classified link/security findings.');

const warningGroups = new Map();
for (const warning of linkWarnings) {
  const group = warningGroups.get(warning.type) || [];
  group.push(warning);
  warningGroups.set(warning.type, group);
}
for (const [type, warnings] of [...warningGroups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  console.warn('\n[' + type + '] ' + warnings.length + ' finding(s)');
  for (const warning of warnings) {
    console.warn('WARN ' + warning.file + ':' + warning.line + ' | ' + warning.href + ' | ' + warning.detail);
  }
}
for (const error of critical) console.error('ERROR ' + error);
for (const [url, files] of duplicateCanonicals) console.error('ERROR duplicate canonical "' + url + '": ' + files.join(', '));
if (critical.length || duplicateCanonicals.length) process.exitCode = 1;
