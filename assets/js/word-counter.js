(function () {
'use strict';
const $ = (id) => document.getElementById(id);
const input = $('wc-text');
if (!input) return;
const fmt = new Intl.NumberFormat('ar');
const keys = ['words','chars','chars-no-space','reading','paragraphs','sentences','lines','average','speech-slow','speech-normal','speech-fast'];
const out = Object.fromEntries(keys.map((key) => [key, $('wc-' + key)]));
const status = $('wc-status'), copyButton = $('wc-copy');
const duration = (minutes) => {
  const sec = Math.max(0, Math.round(minutes * 60));
  if (!sec) return '0 ث';
  const mins = Math.floor(sec / 60), rest = sec % 60;
  return mins ? fmt.format(mins) + ' د' + (rest ? ' ' + fmt.format(rest) + ' ث' : '') : fmt.format(sec) + ' ث';
};
function wordsIn(text) {
  const value = text.trim();
  if (!value) return [];
  try { return value.match(/[\p{L}\p{N}]+(?:[’'\u2010-\u2015-][\p{L}\p{N}]+)*/gu) || []; }
  catch (_) { return value.match(/[A-Za-z0-9_\u0600-\u06FF]+/g) || []; }
}
function update() {
  const text = input.value, trimmed = text.trim(), words = wordsIn(text);
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n+/).filter((p) => p.trim()).length : 0;
  const sentences = trimmed ? (trimmed.match(/[^.!?؟。]+[.!?؟。]+|[^.!?؟。]+$/gu) || []).filter((s) => s.trim()).length : 0;
  const lines = trimmed ? text.split(/\r?\n/).filter((line) => line.trim()).length : 0;
  const chars = Array.from(text).length, compact = Array.from(text.replace(/\s/gu, '')).length;
  const put = (key, value) => { out[key].textContent = value; };
  put('words', fmt.format(words.length)); put('chars', fmt.format(chars)); put('chars-no-space', fmt.format(compact));
  put('reading', duration(words.length / 200)); put('paragraphs', fmt.format(paragraphs)); put('sentences', fmt.format(sentences)); put('lines', fmt.format(lines));
  put('average', fmt.format(words.length ? Math.round(compact / words.length * 10) / 10 : 0));
  put('speech-slow', duration(words.length / 130)); put('speech-normal', duration(words.length / 150)); put('speech-fast', duration(words.length / 180));
  copyButton.disabled = !trimmed; status.dataset.kind = trimmed ? 'success' : 'info';
  status.textContent = trimmed ? 'تم تحديث الإحصاءات مباشرةً. لا يغادر النص جهازك.' : 'أدخل نصًا لعرض الإحصاءات.';
}
function summary() {
  return ['إحصاءات النص — MSEO','الكلمات: ' + out.words.textContent,'الأحرف مع المسافات: ' + out.chars.textContent,'الأحرف دون المسافات: ' + out['chars-no-space'].textContent,'الفقرات: ' + out.paragraphs.textContent,'الجمل التقريبية: ' + out.sentences.textContent,'الأسطر غير الفارغة: ' + out.lines.textContent,'زمن القراءة: ' + out.reading.textContent,'الإلقاء البطيء: ' + out['speech-slow'].textContent,'الإلقاء الطبيعي: ' + out['speech-normal'].textContent,'الإلقاء السريع: ' + out['speech-fast'].textContent].join('\n');
}
input.addEventListener('input', update);
$('wc-sample').addEventListener('click', function () {
  input.value = 'تحسين محركات البحث يبدأ بفهم احتياجات القارئ. اكتب عنوانًا واضحًا، ونظّم المقال بعناوين فرعية مفيدة.\n\nA good article answers the reader’s question, uses clear headings, and makes the next step easy to understand.';
  update(); input.focus();
});
$('wc-clear').addEventListener('click', function () { input.value = ''; update(); input.focus(); });
copyButton.addEventListener('click', async function () {
  try { await navigator.clipboard.writeText(summary()); status.dataset.kind = 'success'; status.textContent = 'تم نسخ ملخص الإحصاءات.'; }
  catch (_) {
    const helper = document.createElement('textarea'); helper.value = summary(); helper.setAttribute('readonly', '');
    helper.style.position = 'absolute'; helper.style.insetInlineStart = '-9999px'; document.body.appendChild(helper); helper.select();
    const ok = document.execCommand('copy'); helper.remove(); status.dataset.kind = ok ? 'success' : 'error';
    status.textContent = ok ? 'تم نسخ ملخص الإحصاءات.' : 'تعذر النسخ تلقائيًا؛ حاول تحديد النص يدويًا.';
  }
});
update();
})();