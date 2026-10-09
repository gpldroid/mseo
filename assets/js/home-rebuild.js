const CATALOG_URL = new URL("./data/articles.json", document.baseURI);
const PAGE_SIZE = 8;
const $ = (selector, root = document) => root.querySelector(selector);
const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const rootURL = new URL("./", document.baseURI);
let allArticles = [];
let currentPage = 1;
const categoryRoutes = {
  "الذكاء الاصطناعي":"pages/ai.html",
  "تطوير المواقع":"pages/web-development.html",
  "تصميم الواجهات":"pages/web-design.html",
  "البرمجة":"pages/programming.html",
  "تحسين محركات البحث":"pages/seo.html",
  "الأدوات والتقنيات":"pages/tools.html",
  "الأداء وتجربة المستخدم":"pages/performance.html"
};
const categoryPalette = [
  ["#477a48","#eef6e8","✳"],["#456bb1","#edf2fc","⌘"],["#bd6b48","#fbefe8","◈"],["#8055a4","#f4edfa","{ }"],["#218b8d","#e8f6f5","↗"],["#b58a2b","#fbf4df","⚙"]
];
function assetURL(value) {
  if (!value) return "";
  try { return new URL(String(value).replace(/^\.\//,"").replace(/^\//,""), rootURL).href; }
  catch { return ""; }
}
function articleHref(article) {
  const file = String(article.file || "").replace(/^\/+/, "");
  if (!file || file.split("/").some(part => part === ".." || part === ".")) return "#articles";
  return new URL("articles/" + file, rootURL).href;
}
function imageMarkup(article) {
  const source = article.image || article.thumbnail || "";
  const fallback = article.thumbnail ? assetURL(article.thumbnail) : "";
  const src = /^https?:\/\//i.test(source) ? source : assetURL(source);
  const alt = esc(article.title || "صورة المقال");
  return '<img class="article-image" src="' + esc(src) + '" alt="' + alt + '" width="800" height="450" loading="lazy" decoding="async" data-fallback="' + esc(fallback) + '">' +
    '<span class="image-shade" aria-hidden="true"></span>';
}
function card(article, index) {
  const href = articleHref(article);
  const category = esc(article.category || "مقالات");
  const title = esc(article.title || "مقال بدون عنوان");
  const description = esc(article.description || "دليل عملي يساعدك على فهم الموضوع وتطبيقه خطوة بخطوة.");
  const image = imageMarkup(article);
  return '<article class="article-card">' +
    '<a class="article-image-link" href="' + esc(href) + '" tabindex="-1" aria-hidden="true">' + image + '<span class="article-category-pill">' + category + '</span></a>' +
    '<div class="article-card-body"><div class="article-card-meta"><span>' + category + '</span><span>دليل رقم ' + String(index + 1).padStart(2,"0") + '</span></div>' +
    '<h3><a href="' + esc(href) + '">' + title + '</a></h3><p class="article-card-description">' + description + '</p>' +
    '<div class="article-card-footer"><a class="read-link" href="' + esc(href) + '">اقرأ المقال <span aria-hidden="true">←</span></a><span class="read-time">محتوى عملي</span></div></div></article>';
}
function renderCategories(articles) {
  const host = $("#category-grid");
  const map = new Map();
  articles.forEach(article => {
    if (!article.category) return;
    if (!map.has(article.category)) map.set(article.category, []);
    map.get(article.category).push(article);
  });
  const entries = [...map.entries()].sort((a,b) => a[0].localeCompare(b[0],"ar"));
  if (!entries.length) { host.innerHTML = '<p class="empty-state">لا توجد تصنيفات لعرضها.</p>'; return; }
  host.innerHTML = entries.map(([name, items], i) => {
    const palette = categoryPalette[i % categoryPalette.length];
    const route = categoryRoutes[name] || "pages/ai.html";
    const title = esc(name);
    const cover = items.find(a => a.thumbnail)?.thumbnail || items[0]?.image || "";
    const visual = cover ? '<span class="category-symbol" style="--cat-color:' + palette[0] + ';--cat-tint:' + palette[1] + ';background-image:url(&quot;' + esc(assetURL(cover)) + '&quot;);background-size:cover;background-position:center;color:transparent">' + palette[2] + '</span>' :
      '<span class="category-symbol" style="--cat-color:' + palette[0] + ';--cat-tint:' + palette[1] + '">' + palette[2] + '</span>';
    return '<a class="category-card" href="' + esc(route) + '" style="--cat-color:' + palette[0] + ';--cat-tint:' + palette[1] + '">' + visual +
      '<h3>' + title + '</h3><p>أدلة ومقالات في ' + title + '</p><div class="category-meta"><span>' + items.length + ' مقالات</span><span aria-hidden="true">←</span></div></a>';
  }).join("");
}
function getFiltered() {
  const query = ($("#article-search").value || "").trim().toLocaleLowerCase("ar");
  const category = $("#article-category").value;
  return allArticles.filter(article => {
    const content = [article.title, article.description, article.category, ...(article.tags || [])].join(" ").toLocaleLowerCase("ar");
    return (!query || content.includes(query)) && (!category || article.category === category);
  });
}
function render() {
  const filtered = getFiltered();
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  currentPage = Math.min(Math.max(currentPage, 1), pages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);
  $("#article-grid").innerHTML = visible.length ? visible.map((article, i) => card(article, start + i)).join("") : '<p class="empty-state">لا توجد مقالات مطابقة. جرّب عبارة بحث أخرى أو اختر تصنيفًا مختلفًا.</p>';
  $("#results-count").textContent = filtered.length + " مقال";
  const nav = $("#pagination");
  nav.hidden = pages < 2;
  nav.innerHTML = '<button class="page-button" data-page="' + (currentPage - 1) + '" ' + (currentPage === 1 ? "disabled" : "") + '>السابق</button>' +
    Array.from({length:pages}, (_,i) => i + 1).filter(n => pages <= 5 || n === 1 || n === pages || Math.abs(n-currentPage) <= 1).map(n =>
      '<button class="page-button" data-page="' + n + '" ' + (n === currentPage ? 'aria-current="page"' : "") + '>' + n + '</button>').join("") +
    '<span class="page-status">صفحة ' + currentPage + ' من ' + pages + '</span>' +
    '<button class="page-button" data-page="' + (currentPage + 1) + '" ' + (currentPage === pages ? "disabled" : "") + '>التالي</button>';
  $("#article-grid").querySelectorAll("img[data-fallback]").forEach(img => img.addEventListener("error", () => {
    const fallback = img.dataset.fallback;
    if (fallback && img.src !== fallback && !img.dataset.triedFallback) {
      img.dataset.triedFallback = "1";
      img.src = fallback;
    } else {
      img.hidden = true;
      img.closest(".article-image-link")?.classList.add("image-unavailable");
    }
  }, {once:false}));
}
async function start() {
  try {
    const response = await fetch(CATALOG_URL.href + "?v=20261009-1", {headers:{Accept:"application/json"}, cache:"no-cache"});
    if (!response.ok) throw new Error("Catalogue request failed: " + response.status);
    const articles = await response.json();
    if (!Array.isArray(articles) || !articles.length) throw new Error("Empty catalogue");
    allArticles = articles;
    renderCategories(allArticles);
    const select = $("#article-category");
    [...new Set(allArticles.map(a => a.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"ar")).forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      select.append(option);
    });
    const params = new URLSearchParams(location.search);
    $("#article-search").value = params.get("q") || "";
    render();
    $("#load-error").hidden = true;
  } catch (error) {
    console.error("[MSEO] Failed to load articles", error);
    $("#article-grid").innerHTML = '<p class="empty-state">تعذر تحميل المقالات. تأكد من اكتمال نشر ملفات الموقع ثم أعد المحاولة.</p>';
    $("#category-grid").innerHTML = '<p class="empty-state">تعذر تحميل التصنيفات.</p>';
    $("#results-count").textContent = "تعذر التحميل";
    $("#load-error").hidden = false;
  }
}
$("#article-search").addEventListener("input", () => {currentPage = 1; render();});
$("#article-category").addEventListener("change", () => {currentPage = 1; render();});
$("#pagination").addEventListener("click", event => {
  const button = event.target.closest("button[data-page]");
  if (!button || button.disabled) return;
  currentPage = Number(button.dataset.page);
  render();
  $("#articles").scrollIntoView({behavior:"smooth", block:"start"});
});
start();
