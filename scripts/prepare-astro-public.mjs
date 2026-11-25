import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const publicDir = path.join(root, 'public');
const copyDirs = ['assets', 'articles', 'pages', 'data'];
const copyFiles = ['404.html', 'article.html', 'CNAME', 'BingSiteAuth.xml', 'ads.txt', 'robots.txt', 'sitemap.xml', 'feed.xml', 'llms.txt', 'site.webmanifest', '_redirects'];

await rm(publicDir, { recursive: true, force: true });
await mkdir(publicDir, { recursive: true });
for (const name of copyDirs) {
  try { await cp(path.join(root, name), path.join(publicDir, name), { recursive: true }); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
for (const name of copyFiles) {
  try { await cp(path.join(root, name), path.join(publicDir, name)); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}

async function enhanceHtml(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { await enhanceHtml(file); continue; }
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    let html = await readFile(file, 'utf8');
    if (!html.includes('mseo-3d-system')) {
      html = html.replace('</head>', '  <link rel="stylesheet" href="/assets/css/mseo-3d-system.css">\\n</head>');
    }
    if (!html.includes('mseo-bottom-tabs')) {
      html = html.replace('</body>', '  <script src="/assets/js/mseo-bottom-tabs.js" defer></script>\\n</body>');
    }
    await writeFile(file, html, 'utf8');
  }
}
await enhanceHtml(publicDir);
console.log('Astro public assets prepared from the existing MSEO pages.');
