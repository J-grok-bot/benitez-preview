(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Entrance
  requestAnimationFrame(function () { requestAnimationFrame(function () { doc.classList.add('loaded'); }); });

  // Hero video: load sources only when motion is OK and connection isn't data-saver
  var hv = document.querySelector('.hero-video');
  var saveData = navigator.connection && navigator.connection.saveData;
  if (hv) {
    if (!reduce && !saveData) {
      hv.querySelectorAll('source[data-src]').forEach(function (s) { s.src = s.getAttribute('data-src'); });
      hv.load();
      var p = hv.play(); if (p && p.catch) p.catch(function () {});
    } else {
      hv.removeAttribute('autoplay');
    }
  }

  // Nav: scrolled state, mobile menu, active link
  var nav = document.getElementById('top-nav');
  var toggle = nav.querySelector('.nav-toggle');
  function setOpen(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  toggle.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
  nav.querySelectorAll('.nav-links a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) setOpen(false); });

  var links = {};
  nav.querySelectorAll('.nav-links a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && links[en.target.id]) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); });
          if (!links[en.target.id].classList.contains('nav-cta')) links[en.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) secObs.observe(s); });
  }

  // Scroll reveals (staggered within a parent)
  var reveals = [].slice.call(document.querySelectorAll('.reveal'));
  if (!reduce && 'IntersectionObserver' in window) {
    var rObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var sibs = [].slice.call(en.target.parentNode.children).filter(function (c) { return c.classList.contains('reveal'); });
          en.target.style.setProperty('--rd', (Math.max(0, sibs.indexOf(en.target)) % 5) * 0.09 + 's');
          en.target.classList.add('in');
          rObs.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { rObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // Parallax + nav state (single rAF loop on scroll)
  var px = reduce ? [] : [].slice.call(document.querySelectorAll('[data-parallax]'));
  var ticking = false;
  function onScroll() {
    var y = window.scrollY, vh = window.innerHeight;
    nav.classList.toggle('scrolled', y > 40);
    px.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0;
      var offset = (r.top + r.height / 2 - vh / 2) * -speed;
      el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
    });
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // Feature video play overlay
  var vf = document.querySelector('.video-frame');
  if (vf) {
    var v = vf.querySelector('video'), pb = vf.querySelector('.video-play');
    v.removeAttribute('controls');
    pb.addEventListener('click', function () { v.setAttribute('controls', ''); v.preload = 'auto'; v.play(); });
    v.addEventListener('play', function () { vf.classList.add('playing'); if (hv) hv.pause(); });
    v.addEventListener('pause', function () { vf.classList.remove('playing'); });
  }

  // Lightbox
  var lb = document.getElementById('lightbox');
  var items = [].slice.call(document.querySelectorAll('.g-open'));
  var idx = 0, lastFocus = null;
  var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('figcaption');
  function show(i) {
    idx = (i + items.length) % items.length;
    var it = items[idx];
    lbImg.src = it.getAttribute('data-full');
    lbImg.alt = it.querySelector('img').alt;
    lbCap.textContent = it.getAttribute('data-caption');
  }
  function openLb(i) {
    lastFocus = document.activeElement; show(i);
    lb.hidden = false; document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { lb.classList.add('show'); });
    lb.querySelector('.lb-close').focus();
  }
  function closeLb() {
    lb.classList.remove('show'); document.body.style.overflow = '';
    setTimeout(function () { lb.hidden = true; }, reduce ? 0 : 350);
    if (lastFocus) lastFocus.focus();
  }
  items.forEach(function (b, i) { b.addEventListener('click', function () { openLb(i); }); });
  lb.querySelector('.lb-close').addEventListener('click', closeLb);
  lb.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
  lb.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowRight') show(idx + 1);
    else if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === 'Tab') { // simple focus trap
      var f = lb.querySelectorAll('button'), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  var tx = null;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (tx === null) return; var dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); tx = null;
  });

  // "Inquire about lessons" preselects the subject
  document.querySelectorAll('[data-subject]').forEach(function (a) {
    a.addEventListener('click', function () {
      var r = document.querySelector('input[name="subject"][value="' + a.getAttribute('data-subject') + '"]');
      if (r) r.checked = true;
    });
  });

  // Contact form: Formspree if data-endpoint is set, otherwise mailto fallback
  var form = document.getElementById('contact-form');
  if (form) {
    var status = form.querySelector('.form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (el) {
        var bad = !el.value.trim() || (el.type === 'email' && !/^\S+@\S+\.\S+$/.test(el.value));
        el.closest('.field').classList.toggle('invalid', bad);
        if (bad && ok) { el.focus(); ok = false; }
      });
      if (!ok) { status.textContent = 'Please fill in your name, a valid email, and a message.'; return; }
      if (form._gotcha && form._gotcha.value) return;
      var data = new FormData(form);
      var endpoint = form.getAttribute('data-endpoint');
      if (endpoint) {
        status.textContent = 'Sending…';
        fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
          .then(function (r) { if (!r.ok) throw new Error(); form.reset(); status.textContent = 'Thank you! Your message has been sent.'; })
          .catch(function () { status.textContent = 'Sorry, something went wrong. Please email frankie@benitez.studio directly.'; });
      } else {
        var subject = data.get('subject') + ' inquiry from ' + data.get('name');
        var body = data.get('message') + '\n\n— ' + data.get('name') + '\n' + data.get('email');
        window.location.href = 'mailto:' + form.getAttribute('data-mailto') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        status.textContent = 'Opening your email app…';
      }
    });
  }

  var yr = document.getElementById('year'); if (yr) yr.textContent = new Date().getFullYear();
})();
