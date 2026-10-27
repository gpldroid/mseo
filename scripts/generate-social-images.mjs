import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const siteBase = new URL(process.env.MSEO_SITE_URL || process.env.URL || 'https://fastseo.site/');
const previewDir = path.join(root, 'assets/images/social-previews');
const excluded = new Set(['404.html', 'pages/admin.html']);
const htmlFiles = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'dist', 'admin-dashboard'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.isFile() && entry.name.endsWith('.html') && !excluded.has(path.relative(root, full))) htmlFiles.push(full);
  }
}
function esc(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
function plain(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
}
function getAttr(tag, name) {
  const re = new RegExp('\\b' + name + '\\s*=\\s*(?:"([^"]*)"|\\x27([^\\x27]*)\\x27|([^\\s>]+))', 'i');
  const match = tag.match(re);
  return match ? (match[1] ?? match[2] ?? match[3] ?? '') : '';
}
function makeSvg(title, description, section) {
  const t = esc(title.slice(0, 100));
  const d = esc(description.slice(0, 150));
  const category = section === 'articles' ? 'PRACTICAL GUIDE' : section === 'pages' ? 'FAST SEO RESOURCE' : 'FAST SEO · TECH KNOWLEDGE';
  return '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc">' +
'<title id="title">' + t + '</title><desc id="desc">' + d + '</desc>' +
'<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0b1220"/><stop offset="1" stop-color="#243e73"/></linearGradient><linearGradient id="accent"><stop stop-color="#65e2d1"/><stop offset="1" stop-color="#829bff"/></linearGradient><pattern id="grid" width="42" height="42" patternUnits="userSpaceOnUse"><path d="M42 0H0V42" fill="none" stroke="#b7c9ed" stroke-opacity=".08"/></pattern></defs>' +
'<rect width="1200" height="630" rx="28" fill="url(#bg)"/><rect width="1200" height="630" rx="28" fill="url(#grid)"/>' +
'<circle cx="1010" cy="145" r="170" fill="#4966b2" opacity=".16"/><circle cx="1010" cy="145" r="112" fill="none" stroke="url(#accent)" stroke-width="3" opacity=".75"/>' +
'<rect x="78" y="78" width="1044" height="474" rx="28" fill="#101b2c" fill-opacity=".68" stroke="#7e96bd" stroke-opacity=".38"/>' +
'<rect x="112" y="112" width="10" height="60" rx="5" fill="url(#accent)"/><text x="150" y="151" fill="#a8bddf" font-family="Arial,sans-serif" font-size="21" font-weight="700" letter-spacing="4">FAST SEO · ' + esc(category) + '</text>' +
'<text x="1080" y="264" text-anchor="end" direction="rtl" unicode-bidi="plaintext" fill="#f4f7ff" font-family="Arial, sans-serif" font-size="46" font-weight="700">' + t + '</text>' +
'<foreignObject x="130" y="302" width="940" height="112"><div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial,sans-serif;color:#c7d6ee;font-size:25px;line-height:1.55;text-align:right;direction:rtl">' + d + '</div></foreignObject>' +
'<path d="M132 466H1068" stroke="#7e96bd" stroke-opacity=".35"/><text x="132" y="506" fill="#65e2d1" font-family="Arial,sans-serif" font-size="22" font-weight="700">LEARN · BUILD · OPTIMIZE</text><text x="1068" y="506" text-anchor="end" fill="#c7d6ee" font-family="Arial,sans-serif" font-size="21">' + esc(siteBase.host + siteBase.pathname.replace(/\/$/, '')) + '</text></svg>';
}
function upsertMeta(head, attr, key, value) {
  const re = new RegExp('<meta\\b(?=[^>]*\\b' + attr + '\\s*=\\s*["\\x27]' + key + '["\\x27])[^>]*>', 'i');
  const tag = '<meta ' + attr + '="' + key + '" content="' + esc(value) + '">';
  let found = false;
  head = head.replace(new RegExp(re.source, 'ig'), () => {
    if (found) return '';
    found = true;
    return tag;
  });
  return found ? head : head + '\n' + tag;
}
function removeMeta(head, attr, key) {
  const re = new RegExp('\\s*<meta\\b(?=[^>]*\\b' + attr + '\\s*=\\s*["\\x27]' + key + '["\\x27])[^>]*>', 'ig');
  return head.replace(re, '');
}
await walk(root);
await mkdir(previewDir, { recursive: true });
let generated = 0, reused = 0, metadataFixed = 0;
for (const file of htmlFiles) {
  let html = await readFile(file, 'utf8');
  const rel = path.relative(root, file).split(path.sep).join('/');
  const headMatch = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
  if (!headMatch) continue;
  let head = headMatch[1];
  const title = plain((head.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [,'فاست سيو | Fast Seo — دليل تقني'])[1]);
  const descTag = (head.match(/<meta\b(?=[^>]*\bname\s*=\s*["']description["'])[^>]*>/i) || [''])[0];
  const description = plain((descTag.match(/\bcontent\s*=\s*["']([^"']*)["']/i) || [,''])[1] || title);
  const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const main = mainMatch ? mainMatch[1] : '';
  const imgMatch = main.match(/<img\b[^>]*>/i);
  let imageUrl = '';
  let generatedFallback = false;
  if (imgMatch) {
    const src = getAttr(imgMatch[0], 'src').trim();
    if (src && !/^(data:|blob:|javascript:)/i.test(src)) {
      try { imageUrl = new URL(src, new URL(rel, siteBase)).href; } catch {}
      if (imageUrl) reused++;
    }
  }
  if (!imageUrl) {
    const slug = rel === 'index.html' ? 'home' : rel.replace(/\.html$/i, '').replace(/[^a-zA-Z0-9/_-]/g, '-').replace(/\//g, '--');
    const assetRel = 'assets/images/social-previews/' + slug + '.svg';
    await writeFile(path.join(root, assetRel), makeSvg(title, description, rel.split('/')[0]), 'utf8');
    imageUrl = new URL(assetRel, siteBase).href;
    generatedFallback = true;
    // Keep fallback previews in metadata only. Never inject a second image into page content.
    generated++;
  }
  const originalHead = head;
  const pageUrl = rel === 'index.html' ? siteBase.href : new URL(rel, siteBase).href;
  head = upsertMeta(head, 'property', 'og:type', rel.startsWith('articles/') ? 'article' : 'website');
  head = upsertMeta(head, 'property', 'og:title', title);
  head = upsertMeta(head, 'property', 'og:description', description);
  head = upsertMeta(head, 'property', 'og:url', pageUrl);
  head = upsertMeta(head, 'property', 'og:site_name', 'فاست سيو | Fast Seo');
  head = upsertMeta(head, 'property', 'og:image', imageUrl);
  head = upsertMeta(head, 'property', 'og:image:alt', title);
  head = upsertMeta(head, 'name', 'twitter:card', 'summary_large_image');
  head = upsertMeta(head, 'name', 'twitter:title', title);
  head = upsertMeta(head, 'name', 'twitter:description', description);
  head = upsertMeta(head, 'name', 'twitter:image', imageUrl);
  if (generatedFallback) {
    head = upsertMeta(head, 'property', 'og:image:width', '1200');
    head = upsertMeta(head, 'property', 'og:image:height', '630');
  } else {
    head = removeMeta(head, 'property', 'og:image:width');
    head = removeMeta(head, 'property', 'og:image:height');
  }
  if (head !== originalHead) metadataFixed++;
  const rebuiltHead = '<head' + ((headMatch[0].match(/^<head\b([^>]*)>/i) || [,''])[1]) + '>' + head + '</head>';
  html = html.replace(headMatch[0], rebuiltHead);
  await writeFile(file, html, 'utf8');
}
console.log('Social image audit complete: ' + htmlFiles.length + ' HTML pages checked; ' + generated + ' fallback SVG previews generated for metadata only; ' + reused + ' existing main images reused; metadata updated on ' + metadataFixed + ' pages.');
