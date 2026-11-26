(()=>{"use strict";
const root=document.documentElement;
const menu=document.querySelector("[data-mobile-menu]");
const menuButton=document.querySelector("[data-menu-toggle]");
const getTheme=()=>{try{return localStorage.getItem("fastseo-theme")}catch{return null}};
const systemTheme=()=>matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";
const applyTheme=theme=>{const value=theme==="dark"?"dark":"light";root.dataset.theme=value;root.classList.toggle("dark",value==="dark");document.querySelectorAll("[data-theme-toggle]").forEach(button=>{button.setAttribute("aria-label",value==="dark"?"تفعيل الوضع النهاري":"تفعيل الوضع الليلي");button.setAttribute("aria-pressed",String(value==="dark"))})};
applyTheme(getTheme()||systemTheme());
const closeMenu=({restoreFocus=false}={})=>{if(!menu||!menuButton)return;menu.hidden=true;menuButton.setAttribute("aria-expanded","false");menuButton.setAttribute("aria-label","فتح القائمة");if(restoreFocus)menuButton.focus()};
const toggleMenu=()=>{if(!menu||!menuButton)return;const opening=menuButton.getAttribute("aria-expanded")!=="true";menu.hidden=!opening;menuButton.setAttribute("aria-expanded",String(opening));menuButton.setAttribute("aria-label",opening?"إغلاق القائمة":"فتح القائمة");if(opening){const first=menu.querySelector("a");if(first)first.focus()}};
function analytics(){if(window.__fastseoAnalyticsRequested)return;window.__fastseoAnalyticsRequested=true;const script=document.createElement("script");script.src="/tracking/google-analytics.js";script.async=true;document.head.appendChild(script)}
const normalizePath=path=>path.replace(/index\.html$/,"").replace(/\/$/,"")||"/";
const currentPath=normalizePath(location.pathname);
document.querySelectorAll("[data-tab-link]").forEach(link=>{const target=normalizePath(new URL(link.href,location.href).pathname);const active=target==="/" ? currentPath==="/" : currentPath===target||currentPath.startsWith(target+"/");if(active)link.setAttribute("aria-current","page")});
document.addEventListener("click",event=>{
 const themeButton=event.target.closest("[data-theme-toggle]");
 if(themeButton){const value=root.dataset.theme==="dark"?"light":"dark";try{localStorage.setItem("fastseo-theme",value)}catch{}applyTheme(value);return}
 if(event.target.closest("[data-menu-toggle]")){toggleMenu();return}
 if(menu&&!menu.hidden){if(event.target.closest("[data-menu-link]"))closeMenu();else if(!event.target.closest("[data-site-header]"))closeMenu()}
 const consent=event.target.closest("[data-consent]");
 if(consent){try{localStorage.setItem("mseo-consent-v1",consent.dataset.consent==="accept"?"accepted":"rejected")}catch{}const banner=document.querySelector("[data-cookie-banner]");if(banner)banner.hidden=true;if(consent.dataset.consent==="accept")analytics()}
 const more=event.target.closest("[data-load-more]");
 if(more){document.querySelectorAll("[data-load-item][hidden]").forEach((element,index)=>{if(index<8)element.hidden=false});if(!document.querySelector("[data-load-item][hidden]"))more.hidden=true}
 const scrollButton=event.target.closest("[data-scroll]");
 if(scrollButton)scrollTo({top:scrollButton.dataset.scroll==="top"?0:document.documentElement.scrollHeight,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
});
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&menu&&!menu.hidden)closeMenu({restoreFocus:true})});
try{if(localStorage.getItem("mseo-consent-v1")==="accepted")analytics();else{const banner=document.querySelector("[data-cookie-banner]");if(banner)banner.hidden=false}}catch{}
const topButton=document.querySelector('[data-scroll="top"]'),downButton=document.querySelector('[data-scroll="down"]');
const updateScrollControls=()=>{const y=window.scrollY,bottom=y+window.innerHeight>=document.documentElement.scrollHeight-80;if(topButton)topButton.hidden=y<280;if(downButton)downButton.hidden=bottom};
window.addEventListener("scroll",updateScrollControls,{passive:true});window.addEventListener("resize",updateScrollControls);updateScrollControls();
})();