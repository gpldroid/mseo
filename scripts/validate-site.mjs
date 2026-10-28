import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const required = [
  'index.html', '404.html', 'CNAME', 'robots.txt', 'sitemap.xml', 'feed.xml', '_redirects',
  'pages/archive.html', 'pages/privacy.html', 'pages/terms.html'
];
for (const file of required) await access(path.join(root, file));

const articleFiles = (await readdir(path.join(root, 'articles')))
  .filter(file => file.endsWith('.html'))
  .sort();
const pageFiles = (await readdir(path.join(root, 'pages')))
  .filter(file => file.endsWith('.html') && file !== 'admin.html')
  .sort();

const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
const siteBase = new URL(process.env.MSEO_SITE_URL || 'https://fastseo.site/');
if (!siteBase.pathname.endsWith('/')) siteBase.pathname += '/';
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1].trim());
if (!sitemapUrls.length) throw new Error('sitemap.xml contains no URL entries.');
if (new Set(sitemapUrls).size !== sitemapUrls.length) throw new Error('sitemap.xml contains duplicate URLs.');

const missingSitemapFiles = [];
for (const value of sitemapUrls) {
  let url;
  try { url = new URL(value); }
  catch { throw new Error('Invalid sitemap URL: ' + value); }
  if (url.origin !== siteBase.origin || !url.pathname.startsWith(siteBase.pathname)) {
    throw new Error('Sitemap URL is outside the configured site base: ' + value);
  }
  let relative = decodeURIComponent(url.pathname.slice(siteBase.pathname.length));
  if (!relative) relative = 'index.html';
  if (relative.endsWith('/')) relative += 'index.html';
  try { await access(path.join(root, relative)); }
  catch { missingSitemapFiles.push(value); }
}
if (missingSitemapFiles.length) {
  throw new Error('Sitemap contains ' + missingSitemapFiles.length + ' URLs without matching repository files: ' + missingSitemapFiles.slice(0, 12).join(', '));
}

const robots = await readFile(path.join(root, 'robots.txt'), 'utf8');
const sitemapDirectives = [...robots.matchAll(/^Sitemap:\s*(\S+)\s*$/gim)].map(match => match[1]);
if (sitemapDirectives.length !== 1 || sitemapDirectives[0] !== new URL('sitemap.xml', siteBase).href) {
  throw new Error('robots.txt must contain exactly one Sitemap directive pointing to ' + new URL('sitemap.xml', siteBase).href);
}

const redirects = await readFile(path.join(root, '_redirects'), 'utf8');
if (!/^\/index\.html\s+\/\s+301\s*$/m.test(redirects)) {
  throw new Error('_redirects must retain the permanent /index.html to / redirect.');
}

const rss = await readFile(path.join(root, 'feed.xml'), 'utf8');
if (!/<rss\b[^>]*version=["']2\.0["']/i.test(rss) || !/<channel>/i.test(rss)) {
  throw new Error('feed.xml is not a recognizable RSS 2.0 feed.');
}
const rssArticleUrls = [...rss.matchAll(/<link>(https?:[^<]+)<\/link>/g)]
  .map(match => match[1].trim())
  .filter(url => url.includes('/articles/'));
const expectedArticleUrls = articleFiles.map(file => new URL('articles/' + file, siteBase).href);
const missingRss = expectedArticleUrls.filter(url => !rssArticleUrls.includes(url));
const unexpectedRss = rssArticleUrls.filter(url => !expectedArticleUrls.includes(url));
if (missingRss.length || unexpectedRss.length || new Set(rssArticleUrls).size !== rssArticleUrls.length) {
  throw new Error('RSS/article inventory mismatch. Missing: ' + missingRss.slice(0, 8).join(', ') + '; unexpected/duplicate entries: ' + unexpectedRss.slice(0, 8).join(', '));
}

console.log('Static site structure OK: ' + articleFiles.length + ' article files, ' + pageFiles.length + ' page files, ' + sitemapUrls.length + ' unique sitemap URLs.');
console.log('RSS feed OK: ' + rssArticleUrls.length + ' article links.');
console.log('This validator checks the checked-in static inventory and does not assume a missing data/articles.json catalog or a Netlify configuration.');
