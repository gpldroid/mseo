# MSEO — SEO Architecture, Keyword Map & Internal Linking Plan
Date: 2026-10-28
Branch: `seo/internal-linking-audit-2026-10`
Scope: repository inventory and implementation plan only. This file does not alter live pages, CSS, JavaScript, URLs, tool behavior, or GitHub Pages settings.

## 1. Audit findings from the current `main` tree

The repository tree currently contains 208 entries, including **67 article HTML files** and **44 page HTML files**. The root has `index.html`, `index.htm`, `article.html`, `404.html`, `feed.xml`, `sitemap.xml`, `robots.txt`, `CNAME`, and verification files.

### Blocking consistency issues to resolve before a visual rebuild
The following paths are referenced by checked-in HTML or validation scripts but were not present in the recursive `main` tree inspected on 2026-10-28:

- `assets/css/style.css` — referenced by the homepage and other pages.
- `assets/js/site.js` — required by `scripts/validate-site.mjs`.
- `data/articles.json` — required by the catalog generator and site validator.
- `netlify.toml` — read by `scripts/validate-site.mjs`.

The validator also expects shared header/footer placeholders and a generated article catalog. These assumptions must be reconciled against the actual deployed source before running a rebuild. Do not fabricate replacement CSS/JS or a new article catalog from guesses; recover the intended files or update the validator only after confirming the real architecture.

### Mixed canonical/domain signals
- `CNAME` and the sitemap identify `https://fastseo.site/` as the intended primary domain.
- The homepage and several article/category pages use `fastseo.site`.
- Some tool/category pages still use `https://gpldroid.github.io/mseo/` in canonical tags or structured data.
- The visible branding is mixed between “MSEO”, “فاست سيو”, and “Fast Seo”.

**Decision required during implementation:** use the existing custom domain `https://fastseo.site/` as canonical only if the current DNS and GitHub Pages configuration are confirmed to serve that domain. Then normalize every canonical, Open Graph URL, JSON-LD URL, and sitemap URL to the same host. Preserve existing page paths unless an explicit redirect is added and tested.

## 2. Existing page inventory

### Main pages and topic hubs
- `index.html` — homepage / broad SEO, web development, programming, and AI discovery.
- `pages/tools.html` — free online tools hub.
- `pages/archive.html` — searchable article archive.
- `pages/categories.html` — all categories.
- `pages/seo.html` — SEO learning hub.
- `pages/performance.html` — web performance and user experience.
- `pages/ai.html` — AI tools and prompt engineering.
- `pages/web-development.html` — website development and web technologies.
- `pages/web-design.html` — web design and UI/UX.
- `pages/programming.html` — programming and coding.
- `pages/topics.html` — topic discovery.
- `pages/about.html`, `pages/contact.html`, `pages/privacy.html`, `pages/terms.html`, `pages/editorial-policy.html` — trust and policy pages.

### Tool pages (keep their current paths and functionality)
`pages/ai-prompt-builder.html`, `pages/base64-converter.html`, `pages/blog-outline-generator.html`, `pages/color-contrast-checker.html`, `pages/css-box-shadow-generator.html`, `pages/css-color-generator.html`, `pages/css-js-minifier.html`, `pages/html-entity-converter.html`, `pages/image-color-picker.html`, `pages/image-compressor.html`, `pages/image-to-favicon.html`, `pages/internal-link-planner.html`, `pages/json-formatter.html`, `pages/json-to-csv.html`, `pages/meta-tags-generator.html`, `pages/open-graph-image-generator.html`, `pages/regex-tester.html`, `pages/responsive-preview.html`, `pages/robots-txt-generator.html`, `pages/schema-markup-generator.html`, `pages/seo-analyzer.html`, `pages/serp-preview.html`, `pages/sitemap-generator.html`, `pages/svg-optimizer.html`, `pages/text-diff-checker.html`, `pages/text-size-analyzer.html`, `pages/text-slug-converter.html`, `pages/url-encoder-decoder.html`, `pages/word-counter.html`.

### Article inventory grouped into semantic clusters

**SEO strategy, research, and content**
- `articles/keyword-research-guide.html`
- `articles/seo-content-strategy.html`
- `articles/seo-website-optimization-2026.html`
- `articles/internal-linking-seo-guide.html`
- `articles/website-not-appearing-google.html`

