/* Runs before CSS. Failure to access storage never prevents rendering. */
(() => {
  'use strict';
  const key = 'qcya-theme'; // Reuse previous preferences rather than reset them.
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const normalize = value => ['light', 'dark', 'system'].includes(value) ? value : 'system';
  let mode = 'system';
  try { mode = normalize(localStorage.getItem(key)); } catch (_) { /* Private/restricted context. */ }

  function apply() {
    const theme = mode === 'system' ? (system.matches ? 'dark' : 'light') : mode;
    root.dataset.theme = theme;
    root.dataset.themeMode = mode;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#111525' : '#fafbff';
    document.dispatchEvent(new CustomEvent('site:theme', { detail: { mode, theme } }));
  }
  function set(value) {
    mode = normalize(value);
    try { localStorage.setItem(key, mode); } catch (_) { /* Keep in-memory selection. */ }
    apply();
  }
  const changed = () => { if (mode === 'system') apply(); };
  if (system.addEventListener) system.addEventListener('change', changed);
  else if (system.addListener) system.addListener(changed);
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) {
      mode = normalize(event.newValue);
      apply();
    }
  });
  window.SiteTheme = { set, apply };
  apply();
})();
