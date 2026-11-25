# MSEO — موقع وأدوات تحسين المواقع

مشروع MSEO هو موقع عربي يضم مقالات وأدلة عملية وأدوات مجانية للمطورين وأصحاب المواقع. يعتمد الآن Astro لتوليد صفحات ثابتة مع إبقاء المقالات والصفحات والأدوات الحالية متاحة عبر مساراتها الأصلية. الموقع منشور عبر GitHub Pages، ويستخدم النطاق العام `https://fastseo.site/`.

## المتطلبات

- Node.js 22 أو إصدار LTS حديث متوافق.
- npm.
- Git للوصول إلى المستودع وإرسال التغييرات.

لا يحتاج الموقع إلى خادم تطبيقات أو قاعدة بيانات لتوليد الصفحات الثابتة. يستخدم Astro لبناء الصفحة الرئيسية ومكونات الواجهة، بينما تُحفظ ملفات المقالات والصفحات والأدوات القديمة كأصول ثابتة خلال مرحلة الانتقال.

## تشغيل المشروع محليًا

```bash
git clone https://github.com/gpldroid/mseo.git
cd mseo
npm install
npm run build
```

ينشئ الأمر `npm run build` مجلد `dist/` الجاهز للنشر. يمكن معاينة الملفات محليًا باستخدام خادم ملفات ثابت، مثل:

```bash
npx serve dist
```

ثم افتح عنوان الخادم المحلي الذي يعرضه الأمر. مجلد `dist/` ناتج بناء مؤقت ولا تعدّل ملفاته يدويًا؛ عدّل ملفات المصدر ثم أعد البناء.

## الأوامر المتاحة

| الأمر | الوظيفة |
| --- | --- |
| `npm run dev` | يجهّز الصفحات الثابتة القديمة ثم يشغّل خادم تطوير Astro. |
| `npm run build` | يضبط SEO والصور، ويولّد Sitemap وRSS، ويجهّز الأصول القديمة، ثم يبني الموقع عبر Astro داخل `dist/`. |
| `npm run preview` | يعاين مخرجات Astro محليًا بعد البناء. |
| `npm run fix:images` | يضيف خصائص الأبعاد والتحميل وفك الترميز الناقصة إلى وسوم الصور المعروفة. آمن لإعادة التشغيل. |
| `npm run audit` | الفحص الشامل: JavaScript وSEO والروابط والأمان والفهرس والترجمات والتوجيه والأداء. |
| `npm run audit:ci` | فحوصات CI الأساسية قبل النشر. |
| `npm run audit:seo` | فحص عناصر SEO للصفحات. |
| `npm run audit:external-links` | فحص الروابط الخارجية. |
| `npm run audit:links` | فحص الروابط الداخلية والوجهات المحلية. |
| `npm run audit:security` | فحص أنماط DOM وحماية إدخال HTML. |
| `npm run audit:catalog` | التحقق من فهرس الأدوات وWebMCP. |
| `npm run audit:translations` | فحص ملفات ونصوص الترجمة. |
| `npm run audit:routing` | فحص قواعد التوجيه وSitemap وRSS وrobots.txt. |
| `npm run audit:performance` | جرد الصور وخصائصها وأحجام الملفات. |
| `npm run audit:astro-articles` | التحقق من سجلات المقالات وملفات المصدر وcanonical والـslugs قبل البناء. |
| `npm run audit:astro-articles:built` | التحقق من وجود جميع مسارات المقالات في مخرجات Astro بعد البناء. |
| `npm run check:js` | التحقق من صياغة ملفات JavaScript المحددة في package.json. |
| `npm run generate:sitemap` | توليد `sitemap.xml` من المقالات والصفحات العامة. |
| `npm run generate:feed` | توليد `feed.xml` من أحدث المقالات. |
| `npm test` | يشغّل الفحص الشامل عبر `npm run audit`. |

للتأكد قبل إرسال التغييرات:

```bash
npm run fix:images
npm run audit:ci
npm run build
```

## بنية المشروع المهمة

- `index.html`: الصفحة الرئيسية ومناطق العرض التي يملؤها مولّد الموقع.
- `articles/`: ملفات المقالات الفردية.
- `pages/`: صفحات الموقع والأدوات.
- `data/articles.json`: مصدر بيانات المقالات الذي يستخدمه البناء لتوليد الصفحة الرئيسية وSitemap وRSS.
- `assets/css/`: ملفات التنسيق.
- `assets/js/site.js`: سلوك الموقع المشترك.
- `assets/js/home.js`: سلوك الصفحة الرئيسية.
- `assets/js/tools-catalog.js`: فهرس الأدوات الذي يغذي دليل الأدوات وتكامل WebMCP.
- `partials/header.html` و`partials/footer.html`: مكوّنا الرأس والتذييل المشتركان.
- `scripts/`: أدوات البناء والفحص الآلي.
- `.github/workflows/`: التحقق الآلي ونشر GitHub Pages.
- `dist/`: مخرجات البناء؛ لا تُعدّلها يدويًا.

