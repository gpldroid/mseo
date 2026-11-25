import articles from '../../data/articles.json';
const site='https://fastseo.site';
const fixed=['/','/archive','/categories','/pages/about.html','/pages/contact.html','/pages/privacy.html','/pages/terms.html','/pages/tools.html','/pages/seo.html','/pages/ai.html','/pages/programming.html','/pages/web-development.html','/pages/web-design.html','/pages/performance.html'];
const topics=['seo','ai','programming','web-development','web-performance','web-design'].map(s=>'/topics/'+s);
const paths=[...new Set([...fixed,...topics,...articles.map(a=>'/articles/'+(a.file||a.slug+'.html'))])];
export async function GET(){const xml='<?xml version="1.0" encoding="UTF-8"?>\\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+paths.map(p=>'<url><loc>'+site+p+'</loc></url>').join('')+'</urlset>';return new Response(xml,{headers:{'Content-Type':'application/xml; charset=utf-8'}})}
