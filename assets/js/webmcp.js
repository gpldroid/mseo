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
  const catalogUrl = script && script.dataset.catalogUrl;
  if (!catalogUrl) {
    emit('error', { reason: 'catalog-url-missing' });
    return;
  }

  const controllers = [];
  const normalizeQuery = value => String(value || '').trim().toLocaleLowerCase();
  const articleUrl = file => new URL('articles/' + encodeURIComponent(file), location.origin).href;

  async function loadCatalog() {
    const response = await fetch(catalogUrl, { credentials: 'same-origin', cache: 'no-cache' });
    if (!response.ok) throw new Error('AI catalog request failed: ' + response.status);
    return response.json();
  }

  async function register() {
    try {
      const catalog = await loadCatalog();
      if (!catalog || !Array.isArray(catalog.tools)) throw new Error('AI catalog has an invalid tools collection');
      let registered = 0;
      for (const definition of catalog.tools) {
        const controller = new AbortController();
        let execute;
        if (definition.name === 'fastseo_search_articles') {
          execute = async ({ query, limit = 5 } = {}) => {
            const term = normalizeQuery(query);
            if (!term) return { error: 'A non-empty search query is required.' };
            if (!window.MSEOArticleCatalog || typeof window.MSEOArticleCatalog.load !== 'function') {
              return { error: 'The article archive is not available on this page.' };
            }
            const articles = await window.MSEOArticleCatalog.load();
            const matches = articles.filter(article => {
              const haystack = [article.title, article.description, article.category, ...(Array.isArray(article.tags) ? article.tags : [])].join(' ').toLocaleLowerCase();
              return haystack.includes(term);
            }).slice(0, Math.min(10, Math.max(1, Number(limit) || 5)));
            return {
              query: String(query).trim(),
              count: matches.length,
              articles: matches.map(article => ({
                title: article.title,
                description: article.description || '',
                category: article.category || '',
                url: articleUrl(article.file)
              }))
            };
          };
        } else if (definition.name === 'fastseo_list_site_tools') {
          execute = async ({ query = '' } = {}) => {
            const term = normalizeQuery(query);
            const response = await fetch(new URL('assets/js/tools-catalog.js', location.origin), { credentials: 'same-origin' });
            if (!response.ok) return { error: 'The tools directory could not be loaded.' };
            const source = await response.text();
            const entries = [...source.matchAll(/\{ icon: "[^"]+", kicker: "([^"]+)", title: "([^"]+)",(?: titleEn: "[^"]+",)? description: "([^"]+)",(?: descriptionEn: "[^"]+",)? href: "([^"]+)" \}/g)]
              .map(match => ({ category: match[1], name: match[2], description: match[3], url: new URL('pages/' + match[4], location.origin).href }));
            const filtered = term ? entries.filter(item => [item.category, item.name, item.description].join(' ').toLocaleLowerCase().includes(term)) : entries;
            return { count: filtered.length, tools: filtered.slice(0, 30) };
          };
        } else {
          controller.abort();
          continue;
        }
        await modelContext.registerTool({
          name: definition.name,
          description: definition.description,
          inputSchema: definition.inputSchema,
          execute
        }, { signal: controller.signal });
        controllers.push(controller);
        registered += 1;
      }
      window.__fastseoWebMcpControllers = controllers;
      emit('registered', { registered, toolNames: catalog.tools.map(tool => tool.name) });
    } catch (error) {
      emit('error', { reason: error && error.message ? error.message : 'registration-failed' });
    }
  }
  register();
})();
