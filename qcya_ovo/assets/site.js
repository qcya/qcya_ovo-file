/* Progressive enhancement: content, links and details work without JavaScript. */
(() => {
  'use strict';
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const nav = document.getElementById('site-nav');
  const menu = document.getElementById('menu-toggle');
  const toggle = document.getElementById('theme-toggle');
  const select = document.getElementById('theme-mode');
  const icon = document.getElementById('theme-icon');
  const narrow = window.matchMedia('(max-width: 780px)');

  function syncTheme() {
    const dark = root.dataset.theme === 'dark';
    if (select) select.value = root.dataset.themeMode || 'system';
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(dark));
      toggle.setAttribute('aria-label', dark ? '切换到浅色模式' : '切换到深色模式');
      toggle.title = dark ? '切换到浅色模式' : '切换到深色模式';
    }
    if (icon) icon.textContent = dark ? '☼' : '☾';
  }
  if (window.SiteTheme) {
    toggle?.addEventListener('click', () => window.SiteTheme.set(root.dataset.theme === 'dark' ? 'light' : 'dark'));
    select?.addEventListener('change', () => window.SiteTheme.set(select.value));
    document.addEventListener('site:theme', syncTheme);
    syncTheme();
    root.classList.add('theme-ready');
  }

  // One function owns display state, accessible label and optional focus return.
  function setMenu(open, returnFocus = false) {
    if (!nav || !menu) return;
    nav.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? '收起导航' : '展开导航');
    if (returnFocus) menu.focus({ preventScroll: true });
  }
  if (menu && nav) {
    menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('pointerdown', event => {
      if (!nav.contains(event.target) && !menu.contains(event.target)) setMenu(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
        setMenu(false, true);
      }
    });
    document.addEventListener('focusin', event => {
      if (!nav.contains(event.target) && !menu.contains(event.target)) setMenu(false);
    });
    const resizeMenu = () => setMenu(false);
    if (narrow.addEventListener) narrow.addEventListener('change', resizeMenu);
    else if (narrow.addListener) narrow.addListener(resizeMenu);
    root.classList.add('menu-ready');
  }

  const links = [...document.querySelectorAll('.nav-link')];
  const sections = links.map(link => document.getElementById(link.hash.slice(1))).filter(Boolean);
  let pending = false;
  function mark(id) {
    for (const link of links) {
      const current = link.hash === '#' + id;
      link.classList.toggle('active', current);
      if (current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }
  function updatePosition() {
    pending = false;
    if (!sections.length) return;
    const headerHeight = header?.getBoundingClientRect().height || 0;
    root.style.setProperty('--header-offset', `${headerHeight + 16}px`);
    const line = headerHeight + Math.min(120, innerHeight * 0.15);
    let active = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= line) active = section;
    }
    // The final section may never reach the reading line on a tall screen.
    const bottom = document.documentElement.scrollHeight - innerHeight;
    const last = sections[sections.length - 1];
    if (scrollY > 0 && scrollY >= bottom - 2 && last.getBoundingClientRect().top < innerHeight) active = last;
    mark(active.id);
  }
  function schedule() {
    if (!pending) { pending = true; requestAnimationFrame(updatePosition); }
  }
  for (const link of links) {
    link.addEventListener('click', () => {
      setMenu(false);
      mark(link.hash.slice(1));
      schedule(); // Native anchors keep history, reduced motion and keyboard behavior.
    });
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('hashchange', schedule);
  window.addEventListener('pageshow', () => { window.SiteTheme?.apply(); schedule(); });
  document.querySelectorAll('details').forEach(details => details.addEventListener('toggle', schedule));
  if ('ResizeObserver' in window && document.querySelector('main')) {
    const observer = new ResizeObserver(schedule);
    observer.observe(document.querySelector('main'));
    if (header) observer.observe(header);
  }
  document.fonts?.ready.then(schedule);
  schedule();

  const status = document.getElementById('status');
  const fallback = document.getElementById('copy-fallback');
  const copyValue = document.getElementById('copy-value');
  let lastCopyButton = null;
  let messageTimer;
  function announce(text) {
    if (!status) return;
    clearTimeout(messageTimer);
    status.textContent = text;
    status.classList.add('visible');
    messageTimer = setTimeout(() => status.classList.remove('visible'), 4000);
  }
  document.querySelectorAll('[data-copy]').forEach(button => {
    button.addEventListener('click', async () => {
      if (button.disabled) return;
      const value = button.dataset.copy || '';
      lastCopyButton = button;
      button.disabled = true;
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(value);
        if (fallback) fallback.hidden = true;
        announce(`${button.dataset.copyLabel || '文本'}已复制`);
      } catch (_) {
        if (fallback && copyValue) {
          fallback.hidden = false;
          copyValue.value = value;
          copyValue.focus();
          copyValue.select();
        }
        announce('浏览器未允许自动复制，请手动复制下方文本。');
      } finally { button.disabled = false; }
    });
  });
  document.getElementById('copy-close')?.addEventListener('click', () => {
    if (fallback) fallback.hidden = true;
    lastCopyButton?.focus();
  });
  root.classList.add('copy-ready');
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
