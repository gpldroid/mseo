/* Shared MSEO tools catalog: one source for homepage and tools directory. */
(() => {
  "use strict";

  const tools = [
    { icon: "search", kicker: "تحليل المواقع", title: "محلل SEO الأساسي", description: "راجع العنوان والوصف والعناوين والصور والروابط وبيانات المشاركة.", href: "seo-analyzer.html" },
    { icon: "tags", kicker: "تحسين الظهور", title: "مولّد Meta Tags", description: "أنشئ وسوم العنوان والوصف والمشاركة الاجتماعية، ثم انسخ الكود.", href: "meta-tags-generator.html" },
    { icon: "file-text", kicker: "كتابة المحتوى", title: "عداد الكلمات وزمن القراءة", description: "احسب الكلمات والأحرف والفقرات وقدّر وقت القراءة والإلقاء.", href: "word-counter.html" },
    { icon: "link", kicker: "تنسيق النصوص", title: "محوّل النصوص ومولّد Slug", description: "جهّز العناوين كروابط واضحة ونظّف النصوص بسهولة.", href: "text-slug-converter.html" },
    { icon: "code", kicker: "أدوات المطورين", title: "منسّق JSON ومتحقّق من صحته", description: "نسّق JSON أو اضغطه وتحقق من صحة الصياغة.", href: "json-formatter.html" },
    { icon: "bot", kicker: "أدوات SEO", title: "مولّد robots.txt", description: "أنشئ قواعد زحف قابلة للتخصيص وأضف رابط Sitemap.", href: "robots-txt-generator.html" },
    { icon: "entities", kicker: "أدوات المطورين", title: "محوّل HTML Entities", description: "حوّل الرموز الخاصة إلى كيانات HTML أو فك ترميزها.", href: "html-entity-converter.html" },
    { icon: "schema", kicker: "البيانات المنظمة", title: "مولّد Schema Markup", description: "أنشئ بيانات منظمة بصيغة JSON-LD وتحقق من صياغتها.", href: "schema-markup-generator.html" },
    { icon: "palette", kicker: "تصميم الواجهات", title: "مولّد الألوان وتدرجات CSS", description: "ولّد لوحات ألوان وتدرجات وانسخ كود CSS.", href: "css-color-generator.html" },
    { icon: "layers", kicker: "تصميم الواجهات", title: "مولّد CSS Box Shadow", description: "خصص ظلال العناصر مع معاينة فورية للكود.", href: "css-box-shadow-generator.html" },
    { icon: "minify", kicker: "أدوات المطورين", title: "ضاغط CSS وJavaScript", description: "قلّل المسافات الزائدة في ملفات الويب.", href: "css-js-minifier.html" },
    { icon: "search", kicker: "SEO", title: "معاينة نتيجة البحث SERP", titleEn: "SERP Snippet Preview", description: "عاين عنوان الصفحة والوصف كما قد يظهران في نتائج البحث.", descriptionEn: "Preview a title and description as a search snippet.", href: "serp-preview.html" },
    { icon: "schema", kicker: "SEO", title: "مولّد XML Sitemap", titleEn: "XML Sitemap Generator", description: "أنشئ خريطة XML من روابط موقعك.", descriptionEn: "Generate an XML sitemap from URLs.", href: "sitemap-generator.html" },
    { icon: "link", kicker: "SEO", title: "مخطط الروابط الداخلية", titleEn: "Internal Link Planner", description: "خطط روابط داخلية بين صفحات موقعك.", descriptionEn: "Plan internal links between pages.", href: "internal-link-planner.html" },
    { icon: "code", kicker: "البرمجة", title: "محوّل JSON إلى CSV", titleEn: "JSON to CSV Converter", description: "حوّل مصفوفة JSON إلى CSV.", descriptionEn: "Convert a JSON array to CSV.", href: "json-to-csv.html" },
    { icon: "link", kicker: "البرمجة", title: "ترميز وفك ترميز URL", titleEn: "URL Encoder / Decoder", description: "رمّز النصوص أو فك ترميزها.", descriptionEn: "Encode or decode URL text.", href: "url-encoder-decoder.html" },
    { icon: "code", kicker: "البرمجة", title: "مختبر Regex", titleEn: "Regular Expression Tester", description: "اختبر التعبيرات النمطية على نصوصك.", descriptionEn: "Test regular expressions against text.", href: "regex-tester.html" },
    { icon: "code", kicker: "البرمجة", title: "محوّل Base64", titleEn: "Base64 Encoder / Decoder", description: "حوّل النصوص إلى Base64 أو فك ترميزها مع دعم Unicode.", descriptionEn: "Encode or decode Base64 including Unicode.", href: "base64-converter.html" },
    { icon: "palette", kicker: "التصميم", title: "فاحص التباين اللوني WCAG", titleEn: "WCAG Color Contrast Checker", description: "احسب تباين النص والخلفية وتحقق من WCAG.", descriptionEn: "Calculate text contrast and check WCAG.", href: "color-contrast-checker.html" },
    { icon: "layers", kicker: "التصميم", title: "معاينة التصميم المتجاوب", titleEn: "Responsive Layout Preview", description: "عاين رابطًا في إطار هاتف أو لوحي أو سطح مكتب.", descriptionEn: "Preview a URL in a device-sized frame.", href: "responsive-preview.html" },
    { icon: "palette", kicker: "التصميم", title: "منسّق ومخفّف SVG", titleEn: "SVG Optimizer", description: "نظّف كود SVG النصي وعاينه ثم نزّل الناتج.", descriptionEn: "Clean SVG source, preview and download.", href: "svg-optimizer.html" },
    { icon: "layers", kicker: "الأداء", title: "ضغط الصور وتحويلها", titleEn: "Image Compressor & Converter", description: "اضغط الصور محليًا وصدّر JPEG أو WebP.", descriptionEn: "Compress images locally and export JPEG or WebP.", href: "image-compressor.html" },
    { icon: "file-text", kicker: "الأداء", title: "محلّل حجم النص", titleEn: "Text Payload Size Analyzer", description: "احسب الكلمات والأحرف وحجم UTF-8.", descriptionEn: "Count words, characters and UTF-8 size.", href: "text-size-analyzer.html" },
    { icon: "bot", kicker: "الذكاء الاصطناعي", title: "منشئ مطالبات الذكاء الاصطناعي", titleEn: "AI Prompt Builder", description: "أنشئ مطالبة منظمة من الهدف والجمهور والقيود.", descriptionEn: "Build a structured prompt from goals and constraints.", href: "ai-prompt-builder.html" },
    { icon: "file-text", kicker: "المحتوى", title: "مولّد مخطط المقال", titleEn: "Blog Outline Generator", description: "أنشئ مخطط مقال بعناوين وأمثلة وخاتمة.", descriptionEn: "Generate an article outline with headings and examples.", href: "blog-outline-generator.html" },
    { icon: "code", kicker: "المحتوى", title: "مقارنة النصوص واكتشاف الفروقات", titleEn: "Text Diff Checker", description: "قارن نصين سطرًا بسطر لاكتشاف التغييرات.", descriptionEn: "Compare two texts line by line.", href: "text-diff-checker.html" }
  ];

  const ICONS = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5M8 10.8h5.6M10.8 8v5.6"/></svg>',
    tags: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m20.6 13.4-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.2"/></svg>',
    "file-text": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8M8 9h1"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.1 0l3-3A5 5 0 0 0 13 2.9l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-3 3A5 5 0 0 0 11 21.1l1.7-1.7"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16"/></svg>',
    bot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="3"/><path d="M12 3v4M8 12h.01M16 12h.01M8 16h8"/></svg>',
    entities: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16"/><path d="M3 3h4M17 21h4"/></svg>',
    schema: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="17" width="7" height="5" rx="1"/><rect x="15" y="17" width="7" height="5" rx="1"/><path d="M12 7v5M5.5 17v-3h13v3"/></svg>',
    palette: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="7.5" cy="12.5" r="1"/><path d="M12 22a10 10 0 1 1 10-10c0 1.1-.9 2-2 2h-2.2a1.8 1.8 0 0 0-1.4 2.9A3.2 3.2 0 0 1 13.8 22Z"/></svg>',
    layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></svg>',
    minify: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m8 3-5 5 5 5M3 8h8M16 21l5-5-5-5M21 16h-8M14 3l-4 18"/></svg>'
  };

  const INITIAL_COUNT = 6;
  const STEP = 6;

  function createCard(tool, index, base) {
    const card = document.createElement("article");
    card.className = "mseo-tool-card";

    const icon = document.createElement("div");
    icon.className = "mseo-tool-card-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = ICONS[tool.icon] || ICONS.code;

    const kicker = document.createElement("span");
    kicker.className = "mseo-tool-card-kicker";
    kicker.textContent = tool.kicker;

    const title = document.createElement("h3");
    title.textContent = tool.title;

    const description = document.createElement("p");
    description.textContent = tool.description;

    const link = document.createElement("a");
    link.className = "mseo-tool-card-link";
    link.href = base + tool.href;
    link.append(document.createTextNode("استخدام الأداة "));
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "←";
    link.append(arrow);

    card.append(icon, kicker, title, description, link);
    card.dataset.toolIndex = String(index);
    return card;
  }

  document.querySelectorAll("[data-tools-grid]").forEach((grid) => {
    const section = grid.closest(".seo-home-tools, .mseo-tool-directory");
    if (!section) return;

    const base = grid.dataset.toolsBase || "";
    const countLabels = section.querySelectorAll("[data-tools-count]");
    const toggle = section.querySelector("[data-tools-toggle]");
    let visibleCount = Math.min(INITIAL_COUNT, tools.length);

    const render = () => {
      const fragment = document.createDocumentFragment();
      tools.slice(0, visibleCount).forEach((tool, index) => {
        fragment.append(createCard(tool, index, base));
      });
      grid.replaceChildren(fragment);

      countLabels.forEach((label) => {
        label.textContent = visibleCount + " / " + tools.length + " أداة";
      });

      if (toggle) {
        const expanded = visibleCount >= tools.length;
        toggle.hidden = tools.length <= INITIAL_COUNT;
        toggle.setAttribute("aria-expanded", String(expanded));
        toggle.innerHTML = expanded
          ? 'عرض أدوات أقل <span aria-hidden="true">⌃</span>'
          : 'عرض المزيد من الأدوات <span aria-hidden="true">⌄</span>';
      }
    };

    if (toggle) {
      toggle.addEventListener("click", () => {
        visibleCount = visibleCount >= tools.length
          ? Math.min(INITIAL_COUNT, tools.length)
          : Math.min(visibleCount + STEP, tools.length);
        render();
      });
    }

    render();
  });
})();
