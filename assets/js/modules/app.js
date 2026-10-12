import {PATH,ROOT} from "./config.js";
import {loadCatalog,mountCatalog} from "./catalog.js?v=20261009-articles4";
import {mountShell,mountCookieNotice} from "./shell.js";
import {mountInteractions} from "./interactions.js";
import {onReady} from "./utils.js";

let started=false;

async function start(){
  if(started)return;
  started=true;
  const root=document.documentElement;

  // Shared site chrome and privacy notice must not depend on the catalogue.
  // Mount them first so a network/data/rendering error cannot remove core UI.
  try{
    mountShell();
  }catch(error){
    console.error("[MSEO] Shared shell failed to mount.",error);
  }
  try{
    mountCookieNotice();
  }catch(error){
    console.error("[MSEO] Cookie notice failed to mount.",error);
  }

  try{
    const articles=await loadCatalog(ROOT+PATH.catalog);

    // The redesigned homepage owns its own catalogue renderer and controls.
    // Mounting the legacy renderer here would overwrite its cards and create
    // a second pagination/search system on the same DOM nodes.
    const usesRebuiltHomepage=Boolean(
      document.querySelector("#article-search") &&
      document.querySelector("#article-category") &&
      document.querySelector("#category-grid")
    );
    if(!usesRebuiltHomepage) mountCatalog(articles,ROOT);

    // Keep shared search/theme/mobile interactions available on every page.
    mountInteractions(articles,ROOT);
    document.querySelectorAll("main img").forEach((image,index)=>{
      if(index>0&&!image.loading)image.loading="lazy";
      if(!image.hasAttribute("decoding"))image.decoding="async";
    });
    root.dataset.mseoReady="true";
    root.dataset.mseoCatalog=articles.length?"loaded":"empty";
    if(!articles.length)console.warn("[MSEO] Catalogue is empty; verify data/articles.json and the deployment base path.");
  }catch(error){
    console.error("[MSEO] Startup failed.",error);
    root.dataset.mseoReady="error";
    const main=document.querySelector("main");
    if(main&&!main.querySelector("[data-startup-error]")){
      const notice=document.createElement("section");
      notice.className="site-empty";
      notice.dataset.startupError="";
      notice.setAttribute("role","alert");
      notice.textContent="تعذر تشغيل بعض وظائف الموقع. ما زال بإمكانك تصفح الصفحات والمقالات؛ يرجى إعادة تحميل الصفحة لاحقًا.";
      main.prepend(notice);
    }
  }
}

onReady(start);
