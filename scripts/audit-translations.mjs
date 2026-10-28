import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const ignoredDirs = new Set(['.git', 'node_modules', 'dist', 'coverage', 'admin-dashboard']);
const htmlFiles = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) await walk(path.join(dir, entry.name));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      htmlFiles.push(path.relative(root, path.join(dir, entry.name)).split(path.sep).join('/'));
    }
  }
}

await walk(root);
htmlFiles.sort();
const languages = new Map();
const missingLang = [];
const hreflangTargets = new Map();

for (const file of htmlFiles) {
  const html = await readFile(path.join(root, file), 'utf8');
  const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] || '';
  const lang = htmlTag.match(/\blang\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase() || '';
  if (!lang) missingLang.push(file);
  else languages.set(lang, (languages.get(lang) || 0) + 1);

  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    if (!/\brel\s*=\s*["'][^"']*\balternate\b[^"']*["']/i.test(tag)) continue;
    const hreflang = tag.match(/\bhreflang\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase();
    const href = tag.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
    if (hreflang && href) {
      const key = file + '|' + hreflang;
      if (hreflangTargets.has(key)) console.warn('WARN ' + file + ': duplicate hreflang=' + hreflang);
      hreflangTargets.set(key, href);
    }
  }
}

console.log('Language coverage audit: ' + htmlFiles.length + ' HTML pages scanned.');
console.log('HTML lang distribution: ' + [...languages.entries()].map(([lang, count]) => lang + '=' + count).join(', '));
console.log('Alternate-language links found: ' + hreflangTargets.size + '.');
if (missingLang.length) {
  console.warn('WARN ' + missingLang.length + ' pages have no html lang attribute: ' + missingLang.slice(0, 20).join(', '));
} else {
  console.log('Language audit passed: every scanned HTML page declares a language.');
}
console.log('This audit reports languages actually present; it does not assume /fr/, /es/, /en/, /ru/ directories or a translation catalog.');
