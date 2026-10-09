# MSEO Project Architecture

MSEO is a static, Arabic-first publishing site hosted on GitHub Pages.

## Runtime structure

- `index.html`: homepage, SEO metadata, and the primary content discovery experience.
- `pages/`: category and static informational pages.
- `articles/`: independently indexable article pages.
- `data/articles.json`: generated article catalogue used by search and category grids.
- `assets/css/site.css`: shared components and responsive presentation.
- `assets/css/tokens.css`: typography, spacing, focus, and motion tokens.
- `assets/js/site.js`: browser entry point.
- `assets/js/modules/config.js`: navigation and site configuration.
- `assets/js/modules/utils.js`: shared DOM, escaping, storage, and URL helpers.
- `assets/js/modules/catalog.js`: article discovery, filtering, and rendering.
- `assets/js/modules/shell.js`: shared header/footer, theme, mobile menu, and consent notice.
- `assets/js/modules/interactions.js`: search, keyboard dismissal, theme and back-to-top behavior.
- `assets/js/modules/app.js`: initialization and orchestration.
- `scripts/`: catalogue generation, sitemap generation, and validation.

## Design principles

1. Keep content in static HTML so search engines and readers can access it without JavaScript.
2. Use shared CSS tokens and reusable component classes rather than page-specific styling.
3. Keep JavaScript split into small ES modules with no frontend framework requirement.
4. Preserve accessible focus states, RTL semantics, responsive type, and reduced-motion preferences.
5. Keep external dependencies minimal and avoid runtime CDN frameworks.

## Build and quality

Run `npm ci`, `npm test`, and `npm run build` before publishing. Review generated catalogue and sitemap changes before committing them.
