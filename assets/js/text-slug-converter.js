(function () {
'use strict';
const $ = (id) => document.getElementById(id);
const input = $('ts-input'), output = $('ts-output'), mode = $('ts-mode'), separator = $('ts-separator');
const transliterate = $('ts-transliterate'), stripDiacritics = $('ts-strip-diacritics'), trimLines = $('ts-trim-lines');
const copy = $('ts-copy'), status = $('ts-status'), length = $('ts-length');
if (!input || !output) return;
const arabicMap = {'ا':'a','أ':'a','إ':'i','آ':'aa','ء':'','ؤ':'u','ئ':'y','ى':'a','ة':'h','ث':'th','ذ':'dh','ش':'sh','غ':'gh','خ':'kh','ح':'h','ج':'j','ع':'a','ق':'q','ص':'s','ض':'d','ط':'t','ظ':'z','ز':'z','س':'s','ر':'r','د':'d','ف':'f','ك':'k','ل':'l','م':'m','ن':'n','ه':'h','و':'w','ي':'y','ب':'b','ت':'t','ث':'th','پ':'p','چ':'ch','ژ':'zh','گ':'g'};
function normalize(text) {
  let value = text.normalize('NFC');
  if (stripDiacritics.checked) value = value.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
  if (trimLines.checked) value = value.replace(/[\t\f\v ]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return value;
}
function latinize(text) {
  return Array.from(text).map(ch => arabicMap[ch] !== undefined ? arabicMap[ch] : ch).join('')
    .replace(/[\u0640]/g, '');
}
function slugify(text) {
  let value = normalize(text).toLocaleLowerCase();
  if (transliterate.checked) value = latinize(value);
  value = value.replace(/&/g, ' and ').replace(/['’]/g, '');
  // Preserve Unicode letters and numbers so Arabic slugs remain valid.
  value = value.replace(/[^\p{L}\p{N}]+/gu, separator.value);
  const escaped = separator.value === '-' ? /-+/g : /_+/g;
  value = value.replace(escaped, separator.value);
  const edge = separator.value === '-' ? /^-+|-+$/g : /^_+|_+$/g;
  return value.replace(edge, '');
}
function convert(text) {
  const value = normalize(text);
  switch (mode.value) {
    case 'slug': return slugify(text);
    case 'clean': return value.replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/[ \t]+/g, ' ').trim();
    case 'lower': return value.toLocaleLowerCase();
    case 'upper': return value.toLocaleUpperCase();
    case 'title': return value.toLocaleLowerCase().replace(/(^|[\s\-])([a-z])/g, (_, prefix, letter) => prefix + letter.toLocaleUpperCase());
    default: return value;
  }
}
function update() {
  const value = convert(input.value);
  output.value = value;
  copy.disabled = !value;
  length.textContent = new Intl.NumberFormat('ar').format(Array.from(value).length) + ' حرفًا في النتيجة';
  status.dataset.kind = input.value.trim() ? 'success' : 'info';
  status.textContent = input.value.trim() ? 'تم تحديث النتيجة تلقائيًا.' : 'أدخل نصًا لبدء التحويل.';
  separator.disabled = mode.value !== 'slug';
  transliterate.disabled = mode.value !== 'slug';
}
input.addEventListener('input', update);
[mode, separator, transliterate, stripDiacritics, trimLines].forEach(el => el.addEventListener('change', update));
$('ts-example').addEventListener('click', () => { input.value = 'دليل تحسين محركات البحث للمبتدئين | MSEO 2026'; mode.value = 'slug'; update(); input.focus(); });
$('ts-clear').addEventListener('click', () => { input.value = ''; output.value = ''; update(); input.focus(); });
copy.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(output.value); status.dataset.kind = 'success'; status.textContent = 'تم نسخ النتيجة.'; }
  catch (_) {
    output.focus(); output.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (__) {}
    status.dataset.kind = ok ? 'success' : 'error';
    status.textContent = ok ? 'تم نسخ النتيجة.' : 'تعذر النسخ تلقائيًا؛ حدد النتيجة وانسخها يدويًا.';
  }
});
update();
})();