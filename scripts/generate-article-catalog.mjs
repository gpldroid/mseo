import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
const root=process.cwd(),dir=join(root,"articles"),base="https://gpldroid.github.io/mseo/articles/";
const icons={"الذكاء الاصطناعي":"fa-robot","تطوير المواقع":"fa-code","تصميم المواقع":"fa-palette","البرمجة":"fa-js","SEO":"fa-chart-line","الأدوات والتقنيات":"fa-screwdriver-wrench","الأداء وتجربة المستخدم":"fa-gauge-high"};
const meta=(h,n,p=false)=>{const a=p?"property":"name",q=new RegExp("<meta\\s+[^>]*"+a+"=[\"']"+n+"[\"'][^>]*content=[\"']([^\"']+)[\"'][^>]*>","i"),m=h.match(q)||h.match(new RegExp("<meta\\s+[^>]*content=[\"']([^\"']+)[\"'][^>]*"+a+"=[\"']"+n+"[\"']","i"));return m?m[1].trim():""};
const title=h=>(h.match(/<title>\s*([^<]+?)\s*<\/title>/i)||[,""])[1].trim();
const articleData=h=>{for(const b of h.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)){try{const d=JSON.parse(b[1]);if(d["@type"]==="Article")return d}catch{}}return{}};
const breadcrumb=h=>{const m=h.match(/"position"\s*:\s*2[\s\S]*?"name"\s*:\s*"([^"]+)"/i);return m?m[1].trim():""};
const files=(await readdir(dir)).filter(x=>x.endsWith(".html")).sort(),out=[];
for(const file of files){const h=await readFile(join(dir,file),"utf8"),d=articleData(h),category=meta(h,"article:section",true)||breadcrumb(h)||"غير مصنف",keywords=meta(h,"keywords").split(",").map(x=>x.trim()).filter(Boolean),t=title(h).replace(/\s*\|\s*MSEO.*$/i,"").trim();out.push({slug:file.replace(/\.html$/i,""),file,title:t||d.headline||file,category,description:meta(h,"description")||d.description||"",keywords,tags:keywords.slice(0,8),icon:icons[category]||"fa-file-lines",datePublished:d.datePublished||"",dateModified:d.dateModified||d.datePublished||"",image:meta(h,"og:image",true)||(Array.isArray(d.image)?d.image[0]:d.image||""),url:base+file})}
await writeFile(join(root,"data/articles.json"),JSON.stringify(out,null,2)+"\\n","utf8");console.log("Article catalog generated:",out.length);
