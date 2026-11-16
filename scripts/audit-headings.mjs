import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const ignoredFiles = new Set(['404.html', 'article.html', 'pages/admin.html']);
const ignoredDirs = new Set(['.git', 'node_modules', 'dist', 'admin-dashboard']);
const htmlFiles = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) await walk(path.join(dir, entry.name));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      const relative = path.relative(root, path.join(dir, entry.name)).split(path.sep).join('/');
      if (!ignoredFiles.has(relative)) htmlFiles.push(relative);
    }
  }
}

await walk(root);

// Tokenize actual HTML tags while respecting comments, quoted attributes and
// raw-text/RCDATA elements. This avoids counting examples such as <h1> inside
// textarea placeholders, code samples, scripts or comments as real headings.
function collectHeadings(html) {
  const headings = [];
  let i = 0;
  while (i < html.length) {
    const open = html.indexOf('<', i);
    if (open === -1) break;
    if (html.startsWith('<!--', open)) {
      const end = html.indexOf('-->', open + 4);
      i = end === -1 ? html.length : end + 3;
      continue;
    }
    if (html[open + 1] === '!' || html[open + 1] === '?') {
      let j = open + 2, quote = '';
      while (j < html.length) {
        const c = html[j++];
        if (quote) { if (c === quote) quote = ''; }
        else if (c === '"' || c === "'") quote = c;
        else if (c === '>') break;
      }
      i = j;
      continue;
    }
    const match = html.slice(open).match(/^<\s*(\/?)\s*([a-z][a-z0-9:-]*)\b/i);
    if (!match) { i = open + 1; continue; }
    const closing = match[1] === '/';
    const tag = match[2].toLowerCase();
    let j = open + match[0].length, quote = '';
    while (j < html.length) {
      const c = html[j++];
      if (quote) { if (c === quote) quote = ''; }
      else if (c === '"' || c === "'") quote = c;
      else if (c === '>') break;
    }
    if (!closing && /^h[1-6]$/.test(tag)) headings.push({ level: Number(tag[1]), index: open });
    i = j;
    if (!closing && ['script', 'style', 'textarea', 'title'].includes(tag)) {
      const close = new RegExp('</\\s*' + tag + '\\s*>', 'ig');
      close.lastIndex = i;
      const found = close.exec(html);
      i = found ? close.lastIndex : html.length;
    }
  }
  return headings;
}

htmlFiles.sort();
const errors = [];
const headingTotals = { oneH1: 0, zeroH1: 0, multipleH1: 0, skippedLevels: 0 };
for (const file of htmlFiles) {
  const html = await readFile(path.join(root, file), 'utf8');
  const headings = collectHeadings(html);
  const h1Count = headings.filter((heading) => heading.level === 1).length;
  if (h1Count === 1) headingTotals.oneH1++;
  else if (h1Count === 0) {
    headingTotals.zeroH1++;
    errors.push(file + ': expected exactly one H1; found none');
  } else {
    headingTotals.multipleH1++;
    errors.push(file + ': expected exactly one H1; found ' + h1Count);
  }
  let previous = 0;
  for (const heading of headings) {
    if (previous && heading.level > previous + 1) {
      headingTotals.skippedLevels++;
      errors.push(file + ': heading hierarchy skips from H' + previous + ' to H' + heading.level);
    }
    previous = heading.level;
  }
}
console.log('Heading audit: ' + htmlFiles.length + ' public HTML pages scanned.');
console.log('H1 coverage: ' + headingTotals.oneH1 + ' pages with exactly one H1; ' + headingTotals.zeroH1 + ' missing; ' + headingTotals.multipleH1 + ' with multiple H1.');
console.log('Heading hierarchy: ' + headingTotals.skippedLevels + ' skipped-level issues.');
for (const error of errors) console.error('ERROR ' + error);
if (errors.length) process.exitCode = 1;
