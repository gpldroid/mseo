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


## المرحلة التالية

تمت إضافة أساس المرحلة التالية في فرع `next-stage-platform`:

- **SEO والفهرسة:** sitemap/robots والتحقق الآلي من metadata، مع إضافة صفحة مساعد AI إلى الفهرس.
- **تجربة الهاتف والأداء:** تقليل الاعتماد على الخط الخارجي، تحسين الفلاتر والاستجابة، ودعم lazy-loading للصور.
- **المقالات والتصنيفات:** كتالوج مركزي في `data/articles.json` يُستخدم للبطاقات والبحث والتصفية.
- **البحث الداخلي:** بحث فوري في العناوين والتصنيفات والوصف مع دعم `?q=`.
- **لوحة الإدارة:** `pages/admin.html` أصبحت محرر محتوى متصلًا بـ GitHub Contents API. استخدم Fine-grained token بصلاحية Contents فقط وعلى المستودع الحالي، ولا يتم حفظ الرمز في localStorage.
- **AI:** `pages/ai-assistant.html` جاهزة لربط endpoint خادمي، والإعداد في `data/ai-config.json`. لا تضع أي API key في JavaScript أو الملفات العامة.
- **الإطلاق:** GitHub Actions يبني CSS، يولد sitemap، ويفحص SEO والروابط قبل النشر.

### ملاحظة أمنية مهمة

GitHub Pages لا يوفر backend أو جلسات مصادقة خادمية. لذلك لوحة الإدارة هنا أداة مالك للمستودع وليست نظام SaaS متعدد المستخدمين. للإدارة الإنتاجية متعددة المستخدمين يجب إضافة OAuth/backend أو خدمة Serverless تحفظ الأسرار على الخادم.
