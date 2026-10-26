import { readFile, writeFile } from 'node:fs/promises';

const siteBase = new URL(process.env.MSEO_SITE_URL || process.env.URL || 'https://fastseo.site/');
if (!siteBase.pathname.endsWith('/')) siteBase.pathname += '/';
const base = siteBase.href;
const catalog = JSON.parse(await readFile(new URL('../data/articles.json', import.meta.url), 'utf8'));
if (!Array.isArray(catalog)) throw new Error('data/articles.json must contain an article array');
const escapeXml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const parseDate = (value) => value && !Number.isNaN(Date.parse(value)) ? new Date(value) : null;
const articles = catalog.slice().sort((a, b) =>
  (parseDate(b.publishedAt || b.updatedAt)?.getTime() ?? 0) -
  (parseDate(a.publishedAt || a.updatedAt)?.getTime() ?? 0)
);
const items = articles.map((article) => {
  if (!article.file || !article.title) throw new Error('Every RSS article needs a title and file');
  const url = new URL('articles/' + article.file, base).href;
  const date = parseDate(article.publishedAt || article.updatedAt);
  return `    <item>\n      <title>${escapeXml(article.title)}</title>\n      <link>${escapeXml(url)}</link>\n      <guid isPermaLink="true">${escapeXml(url)}</guid>\n      <description>${escapeXml(article.description || article.title)}</description>\n      ${article.category ? `<category>${escapeXml(article.category)}</category>\n      ` : ''}${date ? `<pubDate>${date.toUTCString()}</pubDate>\n      ` : ''}</item>`;
});
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n    <title>فاست سيو | Fast Seo</title>\n    <link>${escapeXml(base)}</link>\n    <description>أدلة عربية عملية في تحسين محركات البحث والبرمجة وتطوير المواقع والذكاء الاصطناعي.</description>\n    <language>ar</language>\n    <atom:link href="${escapeXml(new URL('feed.xml', base).href)}" rel="self" type="application/rss+xml" />\n    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n${items.join('\n')}\n  </channel>\n</rss>\n`;
await writeFile(new URL('../feed.xml', import.meta.url), xml);
console.log(`Generated RSS feed with ${articles.length} articles.`);
