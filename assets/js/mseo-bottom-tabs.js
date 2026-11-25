(function () {
  if (document.querySelector('.mseo-bottom-tabs')) return;
  var current = location.pathname.replace(/\\/$/, '') || '/';
  var tabs = [
    { href: '/', label: 'الرئيسية', icon: '⌂', match: function () { return current === '/'; } },
    { href: '/#articles', label: 'المقالات', icon: '▤', match: function () { return current.indexOf('/articles/') === 0 || current === '/pages/archive.html' || current === '/pages/topics.html'; } },
    { href: '/pages/categories.html', label: 'التصنيفات', icon: '◈', match: function () { return current === '/pages/categories.html'; } },
    { href: '/pages/tools.html', label: 'الأدوات', icon: '✣', match: function () { return current.indexOf('/pages/') === 0 && /tools|generator|checker|converter|analyzer|preview|compressor|tester/.test(current); } },
    { href: '/pages/archive.html', label: 'استكشف', icon: '⌕', match: function () { return current.indexOf('/pages/') === 0 && !/categories|tools|generator|checker|converter|analyzer|preview|compressor|tester/.test(current); } }
  ];
  var nav = document.createElement('nav');
  nav.className = 'mseo-bottom-tabs';
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
