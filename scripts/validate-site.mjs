import {readdir,readFile} from "node:fs/promises";
import {join,normalize,relative} from "node:path";

const root=process.cwd();
const baseUrl="https://gpldroid.github.io/mseo";
const skip=new Set(["http:","https:","mailto:","tel:","#","javascript:"]);
const excluded=new Set(["article.html","pages/admin.html","404.html"]);

async function walk(dir){
  const out=[];
  for(const e of await readdir(dir,{withFileTypes:true})){
    if([".git",".github","node_modules"].includes(e.name))continue;
    const p=join(dir,e.name);
    if(e.isDirectory())out.push(...await walk(p));
    else if(e.isFile()&&e.name.endsWith(".html"))out.push(p);
  }
  return out;
}

const html=await walk(root);
const seoErrors=[];
for(const file of html){
  const rel=relative(root,file).replaceAll("\\","/");
  if(excluded.has(rel)) continue;
  const source=await readFile(file,"utf8");
  const count=(re,flags="g")=>[...source.matchAll(new RegExp(re,flags))].length;
  if(!/<title>\\s*[^<]+<\\/title>/i.test(source)) seoErrors.push(rel+" -> missing title");
  if(!/<meta name="description" content="[^"]+">/i.test(source)) seoErrors.push(rel+" -> missing meta description");
  if(count('<link rel="canonical"')!==1) seoErrors.push(rel+" -> canonical count must be 1");
  if(!/<meta name="robots" content="index,follow/i.test(source)) seoErrors.push(rel+" -> missing indexable robots directive");
  if(!/property="og:title"/i.test(source)) seoErrors.push(rel+" -> missing Open Graph title");
  if(!/name="twitter:card"/i.test(source)) seoErrors.push(rel+" -> missing Twitter card");
  if(rel.startsWith("articles/") && !/<script type="application\\/ld\\+json">[\\s\\S]*"@type":"Article"/i.test(source)) seoErrors.push(rel+" -> missing Article JSON-LD");
}
if(seoErrors.length){
  console.error("SEO validation failed:\\n"+seoErrors.join("\\n"));
  process.exit(1);
}
const missing=[];
for(const file of html){
  const s=await readFile(file,"utf8");
  const re=/(?:href|src)=["']([^"']+)["']/g;
  let m;
  while((m=re.exec(s))){
    const u=m[1].trim();
    if(!u||skip.has(u.split(":")[0]+":")||u.startsWith("/")||u.startsWith("//")||u.startsWith("#"))continue;
    const clean=u.split("#")[0].split("?")[0];
    if(!clean)continue;
    const target=normalize(join(file,"..",clean));
    try{await readFile(target)}catch{missing.push(file.replace(root+"/","")+" -> "+u)}
  }
}
if(missing.length){
  console.error("Broken local references:\n"+missing.join("\n"));
  process.exit(1);
}

const expected=html
  .map(file=>relative(root,file).replaceAll("\\","/"))
  .filter(file=>!excluded.has(file))
  .map(file=>file==="index.html"?baseUrl:baseUrl+"/"+file)
  .sort();

const sitemap=await readFile(join(root,"sitemap.xml"),"utf8");
const actual=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]).sort();
const expectedSet=new Set(expected);
const actualSet=new Set(actual);
const sitemapMissing=expected.filter(url=>!actualSet.has(url));
const sitemapExtra=actual.filter(url=>!expectedSet.has(url));

if(sitemapMissing.length||sitemapExtra.length){
  console.error("Sitemap mismatch:");
  if(sitemapMissing.length)console.error("Missing:\n"+sitemapMissing.join("\n"));
  if(sitemapExtra.length)console.error("Unexpected:\n"+sitemapExtra.join("\n"));
  process.exit(1);
}

console.log("MSEO validation passed: "+html.length+" HTML files checked; sitemap contains "+actual.length+" indexable URLs.");
