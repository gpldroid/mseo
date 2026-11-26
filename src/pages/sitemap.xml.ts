import articles from '../../data/articles.json';
const site='https://fastseo.site';
const fixed=[
'/pages/about.html','/pages/ai-prompt-builder.html','/pages/ai.html','/pages/archive.html',
'/pages/base64-converter.html','/pages/blog-outline-generator.html','/pages/categories.html',
'/pages/color-contrast-checker.html','/pages/contact.html','/pages/css-box-shadow-generator.html',
'/pages/css-color-generator.html','/pages/css-js-minifier.html','/pages/editorial-policy.html',
'/pages/html-entity-converter.html','/pages/image-color-picker.html','/pages/image-compressor.html',
'/pages/image-to-favicon.html','/pages/internal-link-planner.html','/pages/internet-speed-test.html',
'/pages/json-formatter.html','/pages/json-to-csv.html','/pages/meta-tags-generator.html',
'/pages/open-graph-image-generator.html','/pages/performance.html','/pages/privacy.html',
'/pages/programming.html','/pages/regex-tester.html','/pages/responsive-preview.html',
'/pages/robots-txt-generator.html','/pages/schema-markup-generator.html','/pages/seo-analyzer.html',
'/pages/seo.html','/pages/serp-preview.html','/pages/sitemap-generator.html','/pages/svg-optimizer.html',
'/pages/terms.html','/pages/text-diff-checker.html','/pages/text-size-analyzer.html',
'/pages/text-slug-converter.html','/pages/tools.html','/pages/topics.html',
'/pages/url-encoder-decoder.html','/pages/web-design.html','/pages/web-development.html',
'/pages/word-counter.html'
];
const paths=[...new Set([...fixed,...articles.map(a=>'/articles/'+(a.file||a.slug+'.html'))])];
const escapeXml=(value:string)=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
export async function GET(){
 const articleByPath=new Map(articles.map(a=>['/articles/'+(a.file||a.slug+'.html'),a]));
 const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+paths.map(p=>{
  const article=articleByPath.get(p);const lastmod=article?.updatedAt||article?.publishedAt;
  return '<url><loc>'+escapeXml(site+p)+'</loc>'+(lastmod&&/^\d{4}-\d{2}-\d{2}$/.test(lastmod)?'<lastmod>'+lastmod+'</lastmod>':'')+'</url>';
 }).join('')+'</urlset>';
 return new Response(xml,{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=0, s-maxage=3600'}});
}