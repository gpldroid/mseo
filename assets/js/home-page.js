/* Homepage content renderer: six-at-a-time progressive article reveal. */
(async()=>{
 const $=(s,r=document)=>r.querySelector(s),base=new URL(location.pathname.match(/\/(articles|pages)\//)?'../':'./',location.href),url=p=>new URL(p,base).href;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const shortDescription=(value,fallback='اكتشف الدليل الكامل في مكتبة فاست سيو | Fast Seo.',maxLength=88)=>{const text=String(value||fallback).replace(/\s+/g,' ').trim();if(text.length<=maxLength)return text;const excerpt=text.slice(0,maxLength-3),boundary=excerpt.lastIndexOf(' ');return (boundary>Math.floor(maxLength*0.65)?excerpt.slice(0,boundary):excerpt).trimEnd()+'…';};
 const grid=$('#article-grid'),catsGrid=$('#category-grid'),select=$('#article-category'),search=$('#article-search'),count=$('#results-count'),more=$('#pagination'),error=$('#load-error');
 if(!grid||!catsGrid)return;
 const batch=6;let articles=[],shown=batch;
 try{
  if (!window.MSEOArticleCatalog) throw new Error('Article catalog service is unavailable');articles=await window.MSEOArticleCatalog.load();articles=articles.map((a,i)=>({...a,_homepageOrder:i})).sort((a,b)=>String(b.updatedAt||b.publishedAt||'').localeCompare(String(a.updatedAt||a.publishedAt||''))||a._homepageOrder-b._homepageOrder).map(({_homepageOrder,...a})=>a);
  const cats=[...new Set(articles.map(a=>a.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ar'));
  const latestTrack=$('[data-latest-carousel]'), dots=$('[data-carousel-dots]'), carouselRoot=$('[data-carousel]');
  const latest=articles.slice(0,5);
  if(latestTrack){
   latestTrack.innerHTML=latest.length?latest.map((a,i)=>{
    const href=url('articles/'+encodeURIComponent(a.file||a.slug+'.html')),img=a.thumbnail||a.image||'assets/favicon.svg';
    return '<article class="latest-carousel-card" data-slide="'+i+'"><a class="latest-carousel-image" href="'+href+'" tabindex="-1" aria-hidden="true"><img loading="lazy" decoding="async" width="480" height="270" sizes="(max-width: 800px) 90vw, 34vw" src="'+esc(url(img))+'" alt=""></a><div class="latest-carousel-copy"><span class="article-category">'+esc(a.category||'مقالات')+'</span><span class="carousel-index">0'+(i+1)+' / 0'+latest.length+'</span><h3><a href="'+href+'">'+esc(a.title)+'</a></h3><p>'+esc(shortDescription(a.description,'اكتشف الدليل الكامل في مكتبة فاست سيو | Fast Seo.',76))+'</p><a class="button button-primary" href="'+href+'">اقرأ المقال <span aria-hidden="true">←</span></a></div></article>';
   }).join(''):'<p class="loading-card">لا توجد مقالات متاحة حاليًا.</p>';
   const slides=[...latestTrack.querySelectorAll('[data-slide]')];let activeSlide=0,slideTimer=null;
   const showSlide=(index)=>{if(!slides.length)return;activeSlide=(index+slides.length)%slides.length;slides[activeSlide].scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest',inline:'start'});dots?.querySelectorAll('button').forEach((dot,i)=>{dot.setAttribute('aria-current',String(i===activeSlide));dot.setAttribute('aria-label','عرض المقال '+(i+1));});};
   if(dots)dots.innerHTML=slides.map((_,i)=>'<button type="button" aria-label="عرض المقال '+(i+1)+'" aria-current="'+String(i===0)+'" data-slide-to="'+i+'"></button>').join('');
   dots?.querySelectorAll('[data-slide-to]').forEach(dot=>dot.addEventListener('click',()=>showSlide(Number(dot.dataset.slideTo))));
   $('[data-carousel-prev]')?.addEventListener('click',()=>showSlide(activeSlide-1));
   $('[data-carousel-next]')?.addEventListener('click',()=>showSlide(activeSlide+1));
   const stopAutoplay=()=>{if(slideTimer){clearInterval(slideTimer);slideTimer=null;}};
   let carouselVisible=true;
    const startAutoplay=()=>{stopAutoplay();if(carouselVisible&&!document.hidden&&slides.length>1&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches)slideTimer=setInterval(()=>showSlide(activeSlide+1),8000);};
   carouselRoot?.addEventListener('mouseenter',stopAutoplay);carouselRoot?.addEventListener('mouseleave',startAutoplay);
   carouselRoot?.addEventListener('focusin',stopAutoplay);carouselRoot?.addEventListener('focusout',e=>{if(!carouselRoot.contains(e.relatedTarget))startAutoplay();});
   document.addEventListener('visibilitychange',()=>document.hidden?stopAutoplay():startAutoplay());
   startAutoplay();
  }
  const sidebarLatest=$('[data-sidebar-latest]');
  if(sidebarLatest)sidebarLatest.innerHTML=latest.slice(0,5).map(a=>'<li><a href="'+url('articles/'+encodeURIComponent(a.file||a.slug+'.html'))+'">'+esc(a.title)+'</a><span>'+esc(a.category||'مقالات')+'</span></li>').join('')||'<li>لا توجد مقالات حاليًا.</li>';
  const sidebarCats=$('[data-sidebar-categories]');
  if(sidebarCats)sidebarCats.innerHTML=cats.map(cat=>'<li><a href="'+url('pages/archive.html')+'?category='+encodeURIComponent(cat)+'">'+esc(cat)+'</a><span>'+articles.filter(a=>a.category===cat).length+'</span></li>').join('')||'<li>لا توجد تصنيفات حاليًا.</li>';
  catsGrid.innerHTML=cats.map((cat,i)=>'<a class="category-card" href="'+url('pages/archive.html')+'?category='+encodeURIComponent(cat)+'"><span class="site-card-icon">'+['✳','⌘','◈','↗','⌁','⚙'][i%6]+'</span><h3>'+esc(cat)+'</h3><p>استكشف الأدلة والمقالات في هذا المجال.</p><span class="site-read">تصفح المقالات ←</span></a>').join('');
  if(select)select.innerHTML='<option value="">كل التصنيفات</option>'+cats.map(cat=>'<option value="'+esc(cat)+'">'+esc(cat)+'</option>').join('');
  function render(animateFrom=-1){
   const q=(search?.value||'').trim().toLocaleLowerCase('ar'),cat=select?.value||'';
   const filtered=articles.filter(a=>(!cat||a.category===cat)&&(!q||[a.title,a.category,a.description,...(a.tags||[])].join(' ').toLocaleLowerCase('ar').includes(q)));
   shown=Math.min(shown,filtered.length);
   grid.innerHTML=filtered.length?filtered.map((a,i)=>{
    const href=url('articles/'+encodeURIComponent(a.file||a.slug+'.html')),img=a.thumbnail||a.image||'assets/favicon.svg';
    return '<article class="article-card mseo-load-card"'+(i>=shown?' hidden':'')+(i>=animateFrom&&i<shown?' data-enter="1"':'')+'><a class="article-card-media" href="'+href+'" tabindex="-1" aria-hidden="true"><img loading="lazy" decoding="async" src="'+esc(url(img))+'" alt="" onerror="this.onerror=null;this.src=\''+esc(url(a.image||'assets/favicon.svg'))+'\';this.classList.add(\'is-fallback\')"></a><div class="article-card-body"><span class="article-category">'+esc(a.category)+'</span><h3><a href="'+href+'">'+esc(a.title)+'</a></h3><p>'+esc(shortDescription(a.description))+'</p><a class="site-read" href="'+href+'">اقرأ المقال ←</a></div></article>';
   }).join(''):'<p class="loading-card">لا توجد مقالات تطابق البحث.</p>';
   grid.querySelectorAll('[data-enter="1"]').forEach(el=>{el.classList.add('mseo-card-enter');el.removeAttribute('data-enter');});
   if(count)count.textContent='عرض '+Math.min(shown,filtered.length)+' من '+filtered.length+' مقالًا';
   const left=filtered.length-shown;
   if(more){more.hidden=left<=0;more.innerHTML=left>0?'<button type="button" class="mseo-load-more" data-load-more>إكتشف المزيد <span aria-hidden="true">↓</span></button>':'';more.querySelector('[data-load-more]')?.addEventListener('click',()=>{const old=shown;shown=Math.min(shown+batch,filtered.length);render(old);});}
  }
  search?.addEventListener('input',()=>{shown=batch;render();});select?.addEventListener('change',()=>{shown=batch;render();});render();
 }catch(e){if(error)error.hidden=false;grid.innerHTML='<p class="loading-card">تعذر تحميل المقالات حاليًا. يرجى المحاولة لاحقًا.</p>';if(count)count.textContent='تعذر تحميل الفهرس';}
})();
