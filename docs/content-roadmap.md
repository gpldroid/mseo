# Content Roadmap

خارطة تنفيذية لإنتاج المحتوى، مبنية على بنية `Category → Subcategory → Article`، مع تحديد نية البحث والربط الداخلي وحماية واضحة من Cannibalization.

## قواعد التنفيذ

- كل مقال جديد يستهدف **نية بحث أساسية واحدة**.
- الـPillar يشرح الموضوع على مستوى واسع، بينما المقالات الداعمة تعالج أسئلة أو مهام محددة.
- لا ننشئ مقالًا جديدًا إذا كان قصده مطابقًا عمليًا لمقال موجود.
- الكلمات الداعمة تُستخدم داخل المقال والعناوين الفرعية عند الحاجة، وليست سببًا لإنشاء صفحات منفصلة تلقائيًا.
- روابط `internal_links_to` يجب أن تكون سياقية، وليس مجرد قائمة روابط في نهاية المقال.
- روابط `internal_links_from` تمثل الصفحات المخطط أن تشير إلى المقال بعد نشره.
- `canonical` يجب أن يبقى فريدًا لكل مقال.
- Tags للتنظيم والربط الداخلي، وليست صفحات SEO مستقلة تلقائيًا.

---

## Phase 1 — Pillars

### 1. AI Pillar
- **slug:** `ai-developers-guide`
- **title:** دليل الذكاء الاصطناعي للمطورين وأصحاب المواقع: الأدوات، بناء المواقع، البرمجة والأتمتة
- **category:** الذكاء الاصطناعي
- **subcategory:** AI للمطورين
- **primary keyword/topic:** الذكاء الاصطناعي للمطورين وأصحاب المواقع
- **search intent:** معلوماتي / تعليمي
- **target audience:** مطورو الويب، أصحاب المواقع، المبتدئون في أدوات AI
- **supporting keywords:** أدوات الذكاء الاصطناعي للمطورين، AI Coding، AI Website Builder، Prompt Engineering، AI Agents، أتمتة تطوير المواقع
- **internal_links_to:** `ai-website-builder-guide`, `ai-coding-prompts`, `ai-developer-tools`, `prompt-engineering-developers`, `ai-code-review-javascript`, `ai-agents-developers`
- **internal_links_from:** جميع مقالات Cluster الذكاء الاصطناعي
- **cannibalization guard:** لا يتحول إلى قائمة أدوات فقط؛ يجب أن يبقى مرجعًا واسعًا يشرح الاستخدامات والاختيارات وسير العمل.

### 2. Web Development Pillar
- **slug:** `web-development-guide`
- **title:** دليل تطوير المواقع للمبتدئين: من HTML وCSS وJavaScript إلى نشر الموقع
- **category:** تطوير المواقع
- **subcategory:** HTML
- **primary keyword/topic:** تطوير المواقع للمبتدئين
- **search intent:** معلوماتي / تعليمي
- **target audience:** المبتدئون ومن يريد بناء أول موقع
- **supporting keywords:** HTML، CSS، JavaScript، Git، GitHub، Hosting، HTTPS، Sitemap، robots.txt
- **internal_links_to:** `html-beginners-guide`, `css-beginners-guide`, `javascript-beginners-guide`, `git-github-beginners`, `domain-hosting-guide`, `https-ssl-guide`, `sitemap-robots-guide`, `web-apis-beginners`, `html-semantic-seo`, `github-pages-deploy`
- **internal_links_from:** مقالات تطوير المواقع الأساسية
- **cannibalization guard:** لا ينافس `html-semantic-seo`؛ هذا المقال خريطة شاملة، بينما المقال الحالي متخصص في Semantic HTML وSEO والوصول.

### 3. Web Design Pillar
- **slug:** `modern-web-design-guide`
- **title:** دليل تصميم المواقع الحديثة: UI وUX وResponsive Design وأساسيات الواجهات
- **category:** تصميم المواقع
- **subcategory:** UI Design
- **primary keyword/topic:** تصميم المواقع الحديثة
- **search intent:** معلوماتي / تعليمي
- **target audience:** مصممو الويب والمطورون وأصحاب المواقع
- **supporting keywords:** UI Design، UX Design، Responsive Design، Mobile-First، Landing Page، Typography، Design Systems
- **internal_links_to:** `ui-design-guide`, `ux-design-guide`, `mobile-first-design`, `landing-page-guide`, `web-typography-guide`, `web-colors-guide`, `design-systems-guide`, `css-modern-design`
- **internal_links_from:** جميع مقالات Cluster التصميم
- **cannibalization guard:** لا تنشئ مقالات متعددة تستهدف عبارة Responsive Design نفسها؛ افصل النية بين المفهوم العام والتطبيقات المتخصصة.

