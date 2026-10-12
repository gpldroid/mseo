/* MSEO progressive-enhancement bootstrap. */
(() => {
  "use strict";
  import("./modules/app.js?v=20261012-cookie-fix").catch((error) => {
    console.error("[MSEO] Unable to load site modules.", error);
    document.documentElement.dataset.mseoReady = "error";
    const main = document.querySelector("main");
    if (main && !main.querySelector("[data-startup-error]")) {
      const notice = document.createElement("section");
      notice.className = "site-empty";
      notice.dataset.startupError = "";
      notice.setAttribute("role", "alert");
      notice.textContent = "تعذر تشغيل بعض وظائف الموقع. ما زال بإمكانك تصفح المحتوى الأساسي؛ يرجى إعادة تحميل الصفحة لاحقًا.";
      main.prepend(notice);
    }
  });
})();
