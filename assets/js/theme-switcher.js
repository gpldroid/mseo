/* Fast SEO seven-theme picker. Loaded on all public pages by assets/js/site.js. */
(() => {
  'use strict';
  const THEME_CSS_ID = 'fastseo-theme-system-css';
  const STORAGE_KEY = 'fastseo-theme';
  const themes = [
    {id:'modern-seo',name:'Modern SEO',icon:'fa-compass',desc:'متوازن، واضح ومهني للاستخدام اليومي.',mode:'فاتح',colors:['#f4f7fc','#2456d8','#18a6a1','#dbe4f1']},
    {id:'dark-tech',name:'Dark Tech',icon:'fa-microchip',desc:'واجهة داكنة ولمسات كهربائية للمحتوى التقني.',mode:'داكن',colors:['#080d18','#80a5ff','#55e6d2','#273650']},
    {id:'editorial-pro',name:'Editorial Pro',icon:'fa-newspaper',desc:'أسلوب مجلة تحريري للقراءة والمقالات الطويلة.',mode:'فاتح',colors:['#f7f2e9','#8e3548','#bd8a55','#e3d8c8']},
    {id:'glass-ai',name:'Glass AI',icon:'fa-wand-magic-sparkles',desc:'طبقات زجاجية خفيفة وهوية مستقبلية للذكاء الاصطناعي.',mode:'فاتح',colors:['#edf4ff','#6557e8','#32bce5','rgba(151,174,224,.48)']},
    {id:'emerald-growth',name:'Emerald Growth',icon:'fa-seedling',desc:'أخضر للنمو والتسويق وتحسين الظهور.',mode:'فاتح',colors:['#f2f8f4','#13845b','#a5cc56','#d4e6da']},
    {id:'mono-minimal',name:'Mono Minimal',icon:'fa-minimize',desc:'بساطة عالية وتركيز على النص والمحتوى.',mode:'فاتح',colors:['#ffffff','#171717','#858585','#e4e4e4']},
    {id:'gradient-pulse',name:'Gradient Pulse',icon:'fa-bolt',desc:'تدرجات حيوية لمظهر إبداعي متجدد.',mode:'فاتح',colors:['#f7f4ff','#7046e8','#f28a52','#e5dcff']}
  ];
  const root = document.documentElement;
  const $ = (selector, parent=document) => parent.querySelector(selector);
  const safeGet = () => { try { return localStorage.getItem(STORAGE_KEY); } catch (_) { return null; } };
  const safeSet = value => { try { localStorage.setItem(STORAGE_KEY, value); } catch (_) {} };
  const valid = id => themes.some(theme => theme.id === id);
  const saved = safeGet();
  const legacy = (() => { try { return localStorage.getItem('mseo-theme'); } catch (_) { return null; } })();
  const legacyMap = {editorial:'editorial-pro',tech:'dark-tech',compact:'modern-seo',reading:'editorial-pro','mseo-blue':'glass-ai'};
  let active = valid(saved) ? saved : (legacyMap[legacy] || 'modern-seo');
  let backdrop, panel, lastFocus;
  function ensureCss() {
    if ($('#' + THEME_CSS_ID)) return;
    const currentScript = document.querySelector('script[data-mseo-theme-switcher-loader]');
    const href = currentScript && currentScript.src
      ? new URL('../css/theme-system.css', currentScript.src).href
      : new URL((/\/(articles|pages)\//.test(location.pathname) ? '../' : './') + 'assets/css/theme-system.css', location.href).href;
    const link = document.createElement('link');
    link.id = THEME_CSS_ID;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
  function apply(id, persist=true) {
    active = valid(id) ? id : 'modern-seo';
    root.dataset.theme = active;
    root.classList.toggle('dark', active === 'dark-tech');
    const theme = themes.find(item => item.id === active);
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.innerHTML = '<i class="fa-solid fa-palette" aria-hidden="true"></i>';
      button.title = 'تغيير النمط — الحالي: ' + theme.name;
      button.setAttribute('aria-label', 'فتح لوحة تغيير النمط. النمط الحالي: ' + theme.name);
      button.setAttribute('aria-haspopup', 'dialog');
      button.setAttribute('aria-expanded', String(Boolean(backdrop && !backdrop.hidden)));
    });
    const quickToggle = $('[data-theme-float]');
    if (quickToggle) {
      const dark = active === 'dark-tech';
      quickToggle.innerHTML = dark ? '<i class="fa-solid fa-sun" aria-hidden="true"></i>' : '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
      quickToggle.title = dark ? 'التبديل إلى المظهر الفاتح' : 'التبديل إلى المظهر الداكن';
      quickToggle.setAttribute('aria-label', quickToggle.title);
      quickToggle.setAttribute('aria-pressed', String(dark));
    }
    if (persist) safeSet(active);
    if (panel) {
      panel.querySelectorAll('[data-theme-choice]').forEach(button => {
        const selected = button.dataset.themeChoice === active;
        button.setAttribute('aria-pressed', String(selected));
        const badge = $('[data-active-badge]', button);
        if (badge) badge.hidden = !selected;
      });
    }
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => {
      meta.content = theme.colors[0];
    });
  }
  function preview(theme) {
    return '<span class="mseo-style-preview" style="--preview-bg:' + theme.colors[0] + ';--preview-brand:' + theme.colors[1] + ';--preview-accent:' + theme.colors[2] + ';--preview-line:' + theme.colors[3] + ';--preview-card:' + theme.colors[0] + ';--preview-muted:' + theme.colors[1] + ';--preview-gradient:linear-gradient(135deg,' + theme.colors[1] + ',' + theme.colors[2] + ')" aria-hidden="true"><span class="mseo-style-preview-bar"><i></i><i></i><i></i><span></span></span><span class="mseo-style-preview-hero"><span class="mseo-style-preview-lines"><i></i><i></i><i></i></span><span class="mseo-style-preview-art"></span></span><span class="mseo-style-preview-cards"><i></i><i></i><i></i></span></span>';
  }
  function buildPanel() {
    if (backdrop) return;
    backdrop = document.createElement('div');
    backdrop.className = 'mseo-style-backdrop';
    backdrop.hidden = true;
    backdrop.innerHTML = '<section class="mseo-style-panel" role="dialog" aria-modal="true" aria-labelledby="mseo-style-title" tabindex="-1"><header class="mseo-style-panel-head"><div><h2 id="mseo-style-title">اختر نمط الموقع</h2><p>تغيير شامل للتصميم مع بقاء المقالات والروابط كما هي.</p></div><button type="button" class="mseo-style-close" data-theme-close aria-label="إغلاق لوحة الأنماط"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></header><div class="mseo-style-grid" data-theme-grid></div></section>';
    const grid = $('[data-theme-grid]', backdrop);
    grid.innerHTML = themes.map(theme => '<button type="button" class="mseo-style-option" data-theme-choice="' + theme.id + '" aria-pressed="false">' + preview(theme) + '<span class="mseo-style-option-name"><i class="fa-solid ' + theme.icon + '" aria-hidden="true"></i><span>' + theme.name + '</span><span class="mseo-style-active" data-active-badge hidden><i class="fa-solid fa-check" aria-hidden="true"></i> الحالي</span></span><p>' + theme.desc + ' <span>· ' + theme.mode + '</span></p></button>').join('');
    document.body.appendChild(backdrop);
    panel = $('.mseo-style-panel', backdrop);
    grid.addEventListener('click', event => {
      const button = event.target.closest('[data-theme-choice]');
      if (!button) return;
      apply(button.dataset.themeChoice, true);
      closePanel();
    });
    $('[data-theme-close]', backdrop).addEventListener('click', closePanel);
    backdrop.addEventListener('click', event => { if (event.target === backdrop) closePanel(); });
    document.addEventListener('keydown', event => {
      if (backdrop.hidden) return;
      if (event.key === 'Escape') { event.preventDefault(); closePanel(); }
      if (event.key === 'Tab') {
        const focusable = [...panel.querySelectorAll('button:not([disabled])')];
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    apply(active, false);
  }
  function openPanel() {
    buildPanel();
    lastFocus = document.activeElement;
    backdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    apply(active, false);
    $('[data-theme-choice="' + active + '"]', backdrop)?.focus();
  }
  function closePanel() {
    if (!backdrop || backdrop.hidden) return;
    backdrop.hidden = true;
    document.body.style.overflow = '';
    document.querySelectorAll('[data-theme-toggle]').forEach(button => button.setAttribute('aria-expanded','false'));
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }
  function createFloatingButton() {
    if ($('[data-theme-float]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mseo-style-float';
    button.dataset.themeFloat = '';
    button.setAttribute('aria-label','التبديل إلى المظهر الداكن');
    button.setAttribute('aria-pressed','false');
    button.title = 'التبديل بين المظهر الفاتح والداكن';
    button.innerHTML = '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
    document.body.appendChild(button);
  }
  function onTrigger(event) {
    const trigger = event.target.closest && event.target.closest('[data-theme-toggle], [data-theme-float]');
    if (!trigger) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (trigger.matches('[data-theme-float]')) {
      apply(active === 'dark-tech' ? 'modern-seo' : 'dark-tech', true);
      return;
    }
    if (backdrop && !backdrop.hidden) closePanel(); else openPanel();
  }
  function init() {
    ensureCss();
    apply(active, !valid(saved));
    createFloatingButton();
    document.addEventListener('click', onTrigger, true);
    // Keep this theme system authoritative if older scripts adjust data-theme.
    const observer = new MutationObserver(() => {
      if (root.dataset.theme !== active) apply(active, false);
    });
    observer.observe(root, {attributes:true, attributeFilter:['data-theme']});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
