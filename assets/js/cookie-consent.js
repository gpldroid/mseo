/* Standalone consent notice for the GitHub Pages homepage. */
(() => {
  "use strict";
  const KEY = "mseo-cookie-consent-v2";
  const init = () => {
    try {
      if (localStorage.getItem(KEY)) return;
    } catch (error) {
      console.warn("[MSEO] Consent preference storage is unavailable.", error);
    }
    if (document.getElementById("cookie-consent")) return;
    const notice = document.createElement("aside");
    notice.className = "cookie-consent";
    notice.id = "cookie-consent";
    notice.setAttribute("role", "dialog");
    notice.setAttribute("aria-modal", "false");
    notice.setAttribute("aria-labelledby", "cookie-title");
    notice.innerHTML = '<div class="cookie-consent-inner"><div class="cookie-consent-copy"><strong id="cookie-title">الخصوصية على MSEO</strong><p>نستخدم التخزين المحلي لحفظ تفضيلاتك مثل هذا الاختيار. لا تستخدم النسخة الحالية ملفات تتبع إعلانية. يمكنك مراجعة التفاصيل في سياسة الخصوصية.</p></div><div class="cookie-consent-actions"><button type="button" data-consent="rejected">رفض</button><button type="button" data-consent="accepted">موافق</button><a href="./pages/privacy.html">سياسة الخصوصية</a></div></div>';
    document.body.append(notice);
    notice.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-consent]");
      if (!button) return;
      try { localStorage.setItem(KEY, button.dataset.consent); } catch (error) {
        console.warn("[MSEO] Could not save consent preference.", error);
      }
      notice.remove();
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();