import { readFile, writeFile, readdir, unlink } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const url = (process.env.SUPABASE_URL || "https://gjkwrxvlnmshcmsjdcfd.supabase.co").replace(/\/$/, "");
const key = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_rGb3srwFQ7aCbHipegsn1A_DmTFCpNX";
const headers = { apikey: key, Authorization: `Bearer ${key}` };
const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[char]);
function safeHtml(html) {
  return String(html ?? "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<(?:style|iframe|object|embed|form)\b[^>]*>[\s\S]*?<\/(?:style|iframe|object|embed|form)>/gi, "")
    .replace(/<\/?(?:style|iframe|object|embed|form|input|button)\b[^>]*>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(['"])\s*(?:javascript|data):[^'"]*\2/gi, '$1="#"');
}
const response = await fetch(`${url}/rest/v1/mseo_content_items?select=slug,title,summary,body_html,content_type,status,seo_title,seo_description,categories,tags,cover_image_url,published_at&status=eq.published&order=published_at.desc`, { headers });
if (!response.ok) throw new Error(`Could not load published CMS content (${response.status}). Check Supabase public SELECT policy and publishable key.`);
const rows = await response.json();
const articlesDir = join(root, "articles");
const pagesDir = join(root, "pages");
for (const [directory, prefix] of [[articlesDir, "cms-"], [pagesDir, "cms-"]]) {
  for (const name of await readdir(directory)) {
    if (name.startsWith(prefix) && name.endsWith(".html")) await unlink(join(directory, name));
  }
}
const catalogPath = join(root, "data", "articles.json");
const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
const retained = catalog.filter((item) => !String(item.file || "").startsWith("cms-"));
const added = [];
for (const row of rows) {
  const slug = String(row.slug || "").toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) continue;
  const file = `cms-${slug}.html`;
  const title = escape(row.seo_title || row.title);
  const description = escape(row.seo_description || row.summary || "");
  const canonical = `https://gpldroid.github.io/mseo/${row.content_type === "page" ? "pages" : "articles"}/${file}`;
  const image = escape(row.cover_image_url || "../assets/favicon.svg");
  const body = safeHtml(row.body_html);
  const html = `<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#101b2b"><title>${title} | MSEO</title><meta name="description" content="${description}">
<link rel="canonical" href="${canonical}"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:image" content="${image}">
<link rel="icon" href="../assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="../assets/css/style.css?v=20261012-images1"></head>
<body><div data-site-header></div><main class="site-container cms-article-page" style="max-width:860px;margin:40px auto;padding:0 20px">
<nav aria-label="مسار التنقل"><a href="../index.html">الرئيسية</a> / <a href="../pages/archive.html">المقالات</a></nav>
<article><header class="cms-article-header"><span class="site-kicker">${escape((row.categories || [])[0] || "MSEO")}</span><h1>${escape(row.title)}</h1><p>${description}</p>${row.cover_image_url ? `<img src="${image}" alt="${escape(row.title)}" style="width:100%;height:auto;border-radius:16px" loading="lazy">` : ""}</header>
<div class="cms-article-content" style="font-size:17px;line-height:2">${body}</div>
<div class="cms-article-tags" style="display:flex;gap:8px;flex-wrap:wrap;margin:28px 0">${(row.tags || []).map(tag => `<span style="padding:4px 10px;border-radius:99px;background:#eef0f8">${escape(tag)}</span>`).join("")}</div></article></main>
<div data-site-footer></div><script src="../assets/js/site.js?v=20261012-images1" defer></script></body></html>`;
  const directory = row.content_type === "page" ? pagesDir : articlesDir;
  await writeFile(join(directory, file), html);
  if (row.content_type !== "page") {
    added.push({ slug: `cms-${slug}`, title: row.title, category: (row.categories || [])[0] || "مقالات الموقع", description: row.summary || "", image: row.cover_image_url || "assets/favicon.svg", tags: row.tags || [], file, published_at: row.published_at });
  }
}
await writeFile(catalogPath, JSON.stringify([...retained, ...added], null, 2) + "\n");
console.log(`Synced ${rows.length} published CMS records; ${added.length} articles added to the static catalogue.`);