### 4. JavaScript Pillar
- **slug:** `javascript-web-development-guide`
- **title:** JavaScript للمواقع: الدليل العملي من الأساسيات إلى الكود القابل للصيانة
- **category:** البرمجة
- **subcategory:** JavaScript
- **primary keyword/topic:** JavaScript للمواقع
- **search intent:** معلوماتي / تعليمي
- **target audience:** المبتدئون والمطورون الذين يبنون مواقع Frontend
- **supporting keywords:** JavaScript للمبتدئين، DOM، Async JavaScript، Modules، Debugging، JavaScript Performance، Clean Code
- **internal_links_to:** `javascript-beginners-guide`, `javascript-dom-guide`, `javascript-debugging`, `javascript-performance`, `async-javascript`, `javascript-modules`, `javascript-clean-code`
- **internal_links_from:** جميع مقالات JavaScript
- **cannibalization guard:** `javascript-clean-code` يبقى متخصصًا في تنظيم وصيانة الكود؛ لا يعاد نشر مقال عام آخر بنفس النية.

### 5. SEO Pillar
- **slug:** `technical-seo-content-guide`
- **title:** دليل SEO للمواقع التقنية: من الأساسيات إلى Technical SEO والمحتوى والروابط
- **category:** SEO
- **subcategory:** Technical SEO
- **primary keyword/topic:** SEO للمواقع التقنية
- **search intent:** معلوماتي / تعليمي
- **target audience:** أصحاب المواقع التقنية والمطورون وكتاب المحتوى
- **supporting keywords:** SEO للمبتدئين، Technical SEO، Keyword Research، Search Intent، On-Page SEO، Schema، Sitemap، Canonical، Internal Linking
- **internal_links_to:** `seo-beginners-guide`, `keyword-research-guide`, `search-intent-guide`, `seo-content-strategy`, `on-page-seo-guide`, `internal-linking-guide`, `technical-seo-checklist`, `structured-data-guide`, `sitemap-robots-guide`, `canonical-url-guide`, `javascript-seo-guide`, `seo-audit-guide`
- **internal_links_from:** جميع مقالات SEO
- **cannibalization guard:** لا يستهدف استعلامًا ضيقًا مثل Schema أو Canonical أو Keyword Research؛ هذه لها صفحات داعمة مستقلة.

---

## Phase 2 — Gap Fillers

### 6. AI Developer Tools
- **slug:** `ai-developer-tools`
- **title:** أفضل أدوات الذكاء الاصطناعي للمطورين في 2026
- **category:** الذكاء الاصطناعي
- **subcategory:** أدوات AI
- **primary keyword/topic:** أدوات الذكاء الاصطناعي للمطورين
- **search intent:** تجاري/تحقيقي + معلوماتي
- **target audience:** مطورو الويب والمبرمجون
- **supporting keywords:** AI Coding Tools، أدوات برمجة بالذكاء الاصطناعي، AI Code Assistant
- **internal_links_to:** `ai-developers-guide`, `ai-coding-prompts`, `prompt-engineering-developers`
- **internal_links_from:** `ai-developers-guide`, `ai-coding-prompts`
- **cannibalization guard:** يركز على مقارنة حالات الاستخدام والمعايير العملية، لا على شرح AI للمطورين بشكل عام.

### 7. Prompt Engineering
- **slug:** `prompt-engineering-developers`
- **title:** Prompt Engineering للمطورين: كيف تكتب Prompts أفضل لكتابة ومراجعة الكود
- **category:** الذكاء الاصطناعي
- **subcategory:** Prompt Engineering
- **primary keyword/topic:** Prompt Engineering للمطورين
- **search intent:** تعليمي
- **target audience:** المطورون ومستخدمو AI Coding
- **supporting keywords:** coding prompts، prompts للبرمجة، code review prompts، تحسين مخرجات AI
- **internal_links_to:** `ai-developers-guide`, `ai-coding-prompts`, `ai-code-review-javascript`
- **internal_links_from:** `ai-developers-guide`, `ai-coding-prompts`
- **cannibalization guard:** `ai-coding-prompts` يركز على أمثلة جاهزة؛ هذا المقال يشرح المنهجية والمبادئ لبناء Prompt.