**Technical SEO, crawling, indexing, and structured data**
- `articles/canonical-url-guide.html`
- `articles/faceted-navigation-seo-guide.html`
- `articles/google-search-console-indexing-errors.html`
- `articles/google-search-console-performance-report.html`
- `articles/hreflang-multilingual-seo-guide.html`
- `articles/javascript-seo-rendering-guide.html`
- `articles/robots-txt-guide.html`
- `articles/structured-data-guide.html`
- `articles/xml-sitemap-guide.html`
- `articles/xml-sitemap-seo-guide.html`
- `articles/html-semantic-seo.html`
- `articles/html-seo-metadata.html`
- `articles/seo-image-optimization-guide.html`

**Performance, accessibility, quality, and security**
- `articles/core-web-vitals-practical-guide.html`
- `articles/lighthouse-audit-fixes-guide.html`
- `articles/mobile-website-quality-testing.html`
- `articles/web-accessibility-checklist.html`
- `articles/web-performance-core.html`
- `articles/website-quality-audit-checklist.html`
- `articles/website-security-basics-checklist.html`
- `articles/website-speed-optimization-guide.html`
- `articles/website-update-regression-testing.html`
- `articles/frontend-ui-testing-guide.html`

**AI and prompt engineering**
- `articles/ai-coding-prompts.html`
- `articles/ai-developer-tools.html`
- `articles/ai-prompts-for-programmers.html`
- `articles/ai-website-builder-guide.html`
- `articles/create-website-with-ai.html`
- `articles/prompt-engineering-developers.html`

**Web development, HTML, CSS, JavaScript, Git, and deployment**
- `articles/create-website-from-scratch.html`
- `articles/css-container-queries-guide.html`
- `articles/css-modern-design.html`
- `articles/git-github-beginners.html`
- `articles/github-actions-workflow-lockfiles.html`
- `articles/github-pages-deploy.html`
- `articles/html-advanced-inputs.html`
- `articles/html-audio-video.html`
- `articles/html-css-js-roles.html`
- `articles/html-document-structure.html`
- `articles/html-form-validation-accessibility.html`
- `articles/html-forms-basics.html`
- `articles/html-global-attributes-data.html`
- `articles/html-iframe-security.html`
- `articles/html-keyboard-accessibility.html`
- `articles/html-links-paths.html`
- `articles/html-lists-images.html`
- `articles/html-multipage-project.html`
- `articles/html-performance-loading.html`
- `articles/html-responsive-images.html`
- `articles/html-semantic-elements.html`
- `articles/html-tables-caption.html`
- `articles/html-text-headings-links.html`
- `articles/html-validation-debugging.html`
- `articles/html-what-is-html.html`
- `articles/javascript-beginners-guide.html`
- `articles/javascript-clean-code.html`
- `articles/javascript-debugging.html`
- `articles/javascript-fetch-api-errors.html`
- `articles/professional-website-ui-ux-guide.html`
- `articles/responsive-website-css-guide.html`
- `articles/typescript-for-beginners-ar.html`
- `articles/arabic-web-typography-guide.html`

## 3. Keyword-to-page map

Assign one primary search intent to each URL; use secondary phrases naturally in headings and body copy. Do not create duplicate pages targeting the same intent.

