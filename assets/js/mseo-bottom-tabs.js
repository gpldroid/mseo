(function () {
  'use strict';

  var existing = Array.prototype.slice.call(document.querySelectorAll('.mseo-bottom-tabs'));
  var nav = existing.find(function (item) {
    return item.hasAttribute('data-3d-tab-bar');
  }) || existing[0];

  // Keep exactly one navigation bar; prefer the explicitly marked 3D component.
  existing.forEach(function (item) {
    if (item !== nav) item.remove();
  });

  if (nav) {
    nav.setAttribute('data-3d-tab-bar', '');
    return;
  }

  var current = location.pathname;
  if (current.length > 1 && current.charAt(current.length - 1) === '/') current = current.slice(0, -1);
  var tabs = [
    { href: '/', label: 'الرئيسية', icon: '⌂', match: function () { return current === '/'; } },
    { href: '/#articles', label: 'المقالات', icon: '▤', match: function () { return current.indexOf('/articles/') === 0 || current === '/pages/archive.html' || current === '/pages/topics.html'; } },
    { href: '/pages/categories.html', label: 'التصنيفات', icon: '◈', match: function () { return current === '/pages/categories.html'; } },
    { href: '/pages/tools.html', label: 'الأدوات', icon: '✣', match: function () { return current.indexOf('/pages/') === 0 && /tools|generator|checker|converter|analyzer|preview|compressor|tester/.test(current); } },
    { href: '/pages/archive.html', label: 'استكشف', icon: '⌕', match: function () { return current.indexOf('/pages/') === 0 && !/categories|tools|generator|checker|converter|analyzer|preview|compressor|tester/.test(current); } }
  ];

  nav = document.createElement('nav');
  nav.className = 'mseo-bottom-tabs';
  nav.setAttribute('data-3d-tab-bar', '');
  nav.setAttribute('aria-label', 'التنقل الرئيسي السفلي');
  tabs.forEach(function (tab) {
    var link = document.createElement('a');
    link.className = 'mseo-tab';
    link.href = tab.href;
    link.innerHTML = '<span class="mseo-tab-icon" aria-hidden="true">' + tab.icon + '</span><span>' + tab.label + '</span>';
    if (tab.match()) link.setAttribute('aria-current', 'page');
    nav.appendChild(link);
  });
  document.body.appendChild(nav);
})();
