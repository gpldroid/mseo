# FastSEO DOM XSS and Trusted Types audit

**Scope:** read-only audit of the current `main` branch before changing runtime behavior or enforcing a Content Security Policy.

## Executive summary

FastSEO uses JavaScript to render shared navigation/footer UI, article cards, category filters, archive results, carousel slides, sidebar widgets, and tool controls. This is a supported architecture and does not need to be removed.

The current implementation has multiple HTML parsing sinks (`innerHTML`) in `assets/js/home.js`, `assets/js/site.js`, and `assets/js/tools-catalog.js`. Some templates escape text values before interpolation, but HTML escaping alone does not validate URL schemes or make every HTML sink safe. Therefore, enabling `require-trusted-types-for 'script'` now would likely break rendering, while adding a pass-through Trusted Types policy would provide no meaningful protection.

## Confirmed findings

### `assets/js/home.js`

- Builds article cards and carousel markup with template strings and assigns them to `innerHTML`.
- Renders category options, pagination buttons, sidebar article/category lists, and empty/error states through `innerHTML`.
- Uses an `esc()` helper for many text and attribute values. This is useful context-specific escaping, but URLs and the HTML parsing sink still need separate validation.
- Article image sources can come from the article catalog; source protocols and allowed hosts should be validated before assigning them to URL-bearing attributes.

### `assets/js/site.js`

- Generates the shared header and footer with template strings.
- Renders archive cards, filters, article sidebars, and the article carousel from catalog data.
- Uses `innerHTML` for several static controls and icon fragments as well as data-backed markup.
- Dynamically inserts optional Google Fonts, Font Awesome, and AdSense scripts. These origins must be represented deliberately in any eventual CSP.
- AdSense placement code also uses DOM construction APIs such as `createElement` and `appendChild`; these are preferable to parsing HTML strings.

### `assets/js/tools-catalog.js`

- Uses `innerHTML` for SVG icon fragments and a small tool-toggle label.
- The icon markup is selected from an in-code constant map, not directly from article/user content. It should still be moved to DOM/SVG construction or explicitly constrained as trusted static markup.

### `index.html`

- Contains inline scripts for deferred tool-catalog loading and Google Analytics bootstrap.
- A strict CSP will need hashes/nonces or, preferably for this static site, moving these inline blocks into versioned external JavaScript files.
- External dependencies currently include Google Fonts, Google Analytics/Tag Manager, Google AdSense, and Font Awesome.

## Risk and compatibility notes

1. Do not enable Trusted Types enforcement until every active HTML/script URL sink is migrated or safely wrapped.
2. Do not create a permissive Trusted Types policy that returns its input unchanged.
3. Do not treat `esc()` as a sanitizer for arbitrary HTML or as URL validation.
4. Validate catalog image URLs and navigation destinations against explicit allowed protocols/origins.
5. Preserve the current dynamic UI, article catalog, search/filter/pagination, carousel, shared header/footer, AdSense, and Analytics behavior.
6. Do not add a `_headers` file and assume GitHub Pages will apply it. GitHub Pages does not provide project-level custom response-header configuration.

## Recommended implementation sequence

### Phase A — safe DOM rendering

- Replace text-only `innerHTML` writes with `textContent`.
- Replace generated option/button/icon nodes with `createElement`, attributes, and text nodes.
- For genuinely rich HTML templates, use a maintained sanitizer (DOMPurify) with a narrowly defined allowlist and a named Trusted Types policy. Pin and self-host the dependency where practical; do not use an unpinned third-party script.
- Validate URL-bearing attributes independently (protocol and permitted origins).
- Add regression tests for malicious article titles, descriptions, category labels, filenames, and image URLs.

### Phase B — Trusted Types

- Test with a report-only / staging policy first where response headers are available.
- Enable `require-trusted-types-for 'script'` only after all sinks are compatible.
- Keep the policy allowlist narrow; never add a generic pass-through policy.

### Phase C — response-header security

- GitHub Pages remains the build/deployment platform, but it cannot set custom HTTP response headers itself.
- Once an approved proxy/CDN is configured in front of the existing Pages origin, introduce CSP in Report-Only mode, inspect violations, then enforce.
- Add HSTS, COOP, clickjacking protection (`frame-ancestors` / X-Frame-Options), `X-Content-Type-Options`, Referrer-Policy, and a restrictive Permissions-Policy after compatibility checks.
- Do not enable HSTS `includeSubDomains` or preload until every affected subdomain is confirmed HTTPS-ready.

## Out of scope for this audit

- No changes to DNS, Cloudflare, hosting, or deployment configuration.
- No CSP/HSTS/COOP response-header changes.
- No Trusted Types enforcement.
- No removal or redesign of the JavaScript-rendered interface.
- No changes to AdSense, Analytics, Search Console, the Gradient Pulse theme, or site content.

## Acceptance criteria for the implementation PR

- Homepage, archive, article pages, navigation, footer, category filters, search, pagination, and carousels render and remain interactive.
- No untrusted article/catalog value reaches an HTML parsing sink without sanitization.
- URL attributes reject unsafe protocols such as `javascript:`.
- Trusted Types tests pass before enforcement is enabled.
- Existing analytics and advertising integrations continue to load.
- Mobile and desktop regression checks pass.
