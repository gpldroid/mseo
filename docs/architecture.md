# MSEO — Architecture and migration guide

MSEO is a static-first Arabic RTL publishing site deployed on GitHub Pages. Article HTML remains independently crawlable; JavaScript enhances discovery rather than owning article content.

## Runtime boundaries

- `index.html`, `pages/`, `articles/`, and `404.html`: documents, canonical URLs, metadata, and readable content.
- `data/articles.json`: generated discovery index. Do not hand-edit generated catalogue data.
- `assets/js/site.js`: tiny browser bootstrap with a visible failure state.
- `assets/js/modules/config.js`: site constants, routes, and storage keys.
- `assets/js/modules/utils.js`: DOM helpers, HTML escaping, safe storage, URL validation, announcements, and DOM-ready handling.
- `assets/js/modules/catalog.js`: catalogue loading, filtering, and article cards.
- `assets/js/modules/shell.js`: shared navigation, footer, theme, and consent UI.
- `assets/js/modules/interactions.js`: search dialog, keyboard interactions, mobile menu, and back-to-top.
- `assets/css/site.css`: project-owned visual layer and Bulma integration point.
- `assets/css/tokens.css`: reusable design tokens.
- `scripts/`: catalogue generation, sitemap generation, and static validation.

## Bulma adoption rules

Bulma is a layout/component foundation, not a replacement for MSEO's editorial identity. Use its documented layout and component primitives where they remove repeated custom code; keep brand tokens, RTL-specific behavior, article typography, and accessible states in project-owned CSS.

1. Keep HTML `lang="ar"` and `dir="rtl"`; explicitly test navigation, dropdowns, forms, pagination, and modal alignment in RTL.
2. Prefer logical properties (`margin-inline`, `padding-inline`, `inset-inline`) over left/right rules.
3. Never let Bulma class names become JavaScript hooks. JS should use IDs, `data-*` attributes, or semantic roles.
4. Keep third-party versions pinned. For production, vendor the chosen Bulma release into the repository/build output rather than depending on a mutable CDN URL.
5. Do not convert article bodies into client-rendered content. SEO metadata, canonical URLs, structured data, and article text remain in static HTML.
6. Preserve progressive enhancement: a catalogue or script failure must not block direct article navigation.
7. Avoid mixing multiple CSS frameworks. Remove obsolete utility output only after repository-wide usage checks show it is safe.

## JavaScript contracts

- Feature modules export explicit mount functions and do not initialize themselves as import side effects.
- Startup is idempotent and has one error boundary.
- Rendered text must be escaped or assigned with `textContent`; do not interpolate untrusted catalogue values into HTML.
- Storage can fail in private browsing and must never prevent the page from starting.
- Use stable `data-site-action` attributes for delegated interactions; keep keyboard dismissal and focus behavior covered by tests.
- Keep helpers small and feature ownership clear; avoid circular imports between feature modules.

## Quality gates

Run `npm ci`, `npm test`, and `npm run build` using the repository's supported Node.js LTS version. Review generated catalogue and sitemap diffs. Also manually check mobile/desktop layouts, RTL, keyboard-only navigation, dark mode, search empty states, and script/network failure states before merging.
