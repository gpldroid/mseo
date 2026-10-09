import { $,escapeHTML,articleURL } from "./utils.js";

export async function loadCatalog(url){
  try{
    const response=await fetch(url,{headers:{Accept:"application/json"}});
    if(!response.ok) throw new Error("Catalog request failed: "+response.status);
    const rows=await response.json();
    return Array.isArray(rows)?rows:[];
  }catch(error){
    console.error("[MSEO] Unable to load article catalog",error);
    return [];
  }
}

export function articleCard(article,root="",index=0){
  const title=escapeHTML(article.title||"مقال بدون عنوان");
  const category=escapeHTML(article.category||"مقالات");
  const description=escapeHTML(article.description||"اكتشف هذا الدليل العملي وتعرّف على أهم النقاط خطوة بخطوة.");
  const icon=escapeHTML(article.icon||"fa-file-lines");
  const url=articleURL(article,root);
  const featured=index===0?" site-article-card--featured":"";
  const number=String(index+1).padStart(2,"0");
  return `<article class="site-card site-article-card${featured}">
    <div class="site-article-card-top">
      <span class="site-article-category"><i class="fa-solid fa-folder-open" aria-hidden="true"></i>${category}</span>
      <span class="site-article-number" aria-hidden="true">${number}</span>
    </div>
    <div class="site-article-card-heading">
      <span class="site-card-icon" aria-hidden="true"><i class="fa-solid ${icon}"></i></span>
      <h3><a href="${url}">${title}</a></h3>
    </div>
    <p class="site-article-description">${description}</p>
    <div class="site-article-card-footer">
      <a class="site-read" href="${url}"><span>اقرأ المقال</span><span class="site-read-arrow" aria-hidden="true"><i class="fa-solid fa-arrow-left"></i></span></a>
      <span class="site-article-type">دليل عملي</span>
    </div>
  </article>`;
}

function matches(article,query,category){
  const text=[article.title,article.category,article.description,...(article.tags||[])].join(" ").toLocaleLowerCase("ar");
  return(!query||text.includes(query.toLocaleLowerCase("ar")))&&(!category||article.category===category);
}

export function mountCatalog(articles,root=""){
  const grid=$("#article-grid"),search=$("#home-search"),filter=$("#category-filter");
  if(!grid&&!document.querySelector("[data-category-grid]"))return;
  if(search)search.classList.add("input");
  if(filter){
    const categories=[...new Set(articles.map(a=>a.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"ar"));
    filter.innerHTML='<option value="">جميع المجالات</option>'+categories.map(c=>'<option value="'+escapeHTML(c)+'">'+escapeHTML(c)+"</option>").join("");
  }
  const params=new URLSearchParams(location.search);
  if(search)search.value=params.get("q")||"";
  const render=()=>{
    const query=search?.value.trim()||params.get("q")||"",category=filter?.value||"";
    const rows=articles.filter(a=>matches(a,query,category));
    if(grid)grid.innerHTML=rows.map((a,i)=>articleCard(a,root,i)).join("")||'<p class="site-empty" role="status">لا توجد مقالات مطابقة. جرّب كلمات أخرى.</p>';
    const categoryGrid=$("[data-category-grid]"),categoryMain=$("[data-category]");
    if(categoryGrid&&categoryMain){
      const selected=articles.filter(a=>a.category===categoryMain.dataset.category);
      categoryGrid.innerHTML=selected.map((a,i)=>articleCard(a,root,i)).join("")||'<p class="site-empty">لا توجد مقالات في هذا التصنيف بعد.</p>';
    }
  };
  search?.addEventListener("input",()=>{
    const url=new URL(location.href);
    search.value.trim()?url.searchParams.set("q",search.value.trim()):url.searchParams.delete("q");
    history.replaceState(null,"",url);
    render();
  });
  filter?.addEventListener("change",render);
  render();
}