| Target page | Primary keyword / intent | Supporting terms | Internal links to add or verify |
|---|---|---|---|
| `pages/seo.html` | تعلم تحسين محركات البحث | SEO للمبتدئين، SEO تقني، تحسين الصفحات | Link to keyword research, internal linking, Search Console, sitemap, robots, schema guides and SEO tools |
| `articles/keyword-research-guide.html` | البحث عن الكلمات المفتاحية | تحليل الكلمات المفتاحية، نية البحث، long-tail keywords | Link to content strategy, SEO hub, blog outline generator |
| `articles/seo-content-strategy.html` | استراتيجية المحتوى SEO | خطة محتوى، topic clusters، المحتوى المفيد | Link to keyword research, internal linking, blog outline generator |
| `articles/internal-linking-seo-guide.html` | الروابط الداخلية SEO | بنية الموقع، نص الرابط، الصفحات المعزولة | Link to internal link planner, SEO analyzer, sitemap and content strategy |
| `pages/internal-link-planner.html` | أداة تخطيط الروابط الداخلية | internal link planner، ربط المقالات | Link back to internal linking guide and SEO hub |
| `pages/seo-analyzer.html` | أداة تحليل SEO للصفحة | فحص title، meta description، H1، canonical | Link to meta tags generator, SERP preview, HTML SEO metadata, website audit checklist |
| `pages/meta-tags-generator.html` | مولد Meta Tags | title tag، meta description، Open Graph | Link to HTML SEO metadata, SERP preview, SEO analyzer |
| `pages/serp-preview.html` | معاينة نتائج Google | معاينة عنوان SEO، معاينة الوصف | Link to meta tags generator and keyword research guide |
| `articles/google-search-console-indexing-errors.html` | حل مشاكل الفهرسة في Google | URL inspection، طلب الفهرسة، تغطية الصفحات | Link to website-not-appearing, sitemap guide, robots guide, canonical guide |
| `articles/website-not-appearing-google.html` | لماذا لا يظهر موقعي في Google | فهرسة الموقع، Search Console، crawlability | Link to indexing errors, sitemap, robots, canonical and SEO analyzer |
| `articles/robots-txt-guide.html` | شرح robots.txt | منع الزحف، قواعد robots | Link to robots.txt generator, sitemap guide, indexing errors |
| `pages/robots-txt-generator.html` | مولد robots.txt | إنشاء robots.txt، قواعد الزحف | Link to robots guide and sitemap generator |
| `articles/xml-sitemap-seo-guide.html` | sitemap SEO | خريطة الموقع XML، اكتشاف الصفحات | Link to sitemap generator, robots guide, indexing errors |
| `pages/sitemap-generator.html` | مولد sitemap XML | إنشاء خريطة الموقع، XML sitemap | Link to sitemap guide, robots generator and Search Console indexing guide |
| `articles/structured-data-guide.html` | البيانات المنظمة Schema | JSON-LD، rich results، structured data | Link to schema markup generator, HTML semantic SEO |
| `pages/schema-markup-generator.html` | مولد Schema Markup | JSON-LD generator، بيانات منظمة | Link to structured data guide and SEO analyzer |
| `articles/canonical-url-guide.html` | canonical URL في SEO | المحتوى المكرر، canonical tag | Link to indexing errors, faceted navigation, multilingual SEO |
| `articles/hreflang-multilingual-seo-guide.html` | hreflang وSEO متعدد اللغات | صفحات عربية وإنجليزية، international SEO | Link to canonical guide, HTML metadata, language-specific pages |
| `articles/seo-image-optimization-guide.html` | تحسين الصور لمحركات البحث | alt text، ضغط الصور، صور الويب | Link to image compressor, image-to-favicon, performance guide |
| `pages/performance.html` | تحسين سرعة الموقع | Core Web Vitals، تجربة المستخدم، أداء الهاتف | Link to speed, Core Web Vitals, Lighthouse, responsive preview and image compression |
| `articles/website-speed-optimization-guide.html` | تسريع الموقع | تحسين وقت التحميل، LCP، ضغط الصور | Link to Core Web Vitals, Lighthouse, image optimization |
| `articles/core-web-vitals-practical-guide.html` | شرح Core Web Vitals | LCP، INP، CLS، تجربة الصفحة | Link to speed optimization, Lighthouse audit, mobile quality testing |
| `articles/lighthouse-audit-fixes-guide.html` | إصلاح مشاكل Lighthouse | تدقيق الأداء، accessibility، best practices | Link to performance hub, Core Web Vitals, website quality checklist |
| `pages/ai.html` | أدوات الذكاء الاصطناعي للمطورين | هندسة الأوامر، بناء المواقع بالذكاء الاصطناعي | Link to AI articles, prompt builder and blog outline generator |
| `pages/ai-prompt-builder.html` | مولد أوامر الذكاء الاصطناعي | كتابة prompts، prompt engineering | Link to prompt engineering and AI coding prompt guides |
| `pages/blog-outline-generator.html` | مولد مخطط مقال | outline لمقال SEO، تخطيط المحتوى | Link to keyword research and content strategy |
| `pages/web-development.html` | تعلم تطوير المواقع | HTML، CSS، JavaScript، نشر المواقع | Link to web basics, responsive CSS, Git/GitHub and GitHub Pages deployment |
| `pages/web-design.html` | تصميم مواقع احترافية | UI/UX، responsive design، typography | Link to UI/UX, responsive CSS, Arabic typography, color contrast checker |
| `pages/programming.html` | تعلم البرمجة للمبتدئين | JavaScript، TypeScript، debugging | Link to JavaScript guide, TypeScript, clean code and debugging |
| `pages/tools.html` | أدوات ويب مجانية | أدوات SEO، أدوات المطورين، أدوات المحتوى | Link to every relevant tool category and selected tutorials; avoid a giant undifferentiated link block |
| `pages/archive.html` | مقالات وأدلة SEO وتطوير الويب | أرشيف المقالات، البحث في المحتوى | Link to category hubs and popular evergreen guides |

## 4. Recommended internal-linking rules

