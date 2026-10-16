/* United Auto Tech: all animation lives here.
   GSAP + ScrollTrigger + SplitText + Lenis from vendor/.
   Nothing runs for visitors who ask for reduced motion, and if any library is missing
   the page simply shows as is (the inline failsafe in <head> also covers a missing file). */
(function () {
  'use strict';

  var html = document.documentElement;
  window.__motionReady = true;

  function release() { html.classList.remove('motion-pending', 'is-loading'); }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger, SplitText = window.SplitText;
  if (reduce || !gsap || !ScrollTrigger || !SplitText) { release(); return; }

  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var random = gsap.utils.random;
  var lenis = null;
  var treadTick = null;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------- Letter splitting (never right-to-left text) ---------- */

  var RTL = /[֐-ࣿיִ-﷿ﹰ-﻿]/;

  function canSplit(el) {
    return el && !el.closest('[dir="rtl"]') && !RTL.test(el.textContent);
  }

  /* Splits el into letters. Screen readers get one hidden copy of the plain text,
     and the letter pieces are hidden from them so words are not read letter by letter. */
  function splitLetters(el, skipLabel) {
    if (!canSplit(el)) return null;
    var text = el.textContent.replace(/\s+/g, ' ').trim();
    var split = SplitText.create(el, { type: 'words,chars', tag: 'span', wordsClass: 'word', charsClass: 'char', aria: 'none' });
    split.words.forEach(function (w) { w.setAttribute('aria-hidden', 'true'); });
    if (!skipLabel) {
      var sr = document.createElement('span');
      sr.className = 'visually-hidden';
      sr.textContent = text;
      el.insertBefore(sr, el.firstChild);
    }
    return split;
  }

  /* ---------- Smooth scrolling ---------- */

  function setupLenis() {
    if (!window.Lenis) return;
    lenis = new window.Lenis({ lerp: 0.11, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;
    document.addEventListener('book:open', function () { lenis.stop(); });
    document.addEventListener('book:close', function () { lenis.start(); });
  }

  /* ---------- Header: hide going down, back going up ---------- */

  function setupHeader() {
    var header = $('[data-header]');
    if (!header) return;
    var lastY = window.pageYOffset, travel = 0;
    function update(y) {
      var delta = y - lastY;
      lastY = y;
      if (y < 140) { header.classList.remove('is-hidden'); travel = 0; return; }
      travel = (delta > 0) === (travel > 0) ? travel + delta : delta;
      if (travel > 8) header.classList.add('is-hidden');
      else if (travel < -8) header.classList.remove('is-hidden');
    }
    if (lenis) lenis.on('scroll', function (l) { update(l.scroll); });
    else window.addEventListener('scroll', function () { update(window.pageYOffset); }, { passive: true });
  }

  /* ---------- Intro loader: gauge 0-100%, then the roll-up door lifts ---------- */

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function runLoader(onLift) {
    var loader = $('.loader');
    if (!loader) { html.classList.remove('is-loading'); onLift(); return; }
    var num = $('.loader__num', loader);
    var needle = $('.loader__needle', loader);
    var fill = $('.loader__arc--fill', loader);
    var gauge = $('.loader__gauge', loader);
    var count = { v: 0 };
    var fontsReady = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, wait(1500)]) : Promise.resolve();

    gsap.set(needle, { rotation: 0, svgOrigin: '100 110' });
    gsap.from(gauge, { scale: 0.85, autoAlpha: 0, duration: 0.4, ease: 'back.out(2)' });

    var gaugeDone = new Promise(function (resolve) {
      gsap.timeline({ onComplete: resolve })
        .to(count, {
          v: 100, duration: 1.5, ease: 'power2.inOut',
          onUpdate: function () { num.textContent = Math.round(count.v); }
        }, 0.15)
        .to(needle, { rotation: 180, svgOrigin: '100 110', duration: 1.5, ease: 'power2.inOut' }, 0.15)
        .to(fill, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, 0.15)
        .to(needle, { rotation: 170, svgOrigin: '100 110', duration: 0.12, yoyo: true, repeat: 1, ease: 'power1.inOut' });
    });

    Promise.all([gaugeDone, fontsReady]).then(function () {
      try { sessionStorage.setItem('uat-intro', '1'); } catch (e) {}
      gsap.timeline({
        onComplete: function () {
          html.classList.remove('is-loading');
          gsap.set([loader, gauge], { clearProps: 'all' });
        }
      })
        .to(gauge, { y: -40, autoAlpha: 0, duration: 0.35, ease: 'power2.in' })
        .to(loader, { yPercent: -100, duration: 1, ease: 'power3.inOut' }, '-=0.05')
        .add(onLift, '-=0.6');
    });
  }

  /* ---------- Hero ---------- */

  function buildHeroIntro() {
    var hero = $('.hero');
    var title = $('.hero__title');
    var lines = $$('.hero__line', title);
    var cards = $$('.stack-card');
    var sticker = $('[data-sticker]');

    var chars = [];
    if (canSplit(title)) {
      var sr = document.createElement('span');
      sr.className = 'visually-hidden';
      sr.textContent = lines.map(function (l) { return l.textContent.trim(); }).join(' ');
      lines.forEach(function (line) {
        var s = splitLetters(line, true);
        line.setAttribute('aria-hidden', 'true');
        if (s) chars = chars.concat(s.chars);
      });
      title.insertBefore(sr, title.firstChild);
    }

    var drops = [-34, 28, -20];
    var tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
    tl.from('.hero__eyebrow', { y: 24, autoAlpha: 0, duration: 0.5 }, 0)
      .from(chars, {
        yPercent: 120, scale: 0.2, rotation: function () { return random(-30, 30); }, autoAlpha: 0,
        duration: 0.9, ease: 'back.out(2.6)', stagger: 0.05
      }, 0.1)
      .from(cards, {
        y: function () { return -(window.innerHeight + 260); },
        rotation: function (i) { return drops[i % drops.length]; },
        duration: 1.15, ease: 'bounce.out', stagger: 0.17
      }, 0.15)
      .from(sticker, { scale: 0, rotation: -200, autoAlpha: 0, duration: 1.4, ease: 'elastic.out(1, 0.4)' }, 0.95)
      .from(['.hero__tagline', '.hero__ctas', '.hero__stats'], { y: 30, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, 0.7)
      .call(function () { followMouse(hero, cards.concat(sticker ? [sticker] : [])); });
    return tl;
  }

  /* Cards drift with the mouse, deeper ones further. */
  function followMouse(hero, els) {
    if (!finePointer || !hero) return;
    var movers = els.map(function (el) {
      return {
        depth: parseFloat(el.getAttribute('data-depth') || '1.9'),
        x: gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3' }),
        y: gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3' })
      };
    });
    hero.addEventListener('pointermove', function (e) {
      var nx = e.clientX / window.innerWidth - 0.5;
      var ny = e.clientY / window.innerHeight - 0.5;
      movers.forEach(function (m) { m.x(nx * 40 * m.depth); m.y(ny * 28 * m.depth); });
    });
    hero.addEventListener('pointerleave', function () {
      movers.forEach(function (m) { m.x(0); m.y(0); });
    });
  }

  /* ---------- Scroll reveals ---------- */

  function setupSectionTitles() {
    $$('.section-title').forEach(function (title) {
      var s = splitLetters(title);
      if (!s) return;
      gsap.from(s.chars, {
        yPercent: 90, rotation: function () { return random(-16, 16); }, autoAlpha: 0,
        duration: 0.75, ease: 'back.out(3.2)', stagger: 0.035,
        scrollTrigger: { trigger: title, start: 'top 88%', once: true }
      });
    });
    $$('.section-head .eyebrow, .section-lede').forEach(function (el) {
      gsap.from(el, { y: 22, autoAlpha: 0, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
  }

  function setupBoard() {
    var items = $$('.board__item');
    if (!items.length) return;
    gsap.set(items, { y: 56, autoAlpha: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 92%',
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', stagger: 0.08, overwrite: true });
      }
    });
    document.addEventListener('services:filter', function (e) {
      var shown = (e.detail && e.detail.items) || [];
      gsap.fromTo(shown, { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out', stagger: 0.05, overwrite: true });
      ScrollTrigger.refresh();
    });
  }

  function setupWall() {
    $$('.wall__tile').forEach(function (tile, i) {
      var fig = $('figure', tile);
      var art = $('.wall__art', tile);
      var tl = gsap.timeline({ scrollTrigger: { trigger: tile, start: 'top 88%', once: true }, delay: (i % 3) * 0.12 });
      tl.fromTo(fig,
        { clipPath: 'inset(100% 0% 0% 0% round 18px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1, ease: 'power4.inOut', immediateRender: true,
          onComplete: function () { gsap.set(fig, { clearProps: 'clipPath' }); } })
        .from(art, { scale: 1.5, rotation: -25, duration: 1.1, ease: 'power3.out' }, 0.25);
    });
    $$('.shop__foot').forEach(function (el) {
      gsap.from(el, { y: 30, autoAlpha: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    });
  }

  /* Cards toss in like they were thrown onto a bench. */
  function setupCards() {
    $$('[data-cards]').forEach(function (group) {
      var cards = Array.prototype.slice.call(group.children);
      gsap.from(cards, {
        y: 240, x: function () { return random(-140, 140); }, rotation: function () { return random(-30, 30); },
        autoAlpha: 0, duration: 1.1, ease: 'back.out(1.5)', stagger: 0.12,
        scrollTrigger: { trigger: group, start: 'top 86%', once: true }
      });
    });
    $$('.story__body > *').forEach(function (el) {
      gsap.from(el, { y: 30, autoAlpha: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
  }

  /* ---------- Tire-sidewall marquee: rolls on its own, spins up with scroll speed ---------- */

  function setupTread() {
    var treads = $$('[data-tread]').map(function (el) {
      var track = $('.tread__track', el);
      var run = track && track.children[0];
      var reverse = el.hasAttribute('data-tread-reverse');
      return { track: track, run: run, w: run ? run.offsetWidth : 0, sign: reverse ? 1 : -1, x: 0 };
    }).filter(function (t) { return t.run; });
    if (!treads.length) return;

    var boost = 0, dir = 1;
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: function (self) {
        dir = self.direction || 1;
        boost = Math.max(boost, Math.min(Math.abs(self.getVelocity()) / 110, 14));
      }
    });
    ScrollTrigger.addEventListener('refresh', function () {
      treads.forEach(function (t) { t.w = t.run.offsetWidth; });
    });
    treadTick = function (time, delta) {
      boost *= 0.92;
      var step = 64 * (1 + boost) * (Math.min(delta, 50) / 1000);
      treads.forEach(function (t) {
        t.x = gsap.utils.wrap(-t.w, 0, t.x + t.sign * dir * step);
        t.track.style.transform = 'translate3d(' + t.x.toFixed(2) + 'px,0,0)';
      });
    };
    gsap.ticker.add(treadTick);
  }

  /* ---------- Footer name: letters drop in, then hop when hovered ---------- */

  function setupFooterName() {
    var el = $('[data-footer-name]');
    var s = splitLetters(el);
    if (!s) return;
    gsap.from(s.chars, {
      yPercent: -170, rotation: function () { return random(-35, 35); }, autoAlpha: 0,
      duration: 1.2, ease: 'bounce.out', stagger: { each: 0.05, from: 'random' },
      scrollTrigger: { trigger: el, start: 'top 94%', once: true }
    });
    s.chars.forEach(function (ch) {
      ch.addEventListener('pointerenter', function () {
        if (gsap.isTweening(ch)) return;
        gsap.timeline()
          .to(ch, { y: '-0.24em', rotation: random(-14, 14), duration: 0.18, ease: 'power2.out' })
          .to(ch, { y: 0, rotation: 0, duration: 0.7, ease: 'bounce.out' });
      });
    });
  }

  /* ---------- Buttons lean toward the cursor ---------- */

  function setupMagnetic() {
    if (!finePointer) return;
    $$('[data-magnetic]').forEach(function (btn) {
      var xTo = gsap.quickTo(btn, 'x', { duration: 0.45, ease: 'power3' });
      var yTo = gsap.quickTo(btn, 'y', { duration: 0.45, ease: 'power3' });
      var rTo = gsap.quickTo(btn, 'rotation', { duration: 0.45, ease: 'power3' });
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        xTo(dx * 0.28); yTo(dy * 0.4); rTo(dx * 0.05);
      });
      btn.addEventListener('pointerleave', function () { xTo(0); yTo(0); rTo(0); });
    });
  }

  /* ---------- Start ---------- */

  /* Letters are split only once the web fonts are in (or after 1.5 s at most),
     so each letter is measured in the right face. The loader keeps running meanwhile. */
  function init() {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    html.classList.add('motion-on');
    setupLenis();
    setupHeader();
    setupTread();
    setupMagnetic();

    var showLoader = html.classList.contains('is-loading');
    var fontsReady = document.fonts && document.fonts.ready
      ? Promise.race([document.fonts.ready, wait(1500)])
      : Promise.resolve();

    var introReady = fontsReady.then(function () {
      try {
        var intro = buildHeroIntro();
        html.classList.remove('motion-pending');
        setupSectionTitles();
        setupBoard();
        setupWall();
        setupCards();
        setupFooterName();
        ScrollTrigger.refresh();
        /* Wrapped: a GSAP timeline has .then(), so returning it bare would make this
           promise wait for the (paused) intro to finish. */
        return { intro: intro };
      } catch (err) {
        fail(err);
        return null;
      }
    });

    function play() { introReady.then(function (ready) { if (ready) ready.intro.play(); }); }

    if (showLoader) {
      if (lenis) lenis.stop();
      runLoader(function () {
        if (lenis) lenis.start();
        play();
      });
    } else {
      play();
    }

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  /* Something went wrong: undo every animation state and show the page as written. */
  function fail(err) {
    html.classList.remove('motion-on');
    if (treadTick) gsap.ticker.remove(treadTick);
    ScrollTrigger.getAll().forEach(function (st) { st.kill(); });
    gsap.globalTimeline.getChildren(true, true, true).forEach(function (t) { t.kill(); });
    gsap.set($$('.hero *, .board__item, .wall__tile, .wall__tile *, [data-cards] > *, .section-head *, .story__body > *, .shop__foot, .loader, .loader *, .tread__track'), { clearProps: 'all' });
    if (lenis) { lenis.destroy(); window.__lenis = null; }
    release();
    if (window.console && console.warn) console.warn('motion.js disabled:', err);
  }

  try {
    init();
  } catch (err) {
    fail(err);
  }
})();
