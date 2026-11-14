import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const site = read('../assets/js/site.js');
const home = read('../assets/js/home.js');
const tools = read('../assets/js/tools-catalog.js');

assert.ok(site.includes('DOMPurify 3.4.17'));
assert.ok(site.includes('window.FastSEODOM = Object.freeze({ setHTML, safeURL })'));
assert.ok(site.includes("trustedTypes.createPolicy('fastseo-dom'"));
assert.ok(site.includes('trustedPolicy.createHTML(input)'));
assert.ok(site.includes('DOMPurify.sanitize(input, purifierConfig)'));
assert.ok(site.includes("url.hostname === 'images.unsplash.com'"));
assert.ok(home.includes('safeURL(path, { allowExternalImages: true })'));

const marker = '/* FastSEO safe DOM rendering bridge.';
const appSite = site.slice(site.indexOf(marker));
const helperFreeSite = appSite.replace(/const setHTML = \(element, dirty\) => \{[\s\S]*?\n  \};/, '');
for (const [name, source] of [['site.js', helperFreeSite], ['home.js', home], ['tools-catalog.js', tools]]) {
  assert.doesNotMatch(source, /\.innerHTML\s*=/, name + ' must not write raw HTML outside the sanitizer bridge');
  assert.doesNotMatch(source, /\b(?:insertAdjacentHTML|outerHTML\s*=|document\.write|eval\s*\(|new\s+Function)\b/, name + ' contains a disallowed HTML/script sink');
}

console.log('DOM XSS hardening boundary checks passed.');
