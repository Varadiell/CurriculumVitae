/* ==========================================================================
   Resume runtime — language, theme, live dates, motion. No dependency.
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Search state (declared early: translate() clears highlights) ---------- */

  var pageEl = document.querySelector('.page');
  var searchBar = document.getElementById('searchBar');
  var searchInput = document.getElementById('searchInput');
  var searchCount = document.getElementById('searchCount');
  var searchTerm = '';
  var hits = [];
  var hitIndex = 0;

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
    // the button shows the language currently in use
    if (langLabel) { langLabel.textContent = lang.toUpperCase(); }
  }

  function setLang(lang, animate) {
    try { localStorage.setItem('cv-lang', lang); } catch (e) { /* private mode */ }
    if (animate && !reduced) {
      document.body.classList.add('lang-swap');
      window.setTimeout(function () {
        retranslate(lang);
        document.body.classList.remove('lang-swap');
      }, 180);
    } else {
      retranslate(lang);
    }
  }

  function currentLang() {
    return root.lang === 'fr' ? 'fr' : 'en';
  }

  function dict(key) {
    var table = window.I18N[currentLang()] || window.I18N.en;
    return table[key] || '';
  }

  // highlights live inside the very nodes translate() rewrites
  function retranslate(lang) {
    var pending = searchTerm;
    clearSearch();
    translate(lang);
    if (pending) { applySearch(pending); }
  }

  function toggleLang() {
    setLang(currentLang() === 'fr' ? 'en' : 'fr', true);
  }

  if (langBtn) { langBtn.addEventListener('click', toggleLang); }

  translate(currentLang());

  /* ---------- Theme ---------- */

  var themeSwapTimer = 0;

  function setTheme(theme) {
    if (!reduced) {
      root.classList.add('theme-switching');
      window.clearTimeout(themeSwapTimer);
      themeSwapTimer = window.setTimeout(function () {
        root.classList.remove('theme-switching');
      }, 500);
    }

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

  /* ---------- Hero arrow ---------- */

  var scrollHint = document.querySelector('.scroll-hint');
  if (scrollHint) {
    scrollHint.addEventListener('click', function (event) {
      var target = document.querySelector(scrollHint.getAttribute('href'));
      if (!target) { return; }
      event.preventDefault();
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });
  }

  /* ---------- Print ---------- */

  var printBtn = document.getElementById('printBtn');
  if (printBtn) { printBtn.addEventListener('click', function () { window.print(); }); }

  /* ---------- Keyboard shortcuts ---------- */

  document.addEventListener('keydown', function (event) {
    if (event.metaKey || event.ctrlKey || event.altKey) { return; }

    var typing = /^(input|textarea|select)$/i.test(event.target.tagName);
    var key = event.key.toLowerCase();

    if (typing) {
      if (key === 'escape') { setQuery(''); event.target.blur(); }
      return;
    }

    if (key === '/') { event.preventDefault(); if (searchInput) { searchInput.focus(); } return; }
    if (key === 'escape') { setQuery(''); return; }
    if (key === 'l') { toggleLang(); }
    if (key === 't') { setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'); }
    if (key === 'p') { window.print(); }
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
    var rgbTarget = rgb.slice();
    var maxDist = 148;

    function tint() {
      var raw = getComputedStyle(root).getPropertyValue('--net').trim() || '183, 155, 255';
      return raw.split(',').map(function (part) { return parseFloat(part) || 0; });
    }

    function stroke(alpha) {
      return 'rgba(' + Math.round(rgb[0]) + ',' + Math.round(rgb[1]) + ',' + Math.round(rgb[2]) + ',' + alpha + ')';
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

      for (var t = 0; t < 3; t++) { rgb[t] += (rgbTarget[t] - rgb[t]) * 0.08; }

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
          ctx.strokeStyle = stroke((0.22 * (1 - dist / maxDist)).toFixed(3));
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }

        ctx.fillStyle = stroke(0.55);
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function refreshTint() {
      window.setTimeout(function () { rgbTarget = tint(); }, 60);
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


  /* ---------- Search, and badges that search for themselves ----------
     One mechanism serves both: typing highlights every occurrence and dims
     the rows that hold none; clicking a technology badge runs the same
     query so its twins light up across the whole resume.                  */

  var DIMMABLE = '.chip, .pills li, .tl, .edu__item';
  var FOLDED = 'àáâäãçèéêëìíîïñòóôöõùúûüýÿ';
  var PLAIN = 'aaaaaceeeeiiiinooooouuuuyy';

  function fold(text) {
    return text.toLowerCase().replace(/[^\u0000-\u007f]/g, function (ch) {
      var i = FOLDED.indexOf(ch);
      return i === -1 ? ch : PLAIN.charAt(i);
    });
  }

  function clearSearch() {
    var marks = document.querySelectorAll('mark.hit');
    for (var i = 0; i < marks.length; i++) {
      var parent = marks[i].parentNode;
      parent.replaceChild(document.createTextNode(marks[i].textContent), marks[i]);
      parent.normalize();
    }
    var dimmed = document.querySelectorAll('.is-dim');
    for (var j = 0; j < dimmed.length; j++) { dimmed[j].classList.remove('is-dim'); }
    hits = [];
    hitIndex = 0;
  }

  function paintCount() {
    if (!searchBar || !searchCount) { return; }

    var label = '';
    if (searchTerm.length >= 2) {
      label = hits.length ? (hitIndex + 1) + '/' + hits.length : dict('search.none');
    }

    searchBar.classList.toggle('has-query', searchTerm.length > 0);
    searchCount.textContent = label;

    // width animates only between two lengths, so measure the text we just set
    searchCount.style.width = label ? searchCount.scrollWidth + 'px' : '0px';
    searchBar.classList.toggle('has-count', !!label);
  }

  function focusHit(index, scroll) {
    if (!hits.length) { paintCount(); return; }
    for (var i = 0; i < hits.length; i++) { hits[i].classList.remove('is-active'); }
    hitIndex = (index % hits.length + hits.length) % hits.length;
    var target = hits[hitIndex];
    target.classList.add('is-active');
    if (scroll) {
      target.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
    }
    paintCount();
  }

  function applySearch(term) {
    clearSearch();
    searchTerm = term;

    if (!pageEl || term.length < 2) { paintCount(); return; }

    var needle = fold(term);
    var walker = document.createTreeWalker(pageEl, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) {
      if (walker.currentNode.nodeValue.trim()) { nodes.push(walker.currentNode); }
    }

    nodes.forEach(function (node) {
      var haystack = fold(node.nodeValue);
      var starts = [];
      var from = 0;
      var at;
      while ((at = haystack.indexOf(needle, from)) !== -1) {
        starts.push(at);
        from = at + needle.length;
      }
      if (!starts.length) { return; }

      var fragment = document.createDocumentFragment();
      var cursor = 0;
      starts.forEach(function (start) {
        if (start > cursor) {
          fragment.appendChild(document.createTextNode(node.nodeValue.slice(cursor, start)));
        }
        var mark = document.createElement('mark');
        mark.className = 'hit';
        mark.textContent = node.nodeValue.substr(start, needle.length);
        fragment.appendChild(mark);
        cursor = start + needle.length;
      });
      if (cursor < node.nodeValue.length) {
        fragment.appendChild(document.createTextNode(node.nodeValue.slice(cursor)));
      }
      node.parentNode.replaceChild(fragment, node);
    });

    hits = [].slice.call(pageEl.querySelectorAll('mark.hit'));

    var rows = pageEl.querySelectorAll(DIMMABLE);
    for (var i = 0; i < rows.length; i++) {
      if (!rows[i].querySelector('mark.hit')) { rows[i].classList.add('is-dim'); }
    }

    focusHit(0, false);
  }

  function setQuery(term, scroll) {
    if (searchInput) { searchInput.value = term; }
    applySearch(term.trim());
    if (scroll && hits.length) { focusHit(0, true); }
  }

  if (searchInput) {
    var debounce = 0;
    searchInput.addEventListener('input', function () {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(function () {
        applySearch(searchInput.value.trim());
      }, 120);
    });
  }

  if (searchBar) {
    searchBar.addEventListener('submit', function (event) {
      event.preventDefault();
      focusHit(hitIndex + 1, true);
    });
  }

  var prevBtn = document.getElementById('searchPrev');
  var nextBtn = document.getElementById('searchNext');
  var clearBtn = document.getElementById('searchClear');

  if (prevBtn) { prevBtn.addEventListener('click', function () { focusHit(hitIndex - 1, true); }); }
  if (nextBtn) { nextBtn.addEventListener('click', function () { focusHit(hitIndex + 1, true); }); }
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      setQuery('');
      if (searchInput) { searchInput.focus(); }
    });
  }

  /* badges act as saved queries */
  if (pageEl) {
    var badges = pageEl.querySelectorAll('.chip');
    for (var b = 0; b < badges.length; b++) {
      badges[b].setAttribute('role', 'button');
      badges[b].setAttribute('tabindex', '0');
    }

    function queryFromBadge(badge) {
      var label = badge.textContent.trim();
      setQuery(fold(searchTerm) === fold(label) ? '' : label, false);
    }

    pageEl.addEventListener('click', function (event) {
      var badge = event.target.closest ? event.target.closest('.chip') : null;
      if (badge) { queryFromBadge(badge); }
    });

    pageEl.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') { return; }
      var badge = event.target.closest ? event.target.closest('.chip') : null;
      if (!badge) { return; }
      event.preventDefault();
      queryFromBadge(badge);
    });
  }

})();