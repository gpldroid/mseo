import { readFile, readdir, access } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(process.argv[2] || "dist");
const source = path.resolve("migration/source");
const records = JSON.parse(await readFile("data/articles.json", "utf8"));
const pageFiles = (await readdir(path.join(source, "pages"))).filter(x => x.endsWith(".html"));
const failures = [];
console.log("DIST_ARTICLES_ENTRIES:", await readdir(path.join(root, "articles")).catch(() => []));
console.log("DIST_PAGES_ENTRIES:", await readdir(path.join(root, "pages")).catch(() => []));
const exists = async file => access(file).then(() => true).catch(() => false);
const requireFile = async (file, label) => { if (!(await exists(file))) failures.push("Missing " + label + ": " + path.relative(root, file)); };
await requireFile(path.join(root, "index.html"), "homepage");
await requireFile(path.join(root, "sitemap.xml"), "sitemap");
await requireFile(path.join(root, "robots.txt"), "robots.txt");
await requireFile(path.join(root, "ads.txt"), "ads.txt");
await requireFile(path.join(root, "CNAME"), "GitHub Pages CNAME");
await requireFile(path.join(root, "BingSiteAuth.xml"), "Bing verification");
await requireFile(path.join(root, "tracking", "google-analytics.js"), "GA4 script");
await requireFile(path.join(root, "data", "articles.json"), "article data JSON");
await requireFile(path.join(root, "assets", "css", "legacy-utilities.css"), "Tailwind compatibility CSS");
const cssDir = path.join(root, "css"), jsDir = path.join(root, "js");
const cssFiles = await readdir(cssDir).catch(() => []);
const jsFiles = await readdir(jsDir).catch(() => []);
if (!cssFiles.some(x => x.startsWith("fastseo."))) failures.push("Hugo Pipes CSS bundle was not generated");
if (!jsFiles.some(x => x.startsWith("site."))) failures.push("Site JavaScript bundle was not generated");
if (!jsFiles.some(x => x.startsWith("tools."))) failures.push("Tools JavaScript bundle was not generated");

const homepage = await readFile(path.join(root, "index.html"), "utf8").catch(() => "");
for (const phrase of ["آخر المقالات", "مقالات حسب التصنيفات", "تحميل المزيد من المقالات", "أدوات فاست سيو", "site-header", "site-footer"]) {
  if (!homepage.includes(phrase)) failures.push("Homepage is missing expected section or shared element: " + phrase);
}
const missingArticles = [];
for (const article of records) {
  const file = path.join(root, "articles", article.slug + ".html");
  if (!(await exists(file))) missingArticles.push(article.slug);
}
if (missingArticles.length) failures.push("Missing article outputs (" + missingArticles.length + "): " + missingArticles.slice(0, 12).join(", "));
const missingPages = [];
for (const filename of pageFiles) {
  const slug = filename.replace(/\.html$/i, "");
  const file = path.join(root, "pages", slug + ".html");
  if (!(await exists(file))) missingPages.push(slug);
}
if (missingPages.length) failures.push("Missing page outputs (" + missingPages.length + "): " + missingPages.slice(0, 12).join(", "));

const sampleArticle = path.join(root, "articles", (records[0]?.slug || "missing") + ".html");
const articleHtml = await readFile(sampleArticle, "utf8").catch(() => "");
console.log("ARTICLE_OUTPUT_SAMPLE:", articleHtml.slice(0, 1800));
for (const marker of ['site-header', 'site-footer', 'dir=rtl', "application/ld+json"]) {
  if (!articleHtml.includes(marker)) failures.push("Article output missing shared layout/SEO marker: " + marker);
}
const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8").catch(() => "");
const sitemapArticleCount = (sitemap.match(/<loc>https:\/\/fastseo\.site\/articles\//g) || []).length;
if (sitemapArticleCount < records.length) failures.push("Sitemap contains only " + sitemapArticleCount + " article URLs; expected at least " + records.length);
const ads = await readFile(path.join(root, "ads.txt"), "utf8").catch(() => "");
if (!ads.includes("pub-1849282438800062")) failures.push("AdSense publisher record was not preserved");
const ga = await readFile(path.join(root, "tracking", "google-analytics.js"), "utf8").catch(() => "");
if (!ga.includes("G-BDHDY9739D")) failures.push("GA4 measurement ID was not preserved");
if (await exists(path.join(root, "migration"))) failures.push("Migration source files leaked into the public output");

if (failures.length) {
  console.error("Hugo output verification failed:");
  failures.forEach(x => console.error(" - " + x));
  process.exit(1);
}
console.log("Verified Hugo output: " + records.length + " articles, " + pageFiles.length + " pages, homepage, sitemap, assets and tracking files.");
