/* QCYA — progressive enhancement, no framework or compulsory network requests */
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
    ['home','about','projects','music','contact'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  var filterButtons = document.querySelectorAll('.filter-button');
  var cards = document.querySelectorAll('.project-card');
  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var filter = button.getAttribute('data-filter');
      filterButtons.forEach(function (other) {
        var selected = other === button;
        other.classList.toggle('active', selected);
        other.setAttribute('aria-pressed', String(selected));
      });
      cards.forEach(function (card) {
        card.hidden = filter !== 'all' && card.getAttribute('data-category') !== filter;
      });
    });
  });

  var quotes = [
    '愿每个奇思妙想，都有被实现的一天。',
    '今天也要保持一点点好奇心。',
    '代码会报错，灵感不会白费。',
    '每次按下运行，都是新的冒险。',
    '世界很大，慢慢探索也没关系。'
  ];
  var quoteIndex = 0;
  document.getElementById('quote-next').addEventListener('click', function () {
    quoteIndex = (quoteIndex + 1) % quotes.length;
    document.getElementById('quote-text').textContent = quotes[quoteIndex];
  });
  document.getElementById('year').textContent = String(new Date().getFullYear());

  // Load legacy playlist only on explicit action. The static site works offline.
  var musicButton = document.getElementById('music-load');
  var musicStatus = document.getElementById('music-status');
  var playerContainer = document.getElementById('aplayer-inner');
  var record = document.querySelector('.record');
  var player = null;
  musicButton.addEventListener('click', async function () {
    if (player) {
      player.audio.paused ? player.play() : player.pause();
      return;
    }
    musicButton.disabled = true;
    musicButton.textContent = '正在读取歌单…';
    musicStatus.textContent = '尝试从旧站使用的 Meting 服务读取网易云歌单。';
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 9000);
    try {
      if (typeof window.APlayer !== 'function') {
        await new Promise(function (resolve, reject) {
          var script = document.createElement('script');
          script.src = 'static/APlayer-1.10.1/dist/APlayer.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      var url = 'https://api.mizore.cn/meting/api.php?server=netease&type=playlist&id=3778678';
      var response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      var tracks = await response.json();
      if (!Array.isArray(tracks) || !tracks.length) throw new Error('empty playlist');
      var songs = tracks.filter(function (track) {
        return track && typeof track.url === 'string' && (track.name || track.title);
      }).map(function (track) {
        return { name: track.name || track.title, artist: track.artist || '未知歌手', url: track.url,
          cover: track.pic || track.cover || '', lrc: track.lrc || '' };
      });
      if (!songs.length) throw new Error('no playable tracks');
      player = new window.APlayer({
        container: playerContainer, audio: songs, autoplay: false,
        volume: 0.6, order: 'random', loop: 'all', listFolded: true,
        lrcType: 3, preload: 'metadata'
      });
      player.on('play', function () { record.classList.add('is-playing'); });
      player.on('pause', function () { record.classList.remove('is-playing'); });
      player.on('ended', function () { record.classList.remove('is-playing'); });
      musicButton.textContent = '播放 / 暂停 ♫';
      musicStatus.textContent = '歌单已载入。是否播放，由你决定。';
    } catch (error) {
      musicButton.textContent = '重新尝试载入 ♫';
      musicStatus.textContent = '暂时无法载入旧歌单（接口或版权限制），其他页面功能不受影响。';
      console.warn('Legacy playlist unavailable:', error);
    } finally {
      clearTimeout(timeout);
      musicButton.disabled = false;
    }
  });
})();
