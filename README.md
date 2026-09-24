# MSEO AI & Web

موقع عربي ثابت لنشر الأدلة والمقالات العملية حول الذكاء الاصطناعي وتطوير المواقع والبرمجة وSEO.

## Architecture

- `index.html`: الصفحة الرئيسية.
- `articles/`: المقالات المنشورة كصفحات HTML مستقلة.
- `pages/`: صفحات التصنيفات والصفحات الثابتة.
- `assets/css/site.css`: نظام التصميم المشترك Header/Footer/Responsive/Search.
- `assets/css/style.css`: أنماط المحتوى الموجودة في المشروع.
- `assets/js/site.js`: المحرك المشترك للمظهر والقائمة والبحث والـHeader/Footer.
- `assets/js/main.js`: نقطة توافق للمشروع القديم وتستدعي المحرك المشترك.
- `.github/workflows/deploy.yml`: النشر التلقائي إلى GitHub Pages.
- `sitemap.xml` و`robots.txt`: ملفات الزحف والفهرسة.

## قواعد التطوير

1. كل مقال يجب أن يملك عنواناً ووصفاً وcanonical فريداً.
2. المقالات لا تستخدم `post.html?id=`؛ كل مقال له URL ثابت داخل `articles/`.
3. استخدم المسارات النسبية للـCSS/JS داخل الصفحات المتداخلة.
4. لا تضع بيانات حساسة أو مفاتيح API في المستودع.
5. صفحة `pages/admin.html` غير مفهرسة ولا تمثل نظام مصادقة.

## GitHub Pages

المشروع static ولا يحتاج إلى backend. Workflow الموجود في `.github/workflows/deploy.yml` يرفع محتوى المستودع مباشرة إلى GitHub Pages عند كل push إلى `main`.

URL المتوقع: https://gpldroid.github.io/mseo/
