import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const siteBase = new URL(process.env.MSEO_SITE_URL || 'https://fastseo.site/');
if (!siteBase.pathname.endsWith('/')) siteBase.pathname += '/';
const ignoredFiles = new Set(['404.html', 'article.html', 'pages/admin.html', 'partials/header.html', 'partials/footer.html']);
const ignoredDirs = new Set(['.git', 'node_modules', 'dist', 'admin-dashboard']);
const BRAND = 'فاست سيو | Fast Seo';
const LOGO = new URL('assets/images/fastseo-logo-header.svg', siteBase).href;

const escapeAttr = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const decodeEntities = value => String(value ?? '').replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|#39);/gi, (entity, code) => {
  if (code[0] === '#') return String.fromCodePoint(code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10));
  return ({ amp:'&', lt:'<', gt:'>', quot:'"', apos:"'", '#39':"'" })[code.toLowerCase()] || entity;
});
const attr = (tag, name) => {
  const match = tag.match(new RegExp('\\b' + name + '\\s*=\\s*(?:"([^"]*)"|\\x27([^\\x27]*)\\x27)', 'i'));
  return match ? (match[1] ?? match[2] ?? '') : '';
};
function upsertMeta(head, keyName, keyValue, content) {
  const pattern = new RegExp('<meta\\b(?=[^>]*\\b' + keyName + '\\s*=\\s*["\\x27]' + keyValue + '["\\x27])[^>]*>', 'i');
  const existing = head.match(pattern)?.[0];
  if (existing) {
    const updated = /\bcontent\s*=/i.test(existing)
      ? existing.replace(/\bcontent\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/i, 'content="' + escapeAttr(content) + '"')
      : existing.replace(/\s*\/?>(\s*)$/, ' content="' + escapeAttr(content) + '">$1');
    return head.replace(existing, updated);
  }
  return head.replace(/<\/head>/i, '  <meta ' + keyName + '="' + escapeAttr(keyValue) + '" content="' + escapeAttr(content) + '">' + '\n</head>');
}
function upsertCanonical(head, href) {
  const pattern = /<link\b(?=[^>]*\brel\s*=\s*["']canonical["'])[^>]*>/i;
  const existing = head.match(pattern)?.[0];
  if (existing) {
    const updated = /\bhref\s*=/i.test(existing)
      ? existing.replace(/\bhref\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/i, 'href="' + escapeAttr(href) + '"')
      : existing.replace(/\s*\/?>(\s*)$/, ' href="' + escapeAttr(href) + '">$1');
    return head.replace(existing, updated);
  }
  return head.replace(/<\/head>/i, '  <link rel="canonical" href="' + escapeAttr(href) + '">' + '\n</head>');
}
async function walk(dir, files = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) await walk(path.join(dir, entry.name), files);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      const relative = path.relative(root, path.join(dir, entry.name)).split(path.sep).join('/');
      if (!ignoredFiles.has(relative)) files.push(relative);
    }
  }
  return files;
}
const files = (await walk(root)).sort();
let changed = 0;
let cleanHomepageLinks = 0;
const issues = [];
for (const file of files) {
  const fullPath = path.join(root, file);
  const original = await readFile(fullPath, 'utf8');
  const match = original.match(/<head\b[\s\S]*?<\/head>/i);
  if (!match) { issues.push(file + ': missing head element'); continue; }
  let head = match[0];
  head = head.replace(/https?:\/\/(?:gpldroid\.github\.io\/mseo|mseopro\.netlify\.app)(?=\/|["'#?])/gi, 'https://fastseo.site');
  head = head.replace(/\bMSEO\b/g, 'Fast Seo');

  const title = decodeEntities((head.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
  const descriptionTag = head.match(/<meta\b(?=[^>]*\bname\s*=\s*["']description["'])[^>]*>/i)?.[0] || '';
  const description = decodeEntities(attr(descriptionTag, 'content').trim());
  if (!title) issues.push(file + ': missing title (left unchanged)');
  if (!description) issues.push(file + ': missing description (left unchanged)');

  const canonical = new URL(file === 'index.html' ? '' : file, siteBase).href;
  head = upsertCanonical(head, canonical);
  head = upsertMeta(head, 'property', 'og:site_name', BRAND);
  head = upsertMeta(head, 'property', 'og:url', canonical);
  if (title) head = upsertMeta(head, 'property', 'og:title', title);
  if (description) head = upsertMeta(head, 'property', 'og:description', description);
  head = upsertMeta(head, 'property', 'og:type', file.startsWith('articles/') ? 'article' : 'website');

  const ogImageTag = head.match(/<meta\b(?=[^>]*\bproperty\s*=\s*["']og:image["'])[^>]*>/i)?.[0] || '';
  const ogImage = decodeEntities(attr(ogImageTag, 'content').trim()) || LOGO;
  head = upsertMeta(head, 'property', 'og:image', ogImage);
  head = upsertMeta(head, 'property', 'og:image:alt', title || BRAND);
  head = upsertMeta(head, 'name', 'twitter:card', 'summary_large_image');
  if (title) head = upsertMeta(head, 'name', 'twitter:title', title);
  if (description) head = upsertMeta(head, 'name', 'twitter:description', description);
  head = upsertMeta(head, 'name', 'twitter:image', ogImage);

  // Normalize relative links back to the homepage without changing article slugs or canonical URLs.
  const withCleanHomepageLinks = original.replace(/(\bhref\s*=\s*)(["'])\.\.\/index\.html(#latest)?\2/gi, (full, prefix, quote, fragment = '') => {
    cleanHomepageLinks++;
    return prefix + quote + '../' + fragment + quote;
  });
  const updated = withCleanHomepageLinks.replace(match[0], head);
  if (updated !== original) {
    await writeFile(fullPath, updated, 'utf8');
    changed++;
  }
}
console.log('SEO metadata normalization: scanned ' + files.length + ' public HTML pages; updated ' + changed + '.');
console.log('Internal homepage links normalized: ' + cleanHomepageLinks + ' (../index.html → ../; fragment anchors preserved).');
for (const issue of issues) console.warn('SEO metadata review required: ' + issue);
