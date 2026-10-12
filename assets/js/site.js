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
            ${navItems.map(([href,ar,en])=>`<a href="${link(href)}" ${((href==='index.html' && (path.endsWith('/mseo/') || path.endsWith('/index.html') || path === '/')) || (href!=='index.html' && path.endsWith('/'+href)))?'aria-current="page"':''}>${t(ar,en)}</a>`).join('')}
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
          <section><a class="mseo-brand" href="${link('index.html')}"><span class="mseo-brand-mark">M</span><span>MSEO</span></a><p>${t('مكتبة عربية للمقالات والأدلة التقنية العملية في الذكاء الاصطناعي والبرمجة وتطوير المواقع وتحسين محركات البحث.','An Arabic library of practical guides on AI, programming, web development and SEO.')}</p><div class="mseo-socials" aria-label="${t('روابط التواصل','Social links')}"><a href="https://github.com/gpldroid/mseo" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub"><svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="currentColor"><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.08c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.24-1.62-1.24-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15.99 1.7 2.6 1.21 3.23.93.1-.72.39-1.21.7-1.49-2.48-.28-5.09-1.24-5.09-5.51 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.11-1.44 3.05-1.14 3.05-1.14.61 1.54.23 2.68.11 2.96.72.78 1.15 1.77 1.15 2.99 0 4.28-2.61 5.23-5.1 5.5.4.35.75 1.03.75 2.08v3.09c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z"/></svg></a><a href="https://github.com/gpldroid/mseo/issues" target="_blank" rel="noopener noreferrer" aria-label="GitHub Issues" title="GitHub Issues"><svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M9 9h.01M15 9h.01M8.5 14.5a4.5 4.5 0 0 0 7 0M12 3v3"/></svg></a></div></section>
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
/* Homepage content renderer: kept in this single shared public-site script. */
(async () => {
 const $ = (s, root=document) => root.querySelector(s);
 const base = new URL('../../', import.meta.url);
 const url = path => new URL(path, base).href;
 const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const grid=$('#article-grid'), categoryGrid=$('#category-grid'), categorySelect=$('#article-category'), search=$('#article-search'), count=$('#results-count'), pagination=$('#pagination'), error=$('#load-error');
 if (!grid || !categoryGrid) return;
 let articles=[], page=1; const perPage=9;
 try {
   const response=await fetch(url('data/articles.json'), {cache:'no-cache'});
   if (!response.ok) throw new Error('Could not load article catalogue');
   articles=await response.json();
   const cats=[...new Set(articles.map(a=>a.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ar'));
   categoryGrid.innerHTML=cats.map((c,i)=>'<a class="category-card" href="'+url('pages/archive.html')+'?category='+encodeURIComponent(c)+'"><span class="site-card-icon">'+['✳','⌘','◈','↗','⌁','⚙'][i%6]+'</span><h3>'+esc(c)+'</h3><p>استكشف الأدلة والمقالات في هذا المجال.</p><span class="site-read">تصفح المقالات ←</span></a>').join('');
   if(categorySelect) categorySelect.innerHTML='<option value="">كل التصنيفات</option>'+cats.map(c=>'<option value="'+esc(c)+'">'+esc(c)+'</option>').join('');
   const render=()=>{
     const q=(search?.value||'').trim().toLocaleLowerCase('ar'), cat=categorySelect?.value||'';
     const filtered=articles.filter(a=>(!cat||a.category===cat)&&(!q||[a.title,a.category,a.description,...(a.tags||[])].join(' ').toLocaleLowerCase('ar').includes(q)));
     const pages=Math.max(1,Math.ceil(filtered.length/perPage)); page=Math.min(page,pages);
     const items=filtered.slice((page-1)*perPage,page*perPage);
     grid.innerHTML=items.length?items.map(a=>{
       const articleUrl=url('articles/'+encodeURIComponent(a.file||a.slug+'.html'));
       return '<article class="article-card"><a href="'+articleUrl+'"><img loading="lazy" decoding="async" src="'+esc(url(a.image||'assets/favicon.svg'))+'" alt="" onerror="this.style.display=\'none\'"></a><div class="article-card-body"><span class="article-category">'+esc(a.category)+'</span><h3><a href="'+articleUrl+'">'+esc(a.title)+'</a></h3><p>'+esc(a.description)+'</p><a class="site-read" href="'+articleUrl+'">اقرأ المقال ←</a></div></article>';
     }).join(''):'<p class="loading-card">لا توجد مقالات تطابق البحث.</p>';
     if(count) count.textContent='عرض '+items.length+' من '+filtered.length+' مقالًا';
     if(pagination){pagination.hidden=pages<=1;pagination.innerHTML=Array.from({length:pages},(_,i)=>'<button type="button" '+(page===i+1?'aria-current="page"':'')+' data-page="'+(i+1)+'">'+(i+1)+'</button>').join('');pagination.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{page=Number(b.dataset.page);render();$('#articles')?.scrollIntoView({behavior:'smooth'});}));}
   };
   search?.addEventListener('input',()=>{page=1;render();});
   categorySelect?.addEventListener('change',()=>{page=1;render();});
   render();
 } catch (e) {
   if(error) error.hidden=false;
   grid.innerHTML='<p class="loading-card">تعذر تحميل المقالات حاليًا. يرجى المحاولة لاحقًا.</p>';
   if(count) count.textContent='تعذر تحميل الفهرس';
 }
})();

/* Cookie consent: no non-essential cookies are set by this static site by default. */
(() => {
 const key='mseo-cookie-consent-v1';
 let choice=null;
 try { choice=localStorage.getItem(key); } catch (_) {}
 if(choice) return;
 const banner=document.createElement('section');
 banner.className='mseo-cookie-banner';
 banner.setAttribute('role','dialog');
 banner.setAttribute('aria-label','إعدادات ملفات تعريف الارتباط');
 banner.setAttribute('aria-live','polite');
 banner.innerHTML='<div class="mseo-cookie-copy"><strong>خصوصيتك تهمنا</strong><p>يستخدم الموقع التخزين المحلي لحفظ تفضيلات الواجهة، مثل المظهر. لا يتم تفعيل ملفات تحليل أو إعلانات اختيارية من خلال هذه الرسالة.</p><a href="'+(location.pathname.includes('/articles/')||location.pathname.includes('/pages/')?'../':'./')+'pages/privacy.html">اقرأ سياسة الخصوصية</a></div><div class="mseo-cookie-actions"><button type="button" data-cookie-accept>موافق</button><button type="button" data-cookie-dismiss>إغلاق</button></div>';
 const save=value=>{try{localStorage.setItem(key,value);}catch(_){}banner.remove();};
 banner.querySelector('[data-cookie-accept]').addEventListener('click',()=>save('accepted'));
 banner.querySelector('[data-cookie-dismiss]').addEventListener('click',()=>save('dismissed'));
 document.body.append(banner);
})();
