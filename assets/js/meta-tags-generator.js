(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const fields = {
    title: $('#meta-title'), description: $('#meta-description'), url: $('#meta-url'),
    image: $('#meta-image'), site: $('#meta-site-name'), locale: $('#meta-locale'),
    card: $('#meta-twitter-card'), robots: $('#meta-robots'), author: $('#meta-author')
  };
  const output = $('#meta-output'), status = $('#meta-status');
  const copyBtn = $('#meta-copy'), downloadBtn = $('#meta-download');
  const escHtml = (s) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const attr = (s) => escHtml(String(s ?? '').trim());
  const validHttp = (value) => {
    if (!value.trim()) return true;
    try { const u = new URL(value.trim()); return (u.protocol === 'https:' || u.protocol === 'http:') && !u.username && !u.password; }
    catch (_) { return false; }
  };
  const read = () => Object.fromEntries(Object.entries(fields).map(([k,el]) => [k, el.value.trim()]));
  function build(v) {
    const lines = ['<!-- Basic SEO -->'];
    if (v.title) lines.push('<title>' + escHtml(v.title) + '</title>');
    if (v.description) lines.push('<meta name="description" content="' + attr(v.description) + '">');
    if (v.url) lines.push('<link rel="canonical" href="' + attr(v.url) + '">');
    lines.push('<meta name="robots" content="' + attr(v.robots || 'index,follow') + '">');
    if (v.author) lines.push('<meta name="author" content="' + attr(v.author) + '">');
    lines.push('', '<!-- Open Graph / social sharing -->', '<meta property="og:type" content="website">');
    if (v.title) lines.push('<meta property="og:title" content="' + attr(v.title) + '">');
    if (v.description) lines.push('<meta property="og:description" content="' + attr(v.description) + '">');
    if (v.url) lines.push('<meta property="og:url" content="' + attr(v.url) + '">');
    if (v.image) lines.push('<meta property="og:image" content="' + attr(v.image) + '">');
    if (v.site) lines.push('<meta property="og:site_name" content="' + attr(v.site) + '">');
    if (v.locale) lines.push('<meta property="og:locale" content="' + attr(v.locale) + '">');
    lines.push('', '<!-- X / Twitter Card -->', '<meta name="twitter:card" content="' + attr(v.card || 'summary_large_image') + '">');
    if (v.title) lines.push('<meta name="twitter:title" content="' + attr(v.title) + '">');
    if (v.description) lines.push('<meta name="twitter:description" content="' + attr(v.description) + '">');
    if (v.image) lines.push('<meta name="twitter:image" content="' + attr(v.image) + '">');
    return lines.join('\n');
  }
  function showStatus(message, kind='info') { status.textContent = message; status.dataset.kind = kind; }
  function render() {
    const v = read();
    const bad = ['url','image'].filter(k => !validHttp(v[k]));
    if (bad.length) {
      showStatus('تحقق من رابط الصفحة والصورة: استخدم رابطًا كاملًا يبدأ بـ https:// أو http://.', 'error');
      return;
    }
    const code = build(v);
    output.value = code;
    $('#meta-preview-title').textContent = v.title || 'سيظهر عنوان الصفحة هنا';
    $('#meta-preview-description').textContent = v.description || 'ستظهر هنا معاينة وصف الصفحة بعد إدخاله.';
    $('#meta-preview-url').textContent = v.url ? v.url.replace(/^https?:\/\//,'').replace(/\/$/,'') : 'example.com/page';
    $('#meta-title-count').textContent = v.title.length + ' حرف';
    $('#meta-description-count').textContent = v.description.length + ' حرف';
    $('#meta-title-count').dataset.kind = v.title.length > 60 ? 'warning' : 'info';
    $('#meta-description-count').dataset.kind = v.description.length > 160 ? 'warning' : 'info';
    copyBtn.disabled = false; downloadBtn.disabled = false;
    showStatus('تم تحديث الكود والمعاينة. راجع الروابط والبيانات قبل النشر.', 'success');
  }
  Object.values(fields).forEach(el => el.addEventListener('input', render));
  $('#meta-generator-form').addEventListener('submit', e => { e.preventDefault(); render(); });
  $('#meta-load-sample').addEventListener('click', () => {
    fields.title.value = 'دليل تحسين محركات البحث للمبتدئين | MSEO';
    fields.description.value = 'تعرف على أساسيات SEO وخطوات عملية لتحسين العناوين والوصف وبنية صفحات موقعك وتجربة الزائر.';
    fields.url.value = 'https://example.com/guides/seo-basics';
    fields.image.value = 'https://example.com/images/seo-guide.jpg';
    fields.site.value = 'MSEO'; fields.locale.value = 'ar_AR';
    fields.card.value = 'summary_large_image'; fields.robots.value = 'index,follow'; fields.author.value = '';
    render(); showStatus('تم تحميل مثال. استبدل روابط example.com بروابط موقعك الفعلية.', 'info');
  });
  copyBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(output.value); showStatus('تم نسخ كود Meta Tags. الصقه داخل عنصر head في صفحتك.', 'success'); }
    catch (_) {
      output.focus(); output.select();
      try { const ok = document.execCommand('copy'); showStatus(ok ? 'تم نسخ الكود.' : 'تعذر النسخ التلقائي؛ حدد الكود وانسخه يدويًا.', ok ? 'success' : 'error'); }
      catch (_) { showStatus('تعذر النسخ التلقائي؛ حدد الكود وانسخه يدويًا.', 'error'); }
    }
  });
  downloadBtn.addEventListener('click', () => {
    const blob = new Blob([output.value + '\n'], {type:'text/html;charset=utf-8'});
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = 'mseo-meta-tags.html'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showStatus('تم تنزيل ملف الكود. راجعه قبل إضافته إلى موقعك.', 'success');
  });
  render();
})();