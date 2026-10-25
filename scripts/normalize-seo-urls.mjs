import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const fallbackBase = 'https://fastseo.site/';
const siteBase = new URL(process.env.MSEO_SITE_URL || process.env.URL || fallbackBase);
if (!siteBase.pathname.endsWith('/')) siteBase.pathname += '/';
const canonicalPrefix = siteBase.href.replace(/\/$/, '');
const excludedDirs = new Set(['.git', 'node_modules', 'dist', 'admin-dashboard']);
const excludedFiles = new Set(['404.html', 'pages/admin.html']);
let updated = 0;
let checked = 0;

function setHeadTag(html, selector, attribute, value, createTag) {
  const match = html.match(selector);
  if (match) {
    const tag = match[0];
    const attrPattern = new RegExp('\\\\b' + attribute + '\\\\s*=\\\\s*(?:"[^"]*"|\\\\x27[^\\\\x27]*\\\\x27)', 'i');
    const replacement = attribute + '="' + value.replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '"';
    const nextTag = attrPattern.test(tag)
      ? tag.replace(attrPattern, replacement)
      : tag.replace(/\\s*\\/?>(?=*$)/, ' ' + replacement + '>');
    return html.replace(tag, nextTag);
  }
  return html.replace(/<\\/head\\s*>/i, createTag(value) + '\\n</head>');
}

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!excludedDirs.has(entry.name)) await walk(path.join(directory, entry.name));
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    const file = path.join(directory, entry.name);
    const relative = path.relative(root, file).split(path.sep).join('/');
    if (excludedFiles.has(relative)) continue;
    checked++;
    const before = await readFile(file, 'utf8');
    let after = before.replace(/https:\\/\\/gpldroid\\.github\\.io\\/mseo(?=\\/|["'?#])/g, canonicalPrefix);

    // Normalize old host references everywhere, including JSON-LD publisher and breadcrumb URLs.
    after = after.replace(/https:\\/\\/(?:gpldroid\\.github\\.io\\/mseo|mseopro\\.netlify\\.app)(?=\\/|["'?#])/g, canonicalPrefix);

    // Keep metadata consistent with the canonical URL for this exact public HTML file.
    const canonical = relative === 'index.html' ? siteBase.href : new URL(relative, siteBase).href;
    after = setHeadTag(
      after,
      /<link\\b(?=[^>]*\\brel\\s*=\\s*["']canonical["'])[^>]*>/i,
      'href',
      canonical,
      (url) => '<link rel="canonical" href="' + url + '">'
    );
    after = setHeadTag(
      after,
      /<meta\\b(?=[^>]*\\bproperty\\s*=\\s*["']og:url["'])[^>]*>/i,
      'content',
      canonical,
      (url) => '<meta property="og:url" content="' + url + '">'
    );

    after = after.replace(/MSEO Editorial/g, 'Fast Seo Editorial');
    after = after.replace(/MSEO/g, 'فاست سيو | Fast Seo');
    after = after.replace(/<meta\\b(?=[^>]*\\bname\\s*=\\s*["']keywords["'])[^>]*>\\s*/gi, '');
    after = after.replace(/(<meta\\b(?=[^>]*\\bproperty\\s*=\\s*["']og:site_name["'])[^>]*\\bcontent\\s*=\\s*["'])[^"']*([ "''][^>]*>)/gi, '$1فاست سيو | Fast Seo$2');
    after = after.replace(/(assets\\/js\\/site\\.js)\\?v=[^"' ]*/g, '$1?v=20261025-fastseo-seo2');

    // Replace explicit index.html URLs in links and metadata with the clean directory URL.
    after = after.replace(/(\\b(?:href|content)\\s*=\\s*)(["'])([^"']*?)index\\.html([?#][^"']*)?\\2/gi,
      (_match, prefix, quote, pathPrefix, suffix = '') => prefix + quote + (pathPrefix || './') + suffix + quote);

    // Re-assert the homepage canonical and social URL after the clean-URL rewrite.
    if (relative === 'index.html') {
      after = setHeadTag(after, /<link\\b(?=[^>]*\\brel\\s*=\\s*["']canonical["'])[^>]*>/i, 'href', siteBase.href,
        (url) => '<link rel="canonical" href="' + url + '">');
      after = setHeadTag(after, /<meta\\b(?=[^>]*\\bproperty\\s*=\\s*["']og:url["'])[^>]*>/i, 'content', siteBase.href,
        (url) => '<meta property="og:url" content="' + url + '">');
    }

    if (after !== before) {
      await writeFile(file, after, 'utf8');
      updated++;
    }
  }
}

await walk(root);
const robotsPath = path.join(root, 'robots.txt');
try {
  const before = await readFile(robotsPath, 'utf8');
  const expected = 'Sitemap: ' + new URL('sitemap.xml', siteBase).href;
  const after = /^Sitemap:\\s*\\S+/mi.test(before)
    ? before.replace(/^Sitemap:\\s*\\S+/mi, expected)
    : before.trimEnd() + '\\n' + expected + '\\n';
  if (after !== before) await writeFile(robotsPath, after, 'utf8');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
console.log('SEO URL normalization complete: ' + checked + ' HTML pages checked, ' + updated + ' updated; base=' + siteBase.href);
