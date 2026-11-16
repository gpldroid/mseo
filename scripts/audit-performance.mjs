import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const ignoredDirs = new Set(['.git', 'node_modules', 'dist', 'admin-dashboard']);
const htmlFiles = [];
const imageFiles = [];
const rasterExt = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif']);

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) await walk(path.join(dir, entry.name));
      continue;
    }
    if (!entry.isFile()) continue;
    const full = path.join(dir, entry.name);
    const relative = path.relative(root, full).split(path.sep).join('/');
    if (entry.name.endsWith('.html')) htmlFiles.push(relative);
    if (relative.startsWith('assets/images/')) {
      const info = await stat(full);
      imageFiles.push({ path: relative, size: info.size, ext: path.extname(entry.name).toLowerCase() });
    }
  }
}
await walk(root);
let imgCount = 0, missingDimensions = 0, missingDecoding = 0, missingLoadingHint = 0;
for (const file of htmlFiles) {
  const html = await readFile(path.join(root, file), 'utf8');
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    imgCount++;
    const tag = match[0];
    if (!/\bwidth\s*=/.test(tag) || !/\bheight\s*=/.test(tag)) missingDimensions++;
    if (!/\bdecoding\s*=\s*["']async["']/i.test(tag)) missingDecoding++;
    if (!/\bloading\s*=\s*["'](?:lazy|eager)["']/i.test(tag)) missingLoadingHint++;
  }
}
const totalBytes = imageFiles.reduce((sum, file) => sum + file.size, 0);
const byFormat = new Map();
for (const file of imageFiles) byFormat.set(file.ext || '[no extension]', (byFormat.get(file.ext || '[no extension]') || 0) + 1);
const largest = imageFiles.slice().sort((a, b) => b.size - a.size).slice(0, 10);
console.log('Static performance inventory:');
console.log('HTML pages: ' + htmlFiles.length + '; img elements: ' + imgCount);
console.log('Image assets: ' + imageFiles.length + '; total: ' + (totalBytes / 1024).toFixed(1) + ' KiB; formats: ' + [...byFormat].map(([format, count]) => format + '=' + count).join(', '));
console.log('Images missing width/height: ' + missingDimensions + '; missing decoding=async: ' + missingDecoding + '; missing loading hint: ' + missingLoadingHint);
for (const file of largest) {
  if (file.size > 150 * 1024) console.warn('LARGE IMAGE ' + file.path + ' (' + (file.size / 1024).toFixed(1) + ' KiB)');
}
console.log('Largest image files:');
for (const file of largest) console.log('  ' + file.path + ' — ' + (file.size / 1024).toFixed(1) + ' KiB');
console.log('Report only: no files are converted or modified by this audit.');
