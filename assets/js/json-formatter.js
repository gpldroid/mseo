(function () {
'use strict';
const $ = (id) => document.getElementById(id);
const input = $('json-input'), output = $('json-output');
if (!input || !output) return;
const status = $('json-status'), copyButton = $('json-copy'), downloadButton = $('json-download'), size = $('json-size');
let lastValid = '';
function setStatus(message, kind) { status.textContent = message; status.dataset.kind = kind || 'info'; }
function sorted(value) {
  if (Array.isArray(value)) return value.map(sorted);
  if (value && typeof value === 'object') {
    return Object.keys(value).sort((a,b) => a.localeCompare(b)).reduce((obj,key) => { obj[key] = sorted(value[key]); return obj; }, {});
  }
  return value;
}
function indentValue() { return $('json-indent').value === 'tab' ? '\t' : Number($('json-indent').value); }
function process(mode) {
  const raw = input.value.trim();
  if (!raw) { setStatus('أدخل JSON أولًا.', 'error'); output.value = ''; size.textContent = '0 حرفًا'; copyButton.disabled = true; downloadButton.disabled = true; return; }
  try {
    let data = JSON.parse(raw);
    if ($('json-sort').value === 'yes') data = sorted(data);
    const result = mode === 'minify' ? JSON.stringify(data) : JSON.stringify(data, null, indentValue());
    output.value = result; lastValid = result;
    size.textContent = new Intl.NumberFormat('ar').format(result.length) + ' حرفًا';
    copyButton.disabled = false; downloadButton.disabled = false;
    const label = mode === 'minify' ? 'تم التحقق من JSON وضغطه بنجاح.' : mode === 'validate' ? 'JSON صحيح. لم يتم تغيير النص المدخل.' : 'JSON صحيح وتم تنسيقه بنجاح.';
    if (mode === 'validate') { output.value = raw; lastValid = raw; size.textContent = new Intl.NumberFormat('ar').format(raw.length) + ' حرفًا'; }
    setStatus(label, 'success');
  } catch (error) {
    output.value = ''; lastValid = ''; size.textContent = '0 حرفًا'; copyButton.disabled = true; downloadButton.disabled = true;
    let message = error && error.message ? error.message : 'صياغة JSON غير صحيحة.';
    const match = message.match(/position\s+(\d+)/i);
    if (match) {
      const position = Number(match[1]), before = raw.slice(0, position);
      const line = before.split('\n').length, column = position - before.lastIndexOf('\n');
      message += ' (السطر ' + line + '، العمود ' + column + ')';
    }
    setStatus('JSON غير صالح: ' + message, 'error');
  }
}
$('json-format').addEventListener('click', () => process('format'));
$('json-minify').addEventListener('click', () => process('minify'));
$('json-validate').addEventListener('click', () => {
  const raw = input.value.trim();
  if (!raw) { process('validate'); return; }
  try { JSON.parse(raw); output.value = raw; lastValid = raw; size.textContent = new Intl.NumberFormat('ar').format(raw.length) + ' حرفًا'; copyButton.disabled = false; downloadButton.disabled = false; setStatus('JSON صحيح نحويًا.', 'success'); }
  catch (_) { process('validate'); }
});
$('json-example').addEventListener('click', () => {
  input.value = JSON.stringify({ name: 'MSEO', language: 'ar', tools: ['SEO Analyzer', 'Meta Tags Generator', 'JSON Formatter'], settings: { free: true, localProcessing: true }, stats: { users: 1200, rating: 4.8 } }, null, 2);
  process('format');
});
$('json-clear').addEventListener('click', () => { input.value = ''; output.value = ''; lastValid = ''; size.textContent = '0 حرفًا'; copyButton.disabled = true; downloadButton.disabled = true; setStatus('تم مسح المحتوى.'); input.focus(); });
copyButton.addEventListener('click', async () => {
  if (!lastValid) return;
  try { await navigator.clipboard.writeText(lastValid); setStatus('تم نسخ النتيجة.', 'success'); }
  catch (_) {
    output.focus(); output.select();
    const ok = document.execCommand('copy');
    setStatus(ok ? 'تم نسخ النتيجة.' : 'تعذر النسخ تلقائيًا؛ حدّد النتيجة وانسخها يدويًا.', ok ? 'success' : 'error');
  }
});
downloadButton.addEventListener('click', () => {
  if (!lastValid) return;
  const blob = new Blob([lastValid + '\n'], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob), anchor = document.createElement('a');
  anchor.href = url; anchor.download = 'formatted.json'; document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
  setStatus('تم تجهيز تنزيل ملف JSON.', 'success');
});
input.addEventListener('input', () => { setStatus('تم تعديل المدخل؛ شغّل التحقق أو التنسيق لتحديث النتيجة.'); });
})();