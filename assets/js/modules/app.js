import {PATH,ROOT} from "./config.js";
import {loadCatalog,mountCatalog} from "./catalog.js";
import {mountShell,mountCookieNotice} from "./shell.js";
import {mountInteractions} from "./interactions.js";
async function start(){mountShell();const articles=await loadCatalog(ROOT+PATH.catalog);mountCatalog(articles,ROOT);mountInteractions(articles,ROOT);mountCookieNotice();document.querySelectorAll("main img").forEach((image,index)=>{if(index>0&&!image.loading)image.loading="lazy"});document.documentElement.dataset.mseoReady="true";if(!articles.length){console.warn("[MSEO] Article catalog is empty; check data/articles.json and the deployment base path.")}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
