import "./modules/theme.js";
import "./modules/ui.js";

const normalizeText = value => (value || "").replace(/\s+/g, " ").trim().toLowerCase();

function initDate(){
  const el=document.querySelector("#current-date");
  if(!el) return;
  const d=new Intl.DateTimeFormat("ar-MA",{weekday:"long",year:"numeric",month:"long",day:"numeric"}).format(new Date());
  const span=el.querySelector("span"); if(span) span.textContent=d;
}

function initArticleLinks(){
  document.querySelectorAll("[data-article-link]").forEach(el=>{
    const href=el.getAttribute("data-article-link");
    if(!href) return;
    if(el.tagName.toLowerCase()!=="a"){
      el.setAttribute("role","link");
      el.setAttribute("tabindex","0");
      el.addEventListener("click",()=>location.href=href);
      el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();location.href=href;}});
    }
  });
}

function initSearch(){
  const input=document.querySelector("#search-input"), results=document.querySelector("#search-results");
  if(!input||!results) return;
  const cards=[...document.querySelectorAll("[data-article-link]")].map(el=>({
    href:el.getAttribute("data-article-link"),
    text:normalizeText(el.textContent),
    title:(el.querySelector("h2,h3,h4,h5")?.textContent||el.textContent).trim()
  }));
  const unique=[...new Map(cards.map(x=>[x.href,x])).values()];
  const render=q=>{
    const query=normalizeText(q);
    if(!query){results.innerHTML='<p class="text-xs text-slate-400 text-center py-6">ابدأ الكتابة للبحث في المقالات...</p>';return;}
    const hits=unique.filter(x=>x.text.includes(query)).slice(0,8);
    results.innerHTML=hits.length?hits.map(x=>'<a class="block p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" href="'+x.href+'"><span class="font-bold text-sm">'+x.title+'</span></a>').join(""):'<p class="text-xs text-slate-400 text-center py-6">لا توجد نتائج مطابقة.</p>';
  };
  input.addEventListener("input",e=>render(e.target.value));
}

function initCookies(){
 const b=document.querySelector("#cookie-banner"); if(!b) return;
 if(localStorage.getItem("mseo-cookie-choice")) b.classList.add("hidden"); else b.classList.remove("hidden");
 document.querySelectorAll('[data-action="cookie-accept"],[data-action="cookie-decline"]').forEach(btn=>btn.addEventListener("click",()=>{localStorage.setItem("mseo-cookie-choice",btn.dataset.action);b.classList.add("hidden");}));
}

document.addEventListener("DOMContentLoaded",()=>{initDate();initArticleLinks();initSearch();initCookies();});
