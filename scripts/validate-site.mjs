import { readdir,readFile } from "node:fs/promises";
import { join,normalize,relative } from "node:path";

const root=process.cwd();
const base="https://gpldroid.github.io/mseo";
const excluded=new Set(["article.html","pages/admin.html","404.html"]);
const schemes=["http:","https:","mailto:","tel:","javascript:","#"];
const categoryPages={
  "الذكاء الاصطناعي":"pages/ai.html",
  "تطوير المواقع":"pages/web-development.html",
  "تصميم المواقع":"pages/web-design.html",
  "البرمجة":"pages/programming.html",
  "SEO":"pages/seo.html",
  "أداء المواقع":"pages/performance.html",
  "الأدوات والتقنيات":"pages/tools.html"
};

async function walk(d){
  const o=[];
  for(const e of await readdir(d,{withFileTypes:true})){
    if([".git",".github","node_modules"].includes(e.name))continue;
    const p=join(d,e.name);
    if(e.isDirectory())o.push(...await walk(p));
    else if(e.isFile()&&e.name.endsWith(".html"))o.push(p);
  }
  return o;
}

const html=await walk(root);
const errors=[];
const broken=[];
const articles=JSON.parse(await readFile(join(root,"data/articles.json"),"utf8"));

function one(re,s){return (s.match(re)||[]).length===1}
function match(re,s){return s.match(re)?.[1]||""}

for(const f of html){
  const rel=relative(root,f).replaceAll("\\","/");
  const s=await readFile(f,"utf8");
  if(excluded.has(rel))continue;

  if(!/<title>\s*[^<]+<\/title>/i.test(s))errors.push(rel+" -> title");
  if(!/<meta name="description" content="[^"]+">/i.test(s))errors.push(rel+" -> description");
  if(!one(/<link rel="canonical"/gi,s))errors.push(rel+" -> canonical");
  if(!/<meta name="robots" content="index,follow/i.test(s))errors.push(rel+" -> robots");
  if(!/property="og:title"/i.test(s))errors.push(rel+" -> og:title");
  if(!/name="twitter:card"/i.test(s))errors.push(rel+" -> twitter");
  if(!one(/<h1\b/gi,s))errors.push(rel+" -> exactly one H1");

  const canonical=match(/<link rel="canonical" href="([^"]+)"/i,s);
  const expected=rel==="index.html"?base:base+"/"+rel;
  if(canonical!==expected)errors.push(rel+" -> canonical mismatch: "+canonical);

  const ogUrl=match(/<meta property="og:url" content="([^"]+)"/i,s);
  if(ogUrl!==canonical)errors.push(rel+" -> og:url mismatch");

  if(rel.startsWith("articles/")){
    if(!/"@type":"Article"/i.test(s))errors.push(rel+" -> Article JSON-LD");
    if(!/"@type":"BreadcrumbList"/i.test(s))errors.push(rel+" -> BreadcrumbList JSON-LD");
    const article=articles.find(a=>a.file===rel.split("/").pop());
    if(article){
      const categoryPath=categoryPages[article.category];
      if(!categoryPath)errors.push(rel+" -> unknown category: "+article.category);
      else if(!s.includes(base+"/"+categoryPath))errors.push(rel+" -> breadcrumb category link mismatch");
      if(!s.includes(">"+article.category+"</span>"))errors.push(rel+" -> visible breadcrumb category mismatch");

      const featuredImage=s.match(/<article\\b[^>]*>[\\s\\S]*?<img\\b[^>]*>/i)?.[0]||"";
      if(!featuredImage)errors.push(rel+" -> missing featured image");
      else{
        const alt=match(/\\balt="([^"]+)"/i,featuredImage);
        const src=match(/\\bsrc="([^"]+)"/i,featuredImage);
        const keywords=match(/<meta name="keywords" content="([^"]+)"/i,s).split(",").map(x=>x.trim()).filter(Boolean);
        if(!alt)errors.push(rel+" -> featured image missing alt");
        if(!src || !src.startsWith("../assets/images/"))errors.push(rel+" -> featured image must be local under assets/images");
        if(keywords.length && alt && !keywords.some(k=>alt.toLowerCase().includes(k.toLowerCase()))){
          errors.push(rel+" -> featured image alt does not contain an article keyword");
        }
      }
    }
  }

  if(rel.startsWith("pages/") && rel!=="pages/admin.html"){
    const category=Object.entries(categoryPages).find(([,path])=>path===rel)?.[0];
    if(category){
      const articleRows=articles.filter(a=>a.category===category);
      if(articleRows.length && !articleRows.some(a=>s.includes("../articles/"+a.file))){
        errors.push(rel+" -> no crawlable article links in category hub");
      }
      if(!/<h2\b/i.test(s))errors.push(rel+" -> category hub missing H2");
      if(!/<nav[^>]+aria-label="مسار التنقل"/i.test(s))errors.push(rel+" -> category breadcrumb");
    }
  }
}

for(const f of html){
  const s=await readFile(f,"utf8");
  const re=/(?:href|src)=["']([^"']+)["']/g;
  let m;
  while((m=re.exec(s))){
    const u=m[1].trim();
    const scheme=u.split(":")[0]+":";
    if(!u||schemes.includes(scheme)||u.startsWith("/")||u.startsWith("//")||u.startsWith("#"))continue;
    const clean=u.split("#")[0].split("?")[0];
    if(!clean)continue;
    try{await readFile(normalize(join(f,"..",clean)));}
    catch{broken.push(relative(root,f).replaceAll("\\","/")+" -> "+u);}
  }
}

if(errors.length||broken.length){
  console.error([...errors,...broken].join("\\n"));
  process.exit(1);
}

const expected=html
  .map(f=>relative(root,f).replaceAll("\\","/"))
  .filter(x=>!excluded.has(x))
  .map(x=>x==="index.html"?base:base+"/"+x)
  .sort();

const sitemap=await readFile(join(root,"sitemap.xml"),"utf8");
const actual=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]).sort();
const missing=expected.filter(x=>!actual.includes(x));
const extra=actual.filter(x=>!expected.includes(x));

if(missing.length||extra.length){
  console.error("Sitemap mismatch",missing,extra);
  process.exit(1);
}

console.log("MSEO validation passed:",html.length,"HTML files;",actual.length,"URLs;");
console.log("SEO checks: H1, title, description, canonical, og:url, category hubs, article schema/breadcrumbs, links, sitemap.");