## إضافة مقال جديد

1. أنشئ ملف HTML جديدًا داخل `articles/` باستخدام slug واضح وثابت، مثل `articles/my-new-guide.html`.
2. انسخ الهيكل الدلالي وبيانات SEO من مقال قائم مناسب، ثم حدّث العنوان والوصف وCanonical وبيانات Open Graph وSchema ومحتوى المقال.
3. أضف سجلًا جديدًا إلى مصفوفة `data/articles.json`، مع الحفاظ على صيغة JSON الصحيحة. الحقول الأساسية المستخدمة في الموقع تشمل:
   - `slug`: المعرّف الثابت للمقال.
   - `file`: اسم ملف HTML داخل `articles/`.
   - `title` و`description`: العنوان والوصف.
   - `category` و`subcategory` و`tags`: التصنيف والوسوم.
   - `image` و`thumbnail`: روابط الصورة الرئيسية والصورة المصغرة.
   - `publishedAt` و`updatedAt`: التاريخ بصيغة `YYYY-MM-DD`.
   - `author` و`authorTitle`: بيانات الكاتب.
4. استخدم مسار الصورة الفعلي الموجود في المستودع، واكتب نصًا بديلًا وصفيًا. أضف `width` و`height` و`loading` و`decoding` إلى الصور؛ اجعل صورة LCP فقط `loading="eager"` عند الحاجة، واترك الصور البعيدة عن الشاشة `lazy`.
5. شغّل الفحوصات والبناء. يتأكد مولّد Sitemap من وجود ملفات المقالات المسجلة، ويُدرج RSS أحدث 30 مقالًا.

مثال مختصر لسجل المقال (أضف الحقول إلى السجل الفعلي بما يتوافق مع المقال):

```json
{
  "slug": "my-new-guide",
  "file": "my-new-guide.html",
  "title": "عنوان الدليل",
  "category": "تطوير المواقع",
  "subcategory": "أدلة عملية",
  "tags": ["HTML", "SEO"],
  "description": "وصف واضح ومختصر للمقال.",
  "image": "https://fastseo.site/assets/images/article-thumbnails/my-new-guide.svg",
  "thumbnail": "https://fastseo.site/assets/images/article-thumbnails/my-new-guide.svg",
  "publishedAt": "2026-11-16",
  "updatedAt": "2026-11-16",
  "author": "عماد الدين لمراني",
  "authorTitle": "محرر محتوى تقني"
}
```

## إضافة أداة جديدة

1. أنشئ صفحة الأداة داخل `pages/`، مع عنوان ووصف وCanonical وبيانات Schema وروابط داخلية صحيحة.
2. أضف الأداة إلى مصفوفة `tools` في `assets/js/tools-catalog.js`. استخدم خصائص الفهرس الموجودة مثل `icon` و`kicker` و`title` و`description` و`href`، وأضف `titleEn` و`descriptionEn` عندما تكون مناسبة.
3. تأكد من أن `href` يطابق اسم الملف وأن الصفحة تعمل دون الاعتماد على مسارات محلية مطلقة غير مناسبة.
4. أضف روابط الأداة إلى الصفحات أو الأقسام ذات الصلة عند الحاجة، مع تجنب تكرار تعريف الأداة في أكثر من فهرس.
5. شغّل `npm run audit:catalog` و`npm run audit:links` ثم `npm run build`.

## الصور والأداء

- استخدم SVG للأيقونات والرسوم المتجهة، وWebP أو AVIF للصور النقطية عندما يكون ذلك مناسبًا.
- حدد أبعاد الصور لتقليل تغيّر التخطيط (CLS).
- استخدم `decoding="async"` للصور غير الحرجة.
- استخدم `loading="lazy"` للصور أسفل الجزء المرئي، ولا تؤخر صورة LCP؛ استخدم `loading="eager"` و`fetchpriority="high"` لها عند ثبوت أنها صورة العنصر الأكبر.
- لا تغيّر امتداد ملف صورة أو تحوّله دون التحقق من نوعه الحقيقي وتحديث جميع المراجع.
- تقرير `audit:performance` فحص ساكن للملفات؛ لا يُعد بديلًا عن قياس Lighthouse أو بيانات Core Web Vitals الفعلية.

## النشر والصيانة

- كل دفع إلى فرع `main` يشغّل سير عمل GitHub Pages للتحقق والبناء والنشر.
- راجع تبويب **Actions** في GitHub للتأكد من نجاح مرحلتي Build وDeploy.
- بعد النشر، تحقق من الصفحة الرئيسية و`/sitemap.xml` و`/feed.xml` و`/robots.txt`.
- لا تغيّر النطاق أو Canonical أو Slugs أو قواعد التوجيه دون مراجعة تأثيرها على الفهرسة والروابط الحالية.

