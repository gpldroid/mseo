# فاست سيو — Hugo

الموقع مبني باستخدام Hugo وGo Templates ويُنشر عبر GitHub Pages على https://fastseo.site/.

التشغيل المحلي: ثبّت Hugo Extended وNode.js 22، ثم نفّذ npm install، وبعدها npm run build:css وnode scripts/prepare-content.mjs ثم hugo server.

- content/: صفحات ومقالات Hugo المولّدة.
- migration/source/: نسخ HTML الأصلية للمقالات والصفحات للحفاظ على النصوص ووظائف الأدوات أثناء الانتقال.
- layouts/: القوالب والـ partials والـ shortcode.
- assets/: ملفات CSS وJavaScript التي يعالجها Hugo Pipes.
- static/: الصور وملفات التحقق والتتبع والملفات العامة.
- data/articles.json: بيانات المقالات الأصلية.
