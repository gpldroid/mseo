/* MSEO theme stylesheet loader.
   Theme choice and persistence remain owned by assets/js/site.js. */
(() => {
  const THEME_ID = 'mseo-blue';
  const STYLE_ID = 'mseo-blue-theme-stylesheet';
  const scriptUrl = document.currentScript && document.currentScript.src
    ? new URL(document.currentScript.src, document.baseURI) : null;
  function ensureStylesheet() {
    if (document.getElementById(STYLE_ID)) return;
    const path = location.pathname;
    const nested = /\/(articles|pages)\//.test(path);
    const href = scriptUrl
      ? new URL('../css/theme-mseo-blue.css', scriptUrl).href
      : new URL((nested ? '../' : './') + 'assets/css/theme-mseo-blue.css', location.href).href;
    const link = document.createElement('link');
    link.id = STYLE_ID;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
  function syncTheme() {
    if (document.documentElement.dataset.theme === THEME_ID) ensureStylesheet();
  }
  syncTheme();
  new MutationObserver(syncTheme).observe(document.documentElement, {
    attributes: true, attributeFilter: ['data-theme']
  });
})();