import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
const catalog = JSON.parse(await readFile(new URL('../data/articles.json', import.meta.url), 'utf8'));
if (!Array.isArray(catalog) || !catalog.length) throw new Error('data/articles.json must contain a non-empty article array');
const seen = new Set();
for (const item of catalog) {
  if (!item.slug || !item.title || !item.category || !item.file) throw new Error('Every article needs slug, title, category and file');
  if (seen.has(item.slug)) throw new Error('Duplicate article slug: ' + item.slug);
  seen.add(item.slug);
  if (!existsSync(new URL('../articles/' + item.file, import.meta.url))) throw new Error('Missing article file: ' + item.file);
}
console.log(`Validated ${catalog.length} article records.`);
