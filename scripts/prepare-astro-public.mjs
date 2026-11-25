import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const publicDir = path.join(root, 'public');
const generatedDir = path.join(root, 'src', 'generated');
const legacyDistHome = path.join(root, 'dist', 'index.html');
const copyDirs = ['assets', 'data'];
const copyFiles = ['404.html', 'article.html', 'CNAME', 'BingSiteAuth.xml', 'ads.txt', 'robots.txt', 'sitemap.xml', 'feed.xml', 'llms.txt', 'site.webmanifest', '_redirects'];

await rm(publicDir, { recursive: true, force: true });
const legacyHomepage = await readFile(legacyDistHome, 'utf8');
const mainMatch = legacyHomepage.match(/<main\b[^>]*>[\s\S]*?<\/main>/i);
if (!mainMatch) throw new Error('The legacy homepage main content could not be extracted.');

await mkdir(publicDir, { recursive: true });
await mkdir(generatedDir, { recursive: true });
await writeFile(path.join(generatedDir, 'legacy-home-content.html'), mainMatch[0], 'utf8');

for (const name of copyDirs) {
  try { await cp(path.join(root, name), path.join(publicDir, name), { recursive: true }); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}

for (const name of copyFiles) {
  try { await cp(path.join(root, name), path.join(publicDir, name)); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}

function stripStyleMarkup(html) {
  const protectedBlocks = [];
  let output = String(html).replace(/<(pre|code|textarea)\b[\s\S]*?<\/\1\s*>/gi, (block) => {
    const token = '__MSEO_PRESERVED_CODE_' + protectedBlocks.length + '__';
    protectedBlocks.push(block);
    return token;
  });
  output = output
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '')
    .replace(/<link\b(?=[^>]*\brel\s*=\s*["'][^"']*\bstylesheet\b)[^>]*>/gi, '')
    .replace(/\sstyle\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  return output.replace(/__MSEO_PRESERVED_CODE_(\d+)__/g, (_, index) => protectedBlocks[Number(index)] || '');
}


async function cleanPublicAssets(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await cleanPublicAssets(file);
      if (entry.name === 'css' && (await readdir(file)).length === 0) await rm(file, { recursive: true, force: true });
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.css')) {
      if (path.relative(publicDir, file).split(path.sep).join('/') !== 'assets/css/mseo-3d-tabs.css') {
        await rm(file, { force: true });
      }
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.html')) {
      const html = await readFile(file, 'utf8');
      await writeFile(file, stripStyleMarkup(html), 'utf8');
    }
  }
}

async function enhanceHtml(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { await enhanceHtml(file); continue; }
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    let html = await readFile(file, 'utf8');
    if (!html.includes('mseo-bottom-tabs')) {
      html = html.replace('</body>', '  <script src="/assets/js/mseo-bottom-tabs.js" defer></script>\n</body>');
    }
    await writeFile(file, stripStyleMarkup(html), 'utf8');
  }
}
await enhanceHtml(publicDir);
await cleanPublicAssets(publicDir);
console.log('Astro public assets prepared from the existing MSEO pages.');