### 8. Git & GitHub
- **slug:** `git-github-beginners`
- **title:** Git وGitHub للمبتدئين: إدارة إصدارات مشاريع الويب خطوة بخطوة
- **category:** تطوير المواقع
- **subcategory:** Git & GitHub
- **primary keyword/topic:** Git وGitHub للمبتدئين
- **search intent:** تعليمي
- **target audience:** المبتدئون ومطورو الويب
- **supporting keywords:** Git basics، GitHub repository، commit، branch، pull request
- **internal_links_to:** `web-development-guide`, `github-pages-deploy`
- **internal_links_from:** `web-development-guide`, `github-pages-deploy`, `ai-website-builder-guide`
- **cannibalization guard:** لا يشرح GitHub Pages كموضوع استضافة؛ ذلك يبقى في `github-pages-deploy`.

### 9. JavaScript Basics
- **slug:** `javascript-beginners-guide`
- **title:** JavaScript للمبتدئين: الأساسيات التي تحتاجها لبناء مواقع تفاعلية
- **category:** البرمجة
- **subcategory:** JavaScript
- **primary keyword/topic:** JavaScript للمبتدئين
- **search intent:** تعليمي
- **target audience:** المبتدئون
- **supporting keywords:** variables، functions، arrays، objects، events، DOM basics
- **internal_links_to:** `javascript-web-development-guide`, `javascript-dom-guide`, `javascript-debugging`, `javascript-clean-code`
- **internal_links_from:** `javascript-web-development-guide`
- **cannibalization guard:** لا يدخل بعمق في Debugging أو Performance أو Clean Code.

### 10. JavaScript Debugging
- **slug:** `javascript-debugging`
- **title:** Debugging في JavaScript: دليل اكتشاف الأخطاء وإصلاحها
- **category:** البرمجة
- **subcategory:** Debugging
- **primary keyword/topic:** JavaScript Debugging
- **search intent:** حل مشكلة / تعليمي
- **target audience:** مطورو JavaScript
- **supporting keywords:** console، DevTools، breakpoints، errors، debugging techniques
- **internal_links_to:** `javascript-web-development-guide`, `javascript-beginners-guide`, `javascript-clean-code`
- **internal_links_from:** `javascript-web-development-guide`, `javascript-beginners-guide`
- **cannibalization guard:** لا يتحول إلى مقال عام عن JavaScript؛ كل المحتوى يجب أن يخدم تشخيص الأخطاء.

### 11. UI Design
- **slug:** `ui-design-guide`
- **title:** UI Design للمواقع: مبادئ تصميم واجهات ويب واضحة واحترافية
- **category:** تصميم المواقع
- **subcategory:** UI Design
- **primary keyword/topic:** UI Design للمواقع
- **search intent:** تعليمي
- **target audience:** مصممو الويب والمطورون
- **supporting keywords:** interface design، visual hierarchy، components، spacing، consistency
- **internal_links_to:** `modern-web-design-guide`, `web-typography-guide`, `web-colors-guide`, `design-systems-guide`
- **internal_links_from:** `modern-web-design-guide`
- **cannibalization guard:** UI فقط؛ لا يعالج تجربة المستخدم الكاملة مثل UX.

### 12. UX Design
- **slug:** `ux-design-guide`
- **title:** UX Design للمواقع: كيف تبني تجربة استخدام سهلة وواضحة
- **category:** تصميم المواقع
- **subcategory:** UX Design
- **primary keyword/topic:** UX Design للمواقع
- **search intent:** تعليمي
- **target audience:** المصممون وأصحاب المواقع والمطورون
- **supporting keywords:** user experience، usability، user flow، navigation، accessibility
- **internal_links_to:** `modern-web-design-guide`, `ui-design-guide`, `landing-page-guide`
- **internal_links_from:** `modern-web-design-guide`
- **cannibalization guard:** لا يعيد شرح قواعد الألوان والتباعد كموضوع UI؛ يركز على الاستخدام والرحلة والتنقل.

### 13. Keyword Research
- **slug:** `keyword-research-guide`
- **title:** Keyword Research للمواقع التقنية: كيف تختار الكلمات حسب نية البحث
- **category:** SEO
- **subcategory:** Keyword Research
- **primary keyword/topic:** Keyword Research للمواقع
- **search intent:** تعليمي
- **target audience:** أصحاب المواقع وكتاب المحتوى وSEO
- **supporting keywords:** keyword research، search intent، keyword mapping، topic clusters
- **internal_links_to:** `technical-seo-content-guide`, `search-intent-guide`, `seo-content-strategy`
- **internal_links_from:** `technical-seo-content-guide`, `seo-content-strategy`
- **cannibalization guard:** لا يتحول إلى مقال عام عن استراتيجية المحتوى؛ مهمته اختيار الكلمات وربطها بالنية والصفحات.

