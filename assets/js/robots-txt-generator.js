(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const form = $("robots-form");
  if (!form) return;
  const agent = $("robots-agent");
  const customAgent = $("robots-custom-agent");
  const policy = $("robots-policy");
  const allow = $("robots-allow");
  const disallow = $("robots-disallow");
  const sitemap = $("robots-sitemap");
  const delay = $("robots-delay");
  const output = $("robots-output");
  const warning = $("robots-warning");
  const status = $("robots-status");
  const lineCount = $("robots-line-count");
  const cleanLines = (value) => value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const validPath = (path) => path.startsWith("/") && !/[\r\n]/.test(path) && !/[\u0000-\u001f]/.test(path);
  const validHttpUrl = (value) => {
    try { const url = new URL(value); return (url.protocol === "https:" || url.protocol === "http:") && Boolean(url.hostname); }
    catch (_) { return false; }
  };
  function build() {
    customAgent.hidden = agent.value !== "custom";
    const warnings = [];
    const selectedAgent = agent.value === "custom" ? customAgent.value.trim() : agent.value;
    const safeAgent = selectedAgent && !/[\r\n\s]/.test(selectedAgent) && !/[#]/.test(selectedAgent) ? selectedAgent : "";
    const lines = [];
    if (!safeAgent) warnings.push("أدخل اسم زاحف مخصصًا صالحًا من دون مسافات أو أسطر جديدة.");
    lines.push("User-agent: " + (safeAgent || "*"));
    if (policy.value === "block") {
      lines.push("Disallow: /");
      warnings.push("تحذير: Disallow: / يطلب منع الزاحف المحدد من زيارة جميع مسارات الموقع.");
    } else {
      lines.push("Disallow:");
    }
    const allowPaths = cleanLines(allow.value);
    const disallowPaths = cleanLines(disallow.value);
    for (const path of allowPaths) {
      if (validPath(path)) lines.push("Allow: " + path);
      else warnings.push("تم تجاهل مسار Allow غير صالح: " + path.slice(0, 80) + " — يجب أن يبدأ بـ /.");
    }
    for (const path of disallowPaths) {
      if (validPath(path)) {
        lines.push("Disallow: " + path);
        if (path === "/") warnings.push("يوجد Disallow: / ضمن المسارات، ما يمنع الزاحف المحدد من زيارة الموقع بالكامل.");
      } else warnings.push("تم تجاهل مسار Disallow غير صالح: " + path.slice(0, 80) + " — يجب أن يبدأ بـ /.");
    }
    const delayValue = delay.value.trim();
    if (delayValue) {
      const n = Number(delayValue);
      if (Number.isInteger(n) && n >= 1 && n <= 120) {
        lines.push("Crawl-delay: " + n);
        warnings.push("دعم Crawl-delay يختلف حسب الزاحف؛ Googlebot لا يدعمه في robots.txt.");
      } else warnings.push("قيمة Crawl-delay يجب أن تكون عددًا صحيحًا بين 1 و120.");
    }
    const sitemapValue = sitemap.value.trim();
    if (sitemapValue) {
      if (validHttpUrl(sitemapValue)) lines.push("Sitemap: " + new URL(sitemapValue).href);
      else warnings.push("رابط Sitemap غير صالح؛ استخدم رابطًا مطلقًا يبدأ بـ https:// أو http://.");
    }
    output.value = lines.join("\n") + "\n";
    lineCount.textContent = lines.length + " سطر";
    warning.hidden = warnings.length === 0;
    warning.textContent = warnings.join(" ");
    status.textContent = warnings.length ? "تم إنشاء المعاينة مع ملاحظات؛ راجع التنبيهات قبل التنزيل." : "المعاينة محدّثة. راجع القواعد قبل نشر الملف.";
  }
  async function copyOutput() {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(output.value);
      else {
        output.focus(); output.select();
        const ok = document.execCommand("copy");
        if (!ok) throw new Error("copy failed");
      }
      status.textContent = "تم نسخ محتوى robots.txt.";
    } catch (_) {
      output.focus(); output.select();
      status.textContent = "تعذّر النسخ تلقائيًا؛ حدّد النص وانسخه يدويًا.";
    }
  }
  function downloadOutput() {
    const blob = new Blob([output.value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "robots.txt";
    document.body.appendChild(link); link.click(); link.remove();
    URL.revokeObjectURL(url);
    status.textContent = "بدأ تنزيل ملف robots.txt.";
  }
  function reset() {
    form.reset(); customAgent.hidden = true; build();
    status.textContent = "أُعيدت الإعدادات إلى الحالة الافتراضية.";
  }
  form.addEventListener("input", build);
  form.addEventListener("change", build);
  $("robots-copy").addEventListener("click", copyOutput);
  $("robots-download").addEventListener("click", downloadOutput);
  $("robots-reset").addEventListener("click", reset);
  $("robots-sample").addEventListener("click", () => {
    agent.value = "*"; policy.value = "allow"; customAgent.value = "";
    allow.value = "/assets/\n/public/";
    disallow.value = "/admin/\n/private/";
    sitemap.value = "https://example.com/sitemap.xml"; delay.value = "";
    build(); status.textContent = "تم تحميل المثال؛ استبدل example.com برابط موقعك الفعلي.";
  });
  build();
})();