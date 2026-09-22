# Magic SEO Pro Max

## العربية

تمت إعادة بناء المشروع إلى بنية نشر احترافية تفصل **المقالات Posts** عن **الصفحات Pages** وعن الواجهة والمنطق البرمجي.

### البنية

- `index.html` — الصفحة الرئيسية.
- `post.html` — قالب واحد يعرض أي مقال عبر `?id=`.
- `pages/about.html` — من نحن.
- `pages/privacy.html` — سياسة الخصوصية.
- `pages/contact.html` — اتصل بنا.
- `pages/terms.html` — شروط الاستخدام.
- `assets/css/style.css` — جميع CSS المخصص.
- `assets/js/data/articles.js` — قاعدة المقالات ومحتوى Posts.
- `assets/js/main.js` — وظائف الصفحة الرئيسية.
- `assets/js/post.js` — محرك عرض المقال.
- `assets/js/tailwind-config.js` — إعداد Tailwind الخارجي.

تمت إزالة CSS وJavaScript المضمنين من `index.html`، وأصبحت بطاقات المقالات تعتمد على روابط ديناميكية إلى `post.html`.

## English

Magic SEO Pro Max now uses a maintainable static publishing architecture that separates posts, pages, content data, styling, and behavior.

- `index.html`: homepage
- `post.html`: reusable post template
- `pages/`: static pages
- `assets/css/style.css`: custom CSS
- `assets/js/data/articles.js`: article database
- `assets/js/main.js`: homepage controller
- `assets/js/post.js`: post renderer
- `assets/js/tailwind-config.js`: external Tailwind configuration

The project is suitable for static hosting and GitHub Pages.
