import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const siteUrl = "https://gpldroid.github.io/mseo";
const feedUrl = siteUrl + "/rss.xml";
const articles = JSON.parse(await readFile(join(root, "data/articles.json"), "utf8"));

const escapeXml = value => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

const toRfc822 = value => {
  if (!value) return new Date().toUTCString();
  const date = new Date(value + "T00:00:00Z");
  return Number.isNaN(date.getTime()) ? new Date().toUTCString() : date.toUTCString();
};

const items = [...articles]
  .filter(article => article.datePublished)
  .sort((a, b) => String(b.datePublished).localeCompare(String(a.datePublished)))
  .map(article => `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(article.url)}</link>
      <guid isPermaLink="true">${escapeXml(article.url)}</guid>
      <description>${escapeXml(article.description)}</description>
      <category>${escapeXml(article.category)}</category>
      <pubDate>${toRfc822(article.datePublished)}</pubDate>
    </item>`)
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>MSEO AI &amp; Web</title>
    <link>${siteUrl}/</link>
    <description>أدلة ومقالات عملية في الذكاء الاصطناعي وتطوير المواقع والبرمجة وSEO.</description>
    <language>ar</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

await writeFile(join(root, "rss.xml"), xml, "utf8");
console.log(`RSS generated: ${articles.length} catalog entries.`);
