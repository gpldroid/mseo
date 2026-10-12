(function () {
  "use strict";
  var projectUrl = "https://gjkwrxvlnmshcmsjdcfd.supabase.co";
  var publishableKey = "sb_publishable_rGb3srwFQ7aCbHipegsn1A_DmTFCpNX";
  var apiHeaders = { apikey: publishableKey, Authorization: "Bearer " + publishableKey };
  function request(table, query) {
    return fetch(projectUrl + "/rest/v1/" + table + "?" + query, { headers: apiHeaders })
      .then(function (r) { if (!r.ok) throw new Error("Site settings unavailable"); return r.json(); });
  }
  function applyTheme(theme) {
    if (!theme || typeof theme !== "object") return;
    var root = document.documentElement;
    if (/^#[0-9a-f]{6}$/i.test(theme.primary || "")) root.style.setProperty("--primary-color", theme.primary);
    if (/^#[0-9a-f]{6}$/i.test(theme.secondary || "")) root.style.setProperty("--secondary-color", theme.secondary);
    if (Number.isFinite(Number(theme.radius))) root.style.setProperty("--ui-radius", Math.max(0, Math.min(32, Number(theme.radius))) + "px");
    var fonts = { Cairo: "Cairo:wght@400;500;600;700;800", Inter: "Inter:wght@400;500;600;700;800", Tahoma: null, Arial: null };
    if (fonts[theme.font]) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=" + fonts[theme.font].replace(/ /g, "+") + "&display=swap";
      document.head.appendChild(link);
      root.style.setProperty("--ui-font", "'" + theme.font.replace(/[^a-zA-Z]/g, "") + "',sans-serif");
    }
  }
  function executeTrustedMarkup(host, html) {
    var template = document.createElement("template");
    template.innerHTML = html || "";
    host.appendChild(template.content.cloneNode(true));
    Array.prototype.forEach.call(host.querySelectorAll("script"), function (oldScript) {
      var script = document.createElement("script");
      Array.prototype.forEach.call(oldScript.attributes, function (attribute) { script.setAttribute(attribute.name, attribute.value); });
      script.text = oldScript.textContent || "";
      oldScript.replaceWith(script);
    });
  }
  function locate(location, index) {
    var explicit = document.querySelector('[data-ad-slot="' + location + '"]');
    if (explicit) return explicit;
    if (location === "header_top") return document.querySelector("[data-site-header], header") || document.body.firstElementChild;
    if (location === "sidebar") return document.querySelector("aside, [data-sidebar]");
    if (location === "footer") return document.querySelector("[data-home-footer], footer") || document.body.lastElementChild;
    if (location === "after_paragraph") {
      var paragraphs = document.querySelectorAll("main article p, article p, main p");
      return paragraphs[Math.min(Math.max(index, 0), Math.max(paragraphs.length - 1, 0))] || null;
    }
    return null;
  }
  function renderAds(ads) {
    var perLocation = {};
    ads.filter(function (ad) { return ad.is_active && ad.code; }).forEach(function (ad) {
      var location = ad.location;
      var count = perLocation[location] || 0;
      perLocation[location] = count + 1;
      var target = locate(location, location === "after_paragraph" ? 2 + count * 4 : 0);
      if (!target) return;
      var slot = document.createElement("div");
      slot.className = "mseo-ad-slot";
      slot.dataset.mseoAd = ad.id;
      slot.setAttribute("aria-label", "Advertisement");
      slot.style.cssText = "margin:18px auto;max-width:100%;overflow:hidden;";
      if (location === "header_top") target.parentNode.insertBefore(slot, target);
      else if (location === "after_paragraph") target.parentNode.insertBefore(slot, target.nextSibling);
      else target.appendChild(slot);
      try { executeTrustedMarkup(slot, ad.code); } catch (error) { console.error("MSEO ad render failed", error); }
    });
  }
  function run() {
    Promise.all([
      request("site_settings", "select=value&key=eq.theme&is_public=eq.true&limit=1"),
      request("ad_slots", "select=id,code,location,is_active&is_active=eq.true&order=created_at.asc")
    ]).then(function (results) {
      if (results[0] && results[0][0]) applyTheme(results[0][0].value);
      renderAds(results[1] || []);
    }).catch(function (error) { console.debug("MSEO runtime skipped:", error.message); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
})();
