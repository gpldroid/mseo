import { mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
const root=process.cwd(), sourceRoot=path.join(root,"migration","source"), contentRoot=path.join(root,".content-build-tmp"), finalContentRoot=path.join(root,"content"), backupContentRoot=path.join(root,".content-build-backup");
const records=JSON.parse(await readFile(path.join(root,"data","articles.json"),"utf8"));
const toolSlugs=new Set(["ai-prompt-builder","base64-converter","blog-outline-generator","color-contrast-checker","css-box-shadow-generator","css-color-generator","css-js-minifier","html-entity-converter","image-color-picker","image-compressor","image-to-favicon","internal-link-planner","internet-speed-test","json-formatter","json-to-csv","meta-tags-generator","open-graph-image-generator","regex-tester","responsive-preview","robots-txt-generator","schema-markup-generator","seo-analyzer","serp-preview","sitemap-generator","svg-optimizer","text-diff-checker","text-size-analyzer","text-slug-converter","url-encoder-decoder","word-counter"]);
const q=v=>JSON.stringify(String(v??"")), arr=a=>"["+((a||[]).map(q).join(", "))+"]";
const date=v=>v?new Date(v+"T00:00:00Z").toISOString():"";
const decode=v=>String(v||"").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">");
const getMeta=(html,name)=>{const tags=html.match(/<meta\b[^>]*>/gi)||[];const tag=tags.find(x=>x.toLowerCase().includes('name="'+name.toLowerCase()+'"')||x.toLowerCase().includes("name='"+name.toLowerCase()+"'"));const m=tag?.match(/content="([^"]*)"/i)||tag?.match(/content='([^']*)'/i);return decode(m?.[1]||"")};
const fm=obj=>{const lines=["+++"];for(const [k,v] of Object.entries(obj)){if(v===undefined||v===null||v==="")continue;if(Array.isArray(v))lines.push(k+" = "+arr(v));else if(typeof v==="boolean")lines.push(k+" = "+v);else if(k==="date"||k==="lastmod")lines.push(k+" = "+new Date(v).toISOString());else lines.push(k+" = "+q(v));}lines.push("+++");return lines.join("\n")};
const articleSlugs=new Set();for(const article of records){if(!article.slug||articleSlugs.has(article.slug))throw new Error("Missing or duplicate article slug: "+article.slug);articleSlugs.add(article.slug);}
await rm(contentRoot,{recursive:true,force:true});await mkdir(path.join(contentRoot,"articles"),{recursive:true});await mkdir(path.join(contentRoot,"pages"),{recursive:true});await mkdir(path.join(contentRoot,"categories"),{recursive:true});
await writeFile(path.join(contentRoot,"articles","_index.md"),fm({title:"المقالات",description:"أحدث الأدلة والمقالات التقنية في فاست سيو.",url:"/articles/"})+"\n\nاكتشف الأدلة العملية في تحسين محركات البحث وتطوير المواقع والبرمجة والذكاء الاصطناعي.\n");
for(const a of records){const filename=a.file||a.slug+".html";const fields={title:a.title,slug:a.slug,date:date(a.publishedAt)||"2026-01-01T00:00:00.000Z",lastmod:date(a.updatedAt||a.publishedAt),description:a.description,categories:[a.category].filter(Boolean),subcategory:a.subcategory||"عام",tags:a.tags||[],image:a.image||a.thumbnail||"",socialImage:a.socialImage||a.image||a.thumbnail||"",imageAlt:a.imageAlt||a.title||"",author:a.author||"عماد الدين لمراني",authorTitle:a.authorTitle||"",legacyPath:"articles/"+filename};const body='{{< legacy-html "'+fields.legacyPath+'" >}}\n';await writeFile(path.join(contentRoot,"articles",a.slug+".md"),fm(fields)+"\n\n"+body);}
const categorySlug=value=>String(value||"").toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu,"-").replace(/^-+|-+$/g,"");
const categoryDescriptions={
  "SEO":"أدلة تحسين محركات البحث، الفهرسة، الكلمات المفتاحية، البيانات المنظمة وقياس الظهور.",
  "تطوير المواقع":"شروحات بناء المواقع باستخدام HTML وواجهات الويب والنشر وإمكانية الوصول.",
  "تصميم المواقع":"مقالات تصميم الواجهات وتجربة المستخدم والتصميم المتجاوب والخطوط العربية.",
  "البرمجة":"دروس لغات البرمجة وتصحيح الأخطاء وقواعد البيانات وأمن تطبيقات الويب.",
  "أداء المواقع":"أدلة قياس سرعة المواقع وتحسين Core Web Vitals واختبار الجودة والصيانة.",
  "الذكاء الاصطناعي":"أدلة استخدام الذكاء الاصطناعي وهندسة الأوامر والنماذج والأتمتة للمطورين وصناع المحتوى."
};
const categoryGroups=new Map();
for(const article of records){const category=String(article.category||"").trim();if(!category)continue;const group=categoryGroups.get(category)||[];group.push(article.slug);categoryGroups.set(category,group);}
await writeFile(path.join(contentRoot,"categories","_index.md"),fm({title:"التصنيفات",description:"تصفح المقالات والأدلة حسب تصنيفات فاست سيو.",article_count:records.filter(article=>article.category).length})+"\n");
const categorySlugs=new Map();
for(const [category,articleSlugs] of categoryGroups){const slug=categorySlug(category);const previous=categorySlugs.get(slug);if(previous&&previous!==category)throw new Error("Category slug collision: "+previous+" / "+category+" -> "+slug);categorySlugs.set(slug,category);const subcategories=[...new Set(records.filter(article=>article.category===category).map(article=>article.subcategory).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"ar"));const fields={title:category,slug,category,article_slugs:articleSlugs,subcategories,article_count:articleSlugs.length,description:categoryDescriptions[category]||("مقالات وأدلة عملية ضمن تصنيف "+category+" في فاست سيو.")};await writeFile(path.join(contentRoot,"categories",slug+".md"),fm(fields)+"\n");}
const searchIndex=[...records.map(article=>({type:"article",title:article.title,url:"/articles/"+article.slug,category:article.category||"",subcategory:article.subcategory||"",tags:article.tags||[]})),...Array.from(categoryGroups.entries()).map(([category])=>({type:"category",title:category,url:"/categories/"+categorySlug(category)+".html",category,subcategory:"",tags:[]}))];
await mkdir(path.join(root,"static"),{recursive:true});
await writeFile(path.join(root,"static","search-index.json"),JSON.stringify(searchIndex));
const pagesDir=path.join(sourceRoot,"pages"),pageFiles=(await readdir(pagesDir)).filter(f=>f.endsWith(".html")).sort();
for(const filename of pageFiles){const slug=filename.replace(/\.html$/i,""),html=await readFile(path.join(pagesDir,filename),"utf8");const titleMatch=html.match(/<title[^>]*>([\s\S]*?)<\/title>/i),h1Match=html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);const title=decode((h1Match?.[1]||titleMatch?.[1]||slug.replace(/-/g," ")).replace(/<[^>]+>/g,"").trim());const fields={title,slug,description:getMeta(html,"description"),tool:toolSlugs.has(slug),legacyPath:"pages/"+filename};const body='{{< legacy-html "'+fields.legacyPath+'" >}}\n';await writeFile(path.join(contentRoot,"pages",slug+".md"),fm(fields)+"\n\n"+body);}
let hadPreviousContent=false;
await rm(backupContentRoot,{recursive:true,force:true});
try{await rename(finalContentRoot,backupContentRoot);hadPreviousContent=true;}catch(error){if(error.code!=="ENOENT")throw error;}
try{await rename(contentRoot,finalContentRoot);}catch(error){if(hadPreviousContent)await rename(backupContentRoot,finalContentRoot);throw error;}
if(hadPreviousContent)await rm(backupContentRoot,{recursive:true,force:true});
console.log("Prepared "+records.length+" articles and "+pageFiles.length+" pages for Hugo.");