1. **Hub → cluster:** every topic hub should link to all relevant existing articles and tools within that topic.
2. **Article → tool:** where a tutorial explains an actionable task, add one contextual link to the matching tool. Examples: internal linking guide → internal link planner; structured data guide → schema generator; robots guide → robots generator; metadata guide → meta tags generator.
3. **Tool → explanation:** each tool should link back to a relevant guide explaining inputs, output, limitations, and recommended next steps.
4. **Article → related article:** add 2–4 highly relevant contextual links where they genuinely help readers; do not force a fixed count into short pages.
5. **Breadcrumbs:** homepage → category/hub → current page, using existing URL paths. Do not add breadcrumbs to the visible UI unless the page already supports them or a tested design change is approved.
6. **Anchor text:** vary descriptive phrases naturally; avoid repeated exact-match anchors across every page and avoid generic “click here” links.
7. **Orphan pages:** every indexable article/tool should be reachable through at least one hub/archive/category link and one contextual link where relevant.
8. **No URL changes:** keep all existing page paths. If a URL must change, add and test a permanent redirect before removing the old URL.
9. **Language:** page language and `dir` must match the actual content. Do not add hreflang alternates unless corresponding language versions exist and return valid pages.
10. **Sitemap integrity:** include canonical, indexable pages only; exclude 404s, admin pages, duplicate URL variants, and redirect destinations that are not canonical.

## 5. Suggested visual direction for the later redesign

Use a hybrid layout rather than copying another site: clear tool discovery inspired by SEO platforms, a well-structured learning library, category hubs, and a focused search interface. Keep the existing site identity and current page layout until the CSS/JS source and actual deployed build are reconciled.

Homepage information architecture:
1. Header with logo, main navigation, search, language control only if real translations exist.
2. Hero focused on one promise: free practical SEO and web tools plus tutorials.
3. Search input spanning tools, articles, and categories.
4. Quick entry cards: SEO tools, keyword research/content, technical SEO, performance, web development, AI.
5. Featured tools with short descriptions and clear links.
6. Featured guides / newest articles with category labels.
7. Topic clusters linking to hub pages.
8. Footer with policies, contact, editorial policy, sitemap.

Tool-page structure (preserve each tool's existing working controls):
- Breadcrumb.
- H1 naming the tool and task.
- Existing tool UI unchanged.
- Short explanation of when to use it.
- Steps to use it and output limitations.
- Related guide link.
- Two or three genuinely related tools.
- FAQ only when useful and consistent with the page's content strategy; do not insert automatically.

Article-page structure:
- Breadcrumb and category.
- One descriptive H1.
- Table of contents only when it improves navigation on long articles.
- Main content with clear H2/H3 hierarchy.
- Contextual links to relevant guides and tools.
- Related reading based on the same topic cluster.
- Article metadata and structured data consistent with visible content.

## 6. Implementation order

### Phase A — source integrity (blocking)
- Recover/confirm missing stylesheet, shared JavaScript, article catalog, and configuration files.
- Determine whether `index.htm` is an intentional legacy page or duplicate of `index.html`.
- Run the existing validation scripts in a real checkout and record exact failures before edits.
- Confirm the current GitHub Pages source and custom-domain configuration.

### Phase B — inventory and mapping
- Confirm each article's title, H1, description, canonical, language, category and existing internal links from its actual HTML.
- Turn the keyword map above into a per-URL sheet with primary keyword, secondary intent, source links and target links.
- Check sitemap entries against real files and canonical URLs.

### Phase C — internal-link implementation
- Add contextual links to existing HTML without rewriting article content or changing tool logic.
- Update category/hub cards only after the shared catalog and JavaScript are restored.
- Preserve URL paths, design tokens, RTL behavior, mobile navigation, dark mode, and all current tool interactions.

### Phase D — QA before merge
- Run the site's own validators and any available build/test commands.
- Verify all local href/src targets resolve to existing files.
- Check duplicate titles/descriptions/canonicals, missing H1s, empty anchors, orphan pages, sitemap coverage, and mixed canonical hosts.
- Test homepage, archive/search/filter, category hubs, each tool, responsive/mobile navigation, RTL, and dark mode.
- Open a pull request for review; do not merge or claim production deployment until checks pass.

## 7. Acceptance criteria
- No existing tool behavior is lost.
- No existing page URL is silently changed.
- No invented article records or links to nonexistent pages.
- All indexable pages use consistent canonical host and correct language metadata.
- Every article/tool is discoverable through a relevant hub and has contextually useful related links.
- Sitemap, feed, navigation, and page inventory agree.
- GitHub Pages build/deployment and mobile behavior are verified before merge.
