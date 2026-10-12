# MSEO — Architecture and migration guide

MSEO is a static-first Arabic RTL publishing site. Article HTML remains independently crawlable; JavaScript enhances discovery rather than owning article content.

## Runtime boundaries

- `index.html`, `pages/`, `articles/`, and `404.html`: documents, canonical URLs, metadata, and readable content.
- `data/articles.json`: generated discovery index; do not hand-edit generated catalogue data.
- `assets/css/style.css`: the single shared stylesheet for the public website, including tokens, responsive layout, header/footer, article cards, dark mode, and consent banner.
- `assets/js/site.js`: the single shared public-site script, including header/footer mounting, navigation, theme/language controls, homepage catalogue, archive search/filtering, and consent notice.
- `scripts/`: catalogue generation, sitemap generation, JavaScript syntax checks, and static validation.
- `pages/admin.html` and `admin-dashboard/`: a separate authenticated admin application. Its assets stay isolated from the public-site pair to preserve Supabase authentication and dashboard functionality.

## Public asset policy

1. Public pages should reference only `assets/css/style.css` and `assets/js/site.js` as their shared local entry points.
2. Do not restore the deleted duplicate files `assets/css/site.css`, `assets/css/tailwind.css`, `assets/css/home-rebuild.css`, `assets/js/home-rebuild.js`, or `assets/js/archive.js`.
3. Keep article bodies, canonical URLs, structured data, and SEO metadata in static HTML.
4. Use logical CSS properties for RTL, visible keyboard focus, and mobile-first responsive layouts.
5. Local storage can be blocked or unavailable; storage errors must never prevent the page shell from rendering.
6. Run `npm ci`, `npm test`, and `npm run build`; then manually inspect desktop/mobile, RTL, navigation, archive filtering, dark mode, and the live deployment.

The admin application is intentionally not folded into the public bundle: it has a separate build/runtime boundary and authentication-sensitive behavior.
