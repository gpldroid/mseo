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
const adminBuild = join(root,'.netlify-admin-build');
await access(join(adminBuild,'index.html'));
await mkdir(join(dist,'admin-dashboard'),{recursive:true});
await cp(adminBuild,join(dist,'admin-dashboard'),{recursive:true,force:true});
console.log('Assembled public website and admin dashboard into dist/.');
