/* ==========================================================================
   Resume runtime — language, theme, live dates, motion. No dependency.
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Language ---------- */

  var langBtn = document.getElementById('langBtn');
  var langLabel = document.getElementById('langLabel');

  function translate(lang) {
    var dict = window.I18N[lang] || window.I18N.en;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var value = dict[el.getAttribute('data-i18n')];
      if (value !== undefined) { el.textContent = value; }
    });

    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var parts = pair.split(':');
        var value = dict[parts[1]];
        if (parts[0] && value !== undefined) { el.setAttribute(parts[0].trim(), value); }
      });
    });

    root.lang = lang;
    // the button advertises the language it switches to
    if (langLabel) { langLabel.textContent = lang === 'fr' ? 'EN' : 'FR'; }
  }

  function setLang(lang, animate) {
    try { localStorage.setItem('cv-lang', lang); } catch (e) { /* private mode */ }
    if (animate && !reduced) {
      document.body.classList.add('lang-swap');
      window.setTimeout(function () {
        translate(lang);
        document.body.classList.remove('lang-swap');
      }, 180);
    } else {
      translate(lang);
    }
  }

  function currentLang() {
    return root.lang === 'fr' ? 'fr' : 'en';
  }

  function toggleLang() {
    setLang(currentLang() === 'fr' ? 'en' : 'fr', true);
  }

  if (langBtn) { langBtn.addEventListener('click', toggleLang); }

  translate(currentLang());

  /* ---------- Theme ---------- */

  function setTheme(theme) {
    root.dataset.theme = theme;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) { meta.content = theme === 'dark' ? '#0b0517' : '#f4f1fb'; }
    try { localStorage.setItem('cv-theme', theme); } catch (e) { /* private mode */ }
  }

  var themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
    });
  }

  /* ---------- Print ---------- */

  var printBtn = document.getElementById('printBtn');
  if (printBtn) { printBtn.addEventListener('click', function () { window.print(); }); }

  /* ---------- Keyboard shortcuts ---------- */

  document.addEventListener('keydown', function (event) {
    if (event.metaKey || event.ctrlKey || event.altKey) { return; }
    var key = event.key.toLowerCase();
    if (key === 'l') { toggleLang(); }
    if (key === 't') { setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'); }
  });

  /* ---------- Live dates ---------- */

  function yearsSince(year, month, day) {
    var from = new Date(year, month - 1, day);
    var now = new Date();
    var years = now.getFullYear() - from.getFullYear();
    var monthDelta = now.getMonth() - from.getMonth();
    if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < from.getDate())) { years--; }
    return years;
  }

  var ageEl = document.getElementById('ageCount');
  var xpEl = document.getElementById('xpCount');
  var yearEl = document.getElementById('year');

  if (ageEl) { ageEl.textContent = yearsSince(1993, 3, 20); }
  if (xpEl) { xpEl.textContent = yearsSince(2014, 11, 1); }
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ---------- Reveal on scroll ---------- */

  var revealables = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window && !reduced) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    revealables.forEach(function (el) { observer.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Scroll progress ---------- */

  var progress = document.querySelector('.scroll-progress span');
  if (progress) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) { return; }
      ticking = true;
      requestAnimationFrame(function () {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Constellation background ----------
     Lightweight successor to the old three.js / Vanta NET effect: ~60 nodes,
     linked when close, gently pushed away by the pointer.                    */

  var canvas = document.getElementById('constellation');

  if (canvas && !reduced) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var nodes = [];
    var pointer = { x: -999, y: -999 };
    var width = 0;
    var height = 0;
    var frame = 0;
    var running = false;
    var rgb = tint();
    var maxDist = 148;

    function tint() {
      return getComputedStyle(root).getPropertyValue('--net').trim() || '183, 155, 255';
    }

    function stop() {
      running = false;
      cancelAnimationFrame(frame);
      ctx.clearRect(0, 0, width, height);
    }

    function start() {
      if (running) { return; }
      running = true;
      frame = requestAnimationFrame(draw);
    }

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;

      if (width < 760 || height < 320) { nodes = []; stop(); return; }

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var count = Math.min(80, Math.round((width * height) / 22000));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22
        });
      }
      start();
    }

    function draw() {
      frame = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, width, height);

      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) { node.vx *= -1; }
        if (node.y < 0 || node.y > height) { node.vy *= -1; }

        var dxp = node.x - pointer.x;
        var dyp = node.y - pointer.y;
        var dp = Math.hypot(dxp, dyp);
        if (dp < 130 && dp > 0.1) {
          node.x += (dxp / dp) * 0.9;
          node.y += (dyp / dp) * 0.9;
        }

        for (var j = i + 1; j < nodes.length; j++) {
          var other = nodes[j];
          var dx = node.x - other.x;
          var dy = node.y - other.y;
          var dist = Math.hypot(dx, dy);
          if (dist > maxDist) { continue; }
          ctx.strokeStyle = 'rgba(' + rgb + ',' + (0.22 * (1 - dist / maxDist)).toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }

        ctx.fillStyle = 'rgba(' + rgb + ',0.55)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function refreshTint() {
      window.setTimeout(function () { rgb = tint(); }, 60);
    }

    window.addEventListener('pointermove', function (event) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    }, { passive: true });

    window.addEventListener('resize', resize);

    // The pane can be hidden (zero-sized) at load time: observe real size changes.
    if ('ResizeObserver' in window) { new ResizeObserver(resize).observe(canvas); }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { cancelAnimationFrame(frame); running = false; }
      else { start(); }
    });

    if (themeBtn) { themeBtn.addEventListener('click', refreshTint); }
    document.addEventListener('keydown', function (event) {
      if (event.key && event.key.toLowerCase() === 't') { refreshTint(); }
    });

    resize();
  }

})();
