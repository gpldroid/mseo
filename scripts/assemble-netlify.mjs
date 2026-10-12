import { cp, mkdir, rm, access } from 'node:fs/promises';
import { join } from 'node:path';
const root = process.cwd();
const dist = join(root,'dist');
await rm(dist,{recursive:true,force:true});
await mkdir(dist,{recursive:true});
const publicItems = ['index.html','article.html','404.html','robots.txt','sitemap.xml','site.webmanifest','assets','articles','pages','data'];
for (const item of publicItems) {
  try { await access(join(root,item)); await cp(join(root,item),join(dist,item),{recursive:true,force:true}); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
// Include the runtime loader on public HTML pages so Supabase theme and ad settings apply without rebuilding content.
await cp(join(root,'site-runtime.js'),join(dist,'site-runtime.js'),{force:true});
const adminBuild = join(root,'.netlify-admin-build');
await access(join(adminBuild,'index.html'));
await mkdir(join(dist,'admin-dashboard'),{recursive:true});
await cp(adminBuild,join(dist,'admin-dashboard'),{recursive:true,force:true});
// The runtime script is loaded on every public page, using the correct root for Netlify and GitHub Pages project hosting.
const { readdir } = await import('node:fs/promises');
async function addRuntime(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'admin-dashboard' && entry.name !== '.netlify') await addRuntime(path);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.html') || path.includes(join('dist','admin-dashboard'))) continue;
    const { readFile, writeFile } = await import('node:fs/promises');
    let html = await readFile(path, 'utf8');
    if (!html.includes('data-mseo-runtime-loader')) {
      const loader = '<script data-mseo-runtime-loader>(function(){var s=document.createElement("script");s.src=(location.hostname==="gpldroid.github.io"?"/mseo":"")+"/site-runtime.js";s.async=false;document.head.appendChild(s)})();</script>';
      html = html.replace('</body>', loader + '\\n</body>');
      await writeFile(path, html);
    }
  }
}
await addRuntime(dist);
console.log('Assembled public website, runtime settings, and admin dashboard into dist/.');
