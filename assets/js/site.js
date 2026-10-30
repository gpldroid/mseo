/* فاست سيو | Fast Seo shared public-site interactions. Does not run in the admin dashboard. */
(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const path = location.pathname;
  const nested = /\/(articles|pages)\//.test(path);
  const root = nested ? '../' : './';
  const link = (href) => root + href;

  // One validated catalog request per page; all article widgets reuse the same promise.
  const articleCatalog = (() => {
    let request = null;
    return {
      load() {
        if (!request) {
          const primary = new URL(link('data/articles.json'), location.href);
          const candidates = [...new Set([primary.href, new URL('/data/articles.json', location.origin).href])];
          request = (async () => {
            let lastError = null;
            for (const url of candidates) {
              try {
                const response = await fetch(url, { cache: 'no-cache', credentials: 'same-origin' });
                if (!response.ok) throw new Error('HTTP ' + response.status + ' loading ' + url);
                const data = await response.json();
                if (!Array.isArray(data)) throw new Error('Article catalog must be a JSON array');
                const valid = data.filter(article => article && typeof article.title === 'string' && article.title.trim() && ((typeof article.file === 'string' && article.file.trim()) || (typeof article.slug === 'string' && article.slug.trim())));
                if (!valid.length) throw new Error('Article catalog contains no valid article titles');
                return valid;
              } catch (error) { lastError = error; }
            }
            throw lastError || new Error('Unable to load the article catalog');
          })().catch(error => { request = null; throw error; });
        }
        return request;
      }
    };
  })();
  window.MSEOArticleCatalog = articleCatalog;

  // Refresh the brand shortcut icon on all pages so browsers do not keep the previous cached mark.
  document.querySelectorAll('link[rel~="icon"]').forEach((iconLink) => {
    iconLink.href = link('assets/favicon.svg?v=20261027');
  });


  // Load Font Awesome once across pages that use the shared site script.
  if (!document.querySelector('script[data-fontawesome-kit]')) {
    const fontAwesomeKit = document.createElement('script');
    fontAwesomeKit.src = 'https://kit.fontawesome.com/5ed1f7cde5.js';
    fontAwesomeKit.crossOrigin = 'anonymous';
    fontAwesomeKit.async = true;
    fontAwesomeKit.setAttribute('data-fontawesome-kit', '');
    document.head.appendChild(fontAwesomeKit);
  }

  const navItems = [
    ['index.html','الرئيسية'],
    ['pages/ai.html','الذكاء الاصطناعي'],
    ['pages/web-development.html','تطوير المواقع'],
    ['pages/programming.html','البرمجة'],
    ['pages/seo.html','SEO'],
    ['pages/tools.html','الأدوات'],
    ['pages/archive.html','الأرشيف']
  ];
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
          <button class="mseo-icon-button mseo-menu-toggle" type="button" aria-label="${'فتح القائمة'}" aria-expanded="false" data-menu-toggle><i class="fa-solid fa-bars" aria-hidden="true"></i></button>
          <a class="mseo-brand" href="${link('')}" aria-label="Fast Seo ${'الرئيسية'}"><img class="mseo-brand-logo" src="${link('assets/images/fastseo-logo-header.svg?v=20261027')}" alt="" width="148" height="46" decoding="async" style="display:block;width:148px;height:46px;object-fit:contain"></a>
          <nav class="mseo-nav" data-main-nav aria-label="${'القائمة الرئيسية'}">
            ${navItems.map(([href,label])=>`<a href="${link(href === 'index.html' ? '' : href)}" ${((href==='index.html' && (path.endsWith('/mseo/') || path.endsWith('/index.html') || path === '/')) || (href!=='index.html' && path.endsWith('/'+href)))?'aria-current="page"':''}>${label}</a>`).join('')}
          </nav>
          <div class="mseo-actions">
            <button class="mseo-icon-button" type="button" data-theme-toggle aria-label="فتح لوحة تغيير النمط" title="تغيير نمط الموقع"><i class="fa-solid fa-palette" aria-hidden="true"></i></button>
            <button class="mseo-icon-button" type="button" data-search-toggle aria-label="${'فتح البحث'}" title="${'بحث'}"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></button>
            </div>
        </div>
        <div class="mseo-search-panel" data-search-panel>
          <form action="${link('pages/archive.html')}" method="get"><label class="sr-only" for="mseo-global-search">${'ابحث في المقالات'}</label><input id="mseo-global-search" name="q" type="search" placeholder="${'ابحث في مقالات فاست سيو | Fast Seo…'}" /><button type="submit">${'بحث'}</button></form>
        </div>
      </header>`;
  }
  // Editorial ticker: six varied articles, moving at a calm pace below the site header.
  (() => {
    const siteHeader = $('[data-site-header] .mseo-header') || $('[data-home-header] .mseo-header') || $('.mseo-header');
    if (!siteHeader || $('[data-mseo-news-ticker]')) return;
    const ticker = document.createElement('section');
    ticker.className = 'mseo-news-ticker';
    ticker.setAttribute('data-mseo-news-ticker', '');
    ticker.setAttribute('aria-label', 'شريط المقالات والأخبار');
    ticker.innerHTML = '<div class="mseo-news-ticker-inner"><span class="mseo-news-ticker-label"><i class="fa-solid fa-bolt" aria-hidden="true"></i><span>مختارات فاست سيو</span></span><div class="mseo-news-ticker-window" aria-live="polite"><span class="mseo-news-ticker-loading">جارٍ تحميل المقالات…</span></div><div class="mseo-news-ticker-controls"><button type="button" data-ticker-prev aria-label="المقال السابق"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button><button type="button" data-ticker-toggle aria-label="إيقاف الشريط مؤقتًا" aria-pressed="false"><i class="fa-solid fa-pause" aria-hidden="true"></i></button><button type="button" data-ticker-next aria-label="المقال التالي"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button></div></div>';
    siteHeader.insertAdjacentElement('afterend', ticker);
    const windowEl = ticker.querySelector('.mseo-news-ticker-window');
    let items = [], active = 0, timer = null, paused = false;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const render = () => {
      if (!items.length) return;
      const item = items[active];
      const href = link('articles/' + encodeURIComponent(item.file || item.slug + '.html'));
      windowEl.innerHTML = '<a class="mseo-news-ticker-item" href="' + href + '"><span class="mseo-news-ticker-category">' + esc(item.category || 'مقالات') + '</span><span class="mseo-news-ticker-title">' + esc(item.title) + '</span><span class="mseo-news-ticker-number">' + String(active + 1).padStart(2, '0') + ' / 06</span></a>';
    };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const start = () => {
      stop();
      if (!paused && !reducedMotion && !document.hidden && items.length > 1) timer = setInterval(() => { active = (active + 1) % items.length; render(); }, 6500);
    };
    const step = direction => { if (!items.length) return; active = (active + direction + items.length) % items.length; render(); start(); };
    ticker.querySelector('[data-ticker-prev]').addEventListener('click', () => step(-1));
    ticker.querySelector('[data-ticker-next]').addEventListener('click', () => step(1));
    const toggle = ticker.querySelector('[data-ticker-toggle]');
    const updateToggle = () => {
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.setAttribute('aria-label', paused ? 'تشغيل الشريط' : 'إيقاف الشريط مؤقتًا');
      toggle.innerHTML = paused ? '<i class="fa-solid fa-play" aria-hidden="true"></i>' : '<i class="fa-solid fa-pause" aria-hidden="true"></i>';
    };
    toggle.addEventListener('click', () => { paused = !paused; updateToggle(); paused ? stop() : start(); });
    ticker.addEventListener('mouseenter', stop);
    ticker.addEventListener('mouseleave', start);
    ticker.addEventListener('focusin', stop);
    ticker.addEventListener('focusout', event => { if (!ticker.contains(event.relatedTarget)) start(); });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    // Load the shared article catalog once for the ticker.
    const loadCatalog = () => window.MSEOArticleCatalog.load();
    loadCatalog().then(articles => {
      // Oldest published entries first; select different categories before filling remaining slots.
      const sorted = articles.map((article, index) => ({...article, _tickerOrder:index}))
        .sort((a, b) => {
          const dateA = Date.parse(a.publishedAt || a.date || a.updatedAt || '') || 0;
          const dateB = Date.parse(b.publishedAt || b.date || b.updatedAt || '') || 0;
          return dateA - dateB || a._tickerOrder - b._tickerOrder;
        });
      const selected = [];
      const categories = new Set();
      for (const article of sorted) {
        const category = String(article.category || 'مقالات').trim();
        if (selected.length < 6 && !categories.has(category)) {
          selected.push(article);
          categories.add(category);
        }
      }
      for (const article of sorted) {
        if (selected.length >= 6) break;
        if (!selected.some(item => (item.slug || item.file) === (article.slug || article.file))) selected.push(article);
      }
      items = selected.slice(0, 6).map(({_tickerOrder, ...article}) => article);
      if (!items.length) throw new Error('No articles available for the ticker');
      render();
      start();
    }).catch(error => {
      console.error('[Fast Seo ticker] Article catalog failed:', error);
      // The homepage may already have rendered article cards; use their headings as a safe fallback.
      const cards = [...document.querySelectorAll('#article-grid article, [data-articles-grid] article, .article-card')];
      items = cards.map(card => {
        const titleLink = card.querySelector('h2 a, h3 a, .article-card-title a, a[href*="/articles/"]');
        if (!titleLink) return null;
        const href = titleLink.getAttribute('href') || '';
        const title = titleLink.textContent.trim();
        if (!title || !href) return null;
        return { title, file: href.split('/').pop().split('?')[0], category: card.querySelector('.article-category')?.textContent.trim() || 'مقالات' };
      }).filter(Boolean).slice(0, 6);
      if (items.length) {
        active = 0;
        render();
        start();
        return;
      }
      windowEl.textContent = 'تعذر تحميل عناوين المقالات. حاول تحديث الصفحة.';
      windowEl.setAttribute('role', 'status');
      windowEl.setAttribute('title', 'تعذر قراءة data/articles.json؛ تحقق من مسار الملف واستجابة الخادم.');
    });
  })();

  // Advertise the RSS feed to browsers and feed readers on every public page.
  if (!document.querySelector('link[rel="alternate"][type="application/rss+xml"]')) {
    const rssLink = document.createElement('link');
    rssLink.rel = 'alternate';
    rssLink.type = 'application/rss+xml';
    rssLink.title = 'فاست سيو | Fast Seo — RSS';
    rssLink.href = link('feed.xml');
    document.head.appendChild(rssLink);
  }

  const footer = $('[data-site-footer]') || $('[data-home-footer]');
  if (footer) {
    footer.innerHTML = `
      <footer class="mseo-footer">
        <div class="mseo-footer-inner">
          <section class="mseo-footer-brand-card" aria-label="عن فاست سيو">
            <a class="mseo-brand mseo-footer-brand" href="${link('')}" aria-label="فاست سيو — الصفحة الرئيسية">
              <img class="mseo-brand-logo" src="${link('assets/images/fastseo-logo-header.svg?v=20261028')}" alt="فاست سيو | Fast Seo" width="180" height="48" decoding="async" onerror="this.onerror=null;this.src='${link('assets/favicon.svg?v=20261028')}'">
            </a>
            <p class="mseo-footer-tagline">المرجع العربي نحو الظهور الأفضل في محركات البحث، مع أدلة عملية في SEO والذكاء الاصطناعي وتطوير المواقع.</p>
            <nav class="mseo-socials" aria-label="مواقع التواصل الاجتماعي">
              <a href="https://x.com/laraforum" target="_blank" rel="noopener noreferrer" aria-label="X"><i class="fa-brands fa-x-twitter" aria-hidden="true"></i></a>
              <a href="https://m.facebook.com/61577188775609" target="_blank" rel="noopener noreferrer" aria-label="فيسبوك"><i class="fa-brands fa-facebook-f" aria-hidden="true"></i></a>
              <a href="https://www.instagram.com/larache_forum" target="_blank" rel="noopener noreferrer" aria-label="إنستغرام"><i class="fa-brands fa-instagram" aria-hidden="true"></i></a>
              <a href="https://ma.linkedin.com/in/imad-limrani-0221aa3aa" target="_blank" rel="noopener noreferrer" aria-label="لينكدإن"><i class="fa-brands fa-linkedin-in" aria-hidden="true"></i></a>
              <a href="https://github.com/gpldroid/" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i class="fa-brands fa-github" aria-hidden="true"></i></a>
              <a href="https://wa.me/212783539816" target="_blank" rel="noopener noreferrer" aria-label="واتساب"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i></a>
            </nav>
          </section>
          <div class="mseo-footer-grid">            
            <section class="mseo-footer-group">
              <h3>الأرشيف و RSS</h3>
              <nav class="mseo-footer-links" aria-label="الأرشيف وRSS">
                <a href="${link('pages/archive.html')}">أرشيف المقالات</a>
                <a href="${link('feed.xml')}">خلاصة RSS</a>
                <a href="${link('sitemap.xml')}">خارطة الموقع</a>
              </nav>
            </section>
            <section class="mseo-footer-group">
              <h3>عن الموقع</h3>
              <nav class="mseo-footer-links" aria-label="عن الموقع والتواصل">
                <a href="${link('pages/about.html')}">من نحن</a>
                <a href="${link('pages/contact.html')}">اتصل بنا</a>
              </nav>
            </section>
            <section class="mseo-footer-group">
              <h3>الصفحات الأساسية</h3>
              <nav class="mseo-footer-links" aria-label="الصفحات الأساسية">
                <a href="${link('')}">الرئيسية</a>
                <a href="${link('pages/seo.html')}">تحسين محركات البحث</a>
                <a href="${link('pages/privacy.html')}">سياسة الخصوصية</a>
                <a href="${link('pages/terms.html')}">شروط الاستخدام</a>
                <a href="${link('pages/editorial-policy.html')}">سياسة النشر</a>
              </nav>
            </section>
            <section class="mseo-footer-group">
              <h3>روابط سريعة</h3>
              <nav class="mseo-footer-links" aria-label="روابط سريعة">
                <a href="${link('pages/topics.html')}">جميع المقالات</a>
                <a href="${link('pages/tools.html')}">الأدوات المجانية</a>
                <a href="${link('pages/categories.html')}">التصنيفات</a>
              </nav>
            </section>
          </div>
          <div class="mseo-copyright">
            <span class="mseo-footer-copyright-text">© فاست سيو <span data-footer-year>2026</span> جميع الحقوق محفوظة.</span>
            <span>تطوير <a href="${link('pages/about.html')}">Imad Limrani</a></span>
          </div>
        </div>
      </footer>`;
  }
  const year = $('[data-current-year]'); if (year) year.textContent = new Date().getFullYear();
  document.querySelectorAll('[data-footer-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  const menuButton=$('[data-menu-toggle]'), nav=$('[data-main-nav]');
  if(menuButton&&nav){menuButton.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');menuButton.setAttribute('aria-expanded',String(open));menuButton.innerHTML=open?'<i class="fa-solid fa-xmark" aria-hidden="true"></i>':'<i class="fa-solid fa-bars" aria-hidden="true"></i>';});nav.addEventListener('click',e=>{if(e.target.closest('a')){nav.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false');menuButton.innerHTML='<i class="fa-solid fa-bars" aria-hidden="true"></i>';}});}
  const searchButton=$('[data-search-toggle]'),searchPanel=$('[data-search-panel]');
  if(searchButton&&searchPanel){searchButton.addEventListener('click',()=>{const open=searchPanel.classList.toggle('is-open');if(open)$('#mseo-global-search')?.focus();});}

  // Mobile tab bar: point to the current category section when present, otherwise the archive.
  if (!document.querySelector('[data-mobile-tabbar]')) {
    const home = path === '/' || path.endsWith('/index.html') || path.endsWith('/mseo/');
    const pageMatch = path.match(/\/pages\/([^/]+)\.html$/);
    const categoryPage = Boolean(pageMatch && ['ai','web-development','programming','seo'].includes(pageMatch[1]));
    const tabs = [
      ['index.html','الرئيسية','fa-house',home],
      ['pages/categories.html','التصنيفات','fa-layer-group',path.endsWith('/pages/categories.html') || categoryPage],
      ['pages/topics.html','المقالات','fa-book-open',path.endsWith('/pages/topics.html') || path.includes('/articles/')],
      ['pages/tools.html','الأدوات','fa-screwdriver-wrench',path.endsWith('/pages/tools.html')],
      ['pages/archive.html','الأرشيف','fa-box-archive',path.endsWith('/pages/archive.html')]
    ];
    const bar = document.createElement('nav');
    bar.className = 'mseo-mobile-tabbar';
    bar.setAttribute('data-mobile-tabbar', '');
    bar.setAttribute('aria-label', 'التنقل السريع');
    bar.innerHTML = tabs.map(([href,label,icon,active]) => {
      const target = href.startsWith('#') ? href : link(href === 'index.html' ? '' : href);
      return '<a href="' + target + '"' + (active ? ' aria-current="page"' : '') + '><i class="fa-solid ' + icon + '" aria-hidden="true"></i><span>' + label + '</span></a>';
    }).join('');
    document.body.appendChild(bar);
  }

  // Upgrade common standalone decorative symbols to Font Awesome icons.
  const symbolIcons = {'✓':'fa-check','↓':'fa-arrow-down','↑':'fa-arrow-up','⌕':'fa-magnifying-glass','⌄':'fa-chevron-down','←':'fa-arrow-left','↗':'fa-arrow-up-right-from-square','✳':'fa-wand-magic-sparkles'};
  document.querySelectorAll('span[aria-hidden="true"], .eyebrow, .hero-points span, .hero-actions a').forEach(el => {
    if (el.children.length || el.closest('.mseo-mobile-tabbar')) return;
    const symbol = el.textContent.trim();
    if (symbolIcons[symbol]) {
      el.innerHTML = '<i class="fa-solid ' + symbolIcons[symbol] + '" aria-hidden="true"></i>';
    } else if (symbol.startsWith('✓ ')) {
      el.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> ' + symbol.slice(1).trim();
    }
  });

  const controls=document.createElement('div');controls.className='mseo-scroll-controls';controls.innerHTML='<button type="button" data-scroll-top aria-label="العودة إلى أعلى الصفحة" title="أعلى الصفحة"><i class="fa-solid fa-arrow-up" aria-hidden="true"></i></button><button type="button" data-scroll-down aria-label="الانتقال إلى أسفل الصفحة" title="أسفل الصفحة"><i class="fa-solid fa-arrow-down" aria-hidden="true"></i></button>';document.body.append(controls);
  const topButton=$('[data-scroll-top]',controls),downButton=$('[data-scroll-down]',controls);
  const onScroll=()=>topButton.classList.toggle('is-visible',window.scrollY>300);
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  topButton.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  downButton.addEventListener('click',()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'smooth'}));
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const target=$(a.getAttribute('href'));if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'});}}));
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
 window.MSEOArticleCatalog.load().then(data=>{all=data;const cats=[...new Set(all.map(a=>a.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ar'));select.innerHTML='<option value="">كل التصنيفات</option>'+cats.map(cat=>'<option value="'+esc(cat)+'">'+esc(cat)+'</option>').join('');select.value=params.get('category')||'';search.value=params.get('q')||'';render();}).catch(()=>{const err=$('#archive-error');if(err)err.hidden=false;count.textContent='';grid.innerHTML='';more.hidden=true;});
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



/* Shared enhancements for every individual article page. */
(() => {
  if (!/\/articles\/[^/]+\.html$/.test(location.pathname)) return;
  const root = '../';
  const $ = (selector, context=document) => context.querySelector(selector);
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const link = path => root + path;
  const main = $('main');
  const article = main && $('article', main);
  if (!main || !article || main.querySelector('.article-page-layout')) return;
  main.classList.add('article-page-main');
  const breadcrumb = $('nav[aria-label="مسار التنقل"]', main);
  // Normalize legacy article markup: the breadcrumb must sit outside <article>.
  // Otherwise the shared layout can be inserted into its own descendant and throw HierarchyRequestError.
  if (breadcrumb && article.contains(breadcrumb) && article.parentNode) {
    article.parentNode.insertBefore(breadcrumb, article);
  }
  const layout = document.createElement('div');
  layout.className = 'article-page-layout';
  const content = document.createElement('div');
  content.className = 'article-page-content';
  const sidebar = document.createElement('aside');
  sidebar.className = 'article-page-sidebar';
  sidebar.setAttribute('aria-label', 'الشريط الجانبي للمقالات');
  sidebar.innerHTML = '<section class="sidebar-widget"><h2>أحدث المقالات</h2><ul class="sidebar-latest" data-article-sidebar-latest><li>جارٍ تحميل المقالات…</li></ul></section><section class="sidebar-widget"><h2>تصفّح حسب التصنيف</h2><ul class="sidebar-categories" data-article-sidebar-categories><li>جارٍ تحميل التصنيفات…</li></ul></section><section class="sidebar-widget sidebar-promo"><span class="section-kicker">أدوات مجانية</span><h2>أنجز مهامك أسرع</h2><p>استخدم أدوات فاست سيو | Fast Seo المجانية لتحسين المحتوى وSEO وتطوير الويب.</p><a class="site-read" href="../pages/tools.html">استكشف الأدوات ←</a></section>';
  if (breadcrumb) breadcrumb.insertAdjacentElement('afterend', layout);
  else main.insertAdjacentElement('afterbegin', layout);
  layout.append(content, sidebar);
  content.appendChild(article);
  const carousel = document.createElement('section');
  carousel.className = 'section latest-carousel-section article-latest-carousel-section';
  carousel.setAttribute('aria-labelledby', 'article-latest-carousel-title');
  carousel.innerHTML = '<div class="section-heading"><div><span class="section-kicker">واصل الاستكشاف</span><h2 id="article-latest-carousel-title">أحدث المقالات</h2><p>مقالات وأدلة جديدة من مكتبة فاست سيو | Fast Seo.</p></div><span class="heading-count" aria-hidden="true">03 / 05</span></div><div class="latest-carousel" data-article-carousel><button class="carousel-arrow" type="button" data-article-prev aria-label="المقالات السابقة">‹</button><div class="latest-carousel-track" data-article-latest-carousel aria-live="polite"><div class="loading-card">جارٍ تحميل أحدث المقالات…</div></div><button class="carousel-arrow" type="button" data-article-next aria-label="المقالات التالية">›</button></div><div class="carousel-dots" data-article-carousel-dots aria-label="اختيار المقال"></div>';
  main.appendChild(carousel);
  window.MSEOArticleCatalog.load().then(items => {
    const articles = items.slice().sort((a,b) => String(b.updatedAt || b.publishedAt || '').localeCompare(String(a.updatedAt || a.publishedAt || '')));
    const latest = articles.slice(0, 5);
    const sidebarLatest = $('[data-article-sidebar-latest]');
    const sidebarCategories = $('[data-article-sidebar-categories]');
    if (sidebarLatest) sidebarLatest.innerHTML = latest.map(a => '<li><a href="' + link('articles/' + encodeURIComponent(a.file || a.slug + '.html')) + '">' + esc(a.title) + '</a><span>' + esc(a.category || 'مقالات') + '</span></li>').join('') || '<li>لا توجد مقالات حاليًا.</li>';
    const categories = [...new Set(articles.map(a => a.category).filter(Boolean))].sort((a,b) => a.localeCompare(b,'ar'));
    if (sidebarCategories) sidebarCategories.innerHTML = categories.map(category => '<li><a href="' + link('pages/archive.html') + '?category=' + encodeURIComponent(category) + '">' + esc(category) + '</a><span>' + articles.filter(a => a.category === category).length + '</span></li>').join('') || '<li>لا توجد تصنيفات حاليًا.</li>';
    const track = $('[data-article-latest-carousel]');
    const dots = $('[data-article-carousel-dots]');
    const carouselRoot = $('[data-article-carousel]');
    if (!track) return;
    track.innerHTML = latest.map((a,i) => {
      const href = link('articles/' + encodeURIComponent(a.file || a.slug + '.html'));
      const image = a.thumbnail || a.image || 'assets/favicon.svg';
      const imageSrc = /^https?:\/\//i.test(image) ? image : link(image);
      return '<article class="latest-carousel-card" data-article-slide="' + i + '"><a class="latest-carousel-image" href="' + href + '" tabindex="-1" aria-hidden="true"><img loading="lazy" decoding="async" width="480" height="270" sizes="(max-width: 540px) 90vw, (max-width: 800px) 45vw, 30vw" src="' + esc(imageSrc) + '" alt=""></a><div class="latest-carousel-copy"><span class="article-category">' + esc(a.category || 'مقالات') + '</span><span class="carousel-index">0' + (i+1) + ' / 0' + latest.length + '</span><h3><a href="' + href + '">' + esc(a.title) + '</a></h3><p>' + esc(a.description || 'اكتشف الدليل الكامل في مكتبة فاست سيو | Fast Seo.') + '</p><a class="button button-primary" href="' + href + '">اقرأ المقال <span aria-hidden="true">←</span></a></div></article>';
    }).join('') || '<p class="loading-card">لا توجد مقالات متاحة حاليًا.</p>';
    const slides = [...track.querySelectorAll('[data-article-slide]')];
    let active = 0, timer = null, visible = false;
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const show = index => {
      if (!slides.length) return;
      active = (index + slides.length) % slides.length;
      slides[active].scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'nearest', inline:'start'});
      if (dots) dots.querySelectorAll('button').forEach((dot,i) => {
        dot.setAttribute('aria-current', String(i === active));
        dot.setAttribute('aria-label', 'عرض المقال ' + (i+1));
      });
    };
    if (dots) {
      dots.innerHTML = slides.map((slide,i) => '<button type="button" aria-label="عرض المقال ' + (i+1) + '" aria-current="' + String(i === 0) + '" data-article-slide-to="' + i + '"></button>').join('');
      dots.querySelectorAll('[data-article-slide-to]').forEach(dot => dot.addEventListener('click', () => show(Number(dot.dataset.articleSlideTo))));
    }
    $('[data-article-prev]')?.addEventListener('click', () => show(active-1));
    $('[data-article-next]')?.addEventListener('click', () => show(active+1));
    const start = () => {
      stop();
      if (visible && !document.hidden && slides.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(() => show(active+1), 8000);
    };
    carouselRoot?.addEventListener('mouseenter', stop);
    carouselRoot?.addEventListener('mouseleave', start);
    carouselRoot?.addEventListener('focusin', stop);
    carouselRoot?.addEventListener('focusout', event => { if (!carouselRoot.contains(event.relatedTarget)) start(); });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    if ('IntersectionObserver' in window && carouselRoot) {
      const observer = new IntersectionObserver(entries => {
        visible = entries.some(entry => entry.isIntersecting);
        visible ? start() : stop();
      }, {threshold: 0.15});
      observer.observe(carouselRoot);
    } else { visible = true; start(); }
  }).catch(() => {
    const track = $('[data-article-latest-carousel]');
    if (track) track.innerHTML = '<p class="loading-card">تعذر تحميل أحدث المقالات.</p>';
  });
})();

/* AdSense placements: fluid units, loaded only shortly before they enter the viewport. */
(() => {
  const client = 'ca-pub-1849282438800062';
  const slot = '4210287912';
  const main = document.querySelector('main');
  if (!main) return;

  let adsenseLoadPromise = null;

  const loadAdsense = () => {
    if (adsenseLoadPromise) return adsenseLoadPromise;

    adsenseLoadPromise = new Promise((resolve, reject) => {
      let script = document.querySelector('script[data-mseo-adsense]');
      if (!script) {
        script = document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]');
      }

      if (script) {
        if (script.dataset.mseoAdsenseLoaded === 'true') {
          resolve();
          return;
        }
        script.addEventListener('load', resolve, { once: true });
        script.addEventListener('error', () => reject(new Error('AdSense failed to load')), { once: true });
        return;
      }

      script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + client;
      script.dataset.mseoAdsense = '';
      script.addEventListener('load', () => {
        script.dataset.mseoAdsenseLoaded = 'true';
        resolve();
      }, { once: true });
      script.addEventListener('error', () => {
        adsenseLoadPromise = null;
        script.remove();
        reject(new Error('AdSense failed to load'));
      }, { once: true });
      document.head.appendChild(script);
    });

    return adsenseLoadPromise;
  };

  const requestAd = ins => {
    if (ins.dataset.mseoAdRequested === 'true') return;
    ins.dataset.mseoAdRequested = 'true';

    loadAdsense()
      .then(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      })
      .catch(error => {
        delete ins.dataset.mseoAdRequested;
        console.warn('[Fast Seo AdSense] Ad could not be initialized:', error);
      });
  };

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          const ins = entry.target.querySelector('ins.adsbygoogle');
          if (ins) requestAd(ins);
        });
      }, { rootMargin: '300px 0px', threshold: 0 })
    : null;

  const placeAdAfter = (anchor, placement) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'mseo-ad-placement mseo-ad-' + placement;
    wrapper.dataset.mseoAdPlacement = placement;
    wrapper.setAttribute('role', 'complementary');
    wrapper.setAttribute('aria-label', 'إعلان');

    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-format', 'fluid');
    ins.setAttribute('data-ad-layout-key', '-fb+5w+4e-db+86');
    ins.setAttribute('data-ad-client', client);
    ins.setAttribute('data-ad-slot', slot);
    wrapper.appendChild(ins);

    // Insert first so AdSense measures the final layout, then observe the placement.
    anchor.insertAdjacentElement('afterend', wrapper);
    if (observer) observer.observe(wrapper);
    else requestAd(ins);
  };

  if (/\\/articles\\/[^/]+\\.html$/.test(location.pathname)) {
    const prose = main.querySelector('article .prose');
    if (!prose) return;
    const paragraphs = [...prose.querySelectorAll('p')].filter(p => p.textContent.trim());
    if (!paragraphs.length) return;

    const middleIndex = Math.max(0, Math.floor(paragraphs.length / 2) - 1);
    if (!prose.querySelector('[data-mseo-ad-placement="middle"]')) {
      placeAdAfter(paragraphs[middleIndex], 'middle');
    }

    const finalParagraph = paragraphs[paragraphs.length - 1];
    if (!prose.querySelector('[data-mseo-ad-placement="bottom"]')) {
      placeAdAfter(finalParagraph, 'bottom');
    }
    return;
  }

  if (main.classList.contains('seo-tool-page')) {
    const paragraphs = [...main.querySelectorAll('p')].filter(p => p.textContent.trim());
    if (!paragraphs.length || main.querySelector('[data-mseo-ad-placement="bottom"]')) return;
    placeAdAfter(paragraphs[paragraphs.length - 1], 'bottom');
  }
})();

/* Category archive cards: reveal six articles at a time, matching the homepage. */
(() => {
  document.querySelectorAll('[data-category-grid]').forEach(grid => {
    const cards = [...grid.children].filter(card => card.classList.contains('category-article-card'));
    if (cards.length <= 6) return;
    const batch = 6;
    let shown = batch;
    cards.forEach((card, index) => { card.hidden = index >= shown; });
    const controls = document.createElement('div');
    controls.className = 'category-load-more-wrap';
    controls.innerHTML = '<p class="category-load-more-count" aria-live="polite"></p><button type="button" class="mseo-load-more" data-category-load-more>تحميل 6 مقالات إضافية <span aria-hidden="true">↓</span></button>';
    grid.insertAdjacentElement('afterend', controls);
    const button = controls.querySelector('[data-category-load-more]');
    const count = controls.querySelector('.category-load-more-count');
    const update = () => {
      count.textContent = 'عرض ' + Math.min(shown, cards.length) + ' من ' + cards.length + ' مقالًا';
      const left = cards.length - shown;
      button.hidden = left <= 0;
      if (left > 0) button.innerHTML = 'تحميل ' + Math.min(batch, left) + ' مقالات إضافية <span aria-hidden="true">↓</span>';
    };
    button.addEventListener('click', () => {
      const nextShown = Math.min(shown + batch, cards.length);
      cards.slice(shown, nextShown).forEach(card => { card.hidden = false; });
      shown = nextShown;
      update();
    });
    update();
  });
})();
