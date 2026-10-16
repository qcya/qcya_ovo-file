/* 青春沿岸 / qcya_ovo — simple interactions, no network dependence */
(function () {
  'use strict';
  var root = document.documentElement;
  var themeToggle = document.getElementById('theme-toggle');
  var themeIcon = document.getElementById('theme-icon');
  var menuToggle = document.getElementById('menu-toggle');
  var siteNav = document.getElementById('site-nav');

  function readTheme() {
    try { return localStorage.getItem('qcya-theme'); } catch (error) { return null; }
  }
  function saveTheme(value) {
    try { localStorage.setItem('qcya-theme', value); } catch (error) { /* storage may be blocked */ }
  }
  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    themeIcon.textContent = theme === 'dark' ? '☼' : '☾';
    themeToggle.setAttribute('aria-label', theme === 'dark' ? '切换到浅色模式' : '切换到深色模式');
    themeToggle.setAttribute('title', theme === 'dark' ? '浅色模式' : '深色模式');
  }
  var savedTheme = readTheme();
  var preferredDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : (preferredDark ? 'dark' : 'light'));
  themeToggle.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next); saveTheme(next);
  });

  menuToggle.addEventListener('click', function () {
    var open = siteNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? '收起导航' : '展开导航');
  });
  siteNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      siteNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', '展开导航');
    });
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      siteNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var targetId = entry.target.id;
        navLinks.forEach(function (link) {
          var active = link.getAttribute('href') === '#' + targetId;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-22% 0px -60% 0px', threshold: 0 });
    ['home','about','projects','contact'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  document.getElementById('year').textContent = String(new Date().getFullYear());
})();
