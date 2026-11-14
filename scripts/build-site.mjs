import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const articleHref = item => '/articles/' + encodeURIComponent(item.file || ((item.slug || '') + '.html'));
const imageFor = item => item.thumbnail || item.image || '';
const sorted = items => items.slice().sort((a,b) => String(b.updatedAt || b.publishedAt || '').localeCompare(String(a.updatedAt || a.publishedAt || '')));

function card(item) {
  const image = imageFor(item);
  return '<article class="article-card">' +
    (image ? '<a href="' + articleHref(item) + '" tabindex="-1" aria-hidden="true"><img src="' + escapeHTML(image) + '" alt="" width="640" height="400" loading="lazy" decoding="async"></a>' : '') +
    '<div class="article-card-body"><span class="article-category">' + escapeHTML(item.category || 'مقالات') + '</span>' +
    '<h3><a href="' + articleHref(item) + '">' + escapeHTML(item.title) + '</a></h3>' +
    (item.description ? '<p>' + escapeHTML(item.description) + '</p>' : '') +
    '<a class="site-read" href="' + articleHref(item) + '">اقرأ الدليل <span aria-hidden="true">←</span></a></div></article>';
}
function carouselCard(item, index) {
  const image = imageFor(item);
  return '<article class="latest-carousel-card">' +
    (image ? '<a class="latest-carousel-image" href="' + articleHref(item) + '"><img src="' + escapeHTML(image) + '" alt="' + escapeHTML(item.title) + '" width="640" height="360" loading="' + (index === 0 ? 'eager' : 'lazy') + '"' + (index === 0 ? ' fetchpriority="high"' : '') + ' decoding="async"></a>' : '') +
    '<div class="latest-carousel-copy"><span class="article-category">' + escapeHTML(item.category || 'مقالات') + '</span>' +
    '<h3><a href="' + articleHref(item) + '">' + escapeHTML(item.title) + '</a></h3><p>' + escapeHTML(item.description || '') + '</p>' +
    '<a class="button button-primary" href="' + articleHref(item) + '">اقرأ المقال <span aria-hidden="true">←</span></a></div></article>';
}
function sidebarItem(item, index) {
  const image = imageFor(item);
  return '<li class="sidebar-article-item"><a class="sidebar-article-thumb" href="' + articleHref(item) + '" tabindex="-1" aria-hidden="true">' +
    (image ? '<img src="' + escapeHTML(image) + '" alt="" width="88" height="66" loading="lazy" decoding="async">' : '<span aria-hidden="true">✦</span>') +
    '</a><div class="sidebar-article-copy"><span class="sidebar-rank">' + (index + 1) + '</span><a class="sidebar-article-title" href="' + articleHref(item) + '">' + escapeHTML(item.title) + '</a>' +
    '<span class="sidebar-article-category">' + escapeHTML(item.category || 'مقالات') + '</span></div></li>';
}
function replaceMarker(html, marker, value) {
  const token = '<!-- FASTSEO:' + marker + ' -->';
  if (!html.includes(token)) throw new Error('Missing homepage marker: ' + marker);
  return html.replace(token, value);
}
async function copySite(source, target) {
  await mkdir(target, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if (['.git', '.github', 'dist', 'node_modules'].includes(entry.name)) continue;
    const from = path.join(source, entry.name), to = path.join(target, entry.name);
    if (entry.isDirectory()) await copySite(from, to);
    else await cp(from, to);
  }
}

const [indexSource, articlesSource, header, footer] = await Promise.all([
  readFile(path.join(root, 'index.html'), 'utf8'),
  readFile(path.join(root, 'data/articles.json'), 'utf8'),
  readFile(path.join(root, 'partials/header.html'), 'utf8'),
  readFile(path.join(root, 'partials/footer.html'), 'utf8')
]);
const articles = sorted(JSON.parse(articlesSource));
if (!articles.length) throw new Error('Article catalog is empty.');
const latest = articles.slice(0, 5);
const categories = [...new Set(articles.map(item => item.category).filter(Boolean))].sort((a,b) => a.localeCompare(b, 'ar'));
let html = indexSource;
html = replaceMarker(html, 'HEADER', header);
html = replaceMarker(html, 'FOOTER', footer);
html = replaceMarker(html, 'LATEST_CAROUSEL', carouselCard(latest[0], 0));
html = replaceMarker(html, 'CAROUSEL_DOTS', latest.map((item, i) => '<button type="button" data-slide="' + i + '" aria-label="عرض المقال ' + (i + 1) + '"' + (i === 0 ? ' aria-current="true"' : '') + '></button>').join(''));
html = replaceMarker(html, 'ARTICLE_GRID', articles.slice(0, 9).map(card).join(''));
html = replaceMarker(html, 'CATEGORY_OPTIONS', categories.map(cat => '<option value="' + escapeHTML(cat) + '">' + escapeHTML(cat) + '</option>').join(''));
html = replaceMarker(html, 'SIDEBAR_LATEST', latest.map(sidebarItem).join(''));
html = replaceMarker(html, 'SIDEBAR_POPULAR', latest.map(sidebarItem).join(''));
html = replaceMarker(html, 'SIDEBAR_CATEGORIES', categories.map(cat => {
  const count = articles.filter(item => item.category === cat).length;
  return '<li><a href="/pages/archive.html?category=' + encodeURIComponent(cat) + '">' + escapeHTML(cat) + '</a><span class="sidebar-category-count">' + count + '</span></li>';
}).join(''));
html = replaceMarker(html, 'CATEGORY_GRID', categories.map(cat => {
  const descriptions = {'SEO':'الكلمات المفتاحية، الفهرسة، والروابط الداخلية','تطوير المواقع':'بناء المواقع، الأداء، وتجربة المستخدم','البرمجة':'لغات البرمجة وأمثلة عملية للمطورين','الذكاء الاصطناعي':'أدوات الذكاء الاصطناعي وتطبيقاتها','أداء المواقع':'السرعة وCore Web Vitals','تصميم المواقع':'واجهات واضحة وتجربة استخدام أفضل'};
  const hrefs = {'SEO':'/pages/seo.html','تطوير المواقع':'/pages/web-development.html','البرمجة':'/pages/programming.html','الذكاء الاصطناعي':'/pages/ai.html','أداء المواقع':'/pages/web-development.html','تصميم المواقع':'/pages/web-development.html'};
  const count = articles.filter(item => item.category === cat).length;
  return '<a class="category-card" href="' + (hrefs[cat] || '/pages/archive.html?category=' + encodeURIComponent(cat)) + '"><span class="site-card-icon" aria-hidden="true">✦</span><h3>' + escapeHTML(cat) + '</h3><p>' + escapeHTML(descriptions[cat] || ('مقالات وأدلة عملية في ' + cat)) + '</p><span class="site-read">' + count + ' مقالًا <span aria-hidden="true">←</span></span></a>';
}).join(''));
await rm(out, { recursive: true, force: true });
await copySite(root, out);
await writeFile(path.join(out, 'index.html'), html, 'utf8');
const generatedHTML = await readFile(path.join(out, 'index.html'), 'utf8');
if (generatedHTML.includes('<!-- FASTSEO:')) throw new Error('Static homepage contains unresolved build markers.');
if (!generatedHTML.includes('class="mseo-header"') || !generatedHTML.includes('class="mseo-footer"')) throw new Error('Static shared header/footer are missing.');
if (!generatedHTML.includes('class="article-card"') || !generatedHTML.includes('class="latest-carousel-card"')) throw new Error('Static article content is missing.');
console.log('Static homepage generated:', { articles: articles.length, latest: latest.length, categories: categories.length, output: 'dist/' });
