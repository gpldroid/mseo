import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist');
const articles=JSON.parse(await readFile(path.resolve('data/articles.json'),'utf8'));
const slugify=value=>value.toLocaleLowerCase('ar').normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'');
const counts=new Map();
for(const article of articles)for(const tag of article.tags||[])counts.set(tag,(counts.get(tag)||0)+1);
const byFile=new Map(articles.map(article=>[article.file||article.slug+'.html',article]));
function escapeHtml(value){return String(value||'').replace(/[&<>"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));}
function discovery(article,currentUrl){
 const tags=(article.tags||[]).filter(tag=>(counts.get(tag)||0)>1).slice(0,10);
 const tagLinks=tags.map(tag=>'<a class="keyword-chip" href="/tags/'+slugify(tag)+'">'+escapeHtml(tag)+'</a>').join('');
 const related=articles.filter(other=>other.slug!==article.slug).map(other=>({other,score:(other.category===article.category?2:0)+(other.tags||[]).filter(tag=>(article.tags||[]).includes(tag)).length*3})).filter(item=>item.score>0).sort((a,b)=>b.score-a.score).slice(0,3);
 const relatedCards=related.map(({other})=>'<a class="related-card" href="/articles/'+encodeURIComponent(other.file||other.slug+'.html')+'"><span>'+escapeHtml(other.category||'مقالات')+'</span><strong>'+escapeHtml(other.title)+'</strong><small>اقرأ المقال ←</small></a>').join('');
 const url=encodeURIComponent(currentUrl),title=encodeURIComponent(article.title||'MSEO');
 const socials=[['Facebook','f','https://www.facebook.com/sharer/sharer.php?u='+url],['X','𝕏','https://twitter.com/intent/tweet?url='+url+'&text='+title],['LinkedIn','in','https://www.linkedin.com/sharing/share-offsite/?url='+url],['WhatsApp','wa','https://api.whatsapp.com/send?text='+title+'%20'+url]];
 const share=socials.map(([name,label,href])=>'<a class="social-3d social-'+name.toLowerCase()+'" href="'+href+'" target="_blank" rel="noopener noreferrer" aria-label="مشاركة عبر '+name+'"><span>'+label+'</span></a>').join('');
 return '<section class="article-discovery" aria-label="روابط ومقالات ذات صلة"><h2>موضوعات وكلمات مفتاحية</h2><div class="keyword-cloud">'+tagLinks+'</div><h2>قد يهمك أيضاً</h2><div class="related-grid">'+relatedCards+'</div><div class="article-share"><strong>شارك هذا الدليل</strong><div class="social-3d-list">'+share+'</div></div></section>';
}
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())await walk(file);else if(entry.isFile()&&entry.name.endsWith('.html'))await patch(file);}}
async function patch(file){
 let html=await readFile(file,'utf8');
 const relative=path.relative(path.join(root,'articles'),file);
 if(relative.startsWith('..')||!byFile.has(relative)) {
   if(!/data-site-header/.test(html)&&!/<header[^>]*class=["'][^"']*site-header/.test(html))html=html.replace(/<body([^>]*)>/i,'<body$1><div data-site-header></div>');
   if(!/data-site-footer/.test(html)&&!/<footer[^>]*class=["'][^"']*site-footer/.test(html))html=html.replace(/<\/body>/i,'<div data-site-footer></div></body>');
   if(!/assets\/js\/site\.js/.test(html))html=html.replace(/<\/body>/i,'<script src="/assets/js/site.js?v=20261126-consent-theme" defer><\/script></body>');
   await writeFile(file,html);return;
 }
 const article=byFile.get(relative);
 if(!html.includes('class="article-discovery"')){
  const canonical='https://fastseo.site/articles/'+encodeURIComponent(relative);
  const markup=discovery(article,canonical);
  const at=html.lastIndexOf('</article>');
  if(at!==-1)html=html.slice(0,at)+markup+html.slice(at);
 }
 html=html.replace(/site\.js\?v=[^"']+/g,'site.js?v=20261126-consent-theme');
 await writeFile(file,html);
}
await walk(root);
console.log('Static pages prepared; article keyword hubs, related links and share controls injected.');
