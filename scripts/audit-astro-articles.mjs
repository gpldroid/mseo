import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const catalog = JSON.parse(await readFile(path.join(root, 'data/articles.json'), 'utf8'));
const built = process.argv.includes('--built');
const errors = [];
const slugs = new Set();

for (const item of catalog) {
  const slug = String(item.slug || '');
  const file = String(item.file || (slug + '.html'));
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    errors.push('Invalid slug: ' + slug);
    continue;
  }
  if (slugs.has(slug)) errors.push('Duplicate slug: ' + slug);
  slugs.add(slug);

  const sourcePath = path.join(root, 'articles', file);
  let source;
  try { source = await readFile(sourcePath, 'utf8'); }
  catch { errors.push(slug + ': source file is missing (' + file + ')'); continue; }

  const head = source.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || '';
  const main = source.match(/<main\b[^>]*>[\s\S]*?<\/main>/i)?.[0] || '';
  const canonical = head.match(/<link\b(?=[^>]*\brel\s*=\s*["']canonical["'])[^>]*>/i)?.[0]
    ?.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1] || '';
  const expected = 'https://fastseo.site/articles/' + file;
  if (!head || !main) errors.push(slug + ': source must contain head and main elements');
  if (canonical !== expected) errors.push(slug + ': canonical mismatch (expected ' + expected + ', found ' + canonical + ')');

  if (built) {
    const outputPath = path.join(root, 'dist', 'articles', slug + '.html');
    try { await access(outputPath); }
    catch { errors.push(slug + ': Astro output route is missing (articles/' + slug + '.html)'); continue; }
    const output = await readFile(outputPath, 'utf8');
    if (!output.includes(canonical)) errors.push(slug + ': built route lost its canonical URL');
    if (!output.includes('mseo-3d-system.css')) errors.push(slug + ': built route is missing the shared gold design system');
    if (!output.includes('<main')) errors.push(slug + ': built route is missing article main content');
  }
}

console.log('Astro article audit:', { articles: catalog.length, uniqueSlugs: slugs.size, built });
if (errors.length) {
  for (const error of errors) console.error('ERROR ' + error);
  process.exitCode = 1;
} else {
  console.log('Astro article audit passed.');
}
