# FastSEO — Semantic Keyword Strategy

Last updated: 2026-10-30
Primary domain: https://fastseo.site/
Language focus: Arabic (Modern Standard Arabic) with English technical entities where users commonly search for them.

## Strategy

- Give each indexable URL one dominant search intent and one primary topic.
- Use supporting terms only where the page genuinely answers that subtopic.
- Treat Arabic variants, transliterations, and English technical terms as vocabulary coverage—not as a checklist to repeat.
- Do not add a `meta keywords` tag. Google does not use it for ranking.
- Do not promise ranking gains from keyword frequency. Prioritize useful answers, accurate titles/descriptions, crawlability, internal links, and clear page structure.
- Do not create a new URL when an existing page already satisfies the same intent.

## Topic clusters and target intent

| Cluster | Primary page | Primary intent | Supporting semantic concepts |
|---|---|---|---|
| SEO learning | `pages/seo.html` | تعلم تحسين محركات البحث | SEO للمبتدئين، SEO داخلي، SEO تقني، نية البحث، جودة المحتوى |
| Keyword research | `articles/keyword-research-guide.html` | البحث عن الكلمات المفتاحية | تحليل الكلمات المفتاحية، الكلمات طويلة الذيل، حجم البحث، صعوبة المنافسة، Keyword Research |
| Content strategy | `articles/seo-content-strategy.html` | استراتيجية محتوى SEO | خطة المحتوى، مجموعات الموضوعات، Topic Clusters، المحتوى المفيد، تقويم المحتوى |
| Internal links | `articles/internal-linking-seo-guide.html` | الروابط الداخلية SEO | بنية الموقع، Anchor Text، الصفحات المعزولة، توزيع الروابط |
| Search indexing | `articles/website-not-appearing-google.html` | لماذا لا يظهر الموقع في Google | الزحف، الفهرسة، URL Inspection، Search Console |
| Indexing diagnostics | `articles/google-search-console-indexing-errors.html` | حل أخطاء الفهرسة | Page indexing، الاستبعاد، noindex، canonical |
| Search analytics | `articles/google-search-console-performance-report.html` | تحليل أداء البحث | مرات الظهور، النقرات، CTR، متوسط الموضع |
| Robots | `articles/robots-txt-guide.html` | شرح robots.txt | User-agent، قواعد الزحف، Crawlability |
| Structured data | `articles/structured-data-guide.html` | البيانات المنظمة Schema | Schema.org، JSON-LD، Rich Results |
| XML sitemap | `articles/xml-sitemap-seo-guide.html` | خريطة الموقع لمحركات البحث | Sitemap XML، اكتشاف الصفحات، عناوين URL |
| Canonical | `articles/canonical-url-guide.html` | canonical URL | الرابط الأساسي، المحتوى المكرر، Canonicalization |
| International SEO | `articles/hreflang-multilingual-seo-guide.html` | SEO متعدد اللغات | hreflang، اللغة والمنطقة، International SEO |
| JavaScript SEO | `articles/javascript-seo-rendering-guide.html` | تحسين JavaScript لمحركات البحث | SSR، CSR، rendering، قابلية الزحف |
| Semantic HTML | `articles/html-semantic-seo.html` | HTML الدلالي وSEO | Semantic HTML، HTML5، بنية العناوين، accessibility |
| Metadata | `articles/html-seo-metadata.html` | وسوم SEO في HTML | Title Tag، Meta Description، canonical، Open Graph |
| Image SEO | `articles/seo-image-optimization-guide.html` | تحسين الصور لمحركات البحث | Alt Text، WebP، ضغط الصور، Image SEO |
| Core Web Vitals | `articles/core-web-vitals-practical-guide.html` | شرح Core Web Vitals | LCP، INP، CLS، Page Experience |
| Web performance | `articles/website-speed-optimization-guide.html` | تحسين سرعة الموقع | وقت التحميل، التخزين المؤقت، ضغط الموارد، PageSpeed Insights |
| Lighthouse | `articles/lighthouse-audit-fixes-guide.html` | تدقيق Lighthouse | الأداء، accessibility، best practices |
| Web development | `articles/create-website-from-scratch.html` | إنشاء موقع إلكتروني | HTML، CSS، JavaScript، الاستضافة، النشر |
| Responsive design | `articles/responsive-website-css-guide.html` | تصميم موقع متجاوب | Mobile First، Media Queries، Flexbox، CSS Grid |
| TypeScript | `articles/typescript-for-beginners-ar.html` | تعلم TypeScript | الأنواع، interfaces، JavaScript، static typing |

## On-page implementation rules

1. **Title:** unique, descriptive, aligned with the page's actual intent. Put the main concept naturally near the beginning; avoid repeated brand terms.
2. **Meta description:** summarize the actual benefit and scope. Do not treat it as a direct ranking-factor guarantee.
3. **H1:** one clear page-level heading that matches the visible content.
4. **H2/H3:** organize real subtopics and user questions; do not add headings solely to place variants.
5. **Opening paragraph:** answer the main query quickly and define the scope.
6. **Entities:** explain relevant concepts and relationships (for example, crawling → indexing → serving) rather than listing disconnected terms.
7. **Internal links:** link to the closest useful guide or tool using descriptive anchor text. Avoid exact-match anchor repetition and links to nonexistent pages.
8. **Images:** write useful alt text describing the image's purpose; do not turn alt text into keyword lists.
9. **Structured data:** use only types that accurately describe visible page content; validate JSON-LD and keep it consistent with the page.
10. **Refreshes:** change `dateModified` only when the page receives a meaningful update.

## Keyword cannibalization checks

- Keep the broad learning intent on `pages/seo.html`; keep specific how-to intents on their dedicated articles.
- Keep keyword research separate from content strategy: research identifies topics and intent; strategy organizes publishing and coverage.
- Keep sitemap generation (tool page) separate from sitemap concepts and SEO guidance (article page).
- When two pages answer the same query, improve the stronger page and link/merge content where appropriate instead of publishing a near-duplicate.
- Review Search Console query-to-page data before changing a page's target. Do not infer search volume or difficulty without a reliable dataset.

## Catalog changes in this release

The `tags` arrays in `data/articles.json` were enriched for 23 existing articles with Arabic query variants and relevant English technical entities. Existing slugs, URLs, titles, descriptions, images, dates, and article content were preserved. These tags support the site's catalog/search experience; they are not a substitute for contextual use of concepts in article copy.
