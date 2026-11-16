import { access, readFile, readdir, writeFile } from 'node:fs/promises';

const siteBase = new URL(process.env.MSEO_SITE_URL || 'https://fastseo.site/');
if (!siteBase.pathname.endsWith('/')) siteBase.pathname += '/';
const base = siteBase.href;
const catalog = JSON.parse(await readFile(new URL('../data/articles.json', import.meta.url), 'utf8'));
const pageFiles = (await readdir(new URL('../pages/', import.meta.url)))
  .filter(file => file.endsWith('.html') && file !== 'admin.html')
  .sort();
const escapeXML = value => String(value).replace(/[<>&"']/g, char => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;'
}[char]));
const entries = [
  { path: '', freq: 'weekly', priority: '1.0' },
  { path: 'pages/archive.html', freq: 'weekly', priority: '0.8' },
  ...catalog.map(article => ({ path: 'articles/' + article.file, freq: 'monthly', priority: '0.8', lastmod: article.updatedAt || article.publishedAt })),
  ...pageFiles.filter(file => file !== 'archive.html').map(file => ({ path: 'pages/' + file, freq: 'weekly', priority: '0.6' }))
];
const unique = new Map();
for (const entry of entries) {
  if (!entry.path || entry.path.startsWith('/') || entry.path.includes('..')) {
    if (entry.path !== '') throw new Error('Unsafe sitemap path: ' + entry.path);
  }
  if (unique.has(entry.path)) throw new Error('Duplicate sitemap path: ' + entry.path);
  const diskPath = entry.path || 'index.html';
  try { await access(new URL('../' + diskPath, import.meta.url)); }
  catch { throw new Error('Sitemap target does not exist: ' + diskPath); }
  if (entry.lastmod && !/^\d{4}-\d{2}-\d{2}$/.test(entry.lastmod)) {
    throw new Error('Invalid sitemap lastmod for ' + entry.path + ': ' + entry.lastmod);
  }
  unique.set(entry.path, entry);
}
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...unique.values()].map(entry => {
  const loc = new URL(entry.path, base).href;
  return [
    '  <url>',
    '    <loc>' + escapeXML(loc) + '</loc>',
    entry.lastmod ? '    <lastmod>' + entry.lastmod + '</lastmod>' : '',
    '    <changefreq>' + entry.freq + '</changefreq>',
    '    <priority>' + entry.priority + '</priority>',
    '  </url>'
  ].filter(Boolean).join('\n');
}).join('\n')}
</urlset>
`;
await writeFile(new URL('../sitemap.xml', import.meta.url), xml, 'utf8');
console.log('Generated sitemap with ' + unique.size + ' verified URLs (' + catalog.length + ' articles, ' + pageFiles.length + ' public tool/content pages).');