### 14. Search Intent
- **slug:** `search-intent-guide`
- **title:** نية البحث Search Intent: كيف تطابق محتوى الصفحة مع ما يريده المستخدم
- **category:** SEO
- **subcategory:** SEO للمبتدئين
- **primary keyword/topic:** Search Intent
- **search intent:** تعليمي
- **target audience:** أصحاب المواقع وكتاب المحتوى
- **supporting keywords:** informational intent، commercial intent، transactional intent، navigational intent
- **internal_links_to:** `technical-seo-content-guide`, `keyword-research-guide`, `seo-content-strategy`
- **internal_links_from:** `technical-seo-content-guide`, `keyword-research-guide`, `seo-content-strategy`
- **cannibalization guard:** يشرح تصنيف النية ومطابقة المحتوى؛ لا يعيد شرح Keyword Research كاملًا.

### 15. On-Page SEO
- **slug:** `on-page-seo-guide`
- **title:** On-Page SEO: تحسين العناوين والمحتوى والروابط وبنية الصفحة
- **category:** SEO
- **subcategory:** On-Page SEO
- **primary keyword/topic:** On-Page SEO
- **search intent:** تعليمي
- **target audience:** أصحاب المواقع وكتاب المحتوى
- **supporting keywords:** title tag، meta description، headings، internal links، image alt
- **internal_links_to:** `technical-seo-content-guide`, `seo-content-strategy`, `internal-linking-guide`, `structured-data-guide`
- **internal_links_from:** `technical-seo-content-guide`, `seo-content-strategy`
- **cannibalization guard:** لا يستهدف Technical SEO ككل؛ يركز على العناصر داخل الصفحة.

### 16. Internal Linking
- **slug:** `internal-linking-guide`
- **title:** الروابط الداخلية في SEO: بناء بنية ربط تساعد المستخدم ومحركات البحث
- **category:** SEO
- **subcategory:** Technical SEO
- **primary keyword/topic:** Internal Linking
- **search intent:** تعليمي
- **target audience:** أصحاب المواقع وكتّاب المحتوى والمطورون
- **supporting keywords:** internal links، topical clusters، anchor text، site architecture
- **internal_links_to:** `technical-seo-content-guide`, `seo-content-strategy`, `structured-data-guide`, `web-development-guide`
- **internal_links_from:** `technical-seo-content-guide`, `seo-content-strategy`, `structured-data-guide`
- **cannibalization guard:** يركز على هندسة الروابط والسياق؛ لا يعيد شرح SEO On-Page بالكامل.

### 17. Technical SEO Checklist
- **slug:** `technical-seo-checklist`
- **title:** Technical SEO Checklist: قائمة فحص تقنية للمواقع قبل وبعد الإطلاق
- **category:** SEO
- **subcategory:** Technical SEO
- **primary keyword/topic:** Technical SEO Checklist
- **search intent:** عملي / حل مشكلة
- **target audience:** المطورون وأصحاب المواقع
- **supporting keywords:** technical SEO audit، crawlability، indexability، canonical، sitemap، robots، HTTPS
- **internal_links_to:** `technical-seo-content-guide`, `sitemap-robots-guide`, `canonical-url-guide`, `structured-data-guide`, `seo-audit-guide`
- **internal_links_from:** `technical-seo-content-guide`
- **cannibalization guard:** Checklist عملية؛ لا ينافس المقالات التعليمية المتخصصة التي تشرح كل عنصر بالتفصيل.

### 18. Sitemap & Robots
- **slug:** `sitemap-robots-guide`
- **title:** Sitemap.xml وRobots.txt: الفرق والاستخدام الصحيح في SEO التقني
- **category:** SEO
- **subcategory:** Technical SEO
- **primary keyword/topic:** Sitemap.xml وRobots.txt
- **search intent:** تعليمي / حل مشكلة
- **target audience:** المطورون وأصحاب المواقع
- **supporting keywords:** XML sitemap، robots.txt، crawl، indexing
- **internal_links_to:** `technical-seo-content-guide`, `technical-seo-checklist`, `canonical-url-guide`
- **internal_links_from:** `technical-seo-content-guide`, `technical-seo-checklist`, `web-development-guide`
- **cannibalization guard:** يجمع الموضوعين لأنهما مرتبطان تقنيًا، لكن لا يكرر شرح Technical SEO العام.

