function toggle(id,openClass="hidden"){const el=document.getElementById(id);if(!el)return;el.classList.toggle(openClass);}
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-action]");
 if(!b)return;
 const a=b.dataset.action;
 if(a==="search"){const m=document.getElementById("search-modal");if(m)m.classList.toggle("hidden");}
 if(a==="settings"){const d=document.getElementById("settings-drawer");if(d)d.classList.toggle("translate-x-full");}
 if(a==="mobile-drawer"){const d=document.getElementById("mobile-drawer");if(d)d.classList.toggle("hidden");}
 if(a==="scroll-top")window.scrollTo({top:0,behavior:"smooth"});
 if(a==="accent"){const c=b.dataset.color;if(c)document.documentElement.style.setProperty("--brand-dynamic",c);}
 if(a==="xml-copy"){const t=document.getElementById("xml-code-area");if(t){navigator.clipboard?.writeText(t.value);}}
});
