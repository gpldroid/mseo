import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist');
const articles=JSON.parse(await readFile(path.resolve('data/articles.json'),'utf8'));
const slugify=value=>String(value||'').toLocaleLowerCase('ar').normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'');
const tagArticles=new Map();
for(const article of articles){
 const uniqueSlugs=new Set((article.tags||[]).map(slugify).filter(Boolean));
 for(const slug of uniqueSlugs){if(!tagArticles.has(slug))tagArticles.set(slug,new Set());tagArticles.get(slug).add(article.slug);}
}
const byFile=new Map(articles.map(article=>[article.file||article.slug+'.html',article]));
function escapeHtml(value){return String(value||'').replace(/[&<>"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));}
function normalizeBrand(html,article){
 const brand='فاست سيو FS';
 if(!/href=["']\/styles\/theme-system\.css/i.test(html))html=html.replace(/<\/head>/i,'<link rel="stylesheet" href="/styles/theme-system.css?v=20261126-gradient-pulse" data-fastseo-theme-css></head>');
 html=html.replace(/فاست\s*سيو\s*\|\s*Fast\s*Seo/gi,brand).replace(/فاست\s*سيو\s*\|\s*FastSEO/gi,brand).replace(/\bMSEO\b/g,brand).replace(/\bFast\s*Seo\b/gi,brand).replace(/\bFastSEO\b/g,brand).replace(/imad\s+limrani/gi,'عماد الدين لمراني');
 if(article){
  const titleMatch=html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if(titleMatch){const base=titleMatch[1].replace(/\s*[|—-]\s*(فاست سيو FS|Fast\s*Seo|FastSEO|MSEO)\s*$/i,'').trim();html=html.replace(titleMatch[0],'<title>'+base+' | '+brand+'</title>');}
  if(/<meta\s+name=["']author["']/i.test(html))html=html.replace(/<meta\s+name=["']author["'][^>]*>/i,'<meta name="author" content="عماد الدين لمراني">');
  else html=html.replace(/<\/head>/i,'<meta name="author" content="عماد الدين لمراني"></head>');
  html=html.replace(/(<meta\s+property=["']og:site_name["']\s+content=["'])[^"']*(["'][^>]*>)/i,'$1'+brand+'$2');
  html=html.replace(/("author"\s*:\s*\{\s*"@type"\s*:\s*"Person"\s*,\s*"name"\s*:\s*")[^"]*(")/g,'$1عماد الدين لمراني$2');
  html=html.replace(/("publisher"\s*:\s*\{\s*"@type"\s*:\s*"Organization"\s*,\s*"name"\s*:\s*")[^"]*(")/g,'$1'+brand+'$2');
 }
 return html;
}
function discovery(article,currentUrl){
 const tags=[],seen=new Set();
 for(const tag of article.tags||[]){const slug=slugify(tag);if(!seen.has(slug)&&slug&&tagArticles.get(slug)?.size>1){seen.add(slug);tags.push({tag,slug});}}
 const tagLinks=tags.slice(0,10).map(({tag,slug})=>'<a class="keyword-chip" href="/tags/'+slug+'">'+escapeHtml(tag)+'</a>').join('');
 const related=articles.filter(other=>other.slug!==article.slug).map(other=>({other,score:(other.category===article.category?2:0)+(other.tags||[]).filter(tag=>(article.tags||[]).some(current=>slugify(current)===slugify(tag))).length*3})).filter(item=>item.score>0).sort((a,b)=>b.score-a.score).slice(0,3);
 const relatedCards=related.map(({other})=>'<a class="related-card" href="/articles/'+encodeURIComponent(other.file||other.slug+'.html')+'"><span>'+escapeHtml(other.category||'مقالات')+'</span><strong>'+escapeHtml(other.title)+'</strong><small>اقرأ المقال ←</small></a>').join('');
 const url=encodeURIComponent(currentUrl),title=encodeURIComponent(article.title||'فاست سيو FS');
 const socials=[['Facebook','f','https://www.facebook.com/sharer/sharer.php?u='+url],['X','𝕏','https://twitter.com/intent/tweet?url='+url+'&text='+title],['LinkedIn','in','https://www.linkedin.com/sharing/share-offsite/?url='+url],['WhatsApp','wa','https://api.whatsapp.com/send?text='+title+'%20'+url]];
 const share=socials.map(([name,label,href])=>'<a class="social-3d social-'+name.toLowerCase()+'" href="'+href+'" target="_blank" rel="noopener noreferrer" aria-label="مشاركة عبر '+name+'"><span>'+label+'</span></a>').join('');
 return '<section class="article-discovery" aria-label="روابط ومقالات ذات صلة"><h2>موضوعات وكلمات مفتاحية</h2><div class="keyword-cloud">'+tagLinks+'</div><h2>قد يهمك أيضاً</h2><div class="related-grid">'+relatedCards+'</div><div class="article-share"><strong>شارك هذا الدليل</strong><div class="social-3d-list">'+share+'</div></div></section>';
}
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())await walk(file);else if(entry.isFile()&&entry.name.endsWith('.html'))await patch(file);}}
async function patch(file){
 let html=await readFile(file,'utf8');
 const relative=path.relative(path.join(root,'articles'),file);
 const article=relative.startsWith('..')?null:byFile.get(relative);
 html=normalizeBrand(html,article);
 html=html.replace(/site\.js\?v=[^"']+/g,'site.js?v=20261126-gradient-pulse-brand');
 if(!article){
  if(!/data-site-header/.test(html)&&!/<header[^>]*class=["'][^"']*site-header/.test(html))html=html.replace(/<body([^>]*)>/i,'<body$1><div data-site-header></div>');
  if(!/data-site-footer/.test(html)&&!/<footer[^>]*class=["'][^"']*site-footer/.test(html))html=html.replace(/<\/body>/i,'<div data-site-footer></div></body>');
  if(!html.includes('site.js'))html=html.replace(/<\/body>/i,'<script src="/assets/js/site.js?v=20261126-gradient-pulse-brand" defer><\/script></body>');
  await writeFile(file,html);return;
 }
 if(!html.includes('class="article-discovery"')){
  const canonical='https://fastseo.site/articles/'+encodeURIComponent(relative);
  const markup=discovery(article,canonical);
  const at=html.lastIndexOf('</article>');
  if(at!==-1)html=html.slice(0,at)+markup+html.slice(at);
 }
 await writeFile(file,html);
}
await walk(root);
console.log('Static pages normalized: brand, author, article metadata, collision-safe keyword links and related content.');
