/* MSEO shared public-site interactions. Does not run in the admin dashboard. */
(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const path = location.pathname;
  const nested = /\/(articles|pages)\//.test(path);
  const root = nested ? '../' : './';
  const link = (href) => root + href;

  // Language-specific pages will be linked here when the real translations are published.
  // Keep the document's authored language and direction unchanged until then.
  const navItems = [
    ['index.html','الرئيسية'],
    ['pages/ai.html','الذكاء الاصطناعي'],
    ['pages/web-development.html','تطوير المواقع'],
    ['pages/programming.html','البرمجة'],
    ['pages/seo.html','SEO'],
    ['pages/tools.html','الأدوات'],
    ['pages/archive.html','ارشيف']
  ];
  const readPreference = (key) => { try { return localStorage.getItem(key); } catch (_) { return null; } };
  const writePreference = (key, value) => { try { localStorage.setItem(key, value); } catch (_) {} };
  // Load the optional theme stylesheet loader without replacing existing interactions.
  if (!$('[data-mseo-theme-switcher-loader]')) {
    const themeLoader = document.createElement('script');
    themeLoader.src = link('assets/js/theme-switcher.js');
    themeLoader.defer = true;
    themeLoader.setAttribute('data-mseo-theme-switcher-loader', '');
    document.head.appendChild(themeLoader);
  }
  const header = $('[data-site-header]') || $('[data-home-header]');
  if (header) {
    header.innerHTML = `
      <header class="mseo-header">
        <div class="mseo-header-inner">
          <button class="mseo-icon-button mseo-menu-toggle" type="button" aria-label="${'فتح القائمة'}" aria-expanded="false" data-menu-toggle>☰</button>
          <a class="mseo-brand" href="${link('index.html')}" aria-label="MSEO — ${'الرئيسية'}"><span class="mseo-brand-mark">M</span><span>MSEO</span></a>
          <nav class="mseo-nav" data-main-nav aria-label="${'القائمة الرئيسية'}">
            ${navItems.map(([href,label])=>`<a href="${link(href)}" ${((href==='index.html' && (path.endsWith('/mseo/') || path.endsWith('/index.html') || path === '/')) || (href!=='index.html' && path.endsWith('/'+href)))?'aria-current="page"':''}>${label}</a>`).join('')}
          </nav>
          <div class="mseo-actions">
            <button class="mseo-icon-button" type="button" data-search-toggle aria-label="${'فتح البحث'}" title="${'بحث'}">⌕</button>
            <button class="mseo-icon-button" type="button" data-theme-toggle aria-label="${'تبديل المظهر'}" title="${'الوضع الداكن'}">☾</button>
            </div>
        </div>
        <div class="mseo-search-panel" data-search-panel>
          <form action="${link('pages/archive.html')}" method="get"><label class="sr-only" for="mseo-global-search">${'ابحث في المقالات'}</label><input id="mseo-global-search" name="q" type="search" placeholder="${'ابحث في مقالات MSEO…'}" /><button type="submit">${'بحث'}</button></form>
        </div>
      </header>`;
  }
  const footer = $('[data-site-footer]') || $('[data-home-footer]');
  if (footer) {
    footer.innerHTML = `
      <footer class="mseo-footer"><div class="mseo-footer-inner">
        <div class="mseo-footer-grid">
          <section><a class="mseo-brand" href="${link('index.html')}"><span class="mseo-brand-mark">M</span><span>MSEO</span></a><p>${'مكتبة عربية للمقالات والأدلة التقنية العملية في الذكاء الاصطناعي والبرمجة وتطوير المواقع وتحسين محركات البحث.'}</p><div class="mseo-socials" aria-label="${'روابط التواصل'}"><a href="https://github.com/gpldroid/" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub"><svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="currentColor"><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.08c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.24-1.62-1.24-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15.99 1.7 2.6 1.21 3.23.93.1-.72.39-1.21.7-1.49-2.48-.28-5.09-1.24-5.09-5.51 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.11-1.44 3.05-1.14 3.05-1.14.61 1.54.23 2.68.11 2.96.72.78 1.15 1.77 1.15 2.99 0 4.28-2.61 5.23-5.1 5.5.4.35.75 1.03.75 2.08v3.09c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z"/></svg></a><a href="info@larache.xyz" target="_blank" rel="noopener noreferrer" aria-label="GitHub Issues" title="GitHub Issues"><svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M9 9h.01M15 9h.01M8.5 14.5a4.5 4.5 0 0 0 7 0M12 3v3"/></svg></a></div></section>
          <section><h3>${'استكشف الموقع'}</h3><div class="mseo-footer-links"><a href="${link('pages/archive.html')}">${'أرشيف المقالات'}</a><a href="${link('pages/tools.html')}">${'الأدوات'}</a><a href="${link('pages/about.html')}">${'من نحن'}</a><a href="${link('pages/contact.html')}">${'اتصل بنا'}</a><a href="${link('pages/editorial-policy.html')}">${'السياسة التحريرية'}</a></div></section>
          <section><h3>${'قانوني'}</h3><div class="mseo-footer-links"><a href="${link('pages/privacy.html')}">${'سياسة الخصوصية'}</a><a href="${link('pages/terms.html')}">${'شروط الاستخدام'}</a></div></section>
        </div>
        <div class="mseo-copyright"><span>© <span data-current-year></span> MSEO — ${'جميع الحقوق محفوظة'}</span><span>${'تصميم وتطوير'} <strong>Imad Limrani</strong></span></div>
      </div></footer>`;
  }
  const year = $('[data-current-year]'); if (year) year.textContent = new Date().getFullYear();
  const themeButton = $('[data-theme-toggle]');
  const themes = [
    {id:'editorial',label:'المجلة',icon:'▤',description:'تصميم تحريري متوازن'},
    {id:'tech',label:'تقني داكن',icon:'⌘',description:'ألوان داكنة ولمسات تقنية'},
    {id:'compact',label:'مكثف',icon:'▦',description:'مساحات أصغر ومحتوى أكثر'},
    {id:'reading',label:'القراءة',icon:'Aa',description:'ألوان دافئة وعمود قراءة مريح'},
    {id:'mseo-blue',label:'MSEO Prism',icon:'✧',description:'بنفسجي عميق ولمسات نعناعية بتأثيرات زجاجية'}
  ];
  const documentRoot = document.documentElement;
  const savedTheme = readPreference('mseo-theme');
  const validTheme = id => themes.some(theme => theme.id === id);
  let activeTheme = validTheme(savedTheme) ? savedTheme : 'editorial';
  const applyTheme = id => {
    activeTheme = validTheme(id) ? id : 'editorial';
    documentRoot.dataset.theme = activeTheme;
    documentRoot.classList.toggle('dark', activeTheme === 'tech');
    const theme = themes.find(item => item.id === activeTheme);
    if (themeButton && theme) {
      themeButton.textContent = theme.icon;
      themeButton.title = 'المظهر الحالي: ' + theme.label + ' — اضغط للتبديل';
      themeButton.setAttribute('aria-label', 'تغيير المظهر. الحالي: ' + theme.label);
      themeButton.setAttribute('aria-pressed', String(activeTheme !== 'editorial'));
    }
  };
  applyTheme(activeTheme);
  if (themeButton) themeButton.addEventListener('click', () => {
    const index = themes.findIndex(theme => theme.id === activeTheme);
    const next = themes[(index + 1) % themes.length];
    applyTheme(next.id);
    writePreference('mseo-theme', next.id);
  });
  const menuButton=$('[data-menu-toggle]'), nav=$('[data-main-nav]');
  if(menuButton&&nav){menuButton.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');menuButton.setAttribute('aria-expanded',String(open));menuButton.textContent=open?'×':'☰';});nav.addEventListener('click',e=>{if(e.target.closest('a')){nav.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false');menuButton.textContent='☰';}});}
  const searchButton=$('[data-search-toggle]'),searchPanel=$('[data-search-panel]');
  if(searchButton&&searchPanel){searchButton.addEventListener('click',()=>{const open=searchPanel.classList.toggle('is-open');if(open)$('#mseo-global-search')?.focus();});}
  const controls=document.createElement('div');controls.className='mseo-scroll-controls';controls.innerHTML='<button type="button" data-scroll-top aria-label="العودة إلى أعلى الصفحة" title="أعلى الصفحة">↑</button><button type="button" data-scroll-down aria-label="الانتقال إلى أسفل الصفحة" title="أسفل الصفحة">↓</button>';document.body.append(controls);
  const topButton=$('[data-scroll-top]',controls),downButton=$('[data-scroll-down]',controls);
  const onScroll=()=>topButton.classList.toggle('is-visible',window.scrollY>300);
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  topButton.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  downButton.addEventListener('click',()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'smooth'}));
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const target=$(a.getAttribute('href'));if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'});}}));
})();
/* Homepage content renderer: six-at-a-time progressive article reveal. */
(async()=>{
 const $=(s,r=document)=>r.querySelector(s),base=new URL(location.pathname.match(/\/(articles|pages)\//)?'../':'./',location.href),url=p=>new URL(p,base).href;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const grid=$('#article-grid'),catsGrid=$('#category-grid'),select=$('#article-category'),search=$('#article-search'),count=$('#results-count'),more=$('#pagination'),error=$('#load-error');
 if(!grid||!catsGrid)return;
 const batch=6;let articles=[],shown=batch;
 try{
  const res=await fetch(url('data/articles.json'),{cache:'no-cache'});if(!res.ok)throw Error();articles=await res.json();articles=articles.map((a,i)=>({...a,_homepageOrder:i})).sort((a,b)=>String(b.updatedAt||b.publishedAt||'').localeCompare(String(a.updatedAt||a.publishedAt||''))||a._homepageOrder-b._homepageOrder).map(({_homepageOrder,...a})=>a);
  const cats=[...new Set(articles.map(a=>a.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ar'));
  catsGrid.innerHTML=cats.map((cat,i)=>'<a class="category-card" href="'+url('pages/archive.html')+'?category='+encodeURIComponent(cat)+'"><span class="site-card-icon">'+['✳','⌘','◈','↗','⌁','⚙'][i%6]+'</span><h3>'+esc(cat)+'</h3><p>استكشف الأدلة والمقالات في هذا المجال.</p><span class="site-read">تصفح المقالات ←</span></a>').join('');
  if(select)select.innerHTML='<option value="">كل التصنيفات</option>'+cats.map(cat=>'<option value="'+esc(cat)+'">'+esc(cat)+'</option>').join('');
  function render(animateFrom=-1){
   const q=(search?.value||'').trim().toLocaleLowerCase('ar'),cat=select?.value||'';
   const filtered=articles.filter(a=>(!cat||a.category===cat)&&(!q||[a.title,a.category,a.description,...(a.tags||[])].join(' ').toLocaleLowerCase('ar').includes(q)));
   shown=Math.min(shown,filtered.length);
   grid.innerHTML=filtered.length?filtered.map((a,i)=>{
    const href=url('articles/'+encodeURIComponent(a.file||a.slug+'.html')),img=a.thumbnail||a.image||'assets/favicon.svg';
    return '<article class="article-card mseo-load-card"'+(i>=shown?' hidden':'')+(i>=animateFrom&&i<shown?' data-enter="1"':'')+'><a class="article-card-media" href="'+href+'" tabindex="-1" aria-hidden="true"><img loading="lazy" decoding="async" src="'+esc(url(img))+'" alt="" onerror="this.onerror=null;this.src=\''+esc(url(a.image||'assets/favicon.svg'))+'\';this.classList.add(\'is-fallback\')"></a><div class="article-card-body"><span class="article-category">'+esc(a.category)+'</span><h3><a href="'+href+'">'+esc(a.title)+'</a></h3><p>'+esc(a.description)+'</p><a class="site-read" href="'+href+'">اقرأ المقال ←</a></div></article>';
   }).join(''):'<p class="loading-card">لا توجد مقالات تطابق البحث.</p>';
   grid.querySelectorAll('[data-enter="1"]').forEach(el=>{el.classList.add('mseo-card-enter');el.removeAttribute('data-enter');});
   if(count)count.textContent='عرض '+Math.min(shown,filtered.length)+' من '+filtered.length+' مقالًا';
   const left=filtered.length-shown;
   if(more){more.hidden=left<=0;more.innerHTML=left>0?'<button type="button" class="mseo-load-more" data-load-more>إكتشف المزيد <span aria-hidden="true">↓</span></button>':'';more.querySelector('[data-load-more]')?.addEventListener('click',()=>{const old=shown;shown=Math.min(shown+batch,filtered.length);render(old);});}
  }
  search?.addEventListener('input',()=>{shown=batch;render();});select?.addEventListener('change',()=>{shown=batch;render();});render();
 }catch(e){if(error)error.hidden=false;grid.innerHTML='<p class="loading-card">تعذر تحميل المقالات حاليًا. يرجى المحاولة لاحقًا.</p>';if(count)count.textContent='تعذر تحميل الفهرس';}
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


/* Archive renderer: six articles initially, then six more per click. */
(()=>{
 const $=s=>document.querySelector(s),search=$('#archive-search'),select=$('#archive-category'),grid=$('#archive-grid'),count=$('#archive-count');
 if(!search||!select||!grid||!count)return;
 const params=new URLSearchParams(location.search),batch=6;let all=[],shown=batch;
 let more=$('#archive-load-more');if(!more){more=document.createElement('div');more.id='archive-load-more';more.className='pagination';more.hidden=true;grid.insertAdjacentElement('afterend',more);}
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 fetch('../data/articles.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{all=data;const cats=[...new Set(all.map(a=>a.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ar'));select.innerHTML='<option value="">كل التصنيفات</option>'+cats.map(cat=>'<option value="'+esc(cat)+'">'+esc(cat)+'</option>').join('');select.value=params.get('category')||'';search.value=params.get('q')||'';render();}).catch(()=>{const err=$('#archive-error');if(err)err.hidden=false;count.textContent='';grid.innerHTML='';more.hidden=true;});
 function render(animateFrom=-1){
  const q=(search.value||'').toLocaleLowerCase('ar').trim(),cat=select.value;
  const filtered=all.filter(a=>(!cat||a.category===cat)&&(!q||[a.title,a.description,a.category,...(a.tags||[])].join(' ').toLocaleLowerCase('ar').includes(q)));
  shown=Math.min(shown,filtered.length);
  grid.innerHTML=filtered.length?filtered.map((a,i)=>{const image=a.thumbnail||a.image||'assets/favicon.svg',src=/^(?:https?:)?\/\//i.test(image)?image:'../'+image,href='../articles/'+encodeURIComponent(a.file||a.slug+'.html');return '<article class="article-card mseo-load-card"'+(i>=shown?' hidden':'')+(i>=animateFrom&&i<shown?' data-enter="1"':'')+'><a href="'+href+'"><img loading="lazy" decoding="async" src="'+esc(src)+'" alt=""></a><div class="article-card-body"><span class="article-category">'+esc(a.category)+'</span><h3><a href="'+href+'">'+esc(a.title)+'</a></h3><p>'+esc(a.description)+'</p><a class="site-read" href="'+href+'">اقرأ المقال ←</a></div></article>';}).join(''):'<p class="loading-card">لا توجد نتائج مطابقة.</p>';
  grid.querySelectorAll('[data-enter="1"]').forEach(el=>{el.classList.add('mseo-card-enter');el.removeAttribute('data-enter');});
  count.textContent='عرض '+Math.min(shown,filtered.length)+' من '+filtered.length+' مقالًا';
  const left=filtered.length-shown;more.hidden=left<=0;more.innerHTML=left>0?'<button type="button" class="mseo-load-more" data-load-more>تحميل 6 مقالات إضافية <span aria-hidden="true">↓</span></button>':'';
  more.querySelector('[data-load-more]')?.addEventListener('click',()=>{const old=shown;shown=Math.min(shown+batch,filtered.length);render(old);});
 }
 search.addEventListener('input',()=>{shown=batch;render();});select.addEventListener('change',()=>{shown=batch;render();});
})();

