import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist');
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())await walk(file);else if(entry.isFile()&&entry.name.endsWith('.html'))await patch(file);}}
async function patch(file){
 let html=await readFile(file,'utf8');
 if(!/data-site-header/.test(html)&&!/<header[^>]*class=["'][^"']*site-header/.test(html))html=html.replace(/<body([^>]*)>/i,'<body$1><div data-site-header></div>');
 if(!/data-site-footer/.test(html)&&!/<footer[^>]*class=["'][^"']*site-footer/.test(html))html=html.replace(/<\/body>/i,'<div data-site-footer></div></body>');
 if(!/assets\/js\/site\.js/.test(html))html=html.replace(/<\/body>/i,'<script src="/assets/js/site.js?v=20261126-shared-chrome" defer><\/script></body>');
 await writeFile(file,html);
}
await walk(root);
console.log('Shared MSEO chrome prepared for generated HTML pages.');
