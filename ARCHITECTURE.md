# MSEO — Architecture & Design System

MSEO is a static-first Arabic RTL publishing site. Public pages are independent HTML documents so article content, canonical URLs, metadata, and structured data remain crawlable without a client-side application runtime.

## Public website runtime

- **Documents:** `index.html`, `pages/`, `articles/`, and `404.html`.
- **Single public stylesheet:** `assets/css/style.css`. It owns public-site design tokens, responsive layout, shared header/footer, article cards, navigation, dark mode, and consent-banner styles.
- **Single public browser script:** `assets/js/site.js`. It mounts shared header/footer, theme and language controls, mobile navigation, search UI, cookie/local-storage notice, homepage catalogue, and archive filtering.
- **Content index:** `data/articles.json` is generated from article metadata. Article bodies remain in HTML.
- **Automation:** `scripts/generate-article-catalog.mjs`, `scripts/generate-sitemap.mjs`, and `scripts/validate-site.mjs` build and validate static content.
- **Administration:** `pages/admin.html` and `admin-dashboard/` are a separate authenticated application with their own assets and build pipeline. They are intentionally isolated from the public site's CSS and JavaScript so public-site cleanup cannot break authentication, roles, or content editing.

## Asset policy

1. Public pages load `assets/css/style.css` and `assets/js/site.js` as their shared local entry points.
2. Do not reintroduce `assets/css/site.css`, `assets/css/tailwind.css`, `assets/css/home-rebuild.css`, `assets/js/archive.js`, or `assets/js/home-rebuild.js`.
3. Keep article text and SEO metadata in HTML; JavaScript enhances navigation and discovery.
4. Use semantic HTML, Arabic `lang`, RTL direction, visible focus states, and responsive layouts.
5. Browser storage may be unavailable; storage errors must not prevent the header, footer, or content from rendering.

## Local validation

```sh
npm ci
npm test
npm run build
```

After a build, review catalogue and sitemap changes before committing. The production deployment is considered verified only after the GitHub Actions quality workflow succeeds and the live site is checked.
