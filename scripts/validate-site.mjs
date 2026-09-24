import {readdir,readFile} from "node:fs/promises";
import {join,normalize} from "node:path";
const root=process.cwd();
const skip=new Set(["http:","https:","mailto:","tel:","#","javascript:"]);
async function walk(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){if([".git",".github"].includes(e.name))continue;const p=join(dir,e.name);if(e.isDirectory())out.push(...await walk(p));else if(e.isFile()&&e.name.endsWith(".html"))out.push(p)}return out}
const html=await walk(root);const missing=[];for(const file of html){const s=await readFile(file,"utf8");const re=/(?:href|src)=["']([^"']+)["']/g;let m;while((m=re.exec(s))){const u=m[1].trim();if(!u||skip.has(u.split(":")[0]+":")||u.startsWith("/")||u.startsWith("//")||u.startsWith("#"))continue;const clean=u.split("#")[0].split("?")[0];if(!clean)continue;const target=normalize(join(file,"..",clean));try{await readFile(target)}catch{missing.push(file.replace(root+"/","")+" -> "+u)}}}
if(missing.length){console.error("Broken local references:\n"+missing.join("\n"));process.exit(1)}
console.log("MSEO validation passed: "+html.length+" HTML files checked.");