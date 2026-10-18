import { access, readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const root = process.cwd();
const locales = ['fr', 'es', 'en', 'ru'];
const ignored = new Set(['.git', 'node_modules', 'admin-dashboard', 'dist', 'coverage']);
const htmlFiles = [];

async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
  for (const entry of entries) {
    if (entry.isDirectory() && ignored.has(entry.name)) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) await walk(fullPath);
    else if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(fullPath);
  }
}

await walk(root);
const rel = path => relative(root, path).split(sep).join('/');
const htmlByPath = new Map(htmlFiles.map(file => [rel(file), file]));
const catalogPath = join(root, 'data/articles.json');
const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
const baseArticleFiles = new Set(catalog.map(item => item.file));
const localeRootCounts = Object.fromEntries(locales.map(locale => [
  locale,
  htmlFiles.filter(file => rel(file).startsWith(locale + '/')).length
]));
const localeCatalogs = Object.fromEntries(await Promise.all(locales.map(async locale => {
  try {
    await access(join(root, 'data', 'i18n', `articles.${locale}.json`));
    return [locale, true];
  } catch (error) {
    if (error.code === 'ENOENT') return [locale, false];
    throw error;
  }
})));
const translatedArticles = Object.fromEntries(locales.map(locale => {
  const found = [...baseArticleFiles].filter(file => htmlByPath.has(`${locale}/articles/${file}`));
  return [locale, found];
}));
const sitemapLocaleCounts = Object.fromEntries(locales.map(locale => [
  locale,
  (sitemap.match(new RegExp(`<loc>[^<]*/${locale}/[^<]*</loc>`, 'g')) || []).length
]));

console.log('MSEO multilingual coverage audit');
console.log(`Arabic source catalog: ${catalog.length} articles`);
console.log('Expected locale prefixes: /fr/, /es/, /en/, /ru/');
console.log('');
for (const locale of locales) {
  console.log(`${locale.toUpperCase()}: ${localeRootCounts[locale]} HTML files; ${translatedArticles[locale].length}/${catalog.length} same-slug article counterparts; locale catalog: ${localeCatalogs[locale] ? 'present' : 'missing'}; sitemap URLs: ${sitemapLocaleCounts[locale]}`);
}
const missing = locales.filter(locale =>
  !htmlByPath.has(`${locale}/index.html`) ||
  !localeCatalogs[locale] ||
  translatedArticles[locale].length !== catalog.length
);
console.log('');
if (missing.length) {
  console.log(`Coverage gaps detected for: ${missing.join(', ')}.`);
  console.log('This audit checks the documented URL/catalog convention; review any intentionally different translation paths manually.');
  if (process.argv.includes('--strict')) process.exitCode = 1;
} else {
  console.log('All locale entry points and same-slug article counterparts are present.');
}
