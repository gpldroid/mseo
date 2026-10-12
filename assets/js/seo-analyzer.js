/* MSEO SEO Analyzer: local-only HTML analysis. */
(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const source = $('#seo-html-source'), fileInput = $('#seo-html-file'), urlInput = $('#seo-page-url');
  const results = $('#seo-results'), status = $('#seo-status');
  const copyButton = $('#seo-copy-report'), downloadButton = $('#seo-download-report');
  let latestReport = null;
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean = n => (n && n.textContent || '').replace(/\s+/g, ' ').trim();
  const safeUrl = value => { try { const u = new URL(value); return /^https?:$/.test(u.protocol) ? u : null; } catch (_) { return null; } };
  const setStatus = (message, kind) => { status.textContent = message; status.dataset.kind = kind || 'info'; };
  function analyze(html, pageUrl) {
    const doc = new DOMParser().parseFromString(html, 'text/html'), findings = [];
    const title = clean(doc.querySelector('title'));
    const description = (doc.querySelector('meta[name="description" i]') || {}).content || '';
    const canonical = doc.querySelector('link[rel~="canonical" i]')?.getAttribute('href')?.trim() || '';
    const robots = (doc.querySelector('meta[name="robots" i]') || {}).content || '';
    const viewport = (doc.querySelector('meta[name="viewport" i]') || {}).content || '';
    const lang = doc.documentElement.getAttribute('lang') || '';
    const h1s = Array.from(doc.querySelectorAll('h1')).map(clean).filter(Boolean);
    const headings = {}; for (let i=1;i<=6;i++) headings[i]=doc.querySelectorAll('h'+i).length;
    const images = Array.from(doc.images), missingAlt = images.filter(i => !i.hasAttribute('alt') || !i.getAttribute('alt').trim());
    const links = Array.from(doc.querySelectorAll('a[href]')), base = safeUrl(pageUrl);
    let internal = null, external = null;
    if (base) {
      const resolved = links.map(a => { try { return new URL(a.getAttribute('href'), base); } catch (_) { return null; } }).filter(Boolean);
      internal = resolved.filter(u => u.origin === base.origin).length;
      external = resolved.filter(u => u.origin !== base.origin && /^https?:$/.test(u.protocol)).length;
    }
    const canonicalUrl = canonical ? safeUrl(canonical.startsWith('//') ? (base ? base.protocol : 'https:') + canonical : canonical) : null;
    const text = clean(doc.body).replace(/\bhttps?:\/\/\S+/gi, '');
    const words = text.match(/[\p{L}\p{N}]+(?:['’_-][\p{L}\p{N}]+)*/gu) || [];
    const ogTitle = (doc.querySelector('meta[property="og:title" i]') || {}).content || '';
    const ogDescription = (doc.querySelector('meta[property="og:description" i]') || {}).content || '';
    const ogImage = (doc.querySelector('meta[property="og:image" i]') || {}).content || '';
    const twitterCard = (doc.querySelector('meta[name="twitter:card" i]') || {}).content || '';
    const add = (severity,titleText,detail) => findings.push({severity,title:titleText,detail});
    if (!title) add('error','عنوان الصفحة مفقود','أضف وسم title فريدًا يصف موضوع الصفحة بدقة.');
    else if (title.length<30) add('warning','عنوان الصفحة قصير','الطول '+title.length+' حرفًا؛ تحقق من أنه يوضح الموضوع والفائدة.');
    else if (title.length>60) add('warning','عنوان الصفحة طويل','الطول '+title.length+' حرفًا؛ قد يظهر مقطوعًا في بعض النتائج.');
    else add('success','عنوان الصفحة موجود','الطول '+title.length+' حرفًا.');
    if (!description.trim()) add('error','الوصف التعريفي مفقود','أضف meta description موجزًا وفريدًا يلخص محتوى الصفحة.');
    else if (description.trim().length<70) add('warning','الوصف التعريفي قصير','الطول '+description.trim().length+' حرفًا؛ أضف سياقًا مفيدًا دون حشو.');
    else if (description.trim().length>160) add('warning','الوصف التعريفي طويل','الطول '+description.trim().length+' حرفًا؛ اختصره مع الحفاظ على أهم معلومة.');
    else add('success','الوصف التعريفي موجود','الطول '+description.trim().length+' حرفًا.');
    if (!h1s.length) add('error','لا يوجد عنوان H1','أضف عنوانًا رئيسيًا واضحًا يصف الموضوع الأساسي.');
    else if (h1s.length>1) add('warning','توجد عدة عناوين H1','عُثر على '+h1s.length+' عناوين H1؛ اجعل العنوان الرئيسي واضحًا.');
    else add('success','عنوان H1 موجود','يوجد عنوان رئيسي واحد.');
    if (!canonical) add('warning','وسم canonical غير موجود','أضف رابطًا أساسيًا إذا كانت الصفحة متاحة عبر عناوين متعددة.');
    else if (!canonicalUrl) add('warning','رابط canonical يحتاج مراجعة','تحقق من أن canonical رابط مطلق صحيح باستخدام HTTP أو HTTPS.');
    else add('success','وسم canonical موجود',canonicalUrl.href);
    if (!viewport) add('warning','وسم viewport مفقود','أضف meta viewport لدعم الهواتف.');
    else add('success','وسم viewport موجود','تم العثور على إعداد viewport.');
    if (!lang) add('warning','لغة المستند غير محددة','حدد lang على عنصر html؛ استخدم lang="ar" للمحتوى العربي.');
    else add('success','لغة المستند محددة','قيمة اللغة: '+lang+'.');
    if (!robots) add('info','وسم robots غير موجود','هذا ليس خطأ بحد ذاته؛ افتراضيًا يمكن فهرسة الصفحة ما لم توجد تعليمات أخرى.');
    else if (/\bnoindex\b/i.test(robots)) add('warning','تعليمات noindex موجودة','تحقق من أن منع الفهرسة مقصود.');
    else add('success','تعليمات robots لا تحتوي noindex',robots);
    if (images.length && missingAlt.length) add('warning','صور بلا نص بديل','هناك '+missingAlt.length+' من '+images.length+' صورة بلا alt أو بقيمة فارغة؛ الصور الزخرفية قد تستخدم alt فارغًا عمدًا.');
    else if (images.length) add('success','خاصية alt موجودة للصور','راجع يدويًا مدى دقة الأوصاف.');
    else add('info','لا توجد صور','إذا كانت الصور مفيدة للشرح، أضفها مع نص بديل مناسب.');
    if (!headings[2]) add('info','لا توجد عناوين H2','قسّم المحتوى الطويل بعناوين فرعية واضحة.');
    else add('success','العناوين الفرعية موجودة','عدد H2: '+headings[2]+'.');
    const skipped=[]; for(let i=2;i<=6;i++) if(headings[i] && !headings[i-1]) skipped.push('H'+i);
    if(skipped.length) add('warning','راجع تسلسل العناوين','توجد مستويات '+skipped.join('، ')+' دون المستوى السابق مباشرة؛ تحقق من البنية الدلالية.');
    if(base) {
      add('info','الروابط المكتشفة',links.length+' رابطًا؛ داخلي: '+internal+'، خارجي: '+external+'.');
      const emptyLinks=links.filter(a=>!a.getAttribute('href').trim() || a.getAttribute('href').trim()==='#').length;
      if(emptyLinks) add('warning','روابط فارغة أو #','عُثر على '+emptyLinks+' رابطًا يحتاج إلى مراجعة.');
    } else add('info','تحليل الروابط محدود','أدخل رابط الصفحة لتصنيف الروابط؛ لن يتم فتح الرابط أو الاتصال به.');
    if(!ogTitle || !ogDescription || !ogImage) add('warning','بيانات Open Graph غير مكتملة','راجع og:title وog:description وog:image لتحسين معاينة المشاركة.');
    else add('success','بيانات Open Graph موجودة','تم العثور على العنوان والوصف والصورة.');
    if(!twitterCard) add('info','Twitter Card غير محدد','أضفه إذا أردت التحكم في معاينة الرابط على المنصات التي تدعمه.');
    if(words.length<100) add('info','النص المستخرج قصير','عُثر على نحو '+words.length+' كلمة؛ لا يوجد حد كلمات سحري يضمن الترتيب.');
    const weights={error:12,warning:5,info:0,success:0};
    const score=Math.max(0,100-findings.reduce((n,f)=>n+weights[f.severity],0));
    return {score,title,description,canonical,robots,viewport,lang,h1s,headings,images:images.length,missingAlt:missingAlt.length,links:links.length,internal,external,words:words.length,ogTitle,ogDescription,ogImage,twitterCard,findings,pageUrl,at:new Date().toLocaleString('ar')};
  }
  const labels={error:'مشكلة مهمة',warning:'يحتاج مراجعة',info:'معلومة',success:'جيد'};
  function formatReport(r) {
    return ['MSEO — تقرير محلل SEO الأساسي','تاريخ الفحص: '+r.at,'الرابط: '+(r.pageUrl||'غير محدد'),'الدرجة الإرشادية: '+r.score+'/100','','العنوان: '+(r.title||'غير موجود'),'الوصف: '+(r.description||'غير موجود'),'Canonical: '+(r.canonical||'غير موجود'),'H1: '+(r.h1s.join(' | ')||'غير موجود'),'عدد الكلمات التقريبي: '+r.words,'الروابط: '+r.links+' | الصور: '+r.images+' | صور تحتاج مراجعة alt: '+r.missingAlt,'','التوصيات:',...r.findings.map((f,i)=>(i+1)+'. ['+labels[f.severity]+'] '+f.title+'\n   '+f.detail),'','الدرجة إرشادية ولا تضمن ترتيبًا في محركات البحث.'].join('\n');
  }
  function render(r) {
    const groups=[
      ['العنوان والوصف',[['عنوان الصفحة',r.title||'غير موجود'],['الوصف التعريفي',r.description||'غير موجود']]],
      ['بنية الصفحة',[['عناوين H1',r.h1s.length],['H2',r.headings[2]],['عدد الكلمات التقريبي',r.words]]],
      ['الروابط والصور',[['الروابط',r.links],['الصور',r.images],['صور تحتاج مراجعة alt',r.missingAlt]]],
      ['الفهرسة والمشاركة',[['canonical',r.canonical||'غير موجود'],['robots',r.robots||'غير محدد'],['Open Graph',r.ogTitle&&r.ogDescription&&r.ogImage?'مكتمل مبدئيًا':'غير مكتمل']]]];
    let html='<section class="seo-score-card"><div class="seo-score-ring" style="--score:'+r.score+'" role="img" aria-label="الدرجة الإرشادية '+r.score+' من 100"><span><strong>'+r.score+'</strong><small>من 100</small></span></div><div><span class="seo-eyebrow">نتيجة الفحص المحلي</span><h2>الدرجة الإرشادية</h2><p>قائمة تحقق مبسطة وليست مقياسًا رسميًا أو توقعًا للترتيب.</p></div></section><div class="seo-metrics">';
    html+=groups.map(g=>'<section class="seo-metric-card"><h3>'+esc(g[0])+'</h3><dl>'+g[1].map(v=>'<div><dt>'+esc(v[0])+'</dt><dd>'+esc(v[1])+'</dd></div>').join('')+'</dl></section>').join('');
    html+='</div><section class="seo-findings"><div class="seo-section-head"><div><span class="seo-eyebrow">خطوات قابلة للتنفيذ</span><h2>نتائج الفحص والتوصيات</h2></div><span class="seo-count">'+r.findings.length+' ملاحظة</span></div><ul class="seo-finding-list">';
    html+=r.findings.map(f=>'<li class="seo-finding seo-'+f.severity+'"><span class="seo-finding-icon" aria-hidden="true">'+({error:'!',warning:'△',info:'i',success:'✓'})[f.severity]+'</span><div><div class="seo-finding-title">'+esc(f.title)+' <span>'+labels[f.severity]+'</span></div><p>'+esc(f.detail)+'</p></div></li>').join('');
    html+='</ul></section><section class="seo-summary-card"><h2>ملخص البيانات المستخرجة</h2><dl>';
    [['عنوان الصفحة',r.title],['الوصف التعريفي',r.description],['H1',r.h1s.join(' | ')],['الرابط الأساسي',r.canonical],['لغة الصفحة',r.lang],['عدد الكلمات التقريبي',r.words]].forEach(v=>{html+='<div><dt>'+esc(v[0])+'</dt><dd>'+esc(v[1]||'—')+'</dd></div>';});
    html+='</dl></section><p class="seo-report-time">أُجري الفحص في '+esc(r.at)+'. النتائج مبنية على HTML المقدم فقط؛ لم يُختبر الخادم أو الأداء أو الروابط الفعلية.</p>';
    results.innerHTML=html; results.hidden=false; copyButton.disabled=false; downloadButton.disabled=false; latestReport=r;
  }
  $('#seo-analyzer-form').addEventListener('submit',e=>{
    e.preventDefault(); const html=source.value.trim(), url=urlInput.value.trim();
    if(!html){setStatus('ألصق كود HTML أو اختر ملفًا أولًا.','error');source.focus();return;}
    if(url&&!safeUrl(url)){setStatus('أدخل رابطًا يبدأ بـ https:// أو http://، أو اترك الحقل فارغًا.','error');urlInput.focus();return;}
    try{latestReport=analyze(html,url);render(latestReport);setStatus('اكتمل التحليل محليًا. راجع النتائج أدناه.','success');results.scrollIntoView({behavior:'smooth',block:'start'});}
    catch(err){console.error(err);setStatus('تعذر تحليل HTML. تحقق من المحتوى وحاول مجددًا.','error');}
  });
  $('#seo-load-sample').addEventListener('click',()=>{
    urlInput.value='https://example.com/article';
    source.value='<!doctype html>\n<html lang="ar" dir="rtl">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>دليل تحسين محركات البحث للمبتدئين | مثال</title>\n<meta name="description" content="تعرف على أساسيات تحسين محركات البحث، واكتشف خطوات عملية لتحسين بنية الصفحة والعناوين والوصف والروابط بطريقة واضحة.">\n<link rel="canonical" href="https://example.com/article">\n<meta name="robots" content="index,follow">\n<meta property="og:title" content="دليل تحسين محركات البحث للمبتدئين">\n<meta property="og:description" content="خطوات عملية لتحسين بنية الصفحة وتجربة القراءة.">\n<meta property="og:image" content="https://example.com/seo.jpg">\n</head>\n<body><main><h1>دليل تحسين محركات البحث للمبتدئين</h1><p>يبدأ تحسين محركات البحث بإنشاء محتوى مفيد يجيب عن أسئلة الزوار وتنظيم الصفحة بعناوين واضحة.</p><h2>تحسين عناصر الصفحة</h2><p>اكتب عنوانًا فريدًا ووصفًا موجزًا واستخدم HTML دلاليًا.</p><img src="/images/seo.jpg" alt="رسم توضيحي لتحسين محركات البحث"><p><a href="/pages/guide.html">دليل داخلي</a> <a href="https://developers.google.com/search">مرجع خارجي</a></p></main></body></html>';
    setStatus('تم تحميل مثال للتجربة. اضغط «حلّل الصفحة».','info');source.focus();
  });
  fileInput.addEventListener('change',async()=>{
    const file=fileInput.files && fileInput.files[0];if(!file)return;
    if(file.size>2*1024*1024){setStatus('حجم الملف يتجاوز 2 ميغابايت. اختر ملفًا أصغر.','error');fileInput.value='';return;}
    try{source.value=await file.text();setStatus('تم تحميل '+file.name+' محليًا؛ لم يُرفع إلى خادم.','success');}
    catch(_){setStatus('تعذر قراءة الملف. اختر ملف HTML نصيًا.','error');}
  });
  copyButton.addEventListener('click',async()=>{
    if(!latestReport)return;const text=formatReport(latestReport);
    try{await navigator.clipboard.writeText(text);setStatus('تم نسخ تقرير SEO إلى الحافظة.','success');}
    catch(_){const area=document.createElement('textarea');area.value=text;area.setAttribute('readonly','');area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();const ok=document.execCommand('copy');area.remove();setStatus(ok?'تم نسخ التقرير.':'تعذر النسخ؛ يمكنك تنزيل التقرير.',ok?'success':'error');}
  });
  downloadButton.addEventListener('click',()=>{
    if(!latestReport)return;const blob=new Blob([formatReport(latestReport)],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='mseo-seo-report.txt';a.click();URL.revokeObjectURL(url);setStatus('تم تجهيز تقرير SEO للتنزيل.','success');
  });
})();