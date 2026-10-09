import {PATH,ROOT} from "./config.js";
import {loadCatalog,mountCatalog} from "./catalog.js";
import {mountShell,mountCookieNotice} from "./shell.js";
import {mountInteractions} from "./interactions.js";
import {onReady} from "./utils.js";

let started=false;

async function start(){
  if(started)return;
  started=true;
  const root=document.documentElement;
  try{
    mountShell();
    const articles=await loadCatalog(ROOT+PATH.catalog);
    mountCatalog(articles,ROOT);
    mountInteractions(articles,ROOT);
    mountCookieNotice();
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
