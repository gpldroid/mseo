/* FastSEO homepage renderer. Keeps the shared header/footer runtime in site.js. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  // Inline onerror handlers are intentionally stripped by DOMPurify; preserve broken-image fallback behavior safely.
  document.addEventListener('error', event => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement)) return;
    image.closest('.article-card a, .latest-carousel-card a')?.remove();
  }, true);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const localAsset = value => {
    const path = String(value || '').trim();
    if (!path || !window.FastSEODOM) return '';
    return window.FastSEODOM.safeURL(path, { allowExternalImages: true });
  };
  const articleUrl = article => 'articles/' + encodeURIComponent(article.file || ((article.slug || '') + '.html'));
  const imageSource = article => localAsset(article.thumbnail || article.image || '');
  const responsiveImageUrl = (source, width) => {
    if (!source) return '';
    try {
      const url = new URL(source, location.href);
      if (url.hostname === 'images.unsplash.com') {
        url.searchParams.set('auto', 'format');
        url.searchParams.set('fit', 'crop');
        url.searchParams.set('w', String(width));
        url.searchParams.set('q', '68');
        return url.href;
      }
    } catch (_) {}
    return source;
  };
  const imageUrl = article => responsiveImageUrl(imageSource(article), 640);
  const imageSrcSet = (article, widths = [320, 640, 960]) => {
    const source = imageSource(article);
    try {
      const url = new URL(source, location.href);
      if (url.hostname === 'images.unsplash.com') {
        return widths.map(width => responsiveImageUrl(source, width) + ' ' + width + 'w').join(', ');
      }
    } catch (_) {}
    return '';
  };
  const sortedArticles = items => items.slice().sort((a, b) =>
    String(b.updatedAt || b.publishedAt || '').localeCompare(String(a.updatedAt || a.publishedAt || ''))
  );
  const categories = [
    {name:'SEO', href:'pages/seo.html', desc:'الكلمات المفتاحية، الفهرسة، والروابط الداخلية'},
    {name:'تطوير المواقع', href:'pages/web-development.html', desc:'بناء المواقع، الأداء، وتجربة المستخدم'},
    {name:'البرمجة', href:'pages/programming.html', desc:'لغات البرمجة وأمثلة عملية للمطورين'},
    {name:'الذكاء الاصطناعي', href:'pages/ai.html', desc:'أدوات الذكاء الاصطناعي وتطبيقاتها'},
    {name:'أداء المواقع', href:'pages/web-development.html', desc:'السرعة وCore Web Vitals'},
    {name:'تصميم المواقع', href:'pages/web-development.html', desc:'واجهات واضحة وتجربة استخدام أفضل'}
  ];
  const card = article => {
    const image = imageUrl(article);
    return '<article class="article-card">' +
      (image ? '<a href="' + articleUrl(article) + '" tabindex="-1" aria-hidden="true"><img src="' + esc(image) + '"' + (imageSrcSet(article, [320, 480, 640]) ? ' srcset="' + esc(imageSrcSet(article, [320, 480, 640])) + '" sizes="(max-width: 700px) calc(100vw - 36px), (max-width: 1100px) 50vw, 33vw"' : '') + ' alt="" width="640" height="400" loading="lazy" decoding="async" onerror="this.closest(\'a\').remove()"></a>' : '') +
      '<div class="article-card-body"><span class="article-category">' + esc(article.category || 'مقالات') + '</span>' +
      '<h3><a href="' + articleUrl(article) + '" aria-label="' + esc(article.title) + '">' + esc(article.title) + '</a></h3>' +
      (article.description ? '<p>' + esc(article.description) + '</p>' : '') +
      '<a class="site-read" href="' + articleUrl(article) + '" aria-label="' + esc(article.title) + '">اقرأ الدليل <span aria-hidden="true">←</span></a></div></article>';
  };
  function init(items) {
    const all = sortedArticles(items);
    const grid = $('#article-grid');
    const search = $('#article-search');
    const select = $('#article-category');
    const count = $('#results-count');
    const pagination = $('#pagination');
    const error = $('#load-error');
    const pageSize = 9;
    let page = 1;
    const uniqueCategories = [...new Set(all.map(item => item.category).filter(Boolean))].sort((a,b) => a.localeCompare(b, 'ar'));
    if (select) window.FastSEODOM.setHTML(select, '<option value="">كل التصنيفات</option>' + uniqueCategories.map(cat => '<option value="' + esc(cat) + '">' + esc(cat) + '</option>').join(''));

    function render() {
      if (!grid) return;
      const query = (search?.value || '').trim().toLocaleLowerCase('ar');
      const category = select?.value || '';
      const filtered = all.filter(item => (!category || item.category === category) &&
        (!query || [item.title, item.description, item.category, item.subcategory, ...(item.tags || [])].join(' ').toLocaleLowerCase('ar').includes(query)));
      const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
      page = Math.min(Math.max(1, page), pageCount);
      const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
      window.FastSEODOM.setHTML(grid, visible.length ? visible.map(card).join('') : '<p class="loading-card">لا توجد مقالات مطابقة. جرّب كلمة بحث أو تصنيفًا آخر.</p>');
      if (count) count.textContent = 'عرض ' + (filtered.length ? (page - 1) * pageSize + 1 : 0) + '–' + Math.min(page * pageSize, filtered.length) + ' من ' + filtered.length + ' مقالًا';
      if (pagination) {
        pagination.hidden = pageCount <= 1;
        window.FastSEODOM.setHTML(pagination, pageCount <= 1 ? '' :
          '<button type="button" data-page="' + (page - 1) + '"' + (page === 1 ? ' disabled' : '') + '>السابق</button>' +
          Array.from({length:pageCount}, (_,i) => i + 1).map(n => '<button type="button" data-page="' + n + '"' + (n === page ? ' aria-current="page"' : '') + '>' + n + '</button>').join('') +
          '<button type="button" data-page="' + (page + 1) + '"' + (page === pageCount ? ' disabled' : '') + '>التالي</button>');
      }
      if (error) error.hidden = true;
    }
    search?.addEventListener('input', () => { page = 1; render(); });
    select?.addEventListener('change', () => { page = 1; render(); });
    pagination?.addEventListener('click', event => {
      const button = event.target.closest('button[data-page]');
      if (!button || button.disabled) return;
      page = Number(button.dataset.page) || 1;
      render();
      $('#articles')?.scrollIntoView({behavior:'smooth', block:'start'});
    });
    render();

    const latest = all.slice(0, 5);
    const track = $('[data-latest-carousel]');
    const dots = $('[data-carousel-dots]');
    const carousel = $('[data-carousel]');
    if (track) {
      if (latest.length) {
        let active = 0;
        const paint = () => {
          const item = latest[active];
          const image = imageUrl(item);
          window.FastSEODOM.setHTML(track, '<article class="latest-carousel-card">' +
            (image ? '<a class="latest-carousel-image" href="' + articleUrl(item) + '"><img src="' + esc(image) + '"' + (imageSrcSet(item) ? ' srcset="' + esc(imageSrcSet(item)) + '" sizes="(max-width: 700px) calc(100vw - 60px), 50vw"' : '') + ' alt="' + esc(item.title) + '" width="640" height="360" loading="' + (active === 0 ? 'eager' : 'lazy') + '"' + (active === 0 ? ' fetchpriority="high"' : '') + ' decoding="async" onerror="this.closest(\'a\').remove()"></a>' : '') +
            '<div class="latest-carousel-copy"><span class="article-category">' + esc(item.category || 'مقالات') + '</span>' +
            '<h3><a href="' + articleUrl(item) + '" aria-label="' + esc(item.title) + '">' + esc(item.title) + '</a></h3>' +
            '<p>' + esc(item.description || '') + '</p><a class="button button-primary" href="' + articleUrl(item) + '" aria-label="' + esc(item.title) + '">اقرأ المقال <span aria-hidden="true">←</span></a></div></article>');
          if (dots) window.FastSEODOM.setHTML(dots, latest.map((item, i) => '<button type="button" data-slide="' + i + '" aria-label="عرض المقال ' + (i + 1) + '"' + (i === active ? ' aria-current="true"' : '') + '></button>').join(''));
          carousel?.setAttribute('data-active-slide', String(active));
        };
        const move = delta => { active = (active + delta + latest.length) % latest.length; paint(); };
        $('[data-carousel-prev]')?.addEventListener('click', () => move(-1));
        $('[data-carousel-next]')?.addEventListener('click', () => move(1));
        dots?.addEventListener('click', event => {
          const button = event.target.closest('[data-slide]');
          if (!button) return;
          active = Number(button.dataset.slide) || 0;
          paint();
        });
        paint();
      } else window.FastSEODOM.setHTML(track, '<p class="loading-card">لا توجد مقالات منشورة بعد.</p>');
    }

    const sidebarCard = (item, rank) => {
      const image = imageUrl(item);
      return '<li class="sidebar-article-item">' +
        '<a class="sidebar-article-thumb" href="' + articleUrl(item) + '" tabindex="-1" aria-hidden="true">' +
        (image ? '<img src="' + esc(image) + '" alt="" width="88" height="66" loading="lazy" decoding="async">' : '<span aria-hidden="true">✦</span>') +
        '</a><div class="sidebar-article-copy">' +
        (rank ? '<span class="sidebar-rank">' + rank + '</span>' : '') +
        '<a class="sidebar-article-title" href="' + articleUrl(item) + '">' + esc(item.title) + '</a>' +
        '<span class="sidebar-article-category">' + esc(item.category || 'مقالات') + '</span></div></li>';
    };
    const sidebarLatest = $('[data-sidebar-latest]');
    const newestFirst = all.slice().sort((a,b) => String(b.publishedAt || b.updatedAt || '').localeCompare(String(a.publishedAt || a.updatedAt || '')));
    const oldestFirst = all.slice().sort((a,b) => String(a.publishedAt || a.updatedAt || '').localeCompare(String(b.publishedAt || b.updatedAt || '')));
    if (sidebarLatest) window.FastSEODOM.setHTML(sidebarLatest, newestFirst.slice(0, 5).map((item, index) => sidebarCard(item, index + 1)).join('') || '<li>لا توجد مقالات بعد.</li>');
    // This static GitHub Pages site has no per-article view counter. Until analytics data is integrated,
    // the requested "most viewed" block is transparently ordered from oldest published to newest.
    const sidebarPopular = $('[data-sidebar-popular]');
    if (sidebarPopular) window.FastSEODOM.setHTML(sidebarPopular, oldestFirst.slice(0, 5).map((item, index) => sidebarCard(item, index + 1)).join('') || '<li>لا توجد مقالات بعد.</li>');
    const sidebarCategories = $('[data-sidebar-categories]');
    if (sidebarCategories) window.FastSEODOM.setHTML(sidebarCategories, uniqueCategories.map(cat => {
      const total = all.filter(item => item.category === cat).length;
      return '<li><a href="' + (categories.find(item => item.name === cat)?.href || 'pages/archive.html?category=' + encodeURIComponent(cat)) + '">' + esc(cat) + '</a><span class="sidebar-category-count">' + total + '</span></li>';
    }).join(''));

    const categoryGrid = $('#category-grid');
    if (categoryGrid) {
      const categoryData = uniqueCategories.map(name => {
        const meta = categories.find(item => item.name === name) || {href:'pages/archive.html?category=' + encodeURIComponent(name), desc:'مقالات وأدلة عملية في ' + name};
        return {...meta, name, total:all.filter(item => item.category === name).length};
      });
      window.FastSEODOM.setHTML(categoryGrid, categoryData.map(item => '<a class="category-card" href="' + item.href + '">' +
        '<span class="site-card-icon" aria-hidden="true">✦</span><h3>' + esc(item.name) + '</h3><p>' + esc(item.desc) + '</p><span class="site-read">' + item.total + ' مقالًا <span aria-hidden="true">←</span></span></a>').join(''));
    }
  }
  function start() {
    if (!$('#article-grid') && !$('[data-latest-carousel]') && !$('#category-grid')) return;
    const catalog = window.MSEOArticleCatalog;
    if (!catalog || typeof catalog.load !== 'function') {
      const error = $('#load-error');
      if (error) { error.hidden = false; error.textContent = 'تعذر تشغيل محمّل المقالات. حدّث الصفحة أو أعد المحاولة.'; }
      return;
    }
    catalog.load().then(init).catch(error => {
      console.error('[FastSEO homepage] Failed to load article catalog:', error);
      const grid = $('#article-grid');
      if (grid) window.FastSEODOM.setHTML(grid, '<p class="loading-card">تعذر تحميل المقالات. تحقق من اتصالك ثم أعد تحديث الصفحة.</p>');
      const track = $('[data-latest-carousel]');
      if (track) window.FastSEODOM.setHTML(track, '<p class="loading-card">تعذر تحميل أحدث المقالات.</p>');
      const count = $('#results-count');
      if (count) count.textContent = 'تعذر تحميل القائمة';
      const loadError = $('#load-error');
      if (loadError) loadError.hidden = false;
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