### 19. Image Optimization
- **slug:** `web-image-optimization`
- **title:** تحسين صور المواقع: تقليل الحجم وتحسين السرعة وتجربة المستخدم
- **category:** أداء المواقع
- **subcategory:** الصور
- **primary keyword/topic:** تحسين صور المواقع
- **search intent:** عملي / حل مشكلة
- **target audience:** مطورو الويب وأصحاب المواقع
- **supporting keywords:** WebP، AVIF، image compression، responsive images، lazy loading
- **internal_links_to:** `web-performance-core`, `lighthouse-pagespeed-guide`, `css-js-optimization`
- **internal_links_from:** `web-performance-core`, `lighthouse-pagespeed-guide`
- **cannibalization guard:** لا يعيد شرح Core Web Vitals بالكامل؛ يركز على الصور والتحميل المرتبط بها.

### 20. Lighthouse & PageSpeed
- **slug:** `lighthouse-pagespeed-guide`
- **title:** Lighthouse وPageSpeed Insights: كيف تفحص أداء الموقع وتحدد مشاكل السرعة
- **category:** أداء المواقع
- **subcategory:** Lighthouse
- **primary keyword/topic:** Lighthouse وPageSpeed Insights
- **search intent:** عملي / حل مشكلة
- **target audience:** المطورون وأصحاب المواقع
- **supporting keywords:** Lighthouse audit، PageSpeed Insights، performance audit، Core Web Vitals
- **internal_links_to:** `web-performance-core`, `web-image-optimization`, `javascript-performance`, `css-js-optimization`
- **internal_links_from:** `web-performance-core`
- **cannibalization guard:** أداة التشخيص والمنهجية؛ لا يصبح مقالًا ثانيًا يشرح Core Web Vitals من الصفر.

---

## Existing articles: role in the roadmap

| slug | الدور |
|---|---|
| `ai-website-builder-guide` | Supporting — AI Website Builder |
| `ai-coding-prompts` | Supporting — AI Coding / Prompts |
| `html-semantic-seo` | Supporting — Semantic HTML + SEO |
| `css-modern-design` | Supporting — CSS / Responsive Design |
| `javascript-clean-code` | Supporting — Clean Code |
| `seo-content-strategy` | Supporting — Content SEO |
| `github-pages-deploy` | Supporting — Hosting / Deployment |
| `structured-data-guide` | Supporting — Technical SEO / Schema |
| `web-performance-core` | **Pillar — Performance / Core Web Vitals** |

## Future expansion backlog

بعد تنفيذ الـ20 مقالًا أعلاه، يمكن إضافة:
- AI Code Review باستخدام JavaScript
- AI Agents للمطورين
- Domain وHosting
- HTTPS وSSL
- Web APIs للمبتدئين
- Mobile-First Design
- Landing Pages
- Typography & Colors
- Design Systems
- JavaScript DOM
- Async JavaScript
- JavaScript Modules
- JavaScript Performance
- Canonical URL
- SEO للمواقع التي تستخدم JavaScript
- SEO Audit
- Caching
- CSS/JS Optimization
- أدوات SEO
- أدوات اختبار HTML/CSS/JavaScript
- إضافات Chrome للمطورين

## Publishing workflow

قبل إنشاء أي مقال جديد:

1. ابحث عن `slug` وموضوع قريب في هذه الخريطة.
2. حدّد الـ**primary intent** قبل العنوان.
3. تحقق من أن المقال ليس نسخة أضيق أو أوسع من مقال موجود بنفس النية.
4. أضف المقال إلى الـPillar المناسب.
5. حدّد الروابط الداخلة والخارجة قبل الكتابة.
6. أنشئ عنوانًا ووصفًا وcanonical فريدًا.
7. بعد النشر، أضف روابط سياقية من المقالات القديمة ذات الصلة.
8. لا تنشئ صفحة Tag أو Subcategory لمجرد وجود كلمة مفتاحية.
9. راجع الخريطة قبل كل دفعة محتوى لتجنب Cannibalization.

## Definition of Done

يُعتبر المقال جاهزًا للإنتاج عندما تكون الحقول التالية محددة:

`slug`, `title`, `category`, `subcategory`, `primary keyword/topic`, `search intent`, `target audience`, `supporting keywords`, `internal_links_to`, `internal_links_from`, `cannibalization guard`.

