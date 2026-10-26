import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
const roots = ['assets/js'];
const files = [];
for (const root of roots) {
  for (const name of await readdir(new URL('../' + root + '/', import.meta.url))) {
    if (name.endsWith('.js') && !name.startsWith('admin.')) files.push(root + '/' + name);
  }
}
files.push('site-runtime.js','scripts/sync-cms-content.mjs','scripts/generate-article-catalog.mjs','scripts/generate-sitemap.mjs','scripts/check-javascript.mjs','scripts/validate-site.mjs','scripts/assemble-netlify.mjs');
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`Syntax check failed: ${file}\n${result.stderr}`);
}
console.log(`JavaScript syntax OK (${files.length} files).`);
