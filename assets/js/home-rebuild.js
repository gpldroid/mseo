/* Homepage renderer using the repository's data/articles.json catalogue. */
(async () => {
 const $=s=>document.querySelector(s);
 const base=new URL('../../', import.meta.url);
 const url=(path)=>new URL(path,base).href;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const grid=$('#article-grid'),categoryGrid=$('#category-grid'),categorySelect=$('#article-category'),search=$('#article-search'),count=$('#results-count'),pagination=$('#pagination'),error=$('#load-error');
 let articles=[],page=1;const perPage=9;
 try{
  const response=await fetch(url('data/articles.json'),{cache:'no-cache'});if(!response.ok)throw new Error('catalogue');articles=await response.json();
  const cats=[...new Set(articles.map(a=>a.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ar'));
  if(categoryGrid)categoryGrid.innerHTML=cats.map((c,i)=>`<a class="category-card" href="${url('pages/archive.html')}?category=${encodeURIComponent(c)}"><span class="site-card-icon">${['✳','⌘','◈','↗','⌁','⚙'][i%6]}</span><h3>${esc(c)}</h3><p>استكشف الأدلة والمقالات في هذا المجال.</p><span class="site-read">تصفح المقالات ←</span></a>`).join('');
  if(categorySelect)categorySelect.innerHTML='<option value="">كل التصنيفات</option>'+cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
  const render=()=>{const q=(search?.value||'').trim().toLocaleLowerCase('ar'),cat=categorySelect?.value||'';const filtered=articles.filter(a=>(!cat||a.category===cat)&&(!q||[a.title,a.category,a.description,...(a.tags||[])].join(' ').toLocaleLowerCase('ar').includes(q)));const pages=Math.max(1,Math.ceil(filtered.length/perPage));page=Math.min(page,pages);const items=filtered.slice((page-1)*perPage,page*perPage);
   if(grid)grid.innerHTML=items.length?items.map(a=>`<article class="article-card"><a href="${url('articles/'+encodeURIComponent(a.file||a.slug+'.html'))}"><img loading="lazy" decoding="async" src="${esc(a.image||'assets/favicon.svg')}" alt="" onerror="this.style.display='none'"></a><div class="article-card-body"><span class="article-category">${esc(a.category)}</span><h3><a href="${url('articles/'+encodeURIComponent(a.file||a.slug+'.html'))}">${esc(a.title)}</a></h3><p>${esc(a.description)}</p><a class="site-read" href="${url('articles/'+encodeURIComponent(a.file||a.slug+'.html'))}">اقرأ المقال ←</a></div></article>`).join(''):'<p class="loading-card">لا توجد مقالات تطابق البحث.</p>';
   if(count)count.textContent=`عرض ${items.length} من ${filtered.length} مقالًا`;if(pagination){pagination.hidden=pages<=1;pagination.innerHTML=Array.from({length:pages},(_,i)=>`<button type="button" ${page===i+1?'aria-current="page"':''} data-page="${i+1}">${i+1}</button>`).join('');pagination.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{page=Number(b.dataset.page);render();$('#articles')?.scrollIntoView({behavior:'smooth'});}));}
  };
  search?.addEventListener('input',()=>{page=1;render()});categorySelect?.addEventListener('change',()=>{page=1;render()});render();
 }catch(e){if(error)error.hidden=false;if(grid)grid.innerHTML='<p class="loading-card">تعذر تحميل المقالات حاليًا. يرجى المحاولة لاحقًا.</p>';if(count)count.textContent='تعذر تحميل الفهرس';}
})();