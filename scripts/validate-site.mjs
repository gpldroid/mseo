import { readFile, access, readdir } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const required = [
  'index.html','assets/css/style.css','assets/js/site.js',
  'data/articles.json','pages/archive.html','sitemap.xml','feed.xml','_redirects','pages/privacy.html','pages/terms.html'
];
for (const path of required) await access(new URL(path, root));
for (const path of ['assets/css/site.css','assets/css/tailwind.css','assets/css/home-rebuild.css','assets/js/home-rebuild.js','assets/js/archive.js']) {
  try { await access(new URL(path, root)); throw new Error('Obsolete duplicate asset still exists: ' + path); }
  catch (error) { if (error.message.startsWith('Obsolete duplicate asset')) throw error; }
}
const catalog = JSON.parse(await readFile(new URL('data/articles.json', root), 'utf8'));
for (const item of catalog) await access(new URL('articles/' + item.file, root));
const home = await readFile(new URL('index.html', root), 'utf8');
if (!home.includes('data-home-header') || !home.includes('data-home-footer')) throw new Error('Homepage shared header/footer placeholders are missing');
const sharedJs = await readFile(new URL('assets/js/site.js', root), 'utf8');
if (sharedJs.includes("link('index.html')") || sharedJs.includes('link(href)}')) throw new Error('Shared navigation must use the clean root URL for homepage links');
const redirects = await readFile(new URL('_redirects', root), 'utf8');
if (!redirects.includes('/index.html / 301')) throw new Error('Missing permanent redirect from /index.html to /');
const css = await readFile(new URL('assets/css/style.css', root), 'utf8');
for (const feature of ['.mseo-header','.mseo-nav','.mseo-search-panel','.mseo-footer','.mseo-scroll-controls','html.dark']) if (!css.includes(feature)) throw new Error('Unified stylesheet missing feature: ' + feature);
// Keep the checked-in sitemap aligned with the generated public inventory.
const sitemap = await readFile(new URL('sitemap.xml', root), 'utf8');
const siteBase = new URL(process.env.MSEO_SITE_URL || process.env.URL || 'https://fastseo.site/');
if (!siteBase.pathname.endsWith('/')) siteBase.pathname += '/';
const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
if (!locs.length) throw new Error('sitemap.xml contains no URL entries');
if (new Set(locs).size !== locs.length) throw new Error('sitemap.xml contains duplicate URLs');
const pageFiles = (await readdir(new URL('pages/', root))).filter((file) => file.endsWith('.html') && file !== 'admin.html');
const expectedUrls = [
  new URL('./', siteBase).href,
  new URL('pages/archive.html', siteBase).href,
  ...catalog.map((item) => new URL('articles/' + item.file, siteBase).href),
  ...pageFiles.filter((file) => file !== 'archive.html').map((file) => new URL('pages/' + file, siteBase).href)
];
const missingUrls = expectedUrls.filter((url) => !locs.includes(url));
if (missingUrls.length) {
  throw new Error('sitemap.xml is missing ' + missingUrls.length + ' expected public URLs: ' + missingUrls.slice(0, 10).join(', '));
}
const offDomainUrls = locs.filter((url) => !url.startsWith(siteBase.href));
if (offDomainUrls.length) {
  throw new Error('sitemap.xml contains URLs outside the configured site base: ' + offDomainUrls.slice(0, 10).join(', '));
}
console.log('Site structure OK; ' + catalog.length + ' article records and ' + expectedUrls.length + ' sitemap URLs checked.');

// Validate the generated RSS feed against the article catalog.
const rss = await readFile(new URL('feed.xml', root), 'utf8');
if (!rss.includes('<rss version="2.0"') || !rss.includes('<channel>') || !rss.includes('application/rss+xml')) throw new Error('feed.xml is not a recognizable RSS 2.0 feed');
const rssLinks = [...rss.matchAll(/<link>(https?:[^<]+)<\/link>/g)].map((match) => match[1]).filter((url) => url.includes('/articles/'));
const expectedRssLinks = catalog.map((item) => new URL('articles/' + item.file, siteBase).href);
const missingRssLinks = expectedRssLinks.filter((url) => !rssLinks.includes(url));
if (missingRssLinks.length) throw new Error('feed.xml is missing ' + missingRssLinks.length + ' article links: ' + missingRssLinks.slice(0, 10).join(', '));
if (rssLinks.length !== catalog.length) throw new Error('feed.xml contains unexpected or duplicate article links');
