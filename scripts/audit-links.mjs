import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const siteBase = new URL(process.env.MSEO_SITE_URL || process.env.URL || 'https://fastseo.site/');
const localHosts = new Set(['fastseo.site', 'www.fastseo.site', 'gpldroid.github.io', 'mseopro.netlify.app', 'mseo-audit.local']);
const ignoredDirs = new Set(['.git', 'node_modules', 'dist', 'admin-dashboard']);
const htmlFiles = [];
const failures = [];
const idsByFile = new Map();
let checked = 0;

function attr(tag, name) {
  const match = tag.match(new RegExp('\\b' + name + '\\s*=\\s*(?:"([^"]*)"|\\x27([^\\x27]*)\\x27|([^\\s>]+))', 'i'));
  return match ? (match[1] ?? match[2] ?? match[3] ?? '') : '';
}

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) await walk(path.join(dir, entry.name));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      htmlFiles.push(path.relative(root, path.join(dir, entry.name)).split(path.sep).join('/'));
    }
  }
}

function resolveLocal(raw, source) {
  const value = String(raw || '').trim();
  if (!value || /^(?:mailto:|tel:|javascript:|data:|blob:|about:)/i.test(value) || value.startsWith('//')) return null;
  let url;
  try {
    url = new URL(value, new URL(source, siteBase));
  } catch {
    failures.push(source + ': invalid href "' + value + '"');
    return null;
  }
  if (!['http:', 'https:'].includes(url.protocol) || !localHosts.has(url.hostname)) return null;

  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    failures.push(source + ': invalid URL encoding in href "' + value + '"');
    return null;
  }
  if (pathname === '/mseo' || pathname.startsWith('/mseo/')) pathname = pathname.slice(5) || '/';
  if (pathname === '/') pathname = '/index.html';
  if (pathname.endsWith('/')) pathname += 'index.html';

  const target = path.resolve(root, '.' + pathname);
  if (target !== root && !target.startsWith(root + path.sep)) {
    failures.push(source + ': href escapes the repository root "' + value + '"');
    return null;
  }
  return { target, hash: url.hash ? decodeURIComponent(url.hash.slice(1)) : '', value };
}

await walk(root);
htmlFiles.sort();

for (const file of htmlFiles) {
  const html = await readFile(path.join(root, file), 'utf8');
  const ids = new Set();
  for (const match of html.matchAll(/\b(?:id|name)\s*=\s*(?:"([^"]+)"|'([^']+)')/gi)) {
    ids.add(match[1] ?? match[2]);
  }
  idsByFile.set(file, ids);
}

for (const file of htmlFiles) {
  const html = await readFile(path.join(root, file), 'utf8');
  const markup = html
    .replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, '$1</script>')
    .replace(/(<style\b[^>]*>)[\s\S]*?<\/style>/gi, '$1</style>')
    .replace(/<(textarea|pre|code)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  for (const match of markup.matchAll(/<a\b[^>]*>/gi)) {
    const href = attr(match[0], 'href');
    if (!href) continue;
    const resolved = resolveLocal(href, file);
    if (!resolved) continue;
    checked++;
    let target;
    try {
      await access(resolved.target);
      target = path.relative(root, resolved.target).split(path.sep).join('/');
    } catch {
      failures.push(file + ': broken local link "' + href + '" (expected ' + path.relative(root, resolved.target) + ')');
      continue;
    }
    if (resolved.hash && target.endsWith('.html')) {
      const ids = idsByFile.get(target);
      const generatedTopicAnchor = target === 'pages/topics.html' && /^topic-(seo|web-development|performance|web-design|programming|ai)$/.test(resolved.hash);
      if (ids && !ids.has(resolved.hash) && !generatedTopicAnchor) {
        failures.push(file + ': missing fragment "' + resolved.hash + '" in link "' + href + '"');
      }
    }
  }
}

console.log('Internal-link audit: scanned ' + htmlFiles.length + ' HTML pages and checked ' + checked + ' local links.');
if (failures.length) {
  for (const failure of failures.slice(0, 150)) console.error('ERROR ' + failure);
  if (failures.length > 150) console.error('... ' + (failures.length - 150) + ' additional link errors omitted.');
  process.exitCode = 1;
} else {
  console.log('Internal-link audit passed: no missing local targets or fragments.');
}
