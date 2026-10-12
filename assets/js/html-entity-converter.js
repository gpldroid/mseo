(function () {
'use strict';
const $ = (id) => document.getElementById(id);
const input = $('he-input'), output = $('he-output'), copy = $('he-copy'), status = $('he-status'), length = $('he-length');
if (!input || !output || !copy || !status || !length) return;
function setStatus(message, kind) { status.textContent = message; status.dataset.kind = kind || 'info'; }
function encodeHTML(value) {
  const element = document.createElement('div');
  element.textContent = value;
  return element.innerHTML.replace(/\u00a0/g, '&nbsp;');
}
function decodeHTML(value) {
  const element = document.createElement('textarea');
  element.innerHTML = value;
  return element.value;
}
function apply(mode) {
  const value = input.value;
  if (!value.length) {
    output.value = ''; copy.disabled = true; length.textContent = '0 حرفًا في النتيجة';
    setStatus('أدخل نصًا ثم اختر عملية التحويل.', 'info'); return;
  }
  output.value = mode === 'encode' ? encodeHTML(value) : decodeHTML(value);
  copy.disabled = false;
  length.textContent = new Intl.NumberFormat('ar').format(Array.from(output.value).length) + ' حرفًا في النتيجة';
  setStatus(mode === 'encode' ? 'تم ترميز النص بنجاح.' : 'تم فك ترميز الكيانات المعروفة.', 'success');
}
$('he-encode').addEventListener('click', () => apply('encode'));
$('he-decode').addEventListener('click', () => apply('decode'));
$('he-example').addEventListener('click', () => {
  input.value = '<h1 title="A & B">مرحبًا بالعالم</h1>\n<p>5 < 8 && 9 > 3</p>';
  apply('encode');
});
$('he-clear').addEventListener('click', () => {
  input.value = ''; output.value = ''; copy.disabled = true; length.textContent = '0 حرفًا في النتيجة';
  setStatus('تم مسح المحتوى.'); input.focus();
});
copy.addEventListener('click', async () => {
  if (copy.disabled) return;
  try { await navigator.clipboard.writeText(output.value); setStatus('تم نسخ النتيجة.', 'success'); }
  catch (_) {
    output.focus(); output.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (__) {}
    setStatus(ok ? 'تم نسخ النتيجة.' : 'تعذر النسخ تلقائيًا؛ حدّد النتيجة وانسخها يدويًا.', ok ? 'success' : 'error');
  }
});
input.addEventListener('input', () => {
  output.value = ''; copy.disabled = true; length.textContent = '0 حرفًا في النتيجة';
  setStatus('تم تعديل النص؛ اختر الترميز أو فك الترميز لتحديث النتيجة.', 'info');
});
})();