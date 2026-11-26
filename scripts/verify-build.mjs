import { readFile, readdir, access } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(process.argv[2] || "dist");
const source = path.resolve("migration/source");
const records = JSON.parse(await readFile("data/articles.json", "utf8"));
const pageFiles = (await readdir(path.join(source, "pages"))).filter(x => x.endsWith(".html"));
const failures = [];
const exists = async file => access(file).then(() => true).catch(() => false);
const requireFile = async (file, label) => { if (!(await exists(file))) failures.push("Missing " + label + ": " + path.relative(root, file)); };
await requireFile(path.join(root, "index.html"), "homepage");
await requireFile(path.join(root, "sitemap.xml"), "sitemap");
await requireFile(path.join(root, "robots.txt"), "robots.txt");
await requireFile(path.join(root, "favicon.ico"), "Google-compatible favicon");
await requireFile(path.join(root, "favicon.svg"), "SVG browser favicon");
await requireFile(path.join(root, "site.webmanifest"), "web app manifest");
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
const requiredMeta = [
  /<title>/i,
  /name=["']?description["']?/i,
  /name=["']?keywords["']?/i,
  /rel=["']?canonical["']?/i,
  /href=["']?[^ >]*favicon\.ico["']?/i,
  /href=["']?[^ >]*site\.webmanifest["']?/i,
  /property=["']?og:title["']?/i,
  /property=["']?og:description["']?/i,
  /property=["']?og:image["']?/i,
  /name=["']?twitter:card["']?/i
];
for (const pattern of requiredMeta) if (!pattern.test(homepage)) failures.push("Homepage is missing SEO metadata: " + pattern);
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

// Every category with source articles must render a complete archive with one card per article.
const categoryCounts = new Map();
for (const article of records) {
  if (!article.category) continue;
  categoryCounts.set(article.category, (categoryCounts.get(article.category) || 0) + 1);
}
const categorySlug = value => value.toLowerCase().trim()
  .replace(/[^\p{L}\p{N}]+/gu, "-")
  .replace(/^-+|-+$/g, "");
for (const [category, expectedCount] of categoryCounts) {
  const slug = categorySlug(category);
  const categoryFile = path.join(root, "categories", slug + ".html");
  const categoryHtml = await readFile(categoryFile, "utf8").catch(() => "");
  if (!categoryHtml) {
    failures.push("Missing category archive: " + category + " (" + path.relative(root, categoryFile) + ")");
    continue;
  }
  const actualCards = (categoryHtml.match(/<article\s+class="post-card"/g) || []).length;
  if (actualCards !== expectedCount) {
    const debugStart = ["<!-- category-debug","<!-- taxonomy-debug","<!-- term-debug","<!-- list-debug"].map(marker => categoryHtml.indexOf(marker)).find(index => index >= 0) ?? -1;
    const debugEnd = categoryHtml.indexOf("-->", debugStart);
    const debug = debugStart >= 0 && debugEnd >= 0 ? categoryHtml.slice(debugStart, debugEnd + 3) : "no debug marker";
    failures.push("Category archive " + category + " renders " + actualCards + " cards; expected " + expectedCount + ". " + debug);
  }
  for (const article of records.filter(item => item.category === category)) {
    if (!categoryHtml.includes("/articles/" + article.slug + ".html")) {
      failures.push("Category archive " + category + " is missing article link: " + article.slug);
    }
  }
}

const sampleArticle = path.join(root, "articles", (records[0]?.slug || "missing") + ".html");
const articleHtml = await readFile(sampleArticle, "utf8").catch(() => "");
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
