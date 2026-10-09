import { $,escapeHTML,articleURL } from "./utils.js";

const PAGE_SIZE=6;

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
  const image=String(article.image||article.thumbnail||"");
  const safeImage=/^https:\/\//i.test(image)?escapeHTML(image):"";
  const number=String(index+1).padStart(2,"0");
  return `<article class="site-card site-article-card">
    <a class="site-article-thumb" href="${url}" tabindex="-1" aria-hidden="true">
      ${safeImage?`<img src="${safeImage}" alt="" width="800" height="450" loading="lazy" decoding="async" onerror="this.closest('.site-article-thumb').classList.add('is-image-missing');this.remove()">`:""}
      <span class="site-article-thumb-fallback"><i class="fa-solid ${icon}" aria-hidden="true"></i></span>
      <span class="site-article-thumb-label">${category}</span>
    </a>
    <div class="site-article-card-body">
      <div class="site-article-card-top">
        <span class="site-article-category"><i class="fa-solid fa-folder-open" aria-hidden="true"></i>${category}</span>
        <span class="site-article-number" aria-hidden="true">${number}</span>
      </div>
      <h3 class="site-article-title"><a href="${url}">${title}</a></h3>
      <p class="site-article-description">${description}</p>
      <div class="site-article-card-footer">
        <a class="site-read" href="${url}"><span>اقرأ المقال</span><span class="site-read-arrow" aria-hidden="true"><i class="fa-solid fa-arrow-left"></i></span></a>
        <span class="site-article-type">دليل عملي</span>
      </div>
    </div>
  </article>`;
}

function matches(article,query,category){
  const text=[article.title,article.category,article.description,...(article.tags||[])].join(" ").toLocaleLowerCase("ar");
  return(!query||text.includes(query.toLocaleLowerCase("ar")))&&(!category||article.category===category);
}

function ensurePagination(grid){
  let nav=$("#article-pagination");
  if(!nav&&grid){
    nav=document.createElement("nav");
    nav.id="article-pagination";
    nav.className="site-pagination";
    nav.setAttribute("aria-label","التنقل بين صفحات المقالات");
    nav.setAttribute("role","navigation");
    grid.insertAdjacentElement("afterend",nav);
  }
  return nav;
}

function paginationMarkup(page,totalPages){
  if(totalPages<2)return "";
  const button=(label,target,extra="")=>`<button type="button" class="site-page-button ${extra}" data-page="${target}" ${target===page?"aria-current=\"page\"":""}>${label}</button>`;
  let pages="";
  for(let n=1;n<=totalPages;n++){
    if(totalPages>7&&n>2&&n<totalPages-1&&Math.abs(n-page)>1){
      if(n===3||n===totalPages-2)pages+='<span class="site-page-ellipsis" aria-hidden="true">…</span>';
      continue;
    }
    pages+=button(String(n),n,n===page?"is-current":"");
  }
  return button('<i class="fa-solid fa-chevron-right" aria-hidden="true"></i> السابق',Math.max(1,page-1),"site-page-prev")+
    '<div class="site-page-numbers">'+pages+'</div>'+
    button('التالي <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>',Math.min(totalPages,page+1),"site-page-next");
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
  const pagination=ensurePagination(grid);
  let page=1;
  const render=()=>{
    const query=search?.value.trim()||params.get("q")||"",category=filter?.value||"";
    const rows=articles.filter(a=>matches(a,query,category));
    const totalPages=Math.max(1,Math.ceil(rows.length/PAGE_SIZE));
    page=Math.min(Math.max(1,page),totalPages);
    const start=(page-1)*PAGE_SIZE;
    if(grid){
      grid.innerHTML=rows.slice(start,start+PAGE_SIZE).map((a,i)=>articleCard(a,root,start+i)).join("")||
        '<p class="site-empty" role="status">لا توجد مقالات مطابقة. جرّب كلمات أخرى.</p>';
      if(pagination){
        pagination.innerHTML=paginationMarkup(page,totalPages);
        pagination.hidden=totalPages<2;
      }
      grid.setAttribute("aria-label",`المقالات، الصفحة ${page} من ${totalPages}`);
    }
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
    page=1;render();
  });
  filter?.addEventListener("change",()=>{page=1;render()});
  pagination?.addEventListener("click",event=>{
    const button=event.target.closest("button[data-page]");
    if(!button)return;
    page=Number(button.dataset.page)||1;
    render();
    $("#latest")?.scrollIntoView({behavior:"smooth",block:"start"});
  });
  render();
}
