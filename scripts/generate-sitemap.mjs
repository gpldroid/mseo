import { readdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

const root = process.cwd();
const baseUrl = "https://gpldroid.github.io/mseo";
const excluded = new Set(["article.html", "pages/admin.html", "404.html"]);

async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if ([".git", ".github", "node_modules"].includes(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(path);
  }
  return files;
}

const files = (await walk(root))
  .map(file => relative(root, file).replaceAll("\\", "/"))
  .filter(file => !excluded.has(file))
  .sort((a, b) => (a === "index.html" ? -1 : b === "index.html" ? 1 : a.localeCompare(b)));

const priority = file => file === "index.html" ? "1.0" : file.startsWith("articles/") ? "0.8" : "0.6";
const changefreq = file => file === "index.html" || file.startsWith("pages/") ? "weekly" : "monthly";
const today = new Date().toISOString().slice(0, 10);

const urls = files.map(file => {
  const path = file === "index.html" ? "" : "/" + file;
  return `  <url><loc>${baseUrl}${path}</loc><lastmod>${today}</lastmod><changefreq>${changefreq(file)}</changefreq><priority>${priority(file)}</priority></url>`;
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

await writeFile(join(root, "sitemap.xml"), xml, "utf8");
console.log(`Sitemap generated: ${files.length} indexable HTML URLs.`);
