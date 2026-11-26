import articles from '../../data/articles.json';
const site='https://fastseo.site';
const fixed=['/','/archive','/categories','/pages/about.html','/pages/contact.html','/pages/privacy.html','/pages/terms.html','/pages/tools.html','/pages/seo.html','/pages/ai.html','/pages/programming.html','/pages/web-development.html','/pages/web-design.html','/pages/performance.html'];
const topics=['seo','ai','programming','web-development','web-performance','web-design'].map(s=>'/topics/'+s);
const slugify=(value:string)=>value.toLocaleLowerCase('ar').normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'');
const tagArticles=new Map<string,Set<string>>();
for(const article of articles){
  const articleTags=new Set((article.tags||[]).map(slugify).filter(Boolean));
  for(const slug of articleTags){if(!tagArticles.has(slug))tagArticles.set(slug,new Set());tagArticles.get(slug)!.add(article.slug);}
}
const tagPaths=[...tagArticles].filter(([,slugs])=>slugs.size>1).map(([slug])=>'/tags/'+slug);
const paths=[...new Set([...fixed,...topics,...tagPaths,...articles.map(a=>'/articles/'+(a.file||a.slug+'.html'))])];
const escapeXml=(value:string)=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
export async function GET(){
 const articleByPath=new Map(articles.map(a=>['/articles/'+(a.file||a.slug+'.html'),a]));
 const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+paths.map(p=>{
   const article=articleByPath.get(p);const lastmod=article?.updatedAt||article?.publishedAt;
   return '<url><loc>'+escapeXml(site+p)+'</loc>'+(lastmod&&/^\d{4}-\d{2}-\d{2}$/.test(lastmod)?'<lastmod>'+lastmod+'</lastmod>':'')+'</url>';
 }).join('')+'</urlset>';
 return new Response(xml,{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=0, s-maxage=3600'}});
}