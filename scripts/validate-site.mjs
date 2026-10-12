import { readFile, access } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const required = [
  'index.html','assets/css/style.css','assets/css/site.css','assets/css/home-rebuild.css',
  'assets/js/site.js','assets/js/home-rebuild.js','assets/js/archive.js',
  'data/articles.json','pages/archive.html','sitemap.xml','pages/privacy.html','pages/terms.html'
];
for (const path of required) await access(new URL(path, root));
const catalog = JSON.parse(await readFile(new URL('data/articles.json', root), 'utf8'));
for (const item of catalog) await access(new URL('articles/' + item.file, root));
const home = await readFile(new URL('index.html', root), 'utf8');
if (!home.includes('data-home-header') || !home.includes('data-home-footer')) throw new Error('Homepage shared header/footer placeholders are missing');
const css = await readFile(new URL('assets/css/style.css', root), 'utf8');
for (const feature of ['.mseo-header','.mseo-nav','.mseo-search-panel','.mseo-footer','.mseo-scroll-controls','html.dark']) if (!css.includes(feature)) throw new Error('Unified stylesheet missing feature: ' + feature);
console.log(`Site structure OK; ${catalog.length} article records checked.`);
