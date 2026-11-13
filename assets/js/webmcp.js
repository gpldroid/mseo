/* Fast Seo WebMCP progressive enhancement. Requires HTTPS and a supporting browser. */
(() => {
  'use strict';
  if (window.__fastseoWebMcpInit) return;
  window.__fastseoWebMcpInit = true;
  const emit = (status, details = {}) => {
    document.documentElement.dataset.webmcp = status;
    document.dispatchEvent(new CustomEvent('fastseo:webmcp-status', { detail: { status, ...details } }));
  };
  const modelContext = document.modelContext;
  if (!modelContext || typeof modelContext.registerTool !== 'function') {
    emit('unsupported');
    return;
  }
  const script = document.querySelector('script[data-fastseo-webmcp]');
  const catalogUrl = script?.dataset.catalogUrl;
  const articlesUrl = script?.dataset.articlesUrl;
  const toolsCatalogUrl = script?.dataset.toolsCatalogUrl;
  if (!catalogUrl || !articlesUrl || !toolsCatalogUrl) {
    emit('error', { reason: 'catalog-or-data-url-missing' });
    return;
  }
  const controllers = [];
  const normalize = value => String(value || '').trim().toLocaleLowerCase();
  const fetchJson = async url => {
    const response = await fetch(url, { credentials: 'same-origin', cache: 'no-cache' });
    if (!response.ok) throw new Error('Data request failed: ' + response.status);
    return response.json();
  };
  let articlesPromise;
  const loadArticles = () => {
    if (!articlesPromise) {
      articlesPromise = fetchJson(articlesUrl).then(data => {
        if (!Array.isArray(data)) throw new Error('Article catalog must be a JSON array');
        return data.filter(item => item && typeof item.title === 'string' && typeof (item.file || item.slug) === 'string');
      }).catch(error => { articlesPromise = null; throw error; });
    }
    return articlesPromise;
  };
  const loadTools = async () => {
    if (Array.isArray(window.MSEOToolsCatalog)) return window.MSEOToolsCatalog;
    await new Promise((resolve, reject) => {
      const target = new URL(toolsCatalogUrl, location.href).href;
      const existing = [...document.scripts].find(item => item.src === target);
      if (existing) {
        if (existing.dataset.loaded === 'true') return resolve();
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      const loader = document.createElement('script');
      loader.src = target;
      loader.async = true;
      loader.addEventListener('load', () => { loader.dataset.loaded = 'true'; resolve(); }, { once: true });
      loader.addEventListener('error', reject, { once: true });
      document.head.appendChild(loader);
    });
    if (!Array.isArray(window.MSEOToolsCatalog)) throw new Error('Structured tools catalog was not exposed by tools-catalog.js');
    return window.MSEOToolsCatalog;
  };
  const analyzeHtml = ({ htmlSource, pageUrl = '' } = {}) => {
    if (typeof htmlSource !== 'string' || htmlSource.trim().length < 20) return { error: 'Provide at least 20 characters of HTML source.' };
    const parsed = new DOMParser().parseFromString(htmlSource, 'text/html');
    const meta = name => parsed.querySelector('meta[name="' + name + '"]')?.content?.trim() || '';
    const title = parsed.querySelector('title')?.textContent?.trim() || '';
    const description = meta('description');
    const robots = meta('robots');
    const canonical = parsed.querySelector('link[rel="canonical"]')?.href || '';
    const h1 = [...parsed.querySelectorAll('h1')].map(node => node.textContent.trim()).filter(Boolean);
    const images = [...parsed.images];
    const links = [...parsed.querySelectorAll('a[href]')];
    let internal = 0, external = 0, origin = '';
    try { origin = pageUrl ? new URL(pageUrl).origin : location.origin; } catch (_) {}
    links.forEach(anchor => {
      try { if (new URL(anchor.href, pageUrl || location.href).origin === origin) internal += 1; else external += 1; } catch (_) {}
    });
    const missingAlt = images.filter(image => !image.hasAttribute('alt')).length;
    const issues = [];
    if (!title) issues.push('Missing title element');
    if (!description) issues.push('Missing meta description');
    if (h1.length !== 1) issues.push('Expected one H1; found ' + h1.length);
    if (!canonical) issues.push('Missing canonical URL');
    if (missingAlt) issues.push(missingAlt + ' image(s) missing alt attributes');
    if (/noindex/i.test(robots)) issues.push('Robots meta contains noindex');
    return { title, description, canonical, robots, h1, images:{total:images.length,missingAlt}, links:{total:links.length,internal,external}, issues, note:'Static HTML inspection only; no URL was fetched and no ranking or Core Web Vitals assessment was performed.' };
  };
  const handlers = {
    fastseo_search_articles: async ({ query, limit = 5 } = {}) => {
      const term = normalize(query);
      if (!term) return { error: 'A non-empty search query is required.' };
      const articles = await loadArticles();
      const matches = articles.filter(article => [article.title,article.description,article.category,article.subcategory,...(Array.isArray(article.tags)?article.tags:[])].join(' ').toLocaleLowerCase().includes(term))
        .slice(0, Math.min(10, Math.max(1, Number(limit) || 5)));
      return { query:String(query).trim(), count:matches.length, articles:matches.map(article=>({title:article.title,description:article.description||'',category:article.category||'',url:new URL('articles/'+encodeURIComponent(article.file||article.slug+'.html'),'https://fastseo.site/').href})) };
    },
    fastseo_list_site_tools: async ({ query = '' } = {}) => {
      const term = normalize(query);
      const tools = await loadTools();
      const filtered = term ? tools.filter(tool=>[tool.kicker,tool.title,tool.titleEn,tool.description,tool.descriptionEn].filter(Boolean).join(' ').toLocaleLowerCase().includes(term)) : tools;
      return { count:filtered.length, tools:filtered.slice(0,30).map(tool=>({name:tool.title,nameEn:tool.titleEn||'',category:tool.kicker,description:tool.description,url:new URL('pages/'+tool.href,'https://fastseo.site/').href})) };
    },
    fastseo_analyze_page_seo: async input => analyzeHtml(input)
  };
  async function register() {
    try {
      const catalog = await fetchJson(catalogUrl);
      if (!catalog || !Array.isArray(catalog.tools)) throw new Error('AI catalog has an invalid tools collection');
      let registered = 0;
      for (const definition of catalog.tools) {
        const execute = handlers[definition.name];
        if (typeof execute !== 'function') throw new Error('No execution handler for ' + definition.name);
        const controller = new AbortController();
        await modelContext.registerTool({name:definition.name,description:definition.description,inputSchema:definition.inputSchema,execute},{signal:controller.signal});
        controllers.push(controller);
        registered += 1;
      }
      window.__fastseoWebMcpControllers = controllers;
      emit('registered',{registered,toolNames:catalog.tools.map(tool=>tool.name)});
    } catch (error) {
      emit('error',{reason:error && error.message ? error.message : 'registration-failed'});
    }
  }
  window.__fastseoWebMcpReady = register();
})();
