import { createClient } from "npm:@supabase/supabase-js@2";

const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Content-Type":"application/json; charset=utf-8"};
const reply=(status:number,body:Record<string,unknown>)=>new Response(JSON.stringify(body),{status,headers:cors});
const escapeHtml=(value:unknown)=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
const decodeBase64Utf8=(value:string)=>new TextDecoder().decode(Uint8Array.from(atob(value.replace(/\s/g,"")),c=>c.charCodeAt(0)));
const encodeBase64Utf8=(value:string)=>{const bytes=new TextEncoder().encode(value);let binary="";for(let i=0;i<bytes.length;i++)binary+=String.fromCharCode(bytes[i]);return btoa(binary)};
const slugPath=(folder:string,slug:string)=>folder.replace(/^\/+|\/+$/g,"")+"/"+slug+".html";
const githubHeaders=(token:string)=>({Authorization:"Bearer "+token,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","User-Agent":"MSEO-CMS-Publisher"});
async function getFile(api:string,token:string,branch:string){const response=await fetch(api+"?ref="+encodeURIComponent(branch),{headers:githubHeaders(token)});if(response.status===404)return {response,sha:null,content:null};if(!response.ok)return {response,sha:null,content:null};const data=await response.json();if(data.type!=="file")return {response,sha:null,content:null};return {response,sha:String(data.sha),content:decodeBase64Utf8(String(data.content??""))};}
async function putFile(api:string,token:string,branch:string,message:string,content:string,sha:string|null){const payload:Record<string,unknown>={message:message.slice(0,180),content:encodeBase64Utf8(content),branch};if(sha)payload.sha=sha;return await fetch(api,{method:"PUT",headers:{...githubHeaders(token),"Content-Type":"application/json"},body:JSON.stringify(payload)});}
function buildPage(content:any,site:any,path:string){
 const base=String(site.base_url??"https://mseopro.netlify.app/").replace(/\/+$/,"");
 const url=content.canonical_url||base+"/"+path.replace(/^\/+/,"");
 const title=escapeHtml(content.seo_title||content.title),description=escapeHtml(content.seo_description||content.excerpt||"");
 const image=content.featured_image?String(content.featured_image):"";
 const bodyObject=content.body&&typeof content.body==="object"?content.body:{};
 const body=bodyObject.html??bodyObject.text??content.body;
 const bodyHtml=typeof body==="string"?body.replace(/\r\n/g,"\n").replace(/\n/g,"<br>"):"";
 const rawPage=content.kind==="page"&&bodyObject.layout==="raw";
 const category=escapeHtml((content.categories??[])[0]??"مقالات");
 const date=String(content.published_at??new Date().toISOString()).slice(0,10);
 const canonical=escapeHtml(url);
 const safeJson=JSON.stringify({"@context":"https://schema.org","@type":content.kind==="article"?"Article":"WebPage","headline":content.title,"description":content.seo_description||content.excerpt||"","image":image?[image]:undefined,"datePublished":date,"dateModified":new Date().toISOString().slice(0,10),"author":{"@type":"Organization","name":"MSEO Editorial"},"publisher":{"@type":"Organization","name":"MSEO","url":base},"mainEntityOfPage":{"@type":"WebPage","@id":url}}).replace(/</g,"\\u003c");
 const hero=image&&!rawPage?'<img src="'+escapeHtml(image)+'" alt="'+escapeHtml(content.title)+'" width="1400" height="788" loading="eager" fetchpriority="high" decoding="async" class="w-full aspect-video object-cover">':"";
 const tags=(content.kind==="article"&&(content.tags??[]).length)?'<div class="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-2 text-xs"><span class="font-bold">كلمات مفتاحية:</span>'+content.tags.map((t:string)=>'<span class="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">'+escapeHtml(t)+'</span>').join("")+'</div>':"";
 const breadcrumb='<nav aria-label="مسار التنقل" class="text-xs text-slate-500 mb-5"><a href="../index.html">الرئيسية</a> / <span>'+category+'</span> / <span>'+escapeHtml(content.title)+'</span></nav>';
 const header=content.kind==="article"?'<div class="flex flex-wrap gap-2 mb-4"><span class="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">'+category+'</span><time datetime="'+date+'" class="text-xs text-slate-500 px-2 py-1.5">'+date+'</time></div>':'';
 const article='<article class="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">'+hero+'<div class="p-6 sm:p-10">'+header+'<h1 class="text-2xl sm:text-4xl font-black leading-tight text-slate-950 dark:text-white">'+escapeHtml(content.title)+'</h1><p class="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300">'+escapeHtml(content.excerpt??"")+'</p><div class="mt-8 prose prose-slate max-w-none dark:prose-invert">'+bodyHtml+'</div>'+tags+'</div></article>';
 const main=rawPage?'<main class="cms-raw-page">'+bodyHtml+'</main>':'<main class="max-w-4xl mx-auto px-4 py-8">'+breadcrumb+article+'</main>';
 return '<!doctype html>\n<html lang="'+(content.locale==="en"?"en":"ar")+'" dir="'+(content.locale==="en"?"ltr":"rtl")+'">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<meta name="theme-color" content="#0b1220">\n<title>'+title+' | MSEO</title>\n<meta name="description" content="'+description+'">\n<meta name="robots" content="index,follow,max-image-preview:large">\n<link rel="canonical" href="'+canonical+'">\n<meta property="og:type" content="'+(content.kind==="article"?"article":"website")+'">\n<meta property="og:title" content="'+title+'">\n<meta property="og:description" content="'+description+'">\n'+(image?'<meta property="og:image" content="'+escapeHtml(image)+'">\n':'')+'<meta property="og:url" content="'+canonical+'">\n<meta property="og:site_name" content="MSEO">\n<meta name="twitter:card" content="summary_large_image">\n<script type="application/ld+json">'+safeJson+'</script>\n<link rel="stylesheet" href="../assets/css/style.css?v=20261012-cms1">\n</head>\n<body class="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 antialiased">\n<div data-site-header></div>\n'+main+'\n<div data-site-footer></div>\n<script src="../assets/js/site.js?v=20261012-cms1" defer></script>\n</body>\n</html>\n';
}
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="POST")return reply(405,{error:"method_not_allowed"});
 const url=Deno.env.get("SUPABASE_URL"),anonKey=Deno.env.get("SUPABASE_ANON_KEY"),githubToken=Deno.env.get("GITHUB_TOKEN");
 if(!url||!anonKey)return reply(500,{error:"supabase_environment_missing"});
 const authorization=req.headers.get("Authorization");if(!authorization?.startsWith("Bearer "))return reply(401,{error:"authentication_required"});
 const supabase=createClient(url,anonKey,{global:{headers:{Authorization:authorization}},auth:{persistSession:false,autoRefreshToken:false}});
 const {data:authData,error:authError}=await supabase.auth.getUser();if(authError||!authData.user)return reply(401,{error:"invalid_session"});
 let input:{action?:string;content_id?:string;commit_message?:string};try{input=await req.json()}catch{return reply(400,{error:"invalid_json"})}
 if(input.action!=="publish")return reply(400,{error:"unsupported_action"});
 if(!input.content_id)return reply(400,{error:"content_id_required"});
 if(!githubToken)return reply(503,{error:"github_token_not_configured",message:"Configure GITHUB_TOKEN as a Supabase Edge Function secret before publishing."});
 const {data:members,error:memberError}=await supabase.from("mcms_workspace_members").select("workspace_id,role").eq("user_id",authData.user.id);
 if(memberError)return reply(403,{error:"membership_check_failed"});
 const {data:content,error:contentError}=await supabase.from("mcms_content").select("id,workspace_id,site_id,title,slug,kind,status,locale,excerpt,body,seo_title,seo_description,canonical_url,featured_image,tags,categories,published_at").eq("id",input.content_id).is("deleted_at",null).maybeSingle();
 if(contentError||!content)return reply(404,{error:"content_not_found"});
 const allowed=(members??[]).some((m:any)=>m.workspace_id===content.workspace_id&&["owner","admin","publisher"].includes(m.role));
 if(!allowed)return reply(403,{error:"publisher_role_required"});
 if(content.status!=="published")return reply(409,{error:"content_must_be_published"});
 const {data:site,error:siteError}=await supabase.from("mcms_sites").select("id,workspace_id,name,base_url,github_owner,github_repo,github_branch,content_path,pages_path,is_active").eq("id",content.site_id).eq("workspace_id",content.workspace_id).maybeSingle();
 if(siteError||!site||!site.is_active)return reply(404,{error:"active_site_not_found"});
 if(!site.github_owner||!site.github_repo||!site.github_branch)return reply(409,{error:"github_repository_not_configured"});
 if(!["article","page"].includes(content.kind)||!/^[a-z0-9][a-z0-9-]{0,180}$/.test(content.slug||""))return reply(409,{error:"invalid_content_kind_or_slug"});
 const folder=content.kind==="page"?site.pages_path:site.content_path;
 if(typeof folder!=="string"||!folder.trim()||folder.startsWith("/")||folder.includes("\\")||folder.split("/").some((part:string)=>!part||part==="."||part==="..")||!/^[a-zA-Z0-9_./-]+$/.test(folder))return reply(409,{error:"invalid_site_content_path"});
 const path=slugPath(folder,content.slug);if(path.length>400)return reply(400,{error:"invalid_path"});
 const {data:run,error:runError}=await supabase.from("mcms_publish_runs").insert({workspace_id:content.workspace_id,site_id:site.id,content_id:content.id,requested_by:authData.user.id,provider:"github",mode:"manual",status:"running",target_path:path}).select("id").single();
 if(runError||!run)return reply(500,{error:"publish_run_creation_failed"});
 const finish=async(values:Record<string,unknown>)=>{const {error}=await supabase.from("mcms_publish_runs").update({...values,finished_at:new Date().toISOString()}).eq("id",run.id);return !error};
 const baseApi="https://api.github.com/repos/"+encodeURIComponent(site.github_owner)+"/"+encodeURIComponent(site.github_repo)+"/contents/";
 const articleApi=baseApi+path.split("/").map(encodeURIComponent).join("/");
 let existing:{response:Response;sha:string|null;content:string|null};
 try{existing=await getFile(articleApi,githubToken,site.github_branch)}catch{await finish({status:"failed",error_summary:"GitHub read failed before response."});return reply(502,{error:"github_read_failed"})}
 if(!existing.response.ok&&existing.response.status!==404){await finish({status:"failed",error_summary:"GitHub read failed (HTTP "+existing.response.status+")"});return reply(502,{error:"github_read_failed",status:existing.response.status})}
 const html=buildPage(content,site,path);
 let written:Response;
 try{written=await putFile(articleApi,githubToken,site.github_branch,input.commit_message?.trim()||"Publish: "+content.title,html,existing.sha)}catch{await finish({status:"failed",error_summary:"GitHub write failed before response."});return reply(502,{error:"github_write_failed"})}
 const result=await written.json().catch(()=>({}));if(!written.ok){await finish({status:"failed",error_summary:"GitHub write failed (HTTP "+written.status+"): "+String(result.message||"API rejected the commit.").slice(0,300)});return reply(502,{error:"github_write_failed",status:written.status,details:result.message||"GitHub rejected the commit."})}
 let catalogCommit:string|null=null;
 if(content.kind==="article"){
  const catalogApi=baseApi+"data/articles.json";
  try{
   const catalogFile=await getFile(catalogApi,githubToken,site.github_branch);
   if(!catalogFile.response.ok||!catalogFile.content||!catalogFile.sha){await finish({status:"failed",error_summary:"Article was written but data/articles.json could not be read."});return reply(502,{error:"catalog_read_failed",article_path:path})}
   const items=JSON.parse(catalogFile.content);if(!Array.isArray(items))throw new Error("catalogue_not_array");
   const entry={slug:content.slug,file:content.slug+".html",title:content.title,category:(content.categories??[])[0]||"غير مصنف",subcategory:(content.categories??[])[1]||"",tags:content.tags??[],description:content.seo_description||content.excerpt||"",icon:"fa-file-lines",image:content.featured_image||"assets/favicon.svg",thumbnail:content.featured_image||"assets/favicon.svg"};
   const index=items.findIndex((x:any)=>x.slug===content.slug);if(index>=0)items[index]={...items[index],...entry};else items.unshift(entry);
   const catalogueWritten=await putFile(catalogApi,githubToken,site.github_branch,"Update MSEO article catalogue: "+content.title,JSON.stringify(items,null,2)+"\n",catalogFile.sha);
   const catalogResult=await catalogueWritten.json().catch(()=>({}));if(!catalogueWritten.ok){await finish({status:"failed",error_summary:"Article HTML committed, but catalogue update failed (HTTP "+catalogueWritten.status+")."});return reply(502,{error:"catalog_update_failed",article_path:path,details:catalogResult.message||"Catalogue update failed."})}
   catalogCommit=catalogResult.commit?.sha??null;
  }catch(e){await finish({status:"failed",error_summary:"Article HTML committed, but catalogue update failed: "+String(e).slice(0,250)});return reply(502,{error:"catalog_update_failed",article_path:path})}
 }
 const commitSha=result.commit?.sha??null,externalUrl=result.commit?.html_url??result.content?.html_url??null;
 const saved=await finish({status:"succeeded",published_sha:commitSha,external_url:externalUrl,error_summary:null});
 return reply(200,{ok:true,path,branch:site.github_branch,commit_sha:commitSha,catalogue_commit_sha:catalogCommit,content_id:content.id,warning:saved?undefined:"publish_log_update_failed"});
});
