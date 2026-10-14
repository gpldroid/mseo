import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const fallbackBase = 'https://gpldroid.github.io/mseo/';
const siteBase = new URL(process.env.URL || fallbackBase);
if (!siteBase.pathname.endsWith('/')) siteBase.pathname += '/';
const canonicalPrefix = siteBase.href.replace(/\/$/, '');
const legacyPrefix = 'https://gpldroid.github.io/mseo';
const excludedDirs = new Set(['.git', 'node_modules', 'dist', 'admin-dashboard']);
const excludedFiles = new Set(['404.html', 'pages/admin.html']);
let updated = 0;
let checked = 0;

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!excludedDirs.has(entry.name)) await walk(path.join(directory, entry.name));
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    const file = path.join(directory, entry.name);
    const relative = path.relative(root, file).split(path.sep).join('/');
    if (excludedFiles.has(relative)) continue;
    checked++;
    const before = await readFile(file, 'utf8');
    // Keep the repository's GitHub Pages deployment working while making Netlify's
    // configured primary URL canonical when Netlify builds the production site.
    const after = before.replace(/https:\/\/gpldroid\.github\.io\/mseo(?=\/|["'?#])/g, canonicalPrefix);
    if (after !== before) {
      await writeFile(file, after, 'utf8');
      updated++;
    }
  }
}
await walk(root);

const robotsPath = path.join(root, 'robots.txt');
try {
  const before = await readFile(robotsPath, 'utf8');
  const after = before.replace(/^Sitemap:\s*\S+/mi, 'Sitemap: ' + new URL('sitemap.xml', siteBase).href);
  if (after !== before) await writeFile(robotsPath, after, 'utf8');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
console.log('SEO URL normalization complete: ' + checked + ' HTML pages checked, ' + updated + ' updated; base=' + siteBase.href);