## المساهمة

قبل فتح Pull Request أو دمج أي تغيير، شغّل `npm run fix:images` و`npm run audit:ci` و`npm run build`. احتفظ بالتغييرات مركزة، ولا تضف ملفات CSS أو JavaScript مكررة إذا كان بالإمكان توسيع المكوّن أو الملف المشترك القائم.


## بنية Astro الحالية

بدأ الانتقال إلى Astro بصورة تدريجية لتقليل مخاطر تغيير الروابط المفهرسة:

- `astro.config.mjs`: إعداد الموقع الثابت والنطاق `https://fastseo.site` ومجلد النشر.
- `src/pages/index.astro`: الصفحة الرئيسية المبنية بواسطة Astro وتقرأ فهرس المقالات الحالي من `data/articles.json`.
- `src/content.config.mjs`: مجموعة محتوى Astro مخصصة تقرأ `data/articles.json` وتربط كل سجل بملف المقال الأصلي، وتتحقق من وجود الملف وبنية `head` و`main` ومن عدم تكرار slug.
- `src/pages/articles/[slug].astro`: مسار Astro ثابت يولّد روابط المقالات بصيغتها الحالية `/articles/<slug>.html`.
- `src/components/ArticlePage.astro`: قالب المقال الموحد، يحافظ على بيانات SEO الأصلية ومحتوى المقال ويدمج نظام التصميم الذهبي وشريط التنقل.
- `src/components/ArticleCard.astro` و`src/components/CategoryCard.astro`: بطاقات مشتركة لعرض المقالات والتصنيفات.
- `src/pages/pages/categories.astro` و`src/pages/pages/topics.astro`: صفحات Astro للتصنيفات ومقالات كل تصنيف، مع الحفاظ على المسارين القديمين.
- `src/layouts/SiteLayout.astro`: الهيكل المشترك وبيانات الصفحة الأساسية.
- `src/components/BottomTabBar.astro`: شريط التنقل السفلي لصفحات Astro.
- `src/styles/design-system.css`: نظام التصميم ثلاثي الأبعاد CSS 3D.
- `scripts/prepare-astro-public.mjs`: ينسخ الصفحات والأدوات والأصول القديمة إلى مجلد Astro العام، ويضيف ملفات التنقل والتصميم إلى صفحات HTML القديمة. لا ينسخ المقالات أو صفحتي التصنيفات والموضوعات؛ فهذه المسارات تُولّد بواسطة Astro.
- `public/`: مجلد مرحلي مولّد أثناء البناء؛ لا تعدّل محتواه يدويًا.
- `dist/`: المخرجات النهائية الجاهزة لـ GitHub Pages.

### نظام التصميم والتنقل

يعتمد التصميم على أسطح متعددة الطبقات، منظور `perspective`، ظلال عمق، وتحولات ثلاثية الأبعاد خفيفة عند التفاعل. شريط التنقل السفلي يضم الرئيسية والمقالات والتصنيفات والأدوات والاستكشاف، مع مراعاة RTL ومساحات اللمس وتقليل الحركة عند تفعيل `prefers-reduced-motion`.

### ملاحظة الانتقال

اكتملت مرحلة نقل المقالات إلى Astro Content Collection: مصدر البيانات الوصفية هو `data/articles.json`، ومحتوى كل مقال ووسوم SEO يُقرأ من ملف HTML الأصلي دون إعادة كتابة النص أو تغيير الـslug. يولّد Astro صفحة مستقلة لكل مقال على المسار نفسه `/articles/<slug>.html`، مع الحفاظ على canonical وOpen Graph وTwitter وJSON-LD ومحتوى `<main>`. تبقى ملفات HTML الأصلية داخل `articles/` كمصدر محتوى قابل للتحرير والرجوع إليه، لكنها لا تُنسخ إلى `public/` ولا تُنشر مباشرة؛ مخرجات المقالات تأتي من مسارات Astro. الصفحات والأدوات القديمة ما زالت HTML ثابتة في هذه المرحلة.


### ألوان الهوية البصرية

تم توحيد الألوان على لوحة مشروع Ahmed Oubali المرجعي `gpldroid/ahmedoubalie`:

| الرمز | الاستخدام | اللون |
|---|---|---|
| `--paper` | الخلفية العاجية | `#f7f5ef` |
| `--paper-deep` | خلفيات الأقسام | `#efede5` |
| `--surface` | البطاقات | `#fffefa` |
| `--ink` | النص الداكن | `#24231f` |
| `--gold` | الذهبي الأساسي | `#b18a49` |
| `--gold-deep` | الذهبي الداكن والتباين | `#765722` |
| `--line` | الحدود | `#dedbd1` |

تم ربط متغيرات CSS القديمة بهذه الرموز حتى تتوحد الصفحة الرئيسية والمقالات والأدوات والصفحات الثابتة وشريط التنقل دون تغيير بنية المحتوى.
