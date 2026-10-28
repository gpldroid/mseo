(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const type = $('schema-type'), name = $('schema-name'), url = $('schema-url');
  const description = $('schema-description'), output = $('schema-output'), status = $('schema-status');
  const articleFields = $('schema-article-fields'), orgFields = $('schema-org-fields');
  const nameLabel = $('schema-name-label');
  const labels = { Article: 'عنوان المقال *', Organization: 'اسم المؤسسة *', WebSite: 'اسم الموقع *' };
  function updateType() {
    const selected = type.value;
    nameLabel.textContent = labels[selected];
    articleFields.hidden = selected !== 'Article';
    orgFields.hidden = selected !== 'Organization';
    $('schema-publisher').closest('label')?.remove();
  }
  function setStatus(message, good = false) {
    status.textContent = message;
    status.classList.toggle('is-success', good);
    status.classList.toggle('is-error', !good);
  }
  function validUrl(value, required = false) {
    if (!value.trim()) {
      if (required) throw new Error('يرجى إدخال رابط الصفحة.');
      return '';
    }
    let parsed;
    try { parsed = new URL(value.trim()); } catch { throw new Error('أحد الروابط غير صالح. استخدم رابطًا كاملًا مثل https://example.com.'); }
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('يجب أن يبدأ الرابط بـ http:// أو https://.');
    return parsed.href;
  }
  function generate() {
    const selected = type.value;
    const title = name.value.trim();
    if (!title) throw new Error('يرجى إدخال الاسم أو العنوان المطلوب.');
    const pageUrl = validUrl(url.value, true);
    const data = { '@context': 'https://schema.org', '@type': selected, name: title, url: pageUrl };
    if (description.value.trim()) data.description = description.value.trim();
    if (selected === 'Article') {
      const author = $('schema-author').value.trim();
      const publisher = $('schema-publisher').value.trim();
      const date = $('schema-date').value;
      const image = validUrl($('schema-image').value);
      if (author) data.author = { '@type': 'Person', name: author };
      if (publisher) data.publisher = { '@type': 'Organization', name: publisher };
      if (date) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) throw new Error('تاريخ النشر غير صالح.');
        data.datePublished = date;
      }
      if (image) data.image = image;
      data.headline = title;
      data.mainEntityOfPage = { '@type': 'WebPage', '@id': pageUrl };
    } else if (selected === 'Organization') {
      const logo = validUrl($('schema-logo').value);
      if (logo) data.logo = logo;
    } else {
      data.inLanguage = 'ar';
    }
    output.value = JSON.stringify(data, null, 2);
    setStatus('تم إنشاء JSON-LD صالح من ناحية صياغة JSON. راجع القيم قبل النشر.', true);
  }
  type.addEventListener('change', () => {
    articleFields.hidden = type.value !== 'Article';
    orgFields.hidden = type.value !== 'Organization';
    nameLabel.textContent = labels[type.value];
    setStatus('تم تغيير النوع. راجع الحقول ثم أنشئ الكود.');
  });
  $('schema-generate').addEventListener('click', () => {
    try { generate(); } catch (error) { setStatus(error.message); }
  });
  $('schema-example').addEventListener('click', () => {
    type.value = 'Article'; articleFields.hidden = false; orgFields.hidden = true;
    nameLabel.textContent = labels.Article;
    name.value = 'دليل البيانات المنظمة للمواقع';
    url.value = 'https://example.com/structured-data-guide';
    description.value = 'شرح عملي لإضافة البيانات المنظمة إلى صفحات الويب.';
    $('schema-author').value = 'فريق التحرير'; $('schema-publisher').value = 'MSEO';
    $('schema-date').value = '2026-10-12'; $('schema-image').value = 'https://example.com/images/structured-data.jpg';
    try { generate(); } catch (error) { setStatus(error.message); }
  });
  $('schema-reset').addEventListener('click', () => {
    document.querySelectorAll('.schema-tool input, .schema-tool textarea').forEach((field) => { field.value = ''; });
    type.value = 'Article'; articleFields.hidden = false; orgFields.hidden = true;
    nameLabel.textContent = labels.Article; output.value = '';
    setStatus('تم مسح الحقول.');
  });
  $('schema-copy').addEventListener('click', async () => {
    if (!output.value.trim()) { setStatus('أنشئ الكود أولًا قبل النسخ.'); return; }
    try {
      await navigator.clipboard.writeText(output.value);
      setStatus('تم نسخ الكود إلى الحافظة.', true);
    } catch {
      output.focus(); output.select();
      const copied = document.execCommand('copy');
      setStatus(copied ? 'تم نسخ الكود إلى الحافظة.' : 'تعذر النسخ التلقائي؛ حدّد الكود وانسخه يدويًا.', copied);
    }
  });
  $('schema-download').addEventListener('click', () => {
    if (!output.value.trim()) { setStatus('أنشئ الكود أولًا قبل التنزيل.'); return; }
    try {
      JSON.parse(output.value);
      const blob = new Blob([output.value + '\n'], { type: 'application/ld+json;charset=utf-8' });
      const anchor = document.createElement('a');
      anchor.href = URL.createObjectURL(blob); anchor.download = 'schema-markup.json';
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      URL.revokeObjectURL(anchor.href);
      setStatus('تم تجهيز ملف JSON للتنزيل.', true);
    } catch { setStatus('الكود الحالي ليس JSON صالحًا. أنشئه من جديد.'); }
  });
})();