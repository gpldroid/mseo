import { readFile, writeFile, readdir } from 'node:fs/promises';
const siteBase = new URL(process.env.MSEO_SITE_URL || process.env.URL || 'https://fastseo.site/');
if (!siteBase.pathname.endsWith('/')) siteBase.pathname += '/';
const base = siteBase.href;
const catalog = JSON.parse(await readFile(new URL('../data/articles.json', import.meta.url), 'utf8'));
const pages = (await readdir(new URL('../pages/', import.meta.url))).filter(f => f.endsWith('.html') && f !== 'admin.html').sort();
const entries = [
  { path: '', freq: 'weekly', priority: '1.0' },
  { path: 'pages/archive.html', freq: 'weekly', priority: '0.8' },
  ...catalog.map(a => ({path: 'articles/' + a.file, freq: 'monthly', priority: '0.8'})),
  ...pages.filter(f => f !== 'archive.html').map(f => ({path: 'pages/' + f, freq: 'weekly', priority: f === 'about.html' || f === 'contact.html' ? '0.6' : '0.6'}))
];
const unique = [...new Map(entries.map(e => [e.path,e])).values()];
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${unique.map(e => `  <url><loc>${base + e.path}</loc><changefreq>${e.freq}</changefreq><priority>${e.priority}</priority></url>`).join('\n')}\n</urlset>\n`;
await writeFile(new URL('../sitemap.xml', import.meta.url), xml);
console.log(`Generated sitemap with ${unique.length} URLs.`);
