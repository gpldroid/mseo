# Frontend architecture review — FastSEO

## Scope and current decision

This is a static HTML/CSS/JavaScript site. The current evidence does **not** justify an immediate framework migration or a full rebuild. A staged refactor is lower risk because it preserves the existing URLs, article catalog, SEO metadata, tools and deployment model while making the architecture measurable. Reconsider a rebuild only after the remaining shared CSS and page-runtime boundaries are audited and the current site has regression coverage.

## Findings confirmed in the repository

1. `assets/css/style.css` had grown to about 163 KB and included homepage-only hero/workbench styling alongside shared site and article-page rules.
2. `assets/js/site.js` contained the homepage article renderer as well as shared navigation, ticker, archive and individual-article enhancements.
3. Multiple features independently requested `data/articles.json`. The ticker had its own URL fallback and catalog validation, while homepage/archive/article widgets had separate fetch logic.
4. The latest-article carousel had conflicting declarations, including a later `overflow:hidden` rule competing with horizontal scrolling. Repeated selector declarations remain elsewhere in the shared stylesheet and need a dedicated component pass.
5. There is already a `scripts/check-javascript.mjs` and `scripts/validate-site.mjs`; this refactor extends the site validator so page-specific asset boundaries are checked.

## Changes in this refactor branch

- Extracted the homepage article/category/search renderer to `assets/js/home-page.js`; the shared runtime no longer owns the homepage renderer.
- Added a shared `window.MSEOArticleCatalog.load()` promise in `assets/js/site.js`. The homepage, ticker, archive and individual-article widgets reuse it, preventing duplicate catalog requests within a page and retaining response validation and fallback URL handling.
- Moved homepage hero and workbench styles to `assets/css/pages/home.css`; the shared stylesheet no longer owns those page-specific rules.
- Corrected the remaining legacy carousel override so it no longer sets `overflow:hidden` on the horizontal track.
- Added cache-busting versions for the new asset boundaries.
- Extended `scripts/validate-site.mjs` to check that the new assets exist, are linked, and the homepage renderer and page-specific CSS remain separated.

## Validation status

- Static source checks: JavaScript parses successfully; CSS brace counts balance; references for the new homepage assets are present.
- Not yet verified: visual browser testing at mobile/tablet/desktop breakpoints, runtime network waterfall, keyboard carousel interaction, and production deployment smoke test. Do not treat the refactor as production-verified until those pass.

## Remaining work before considering a full rebuild

### Phase 2 — component CSS consolidation
- Consolidate repeated shared rules for header/footer, article cards, carousel and buttons into explicit component styles.
- Remove stale duplicate selector blocks only after checking every page that consumes the component; do not blindly delete repeated selectors that are intentionally responsive or theme-specific.
- Keep theme variables and component styles independent of page layout rules.

### Phase 3 — data and runtime boundaries
- Inventory every article-catalog consumer and move archive/article-specific behavior into page modules where safe.
- Add explicit loading, empty and error states consistently; avoid multiple competing implementations of the same card markup.
- Confirm the catalog sort order is identical across ticker, homepage, archive and article recommendations.

### Phase 4 — regression and deployment
- Run `node scripts/check-javascript.mjs`, `node scripts/validate-site.mjs`, asset/SEO audits and a local static server.
- Test representative homepage, archive, article, tools and theme-switching pages at mobile, tablet and desktop widths.
- Verify links, canonical URLs, structured data, sitemap/RSS, image failures, reduced-motion behavior and browser console/network errors.
- Deploy only after the preview passes; then run a production smoke test.

## Rebuild decision gate

A rebuild is justified only if the component audit shows that shared styles/runtime cannot be separated without pervasive regressions, or if the current static architecture blocks required product capabilities. If that gate is reached, preserve content URLs and metadata, create a migration map, and run old/new pages in parallel before switching production. For now, this branch deliberately avoids a framework change.
