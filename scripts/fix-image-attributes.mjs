import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const ignoredDirs = new Set(['.git', 'node_modules', 'dist', 'admin-dashboard']);
const previewDimensions = {
  'pages/image-color-picker.html': { width: 640, height: 420 },
  'pages/image-to-favicon.html': { width: 256, height: 256 },
  'pages/open-graph-image-generator.html': { width: 1200, height: 630 }
};
const htmlFiles = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) await walk(path.join(dir, entry.name));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.html')) {
      htmlFiles.push(path.relative(root, path.join(dir, entry.name)).split(path.sep).join('/'));
    }
  }
}

function normalizeTag(tag, file) {
  let next = tag;
  const hasWidth = /\bwidth\s*=/.test(next);
  const hasHeight = /\bheight\s*=/.test(next);

  if (!hasWidth || !hasHeight) {
    const dimensions = previewDimensions[file];
    if (dimensions) {
      if (!hasWidth) next = next.replace(/\s*\/?\s*>$/, ` width="${dimensions.width}"$&`);
      if (!hasHeight) next = next.replace(/\s*\/?\s*>$/, ` height="${dimensions.height}"$&`);
    }
  }

  if (!/\bdecoding\s*=/.test(next)) {
    next = next.replace(/\s*\/?\s*>$/, ' decoding="async"$&');
  }
  if (!/\bloading\s*=/.test(next)) {
    const eager = /\bfetchpriority\s*=\s*["']high["']|\bid\s*=\s*["']preview["']|mseo-brand-logo/.test(next);
    next = next.replace(/\s*\/?\s*>$/, ` loading="${eager ? 'eager' : 'lazy'}"$&`);
  }
  return next;
}

await walk(root);
let changedFiles = 0;
let changedImages = 0;
for (const file of htmlFiles) {
  const fullPath = path.join(root, file);
  const original = await readFile(fullPath, 'utf8');
  const updated = original.replace(/<img\b[^>]*>/gi, tag => {
    const normalized = normalizeTag(tag, file);
    if (normalized !== tag) changedImages++;
    return normalized;
  });
  if (updated !== original) {
    await writeFile(fullPath, updated, 'utf8');
    changedFiles++;
    console.log('Updated image attributes: ' + file);
  }
}
console.log('Image normalization complete: ' + changedImages + ' image tags updated across ' + changedFiles + ' HTML files.');
