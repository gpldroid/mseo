/* Category hub and category-section pages; uses the canonical article index. */
(() => {
 const $ = (s, r=document) => r.querySelector(s);
 const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const short = (s, n=135) => { const v=String(s||'اقرأ الدليل العملي في مكتبة فاست سيو.').replace(/\s+/g,' ').trim(); if(v.length<=n)return v; const cut=v.slice(0,n-1),p=cut.lastIndexOf(' ');return (p>n*.65?cut.slice(0,p):cut)+'…'; };
 const categories = [
  {key:'seo',name:'SEO',description:'أدلة تحسين محركات البحث والفهرسة والروابط الداخلية واستراتيجية المحتوى.',icon:'fa-magnifying-glass-chart',image:'seo.svg'},
  {key:'web-development',name:'تطوير المواقع',description:'HTML وCSS وبناء صفحات ويب عملية وسريعة ومتوافقة مع معايير الويب.',icon:'fa-code',image:'web-development.svg'},
  {key:'performance',name:'أداء المواقع',description:'السرعة وتجربة المستخدم وCore Web Vitals وتحسين كفاءة الصفحات.',icon:'fa-gauge-high',image:'performance.svg'},
  {key:'web-design',name:'تصميم المواقع',description:'الواجهات والتصميم المتجاوب والطباعة العربية وتجارب الاستخدام.',icon:'fa-pen-ruler',image:'web-design.svg'},
  {key:'programming',name:'البرمجة',description:'JavaScript وأساسيات البرمجة وتنظيم الكود وتصحيح الأخطاء.',icon:'fa-terminal',image:'programming.svg'},
  {key:'ai',name:'الذكاء الاصطناعي',description:'أدوات الذكاء الاصطناعي وكتابة prompts لرفع الإنتاجية.',icon:'fa-wand-magic-sparkles',image:'ai.svg'}
 ];
 const categoryFor = name => categories.find(c=>c.name===name) || {key:'other',name,description:'اكتشف المقالات والأدلة المنشورة في هذا الموضوع.',icon:'fa-folder-open',image:'seo.svg'};
 const base = new URL('../', location.href);
 const url = p => new URL(p,base).href;
 const hub = $('#category-hub-grid'), sections = $('#topic-sections');
 if (!hub && !sections) return;
 fetch(url('data/articles.json'), {cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('articles');return r.json();}).then(data=>{
  const allCats=[...new Set(data.map(a=>a.category).filter(Boolean))];
  const ordered=[...categories.filter(c=>allCats.includes(c.name)),...allCats.filter(name=>!categories.some(c=>c.name===name)).map(categoryFor)];
  const imageFor=c=>url('assets/images/category-social/'+c.image);
  const articleUrl=a=>url('articles/'+encodeURIComponent(a.file||a.slug+'.html'));
  const archiveUrl=c=>url('pages/archive.html?category='+encodeURIComponent(c.name));
  const card=(a)=>'<article class="article-card"><a href="'+articleUrl(a)+'" aria-label="'+esc(a.title)+'"><img loading="lazy" decoding="async" src="'+esc(url(a.thumbnail||a.image||'assets/favicon.svg'))+'" alt="" onerror="this.onerror=null;this.src=\''+esc(url(a.image||'assets/favicon.svg'))+'\'"></a><div class="article-card-body"><span class="article-category">'+esc(a.category||'مقالات')+'</span><h3><a href="'+articleUrl(a)+'">'+esc(a.title)+'</a></h3><p>'+esc(short(a.description,115))+'</p><a class="site-read" href="'+articleUrl(a)+'">اقرأ المقال <span aria-hidden="true">←</span></a></div></article>';
  if(hub){
   hub.innerHTML=ordered.map(c=>{const count=data.filter(a=>a.category===c.name).length;return '<a class="category-hub-card" href="'+url('pages/topics.html#topic-'+c.key)+'"><img class="category-hub-image" src="'+esc(imageFor(c))+'" alt="صورة تصنيف '+esc(c.name)+'" width="1200" height="630" loading="lazy" decoding="async"><div class="category-hub-body"><div class="category-hub-meta"><span class="site-card-icon"><i class="fa-solid '+c.icon+'" aria-hidden="true"></i></span><span class="category-count">'+count+' مقال</span></div><h3>'+esc(c.name)+'</h3><p>'+esc(c.description)+'</p><span class="site-read">استكشف التصنيف <i class="fa-solid fa-arrow-left" aria-hidden="true"></i></span></div></a>';}).join('')||'<p class="topic-empty">لا توجد تصنيفات منشورة حاليًا.</p>';
   const total=$('#category-total');if(total)total.textContent=ordered.length+' تصنيفات';
  }
  if(sections){
   sections.innerHTML=ordered.map(c=>{const items=data.filter(a=>a.category===c.name).sort((a,b)=>String(b.updatedAt||b.publishedAt||'').localeCompare(String(a.updatedAt||a.publishedAt||''))).slice(0,3);return '<section class="topic-section" id="topic-'+c.key+'" aria-labelledby="title-'+c.key+'"><div class="topic-section-head"><div><span class="site-kicker"><i class="fa-solid '+c.icon+'" aria-hidden="true"></i> تصنيف</span><h2 id="title-'+c.key+'">'+esc(c.name)+'</h2><p>'+esc(c.description)+'</p></div><span class="site-tag">'+data.filter(a=>a.category===c.name).length+' مقال</span></div>'+(items.length?'<div class="article-grid">'+items.map(card).join('')+'</div>':'<p class="topic-empty">لا توجد مقالات منشورة في هذا التصنيف بعد.</p>')+'<div class="topic-section-more"><a class="site-primary" href="'+archiveUrl(c)+'">اقرأ المزيد من '+esc(c.name)+' <i class="fa-solid fa-arrow-left" aria-hidden="true"></i></a></div></section>';}).join('');
   const jump=$('#topic-jump');if(jump)jump.innerHTML=ordered.map(c=>'<a href="#topic-'+c.key+'">'+esc(c.name)+'</a>').join('');
   if(location.hash){requestAnimationFrame(()=>document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({block:'start'}));}
  }
 }).catch(()=>{const err=$('#category-page-error')||$('#topics-page-error');if(err)err.hidden=false;if(hub)hub.innerHTML='';if(sections)sections.innerHTML='';});
})();
