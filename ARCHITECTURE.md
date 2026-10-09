# MSEO — Architecture & Design System

MSEO is a static-first Arabic RTL publishing site deployed on GitHub Pages. It intentionally avoids a server runtime and keeps article URLs crawlable as independent HTML documents.

## Runtime architecture

- **Documents**: `index.html`, `pages/`, `articles/`, `404.html`; each published page owns its title, description, canonical URL and social metadata.
- **Content data**: `data/articles.json` is the catalogue consumed by search and category listings. Article bodies remain in HTML for crawlability and resilience.
- **Browser entry point**: `assets/js/site.js` is a small dynamic-import bootstrap with a user-friendly failure state.
- **Feature modules**: `assets/js/modules/config.js` centralizes site paths and navigation; `utils.js` provides safe DOM/storage helpers; `catalog.js` loads and renders the catalogue; `shell.js` mounts shared header/footer, theme and consent; `interactions.js` owns search, mobile navigation and back-to-top; `app.js` composes startup.
- **Styles**: `assets/css/site.css` is the shared design-system entry point. Design tokens live in `:root` and `html.dark`; shared layout and component classes are used across page families.
- **Automation**: `scripts/generate-article-catalog.mjs` derives catalogue data from article metadata; `scripts/generate-sitemap.mjs` builds the sitemap; `scripts/validate-site.mjs` checks SEO metadata, links, categories and sitemap consistency.

## Design principles

1. Semantic HTML, Arabic language declaration and RTL direction.
2. Mobile-first responsive layout, visible keyboard focus, accessible labels and reduced-motion support.
3. Progressive enhancement: article content remains static HTML; JavaScript enhances discovery and navigation.
4. No Java backend is required for GitHub Pages. JavaScript is the browser runtime language; Java can be introduced only if the project later gains a separate backend service.
5. Keep third-party assets optional where practical and avoid adding a framework without a measurable benefit.

## Local validation

```sh
npm ci
npm run validate
npm run build
```

Review the generated catalogue and sitemap diff before committing. Run the validation command on Node.js LTS.
