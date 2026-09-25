import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const dir = join(root, "articles");
const base = "https://gpldroid.github.io/mseo/articles/";
const siteUrl = "https://gpldroid.github.io/mseo";
const icons = {
  "الذكاء الاصطناعي": "fa-robot",
  "تطوير المواقع": "fa-code",
  "تصميم المواقع": "fa-palette",
  "البرمجة": "fa-js",
  "SEO": "fa-chart-line",
  "الأدوات والتقنيات": "fa-screwdriver-wrench",
  "أداء المواقع": "fa-gauge-high"
};

const meta = (html, name, property = false) => {
  const attr = property ? "property" : "name";
  const q = new RegExp("<meta\\s+[^>]*" + attr + "=[\\\"']" + name + "[\\\"'][^>]*content=[\\\"']([^\\\"']+)[\\\"'][^>]*>", "i");
  const m = html.match(q) || html.match(new RegExp("<meta\\s+[^>]*content=[\\\"']([^\\\"']+)[\\\"'][^>]*" + attr + "=[\\\"']" + name + "[\\\"']", "i"));
  return m ? m[1].trim() : "";
};
const title = html => (html.match(/<title>\\s*([^<]+?)\\s*<\\/title>/i) || [, ""])[1].trim();
const articleData = html => {
  for (const block of html.matchAll(/<script\\s+type=[\"']application\\/ld\\+json[\"']>([\\s\\S]*?)<\\/script>/gi)) {
    try {
      const data = JSON.parse(block[1]);
      if (data["@type"] === "Article") return data;
    } catch {}
  }
  return {};
};
const breadcrumbData = html => {
  for (const block of html.matchAll(/<script\\s+type=[\"']application\\/ld\\+json[\"']>([\\s\\S]*?)<\\/script>/gi)) {
    try {
      const data = JSON.parse(block[1]);
      if (data["@type"] === "BreadcrumbList") return data;
    } catch {}
  }
  return null;
};

const ensureJsonLd = (html, data) => {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.title,
    description: data.description,
    image: data.image ? [data.image] : undefined,
    datePublished: data.datePublished || undefined,
    dateModified: data.dateModified || data.datePublished || undefined,
    author: { "@type": "Organization", name: "MSEO Editorial" },
    publisher: { "@type": "Organization", name: "MSEO", url: siteUrl },
    inLanguage: "ar",
    mainEntityOfPage: { "@type": "WebPage", "@id": data.url }
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: siteUrl + "/" },
      { "@type": "ListItem", position: 2, name: data.category, item: siteUrl + "/pages/" + data.categoryPath },
      { "@type": "ListItem", position: 3, name: data.title, item: data.url }
    ]
  };
  const clean = object => Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined && value !== ""));
  const articleJson = JSON.stringify(clean(article));
  const breadcrumbJson = JSON.stringify(breadcrumb);
  const withoutGenerated = html.replace(/\\s*<script\\s+type=["']application\\/ld\\+json["']>\\s*\\{[\\s\\S]*?["']@type["']\\s*:\\s*["'](?:Article|BreadcrumbList)["'][\\s\\S]*?<\\/script>/gi, "");
  return withoutGenerated.replace(/<\\/head>/i,
    `<script type="application/ld+json">${articleJson}</script>\\n<script type="application/ld+json">${breadcrumbJson}</script>\\n</head>`);
};

const files = (await readdir(dir)).filter(x => x.endsWith(".html")).sort();
const out = [];
for (const file of files) {
  let html = await readFile(join(dir, file), "utf8");
  const existing = articleData(html);
  const titleText = title(html).replace(/\\s*\\|\\s*MSEO.*$/i, "").trim();
  const existingBreadcrumb = breadcrumbData(html);
  const category = meta(html, "article:section", true)
    || existingBreadcrumb?.itemListElement?.find(item => item.position === 2)?.name
    || "غير مصنف";
  const keywords = meta(html, "keywords").split(",").map(x => x.trim()).filter(Boolean);
  const image = meta(html, "og:image", true) || (Array.isArray(existing.image) ? existing.image[0] : existing.image || "");
  const url = base + file;
  const categoryPath = existingBreadcrumb?.itemListElement?.find(item => item.position === 2)?.item?.split("/pages/")[1]
    || ({ "الذكاء الاصطناعي": "ai.html", "تطوير المواقع": "web-development.html", "تصميم المواقع": "web-design.html", "البرمجة": "programming.html", "SEO": "seo.html", "الأدوات والتقنيات": "tools.html", "أداء المواقع": "performance.html" }[category] || "seo.html");
  const data = {
    slug: file.replace(/\\.html$/, ""),
    file,
    title: titleText || existing.headline || file,
    category,
    description: meta(html, "description") || existing.description || "",
    keywords,
    tags: keywords.slice(0, 8),
    icon: icons[category] || "fa-file-lines",
    datePublished: existing.datePublished || "",
    dateModified: existing.dateModified || existing.datePublished || "",
    image,
    url,
    categoryPath
  };
  html = ensureJsonLd(html, data);
  await writeFile(join(dir, file), html, "utf8");
  out.push(data);
}
await writeFile(join(root, "data/articles.json"), JSON.stringify(out, null, 2) + "\\n", "utf8");
console.log("Article catalog and JSON-LD generated:", out.length);
