/* United Auto Tech: everything that is not animation.
   Location switcher, Book popup, service filters, copy address, open-now status,
   smooth in-page links. The page reads fine without this file; it only adds to it. */
(function () {
  'use strict';

  var dataEl = document.getElementById('site-data');
  var data;
  try { data = JSON.parse(dataEl.textContent); } catch (e) { return; }
  var locations = data.locations || [];
  if (!locations.length) return;

  var STORE_KEY = 'uat-location';
  var DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  var DAY_NAMES = { sun: 'Sunday', mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday' };
  var TIME_ZONE = 'America/Los_Angeles';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Booking channels shown in the popup. Any with an empty link in the site data stay hidden;
     calling the shop is always listed. */
  var BOOKING_APPS = [
    { key: 'online', label: 'Book online', sub: 'Pick a time on the booking page', mark: 'calendar' },
    { key: 'google', label: 'Google', sub: 'Book through Google', mark: 'G' },
    { key: 'yelp', label: 'Yelp', sub: 'Request a quote on Yelp', mark: 'Y' },
    { key: 'sms', label: 'Text the shop', sub: 'Send a text message', mark: 'chat', scheme: 'sms:' }
  ];

  var ICONS = {
    calendar: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><path d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 7 7L16 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z"/></svg>',
    chat: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></svg>'
  };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function storeGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function storeSet(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }

  function findLocation(id) {
    for (var i = 0; i < locations.length; i++) if (locations[i].id === id) return locations[i];
    return null;
  }

  var current = findLocation(storeGet(STORE_KEY)) || locations[0];

  /* ---------- Addresses and maps ---------- */

  var isAppleMobile = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  function fullAddress(loc) { return loc.street + ', ' + loc.city + ', ' + loc.region + ' ' + loc.zip; }

  function directionsUrl(address) {
    var q = encodeURIComponent(address);
    return isAppleMobile
      ? 'https://maps.apple.com/?daddr=' + q
      : 'https://www.google.com/maps/dir/?api=1&destination=' + q;
  }

  function textFor(loc, key) {
    switch (key) {
      case 'label': return loc.name + ', ' + loc.area;
      case 'name': return loc.name;
      case 'phone': return loc.phone;
      case 'street': return loc.street;
      case 'city': return loc.city + ', ' + loc.region + ' ' + loc.zip;
      case 'address': return fullAddress(loc);
      case 'business': return data.business;
      default: return null;
    }
  }

  /* ---------- Hours ---------- */

  function nowInShopTime() {
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: TIME_ZONE, weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
    }).formatToParts(new Date());
    var out = {};
    parts.forEach(function (p) { out[p.type] = p.value; });
    return {
      day: out.weekday.slice(0, 3).toLowerCase(),
      minutes: (parseInt(out.hour, 10) % 24) * 60 + parseInt(out.minute, 10)
    };
  }

  function toMinutes(hhmm) { var p = hhmm.split(':'); return parseInt(p[0], 10) * 60 + parseInt(p[1], 10); }

  function prettyTime(hhmm) {
    var m = toMinutes(hhmm), h = Math.floor(m / 60), min = m % 60;
    var suffix = h >= 12 ? 'pm' : 'am';
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (min ? ':' + String(min).padStart(2, '0') : '') + ' ' + suffix;
  }

  /* Returns { open: bool, text: "Open now until 5 pm" | "Closed · opens tomorrow 9 am" } */
  function openStatus(loc) {
    var now = nowInShopTime();
    var today = loc.hours[now.day];
    if (today && now.minutes >= toMinutes(today[0]) && now.minutes < toMinutes(today[1])) {
      return { open: true, text: 'Open now until ' + prettyTime(today[1]) };
    }
    if (today && now.minutes < toMinutes(today[0])) {
      return { open: false, text: 'Closed · opens today ' + prettyTime(today[0]) };
    }
    var idx = DAYS.indexOf(now.day);
    for (var i = 1; i <= 7; i++) {
      var key = DAYS[(idx + i) % 7];
      var h = loc.hours[key];
      if (h) {
        var when = i === 1 ? 'tomorrow' : DAY_NAMES[key];
        return { open: false, text: 'Closed · opens ' + when + ' ' + prettyTime(h[0]) };
      }
    }
    return { open: false, text: 'Call for hours' };
  }

  function paintStatus() {
    var status = openStatus(current);
    $$('[data-open-status]').forEach(function (el) { el.textContent = status.text; });
    $$('[data-open-status-dialog]').forEach(function (el) { el.textContent = status.text; });

    var today = nowInShopTime().day;
    $$('[data-loc-card]').forEach(function (card) {
      var loc = findLocation(card.getAttribute('data-loc-card'));
      if (!loc) return;
      var st = openStatus(loc);
      var badge = $('[data-open-status-card]', card);
      if (badge) {
        badge.textContent = st.text;
        badge.classList.toggle('is-open', st.open);
        badge.classList.toggle('is-closed', !st.open);
      }
      $$('tr[data-day]', card).forEach(function (row) {
        var isToday = row.getAttribute('data-day') === today;
        row.classList.toggle('is-today', isToday);
        if (isToday) row.setAttribute('aria-current', 'date'); else row.removeAttribute('aria-current');
      });
    });
  }

  /* ---------- Applying a location ---------- */

  function applyLocation(loc) {
    current = loc;
    $$('[data-loc-text]').forEach(function (el) {
      var value = textFor(loc, el.getAttribute('data-loc-text'));
      if (value != null) el.textContent = value;
    });
    $$('[data-loc-href]').forEach(function (el) {
      var kind = el.getAttribute('data-loc-href');
      if (kind === 'call') el.href = 'tel:' + loc.tel;
      if (kind === 'directions') el.href = directionsUrl(fullAddress(loc));
    });
    $$('[data-loc-card]').forEach(function (card) {
      card.classList.toggle('is-selected', card.getAttribute('data-loc-card') === loc.id && locations.length > 1);
    });
    var select = $('#loc-select');
    if (select) select.value = loc.id;
    paintStatus();
    renderBookList();
  }

  function chooseLocation(id, announce) {
    var loc = findLocation(id);
    if (!loc) return;
    storeSet(STORE_KEY, loc.id);
    applyLocation(loc);
    if (announce) toast('Showing ' + loc.name + ', ' + loc.area);
  }

  /* With two or more locations the header label becomes a picker. */
  function buildSwitcher() {
    var wrap = $('[data-loc-switch]');
    if (!wrap || locations.length < 2) return;
    var label = document.createElement('label');
    label.className = 'visually-hidden';
    label.setAttribute('for', 'loc-select');
    label.textContent = 'Choose a location';
    var select = document.createElement('select');
    select.id = 'loc-select';
    locations.forEach(function (loc) {
      var opt = document.createElement('option');
      opt.value = loc.id;
      opt.textContent = loc.name + ', ' + loc.area;
      select.appendChild(opt);
    });
    select.addEventListener('change', function () { chooseLocation(select.value, true); });
    var stat = $('.loc-switch__static', wrap);
    if (stat) {
      stat.parentNode.insertBefore(label, stat);
      stat.replaceWith(select);
    } else {
      wrap.appendChild(label);
      wrap.appendChild(select);
    }
    wrap.classList.add('loc-switch--picker');
  }

  /* Directions links that point at one fixed address (the location cards). */
  function wireFixedDirections() {
    $$('[data-directions]').forEach(function (el) {
      el.href = directionsUrl(el.getAttribute('data-directions'));
    });
  }

  /* ---------- Book popup ---------- */

  var dialog = $('#book-dialog');
  var bookList = $('[data-book-list]');

  function appRow(href, iconHtml, title, sub, extraClass, external) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.className = 'book__app' + (extraClass ? ' ' + extraClass : '');
    a.href = href;
    if (external) { a.target = '_blank'; a.rel = 'noopener'; }
    a.innerHTML =
      '<span class="book__app-icon" aria-hidden="true">' + iconHtml + '</span>' +
      '<span class="book__app-text"><strong></strong><span></span></span>' +
      '<span class="book__app-go" aria-hidden="true">&rarr;</span>';
    a.querySelector('strong').textContent = title;
    a.querySelector('.book__app-text span').textContent = sub;
    li.appendChild(a);
    return li;
  }

  function renderBookList() {
    if (!bookList) return;
    bookList.textContent = '';
    var booking = current.booking || {};
    BOOKING_APPS.forEach(function (app) {
      var link = (booking[app.key] || '').trim();
      if (!link) return;
      var href = app.scheme && link.indexOf(':') === -1 ? app.scheme + link : link;
      var icon = ICONS[app.mark] || app.mark;
      bookList.appendChild(appRow(href, icon, app.label, app.sub, '', !app.scheme));
    });
    bookList.appendChild(appRow('tel:' + current.tel, ICONS.phone, 'Call to book', current.phone, 'book__app--phone', false));
  }

  var lastOpener = null;

  function openBook(opener, locId) {
    if (locId && locId !== current.id) chooseLocation(locId, false);
    if (!dialog || typeof dialog.showModal !== 'function') {
      var note = document.getElementById('order');
      if (note) note.scrollIntoView();
      return;
    }
    lastOpener = opener || document.activeElement;
    renderBookList();
    paintStatus();
    if (!dialog.open) dialog.showModal();
    document.dispatchEvent(new CustomEvent('book:open'));
  }

  function closeBook() { if (dialog && dialog.open) dialog.close(); }

  if (dialog) {
    dialog.addEventListener('close', function () {
      document.dispatchEvent(new CustomEvent('book:close'));
      if (lastOpener && typeof lastOpener.focus === 'function') lastOpener.focus({ preventScroll: true });
    });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) closeBook(); });
    $$('[data-book-close]', dialog).forEach(function (b) { b.addEventListener('click', closeBook); });
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-book]');
    if (!trigger) return;
    e.preventDefault();
    openBook(trigger, trigger.getAttribute('data-loc-book'));
  });

  window.addEventListener('hashchange', function () {
    if (/^#(order|book)$/i.test(location.hash)) {
      try { history.replaceState(null, '', location.pathname + location.search); } catch (err) {}
      openBook(null);
    }
  });

  /* ---------- Service filter chips ---------- */

  function wireFilters() {
    var chipsWrap = $('[data-chips]');
    var board = $('[data-board]');
    if (!chipsWrap || !board) return;
    var chips = $$('[data-filter]', chipsWrap);
    var items = $$('[data-cat]', board);
    var status = $('[data-filter-status]');
    chipsWrap.hidden = false;

    chipsWrap.addEventListener('click', function (e) {
      var chip = e.target.closest('[data-filter]');
      if (!chip) return;
      var filter = chip.getAttribute('data-filter');
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
      var shown = [];
      items.forEach(function (item) {
        var cats = (item.getAttribute('data-cat') || '').split(/\s+/);
        var match = filter === 'all' || cats.indexOf(filter) !== -1;
        item.hidden = !match;
        if (match) shown.push(item);
      });
      if (status) status.textContent = 'Showing ' + shown.length + ' service' + (shown.length === 1 ? '' : 's');
      document.dispatchEvent(new CustomEvent('services:filter', { detail: { items: shown } }));
    });
  }

  /* ---------- Copy address ---------- */

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      ta.remove();
      ok ? resolve() : reject();
    });
  }

  function wireCopy() {
    $$('[data-copy-address]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var label = $('[data-copy-label]', btn);
        var text = btn.getAttribute('data-copy-address');
        copyText(text).then(function () {
          if (label) label.textContent = 'Copied';
          toast('Address copied');
          setTimeout(function () { if (label) label.textContent = 'Copy address'; }, 2200);
        }, function () {
          toast(text);
        });
      });
    });
  }

  /* ---------- Phone/tablet menu ---------- */

  function wireMenu() {
    var toggle = $('[data-menu-toggle]');
    var menu = $('[data-menu]');
    if (!toggle || !menu) return;
    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
    }
    toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (toggle.getAttribute('aria-expanded') === 'true' && !e.target.closest('[data-menu]') && !e.target.closest('[data-menu-toggle]')) setOpen(false);
    });
  }

  /* ---------- Toast ---------- */

  var toastEl = $('[data-toast]');
  var toastTimer;
  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2400);
  }

  /* ---------- Social links ---------- */

  function wireSocial() {
    var social = data.social || {};
    $$('[data-social]').forEach(function (a) {
      var url = (social[a.getAttribute('data-social')] || '').trim();
      if (url) { a.href = url; a.hidden = false; }
    });
  }

  /* ---------- In-page links (smooth with Lenis when motion.js runs it) ---------- */

  function headerOffset() {
    var h = $('[data-header]');
    return h ? h.offsetHeight + 12 : 0;
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute('data-book') || e.defaultPrevented) return;
    var id = a.getAttribute('href').slice(1);
    var target = id === 'top' ? document.body : document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    var lenis = window.__lenis;
    if (id === 'top') {
      if (lenis) lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    } else if (lenis) {
      lenis.scrollTo(target, { offset: -headerOffset() });
    } else {
      var y = target.getBoundingClientRect().top + window.pageYOffset - headerOffset();
      window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    var focusTarget = id === 'top' ? $('#main') : target;
    if (focusTarget) {
      if (!focusTarget.hasAttribute('tabindex')) focusTarget.setAttribute('tabindex', '-1');
      focusTarget.focus({ preventScroll: true });
    }
    if (id !== 'top') {
      try { history.pushState(null, '', '#' + id); } catch (err) {}
    }
  });

  /* ---------- Start ---------- */

  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  buildSwitcher();
  wireFixedDirections();
  wireFilters();
  wireCopy();
  wireSocial();
  wireMenu();
  applyLocation(current);
  setInterval(paintStatus, 60 * 1000);

  if (window.__openBook) {
    window.__openBook = false;
    openBook(null);
  }

  window.UAT = { chooseLocation: chooseLocation, openBook: openBook, locations: locations };
})();
