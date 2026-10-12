/* Shared MSEO tools catalog: one source for homepage and tools directory. */
(() => {
  "use strict";

  const tools = [
    { icon: "fa-magnifying-glass-chart", kicker: "تحليل المواقع", title: "محلل SEO الأساسي", description: "راجع العنوان والوصف والعناوين والصور والروابط وبيانات المشاركة.", href: "seo-analyzer.html" },
    { icon: "fa-tags", kicker: "تحسين الظهور", title: "مولّد Meta Tags", description: "أنشئ وسوم العنوان والوصف والمشاركة الاجتماعية، ثم انسخ الكود.", href: "meta-tags-generator.html" },
    { icon: "fa-file-lines", kicker: "كتابة المحتوى", title: "عداد الكلمات وزمن القراءة", description: "احسب الكلمات والأحرف والفقرات وقدّر وقت القراءة والإلقاء.", href: "word-counter.html" },
    { icon: "fa-link", kicker: "تنسيق النصوص", title: "محوّل النصوص ومولّد Slug", description: "جهّز العناوين كروابط واضحة ونظّف النصوص بسهولة.", href: "text-slug-converter.html" },
    { icon: "fa-code", kicker: "أدوات المطورين", title: "منسّق JSON ومتحقّق من صحته", description: "نسّق JSON أو اضغطه وتحقق من صحة الصياغة.", href: "json-formatter.html" },
    { icon: "fa-robot", kicker: "أدوات SEO", title: "مولّد robots.txt", description: "أنشئ قواعد زحف قابلة للتخصيص وأضف رابط Sitemap.", href: "robots-txt-generator.html" },
    { icon: "fa-code-compare", kicker: "أدوات المطورين", title: "محوّل HTML Entities", description: "حوّل الرموز الخاصة إلى كيانات HTML أو فك ترميزها.", href: "html-entity-converter.html" },
    { icon: "fa-diagram-project", kicker: "البيانات المنظمة", title: "مولّد Schema Markup", description: "أنشئ بيانات منظمة بصيغة JSON-LD وتحقق من صياغتها.", href: "schema-markup-generator.html" },
    { icon: "fa-palette", kicker: "تصميم الواجهات", title: "مولّد الألوان وتدرجات CSS", description: "ولّد لوحات ألوان وتدرجات وانسخ كود CSS.", href: "css-color-generator.html" },
    { icon: "fa-clone", kicker: "تصميم الواجهات", title: "مولّد CSS Box Shadow", description: "خصص ظلال العناصر مع معاينة فورية للكود.", href: "css-box-shadow-generator.html" },
    { icon: "fa-compress", kicker: "أدوات المطورين", title: "ضاغط CSS وJavaScript", description: "قلّل المسافات الزائدة في ملفات الويب.", href: "css-js-minifier.html" }
  ];

  const INITIAL_COUNT = 6;
  const STEP = 6;

  function createCard(tool, index, base) {
    const card = document.createElement("article");
    card.className = "mseo-tool-card";

    const icon = document.createElement("div");
    icon.className = "mseo-tool-card-icon";
    icon.setAttribute("aria-hidden", "true");
    const iconElement = document.createElement("i");
    iconElement.className = "fa-solid " + tool.icon;
    icon.append(iconElement);

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
