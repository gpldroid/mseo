import { readFile, writeFile } from 'node:fs/promises';

const siteBase = new URL(process.env.MSEO_SITE_URL || 'https://fastseo.site/');
if (!siteBase.pathname.endsWith('/')) siteBase.pathname += '/';
const base = siteBase.href;
const catalog = JSON.parse(await readFile(new URL('../data/articles.json', import.meta.url), 'utf8'));
const escapeXML = value => String(value ?? '').replace(/[<>&"']/g, char => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;'
}[char]));
const toDate = value => {
  const date = new Date(value || '');
  if (Number.isNaN(date.getTime())) throw new Error('Invalid or missing article date: ' + value);
  return date.toUTCString();
};
const articles = catalog
  .filter(article => article && article.file && article.title && article.description)
  .slice()
  .sort((a, b) => String(b.updatedAt || b.publishedAt || '').localeCompare(String(a.updatedAt || a.publishedAt || '')))
  .slice(0, 30);

if (!articles.length) throw new Error('Cannot generate RSS feed: no complete article records found.');
const seen = new Set();
for (const article of articles) {
  const url = new URL('articles/' + article.file, base).href;
  if (seen.has(url)) throw new Error('Duplicate RSS item URL: ' + url);
  seen.add(url);
}
const items = articles.map(article => {
  const url = new URL('articles/' + article.file, base).href;
  return [
    '    <item>',
    '      <title>' + escapeXML(article.title) + '</title>',
    '      <link>' + escapeXML(url) + '</link>',
    '      <guid isPermaLink="true">' + escapeXML(url) + '</guid>',
    '      <description>' + escapeXML(article.description) + '</description>',
    article.category ? '      <category>' + escapeXML(article.category) + '</category>' : '',
    '      <pubDate>' + toDate(article.publishedAt || article.updatedAt) + '</pubDate>',
    '    </item>'
  ].filter(Boolean).join('\n');
}).join('\n');

const latestDate = articles.reduce((latest, article) => {
  const candidate = new Date(article.updatedAt || article.publishedAt);
  return candidate > latest ? candidate : latest;
}, new Date(0));
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>فاست سيو | Fast Seo</title>
    <link>${escapeXML(base)}</link>
    <description>أدلة عربية عملية في تحسين محركات البحث والبرمجة وتطوير المواقع والذكاء الاصطناعي.</description>
    <language>ar</language>
    <atom:link href="${escapeXML(new URL('feed.xml', base).href)}" rel="self" type="application/rss+xml" />
    <lastBuildDate>${latestDate.toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
await writeFile(new URL('../feed.xml', import.meta.url), xml, 'utf8');
console.log('Generated RSS feed with ' + articles.length + ' recent articles.');
