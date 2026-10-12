/* MSEO shared public-site interactions. Does not run in the admin dashboard. */
(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const path = location.pathname;
  const nested = /\/(articles|pages)\//.test(path);
  const root = nested ? '../' : './';
  const link = (href) => root + href;
  const navItems = [
    ['index.html','الرئيسية','Home'],
    ['pages/ai.html','الذكاء الاصطناعي','AI'],
    ['pages/web-development.html','تطوير المواقع','Web Dev'],
    ['pages/programming.html','البرمجة','Programming'],
    ['pages/seo.html','SEO','SEO'],
    ['pages/archive.html','الأرشيف','Archive']
  ];
  const isEnglish = localStorage.getItem('mseo-ui-language') === 'en';
  const t = (ar,en) => isEnglish ? en : ar;
  const header = $('[data-site-header]') || $('[data-home-header]');
  if (header) {
    header.innerHTML = `
      <header class="mseo-header">
        <div class="mseo-header-inner">
          <button class="mseo-icon-button mseo-menu-toggle" type="button" aria-label="${t('فتح القائمة','Open menu')}" aria-expanded="false" data-menu-toggle>☰</button>
          <a class="mseo-brand" href="${link('index.html')}" aria-label="MSEO — ${t('الرئيسية','Home')}"><span class="mseo-brand-mark">M</span><span>MSEO</span></a>
          <nav class="mseo-nav" data-main-nav aria-label="${t('القائمة الرئيسية','Main navigation')}">
            ${navItems.map(([href,ar,en])=>`<a href="${link(href)}" ${path.endsWith(href.replace('index.html',''))?'aria-current="page"':''}>${t(ar,en)}</a>`).join('')}
          </nav>
          <div class="mseo-actions">
            <button class="mseo-icon-button" type="button" data-search-toggle aria-label="${t('فتح البحث','Open search')}" title="${t('بحث','Search')}">⌕</button>
            <button class="mseo-icon-button" type="button" data-theme-toggle aria-label="${t('تبديل المظهر','Toggle theme')}" title="${t('الوضع الداكن','Dark mode')}">☾</button>
            <button class="mseo-icon-button" type="button" data-language-toggle aria-label="${t('تغيير لغة الواجهة','Switch interface language')}">${isEnglish?'عربي':'EN'}</button>
          </div>
        </div>
        <div class="mseo-search-panel" data-search-panel>
          <form action="${link('pages/archive.html')}" method="get"><label class="sr-only" for="mseo-global-search">${t('ابحث في المقالات','Search articles')}</label><input id="mseo-global-search" name="q" type="search" placeholder="${t('ابحث في مقالات MSEO…','Search MSEO articles…')}" /><button type="submit">${t('بحث','Search')}</button></form>
        </div>
      </header>`;
  }
  const footer = $('[data-site-footer]') || $('[data-home-footer]');
  if (footer) {
    footer.innerHTML = `
      <footer class="mseo-footer"><div class="mseo-footer-inner">
        <div class="mseo-footer-grid">
          <section><a class="mseo-brand" href="${link('index.html')}"><span class="mseo-brand-mark">M</span><span>MSEO</span></a><p>${t('مكتبة عربية للمقالات والأدلة التقنية العملية في الذكاء الاصطناعي والبرمجة وتطوير المواقع وتحسين محركات البحث.','An Arabic library of practical guides on AI, programming, web development and SEO.')}</p><div class="mseo-socials" aria-label="${t('روابط التواصل','Social links')}"><a href="https://github.com/gpldroid/mseo" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">⌘</a><a href="mailto:contact@mseo.example" aria-label="Email" title="Email">✉</a></div></section>
          <section><h3>${t('استكشف الموقع','Explore')}</h3><div class="mseo-footer-links"><a href="${link('pages/archive.html')}">${t('أرشيف المقالات','Article archive')}</a><a href="${link('pages/about.html')}">${t('من نحن','About')}</a><a href="${link('pages/contact.html')}">${t('اتصل بنا','Contact')}</a><a href="${link('pages/editorial-policy.html')}">${t('السياسة التحريرية','Editorial policy')}</a></div></section>
          <section><h3>${t('قانوني','Legal')}</h3><div class="mseo-footer-links"><a href="${link('pages/privacy.html')}">${t('سياسة الخصوصية','Privacy policy')}</a><a href="${link('pages/terms.html')}">${t('شروط الاستخدام','Terms of use')}</a></div></section>
        </div>
        <div class="mseo-copyright"><span>© <span data-current-year></span> MSEO — ${t('جميع الحقوق محفوظة','All rights reserved')}</span><span>${t('تصميم وتطوير','Designed and developed by')} <strong>Imad Limrani</strong></span></div>
      </div></footer>`;
  }
  const year = $('[data-current-year]'); if (year) year.textContent = new Date().getFullYear();
  const themeButton = $('[data-theme-toggle]');
  const savedTheme = localStorage.getItem('mseo-theme');
  const preferredDark = matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', (savedTheme || (preferredDark?'dark':'light')) === 'dark');
  if (themeButton) {
    const syncThemeIcon = () => { const dark=document.documentElement.classList.contains('dark'); themeButton.textContent=dark?'☀':'☾'; themeButton.title=dark?t('الوضع الفاتح','Light mode'):t('الوضع الداكن','Dark mode'); };
    syncThemeIcon();
    themeButton.addEventListener('click',()=>{const dark=!document.documentElement.classList.contains('dark');document.documentElement.classList.toggle('dark',dark);localStorage.setItem('mseo-theme',dark?'dark':'light');syncThemeIcon();});
  }
  const menuButton=$('[data-menu-toggle]'), nav=$('[data-main-nav]');
  if(menuButton&&nav){menuButton.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');menuButton.setAttribute('aria-expanded',String(open));menuButton.textContent=open?'×':'☰';});nav.addEventListener('click',e=>{if(e.target.closest('a')){nav.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false');menuButton.textContent='☰';}});}
  const searchButton=$('[data-search-toggle]'),searchPanel=$('[data-search-panel]');
  if(searchButton&&searchPanel){searchButton.addEventListener('click',()=>{const open=searchPanel.classList.toggle('is-open');if(open)$('#mseo-global-search')?.focus();});}
  const langButton=$('[data-language-toggle]');
  if(langButton){langButton.addEventListener('click',()=>{const next=isEnglish?'ar':'en';localStorage.setItem('mseo-ui-language',next);/* Reload updates shared navigation labels. Article body stays in its authored language. */location.reload();});}
  const controls=document.createElement('div');controls.className='mseo-scroll-controls';controls.innerHTML='<button type="button" data-scroll-top aria-label="العودة إلى أعلى الصفحة" title="أعلى الصفحة">↑</button><button type="button" data-scroll-down aria-label="الانتقال إلى أسفل الصفحة" title="أسفل الصفحة">↓</button>';document.body.append(controls);
  const topButton=$('[data-scroll-top]',controls),downButton=$('[data-scroll-down]',controls);
  const onScroll=()=>topButton.classList.toggle('is-visible',window.scrollY>300);
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  topButton.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  downButton.addEventListener('click',()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'smooth'}));
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const target=$(a.getAttribute('href'));if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'});}}));
})();