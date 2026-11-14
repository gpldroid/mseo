/* Fast Seo WebMCP integration: read-only tools for the public website. */
(() => {
  'use strict';

  if (window.__fastseoWebMcpInit) return;
  window.__fastseoWebMcpInit = true;

  const emit = (status, details = {}) => {
    document.documentElement.dataset.webmcp = status;
    document.dispatchEvent(new CustomEvent('fastseo:webmcp-status', {
      detail: { status, ...details }
    }));
  };

  const modelContext = document.modelContext;
  if (!modelContext || typeof modelContext.registerTool !== 'function') {
    emit('unsupported');
    return;
  }

  const script = document.querySelector('script[data-fastseo-webmcp]');
  const catalogUrl = script && script.dataset.catalogUrl;
  const articlesUrl = script && script.dataset.articlesUrl;
  const toolsCatalogUrl = script && script.dataset.toolsCatalogUrl;

  if (!catalogUrl || !articlesUrl || !toolsCatalogUrl) {
    emit('error', { reason: 'catalog-or-data-url-missing' });
    return;
  }

  const controllers = [];
  let disposed = false;
  let articlesPromise = null;
  let toolsPromise = null;

  const normalize = value => String(value == null ? '' : value).trim().toLocaleLowerCase();
  const isAborted = signal => Boolean(signal && signal.aborted);
  const abortResult = () => ({ error: 'The request was cancelled before completion.' });

  const fetchJson = async url => {
    const target = new URL(url, location.href);
    if (target.origin !== location.origin) throw new Error('WebMCP data must be loaded from this site origin.');
    const response = await fetch(target.href, { credentials: 'same-origin', cache: 'no-cache' });
    if (!response.ok) throw new Error('Site data request failed with HTTP ' + response.status + '.');
    return response.json();
  };

  const loadArticles = () => {
    if (!articlesPromise) {
      articlesPromise = fetchJson(articlesUrl).then(data => {
        if (!Array.isArray(data)) throw new Error('The article catalog is not a list.');
        return data.filter(item =>
          item &&
          typeof item.title === 'string' &&
          (typeof item.file === 'string' || typeof item.slug === 'string')
        );
      }).catch(error => {
        articlesPromise = null;
        throw error;
      });
    }
    return articlesPromise;
  };

  const loadTools = () => {
    if (Array.isArray(window.MSEOToolsCatalog)) return Promise.resolve(window.MSEOToolsCatalog);
    if (!toolsPromise) {
      toolsPromise = new Promise((resolve, reject) => {
        const target = new URL(toolsCatalogUrl, location.href).href;
        let loader = [...document.scripts].find(item => {
          try { return new URL(item.src, location.href).href === target; }
          catch (_) { return false; }
        });

        const verify = () => {
          if (Array.isArray(window.MSEOToolsCatalog)) resolve(window.MSEOToolsCatalog);
          else reject(new Error('The site tools catalog did not initialize.'));
        };

        if (loader) {
          if (loader.dataset.fastseoToolsLoaded === 'true' || loader.dataset.loaded === 'true') {
            verify();
            return;
          }
          loader.addEventListener('load', verify, { once: true });
          loader.addEventListener('error', () => reject(new Error('The site tools catalog could not be loaded.')), { once: true });
          return;
        }

        loader = document.createElement('script');
        loader.src = target;
        loader.async = true;
        loader.addEventListener('load', verify, { once: true });
        loader.addEventListener('error', () => reject(new Error('The site tools catalog could not be loaded.')), { once: true });
        document.head.appendChild(loader);
      }).catch(error => {
        toolsPromise = null;
        throw error;
      });
    }
    return toolsPromise;
  };

  const analyzeHtml = ({ htmlSource, pageUrl = '' } = {}) => {
    if (typeof htmlSource !== 'string' || htmlSource.trim().length < 20) {
      return { error: 'Provide at least 20 characters of HTML source.' };
    }
    if (htmlSource.length > 1000000) {
      return { error: 'The HTML source is too large. The maximum accepted size is 1 MB.' };
    }

    let pageBase = new URL('/', location.origin);
    if (pageUrl) {
      try {
        pageBase = new URL(pageUrl);
        if (!['http:', 'https:'].includes(pageBase.protocol)) {
          return { error: 'The optional page URL must use HTTP or HTTPS.' };
        }
      } catch (_) {
        return { error: 'The optional page URL is not a valid HTTP or HTTPS URL.' };
      }
    }

    const parsed = new DOMParser().parseFromString(htmlSource, 'text/html');
    const meta = name => parsed.querySelector('meta[name="' + name + '"]')?.getAttribute('content')?.trim() || '';
    const title = parsed.querySelector('title')?.textContent?.trim() || '';
    const description = meta('description');
    const robots = meta('robots');
    const canonicalValue = parsed.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
    let canonical = '';
    try { canonical = canonicalValue ? new URL(canonicalValue, pageBase).href : ''; } catch (_) {}

    const h1 = [...parsed.querySelectorAll('h1')].map(node => node.textContent.trim()).filter(Boolean);
    const images = [...parsed.querySelectorAll('img')];
    const links = [...parsed.querySelectorAll('a[href]')];
    let internal = 0;
    let external = 0;

    links.forEach(anchor => {
      try {
        if (new URL(anchor.getAttribute('href'), pageBase).origin === pageBase.origin) internal += 1;
        else external += 1;
      } catch (_) {}
    });

    const missingAlt = images.filter(image => !image.hasAttribute('alt')).length;
    const issues = [];
    if (!title) issues.push('Missing title element');
    if (!description) issues.push('Missing meta description');
    if (h1.length !== 1) issues.push('Expected one H1; found ' + h1.length);
    if (!canonical) issues.push('Missing canonical URL');
    if (missingAlt) issues.push(missingAlt + ' image(s) missing alt attributes');
    if (/noindex/i.test(robots)) issues.push('Robots meta contains noindex');

    return {
      title,
      description,
      canonical,
      robots,
      h1: h1.slice(0, 10),
      images: { total: images.length, missingAlt },
      links: { total: links.length, internal, external },
      issues,
      note: 'Static HTML inspection only; no URL was fetched and no ranking or Core Web Vitals assessment was performed.'
    };
  };

  const handlers = {
    fastseo_search_articles: async (input = {}, signal) => {
      const query = typeof input.query === 'string' ? input.query.trim() : '';
      if (!query) return { error: 'A non-empty search query is required.' };
      if (query.length > 200) return { error: 'The search query must be 200 characters or fewer.' };
      if (input.limit !== undefined && (!Number.isInteger(input.limit) || input.limit < 1 || input.limit > 10)) {
        return { error: 'The result limit must be an integer from 1 to 10.' };
      }
      if (isAborted(signal)) return abortResult();

      const term = normalize(query);
      const articles = await loadArticles();
      if (isAborted(signal)) return abortResult();

      const matches = articles.filter(article => {
        const fields = [
          article.title,
          article.description,
          article.category,
          article.subcategory,
          ...(Array.isArray(article.tags) ? article.tags : [])
        ];
        return fields.filter(value => typeof value === 'string').join(' ').toLocaleLowerCase().includes(term);
      }).slice(0, input.limit === undefined ? 5 : input.limit);

      return {
        query,
        count: matches.length,
        articles: matches.map(article => {
          const file = typeof article.file === 'string' ? article.file : article.slug + '.html';
          if (!/^[a-z0-9-]+\.html$/i.test(file)) return null;
          return {
            title: article.title.slice(0, 240),
            description: typeof article.description === 'string' ? article.description.slice(0, 500) : '',
            category: typeof article.category === 'string' ? article.category.slice(0, 100) : '',
            url: new URL('articles/' + encodeURIComponent(file), location.origin + '/').href
          };
        }).filter(Boolean)
      };
    },

    fastseo_list_site_tools: async (input = {}, signal) => {
      const query = typeof input.query === 'string' ? input.query.trim() : '';
      if (query.length > 200) return { error: 'The optional filter must be 200 characters or fewer.' };
      if (isAborted(signal)) return abortResult();

      const term = normalize(query);
      const tools = await loadTools();
      if (isAborted(signal)) return abortResult();

      const filtered = term ? tools.filter(tool =>
        [tool.kicker, tool.title, tool.titleEn, tool.description, tool.descriptionEn]
          .filter(value => typeof value === 'string')
          .join(' ')
          .toLocaleLowerCase()
          .includes(term)
      ) : tools;

      return {
        count: filtered.length,
        tools: filtered.slice(0, 30).map(tool => {
          if (typeof tool.href !== 'string' || !/^[a-z0-9-]+\.html$/i.test(tool.href)) return null;
          return {
            name: typeof tool.title === 'string' ? tool.title.slice(0, 180) : '',
            nameEn: typeof tool.titleEn === 'string' ? tool.titleEn.slice(0, 180) : '',
            category: typeof tool.kicker === 'string' ? tool.kicker.slice(0, 100) : '',
            description: typeof tool.description === 'string' ? tool.description.slice(0, 400) : '',
            url: new URL('pages/' + encodeURIComponent(tool.href), location.origin + '/').href
          };
        }).filter(Boolean)
      };
    },

    fastseo_analyze_page_seo: async (input = {}, signal) => {
      if (isAborted(signal)) return abortResult();
      return analyzeHtml(input);
    }
  };

  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    controllers.splice(0).forEach(controller => controller.abort());
  };

  window.addEventListener('pagehide', cleanup, { once: true });

  async function register() {
    try {
      const catalog = await fetchJson(catalogUrl);
      if (disposed) return;
      if (!catalog || !Array.isArray(catalog.tools)) throw new Error('The WebMCP catalog has an invalid tools collection.');

      let registered = 0;
      for (const definition of catalog.tools) {
        if (disposed) return;
        const execute = handlers[definition.name];
        if (typeof execute !== 'function') throw new Error('No execution handler is available for ' + definition.name + '.');

        const controller = new AbortController();
        controllers.push(controller);
        await modelContext.registerTool({
          name: definition.name,
          description: definition.description,
          inputSchema: definition.inputSchema,
          annotations: {
            readOnlyHint: true,
            untrustedContentHint: true
          },
          execute: (input, options = {}) => execute(input || {}, options.signal)
        }, { signal: controller.signal });

        if (disposed) {
          controller.abort();
          return;
        }
        registered += 1;
      }

      window.__fastseoWebMcpControllers = controllers;
      emit('registered', {
        registered,
        toolNames: catalog.tools.map(tool => tool.name)
      });
    } catch (error) {
      cleanup();
      const reason = error && error.message ? String(error.message).slice(0, 180) : 'registration-failed';
      emit('error', { reason });
    }
  }

  window.__fastseoWebMcpReady = register();
})();
