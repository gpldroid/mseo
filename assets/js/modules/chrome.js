import {NAV,ROOT} from "./config.js";

const FOOTER_LINKS = [
  ["pages/about.html","من نحن"],
  ["pages/contact.html","اتصل بنا"],
  ["pages/privacy.html","سياسة الخصوصية"],
  ["pages/terms.html","شروط الاستخدام"]
];
const HOME_NAV = [
  ["index.html","الرئيسية"],
  ["pages/ai.html","الذكاء الاصطناعي"],
  ["pages/web-development.html","تطوير المواقع"],
  ["pages/programming.html","البرمجة"],
  ["pages/seo.html","SEO"]
];
const esc = value => String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));

function links(items, root, current = "", home = false) {
  return items.map(([url,label,icon]) => {
    const href = root + url;
    const active = url.split("/").pop() === current;
    if (home) return '<a href="' + esc(href) + '"' + (active ? ' class="active" aria-current="page"' : "") + '>' + esc(label) + '</a>';
    return '<a href="' + esc(href) + '"' + (active ? ' aria-current="page"' : "") + '>' + (icon ? '<i class="fa-solid fa-' + esc(icon) + '" aria-hidden="true"></i> ' : "") + esc(label) + '</a>';
  }).join("");
}

export function mountHomeChrome() {
  const header = document.querySelector("[data-home-header]");
  const footer = document.querySelector("[data-home-footer]");
  const current = location.pathname.split("/").pop() || "index.html";
  if (header) header.innerHTML = '<header class="site-header"><div class="header-inner"><a class="brand" href="' + esc(ROOT || "./") + 'index.html" aria-label="MSEO - الرئيسية"><span class="brand-mark">M</span><span><b>MSEO</b><small>مكتبة المعرفة الرقمية</small></span></a><nav class="main-nav" aria-label="التنقل الرئيسي">' + links(HOME_NAV, ROOT || "./", current, true) + '</nav><a class="nav-cta" href="' + esc((ROOT || "./") + 'index.html#articles') + '">تصفّح المقالات <span aria-hidden="true">←</span></a></div></header>';
  if (footer) footer.innerHTML = '<footer class="site-footer"><div class="footer-inner"><a class="brand footer-brand" href="' + esc((ROOT || "./") + 'index.html') + '"><span class="brand-mark">M</span><span><b>MSEO</b><small>مكتبة المعرفة الرقمية</small></span></a><p>محتوى تقني عربي يساعدك على التعلّم والبناء بثقة.</p><nav aria-label="روابط الموقع">' + links(FOOTER_LINKS, ROOT || "./") + '</nav><span>© ' + new Date().getFullYear() + ' MSEO</span></div></footer>';
}

export function mountInteriorChrome() {
  const header = document.querySelector("[data-site-header]");
  const footer = document.querySelector("[data-site-footer]");
  const current = location.pathname.split("/").pop() || "index.html";
  if (header) header.innerHTML = '<header class="site-header"><div class="site-top"><div class="site-container site-top-inner"><span>دليل عربي متخصص في الذكاء الاصطناعي والويب والبرمجة وSEO</span><time id="site-date"></time></div></div><div class="site-container site-mainbar"><a class="site-brand" href="' + esc(ROOT + 'index.html') + '" aria-label="MSEO الرئيسية"><span class="site-brand-mark"><i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i></span><span>MSEO <b>AI & Web</b></span></a><nav class="site-nav" aria-label="التنقل الرئيسي"><div class="site-nav-inner">' + links(NAV, ROOT, current) + '</div></nav><div class="site-actions"><button class="site-btn button is-ghost" data-site-action="search" aria-label="بحث"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></button><button class="site-btn" data-site-action="theme" aria-label="تبديل المظهر"></button><button class="site-btn site-mobile-toggle" data-site-action="mobile" aria-label="فتح القائمة" aria-expanded="false" aria-controls="site-mobile-menu"><i class="fa-solid fa-bars" aria-hidden="true"></i></button></div></div><nav id="site-mobile-menu" class="site-mobile-menu" aria-label="قائمة الهاتف"><div class="site-container">' + links(NAV, ROOT, current) + '</div></nav></header>';
  if (footer) footer.innerHTML = '<footer class="site-footer"><div class="site-container site-footer-grid"><section class="site-footer-brand"><h2>MSEO AI & Web</h2><p>منصة عربية للمقالات والأدلة العملية حول الذكاء الاصطناعي وتطوير المواقع والبرمجة وSEO.</p><a class="site-social" href="https://github.com/gpldroid/mseo" target="_blank" rel="noopener noreferrer" aria-label="مستودع GitHub"><i class="fa-brands fa-github" aria-hidden="true"></i></a></section><section class="site-footer-group"><h3>الأقسام</h3><nav class="site-footer-links" aria-label="أقسام الموقع">' + links(NAV.slice(1), ROOT) + '</nav></section><section class="site-footer-group"><h3>روابط الموقع</h3><nav class="site-footer-links" aria-label="روابط عامة">' + links(FOOTER_LINKS, ROOT) + '</nav></section></div><div class="site-footer-bottom">© <span id="site-year"></span> MSEO AI & Web — جميع الحقوق محفوظة.</div></footer>';
  const date = document.querySelector("#site-date");
  if (date) date.textContent = new Intl.DateTimeFormat("ar-MA", {dateStyle:"full"}).format(new Date());
  const year = document.querySelector("#site-year");
  if (year) year.textContent = new Date().getFullYear();
}
