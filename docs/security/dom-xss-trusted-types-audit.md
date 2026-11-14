# FastSEO DOM XSS and Trusted Types: audit and implementation status

**Updated:** 2026-11-14  
**Deployment platform:** GitHub Pages  
**Scope:** record the original DOM-rendering findings, the mitigation already merged, and the security work that remains. This document does not authorize hosting, DNS, or CDN changes.

## Executive summary

The original audit identified HTML parsing sinks in the public-site JavaScript. The implementation follow-up was completed in PR #159 and merged to `main`. The current baseline therefore differs from the original pre-mitigation audit: dynamic HTML rendering in the three targeted scripts now passes through a shared DOMPurify-backed boundary, and URL validation is centralized.

This is a mitigation step, not a claim that every script on the site is free of injection risk or that browser-enforced Trusted Types/CSP protections are active.

## Original audit scope and findings

The audit covered:

- `assets/js/home.js`: article cards, carousel, categories, filters, pagination, and sidebar rendering.
- `assets/js/site.js`: shared header/footer, archive/article rendering, icons, and dynamic third-party integrations.
- `assets/js/tools-catalog.js`: SVG icon fragments and tool controls.
- `index.html`: inline tool-catalog and Analytics bootstraps relevant to a future strict CSP.

The site uses JavaScript-generated UI by design. Text escaping alone does not validate URL schemes or sanitize arbitrary HTML. A permissive Trusted Types policy would not provide meaningful protection.

## Implemented mitigation — PR #159

Merged implementation includes:

1. A self-hosted DOMPurify 3.4.17 bundle with its upstream license.
2. A shared `window.FastSEODOM.setHTML(element, dirty)` insertion boundary that sanitizes markup before assignment.
3. A named `fastseo-dom` Trusted Types policy when the browser supports the API. This policy is a preparation boundary; enforcement is not enabled.
4. A `safeURL` helper that restricts URL schemes and allowed external image origins (including the explicitly permitted Unsplash image host).
5. Migration of dynamic HTML assignments in `assets/js/site.js`, `assets/js/home.js`, and `assets/js/tools-catalog.js` to the shared sanitizer boundary.
6. Safe image fallback handling without inline `onerror` handlers.
7. CI checks for JavaScript syntax and DOM-sink regression boundaries via `scripts/validate-dom-security.mjs`.

The implementation PR's validation workflow passed on the deployed main baseline, including the DOM hardening regression check.

## Remaining security work

### Phase A — runtime verification

Automated source checks are in place. Still required before treating the UI migration as fully accepted:

- Browser-test homepage, archive, article pages, navigation, footer, filters, search, pagination, carousel, and tool controls on mobile and desktop.
- Verify article/catalog text renders as text and cannot inject markup.
- Verify unsafe URL schemes (for example, `javascript:`) are rejected and approved local/HTTPS image URLs continue to work.
- Confirm AdSense and Analytics integrations still behave as expected.
- Exercise WebMCP registration and tool invocation in a browser that supports the native WebMCP API. Static CI validation is not a substitute for this browser test.

### Phase B — Trusted Types enforcement

- Keep enforcement disabled until all active script/HTML sinks across the complete site (including tool-specific scripts and inline bootstraps) have been inventoried and tested.
- Where response headers are available, begin with a report-only/staging policy and inspect violations.
- Enable `require-trusted-types-for 'script'` only after compatibility tests pass. Keep the policy allowlist narrow; never introduce a pass-through policy.

### Phase C — response-header security

GitHub Pages remains the sole hosting/deployment platform. GitHub Pages does not provide project-level custom HTTP response headers, so a repository `_headers` file must not be treated as an effective security-header solution.

CSP, HSTS, COOP, clickjacking protection, `X-Content-Type-Options`, Referrer-Policy, and Permissions-Policy require a response-header-capable layer. No such layer, DNS change, Cloudflare change, or hosting change is authorized by this document. Do not make those changes without explicit approval. If a permitted header layer is later established, introduce CSP in Report-Only mode first and check Google Fonts, Analytics, AdSense, Font Awesome, and WebMCP compatibility before enforcement.

Do not enable HSTS `includeSubDomains` or preload until every affected subdomain is confirmed HTTPS-ready.

## Acceptance status

| Item | Status |
|---|---|
| DOMPurify-backed rendering boundary in the three targeted scripts | Implemented in PR #159 |
| URL validation helper | Implemented in PR #159 |
| DOM-sink regression and JavaScript syntax CI checks | Implemented; latest main validation passed |
| Trusted Types policy creation | Implemented as a non-enforcing preparation step |
| Trusted Types enforcement | Intentionally deferred |
| CSP and other response security headers | Deferred; GitHub Pages limitation and no approved header layer |
| Mobile/desktop interactive browser regression | Still requires real browser verification |
| Native WebMCP discovery and invocation | Still requires a supporting browser test |

## Scope and preservation

No DNS, Cloudflare, hosting, or deployment configuration changes are part of this work. Preserve GitHub Pages, the Gradient Pulse design, site content, AdSense, Analytics, and Search Console. Do not remove the JavaScript-rendered interface.
