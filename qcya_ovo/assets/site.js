/* Progressive enhancement. No network calls or third-party runtime code. */
(() => {
  'use strict';
  const root = document.documentElement;
  const storageKey = 'qcya-theme'; // Retain existing visitors' preferences.
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const themeSelect = document.getElementById('theme-mode');
  const themeButton = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  let mode = 'system';
  try { mode = localStorage.getItem(storageKey) || 'system'; } catch (_) {}
  const validMode = (value) => ['light', 'dark', 'system'].includes(value) ? value : 'system';
  mode = validMode(mode);

  function applyTheme() {
    const dark = mode === 'dark' || (mode === 'system' && system.matches);
    root.dataset.theme = dark ? 'dark' : 'light';
    document.getElementById('theme-color').content = dark ? '#111525' : '#fafbff';
    themeSelect.value = mode;
    themeIcon.textContent = dark ? '☼' : '☾';
    const label = dark ? '切换到浅色模式' : '切换到深色模式';
    themeButton.setAttribute('aria-label', label);
    themeButton.title = label;
  }
  function chooseTheme(value) {
    mode = validMode(value);
    try { localStorage.setItem(storageKey, mode); } catch (_) {}
    applyTheme();
  }
  themeSelect.addEventListener('change', () => chooseTheme(themeSelect.value));
  themeButton.addEventListener('click', () => chooseTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
  system.addEventListener('change', () => { if (mode === 'system') applyTheme(); });
  window.addEventListener('storage', (event) => {
    if (event.key === storageKey || event.key === null) {
      mode = validMode(event.newValue); applyTheme();
    }
  });
  applyTheme();
  document.querySelector('.theme-controls').hidden = false;

  const header = document.querySelector('.site-header');
  const nav = document.getElementById('site-nav');
  const menu = document.getElementById('menu-toggle');
  const mobile = window.matchMedia('(max-width: 780px)');
  function setMenu(open, restoreFocus = false) {
    nav.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? '收起导航' : '展开导航');
    if (restoreFocus) menu.focus({ preventScroll: true });
  }
  menu.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('open')) setMenu(false, true);
  });
  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target) && !menu.contains(event.target)) setMenu(false);
  });
  document.addEventListener('focusin', (event) => {
    if (!nav.contains(event.target) && !menu.contains(event.target)) setMenu(false);
  });
  mobile.addEventListener('change', () => {
    const hiddenFocus = !mobile.matches && document.activeElement === menu;
    setMenu(false);
    if (hiddenFocus) nav.querySelector('a').focus({ preventScroll: true });
    scheduleUpdate();
  });
  menu.hidden = false;
  root.classList.add('nav-ready');

  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = links.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  function activate(id) {
    for (const link of links) {
      const active = link.hash === '#' + id;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }
  let frame = 0;
  function updateNavigation() {
    frame = 0;
    const height = header.getBoundingClientRect().height;
    root.style.setProperty('--nav-height', height + 'px');
    const scrolling = document.scrollingElement || root;
    const y = window.scrollY;
    const bottom = scrolling.scrollHeight - window.innerHeight - y <= 3;
    const scrollable = scrolling.scrollHeight > window.innerHeight + 3;
    let active = sections[0];
    if (bottom && scrollable && y > 5) active = sections[sections.length - 1];
    else {
      const line = height + Math.min(160, window.innerHeight * .18);
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) active = section;
      }
    }
    if (active) activate(active.id);
  }
  function scheduleUpdate() {
    if (!frame) frame = requestAnimationFrame(updateNavigation);
  }
  for (const link of links) {
    link.addEventListener('click', () => {
      setMenu(false); activate(link.hash.slice(1));
      const target = document.querySelector(link.hash);
      if (target) setTimeout(() => target.focus({ preventScroll: true }), 0);
    });
  }
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('hashchange', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(document.body); observer.observe(header);
  }
  document.querySelectorAll('details').forEach((el) => el.addEventListener('toggle', scheduleUpdate));
  if (document.fonts) document.fonts.ready.then(scheduleUpdate);
  scheduleUpdate();

  const feedback = document.querySelector('.copy-feedback');
  const status = document.getElementById('copy-status');
  const fallback = document.getElementById('copy-fallback');
  const field = document.getElementById('copy-value');
  let lastCopyButton = null;
  let copySequence = 0;
  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.hidden = false;
    button.addEventListener('click', async () => {
      const request = ++copySequence;
      lastCopyButton = button;
      fallback.hidden = true; status.textContent = '';
      feedback.hidden = false;
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(button.dataset.copy);
        if (request === copySequence) status.textContent = '已复制。';
      } catch (_) {
        if (request !== copySequence) return;
        status.textContent = '浏览器未允许自动复制。';
        field.value = button.dataset.copy;
        fallback.hidden = false;
        field.focus({ preventScroll: true }); field.select();
      }
    });
  });
  document.querySelectorAll('.copy-controls').forEach((el) => { el.hidden = false; });
  function closeFeedback() {
    copySequence++;
    const focusInside = feedback.contains(document.activeElement);
    feedback.hidden = true;
    if (focusInside && lastCopyButton) lastCopyButton.focus({ preventScroll: true });
  }
  document.getElementById('copy-dismiss').addEventListener('click', closeFeedback);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !feedback.hidden) closeFeedback();
  });
  document.getElementById('year').textContent = String(new Date().getFullYear());
})();
