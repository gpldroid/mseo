import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const siteBase = new URL(process.env.MSEO_SITE_URL || process.env.URL || 'https://fastseo.site/');
const ignoredDirs = new Set(['.git', 'node_modules', 'dist', 'admin-dashboard']);
const ignoredFiles = new Set(['404.html', 'article.html', 'pages/admin.html']);
const localHosts = new Set(['mseo-audit.local', 'fastseo.site', 'gpldroid.github.io', 'mseopro.netlify.app']);
const failures = [];
const htmlFiles = [];
const cssFiles = [];

function attr(tag, name) {
  const match = tag.match(new RegExp('\\b' + name + '\\s*=\\s*(?:"([^"]*)"|\\x27([^\\x27]*)\\x27|([^\\s>]+))', 'i'));
  return match ? (match[1] ?? match[2] ?? match[3] ?? '') : '';
}

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) await walk(path.join(dir, entry.name));
      continue;
    }
    if (!entry.isFile()) continue;
    const relative = path.relative(root, path.join(dir, entry.name)).split(path.sep).join('/');
    if (entry.name.endsWith('.html') && !ignoredFiles.has(relative)) htmlFiles.push(relative);
    if (entry.name.endsWith('.css')) cssFiles.push(relative);
  }
}

function localTarget(raw, baseFile) {
  const value = String(raw || '').trim();
  if (!value || /^(?:#|data:|blob:|javascript:|mailto:|tel:|about:)/i.test(value) || value.startsWith('//')) return null;
  let url;
  try {
    const base = new URL(baseFile, siteBase);
    url = new URL(value, base);
  } catch {
    return null;
  }
  if (!['http:', 'https:'].includes(url.protocol) || !localHosts.has(url.hostname)) return null;
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); }
  catch { failures.push(baseFile + ': invalid percent-encoding in local asset URL ' + value); return null; }
  if (pathname.startsWith('/mseo/')) pathname = pathname.slice('/mseo'.length);
  if (pathname === '/mseo') pathname = '/';
  if (pathname === '/') pathname = '/index.html';
  if (pathname.endsWith('/')) pathname += 'index.html';
  return path.join(root, pathname.replace(/^\//, ''));
}

async function checkReference(raw, baseFile, description) {
  const target = localTarget(raw, baseFile);
  if (!target) return;
  try { await access(target); }
  catch { failures.push(baseFile + ': missing local ' + description + ' "' + raw + '" (expected ' + path.relative(root, target) + ')'); }
}

await walk(root);
htmlFiles.sort();
cssFiles.sort();
let htmlRefs = 0;
let cssRefs = 0;

for (const file of htmlFiles) {
  const html = await readFile(path.join(root, file), 'utf8');
  for (const match of html.matchAll(/<(img|script|source|video|audio|iframe|embed|object|track|link)\b[^>]*>/gi)) {
    const tag = match[0];
    const name = match[1].toLowerCase();
    const attrs = name === 'link'
      ? (/(?:^|\s)(?:stylesheet|icon|manifest|preload|modulepreload|prefetch|apple-touch-icon|mask-icon)(?:\s|$)/i.test(attr(tag, 'rel')) ? ['href'] : [])
      : name === 'video' ? ['src', 'poster']
      : name === 'object' ? ['data']
      : ['src'];
    for (const key of attrs) {
      const value = attr(tag, key);
      if (!value) continue;
      htmlRefs++;
      await checkReference(value, file, '<' + name + '> ' + key);
    }
  }
}

for (const file of cssFiles) {
  const css = await readFile(path.join(root, file), 'utf8');
  for (const match of css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"]+))\s*\)/gi)) {
    const value = (match[1] ?? match[2] ?? match[3] ?? '').trim();
    if (!value) continue;
    cssRefs++;
    await checkReference(value, file, 'CSS url() asset');
  }
}

console.log('Asset audit: ' + htmlFiles.length + ' HTML pages and ' + cssFiles.length + ' CSS files scanned; ' + htmlRefs + ' HTML references and ' + cssRefs + ' CSS url() references checked.');
if (failures.length) {
  for (const failure of failures.slice(0, 150)) console.error('ERROR ' + failure);
  if (failures.length > 150) console.error('... ' + (failures.length - 150) + ' additional asset errors omitted.');
  process.exitCode = 1;
} else {
  console.log('Asset audit passed: no missing local HTML or CSS assets.');
}
