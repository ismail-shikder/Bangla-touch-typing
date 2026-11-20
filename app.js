/*
 * app.js — পুরো অ্যাপ: রাউটার, টাইপিং ইঞ্জিন, কীবোর্ড, পাঠ, গতি পরীক্ষা, অগ্রগতি
 */
(function () {
  'use strict';
  var BT = window.BT, Lay = BT.layout, Conv = BT.converter, Cur = BT.curriculum;

  // GitHub-এ তুললে এখানে আপনার রিপোজিটরির লিংক দিন (ফুটারে দেখাবে)
  var CONFIG = { REPO_URL: '' };

  /* ---------- ছোট সহায়ক ---------- */
  var BND = '০১২৩৪৫৬৭৮৯';
  function bn(n) { return String(n).replace(/\d/g, function (d) { return BND[d]; }); }
  function $(s, el) { return (el || document).querySelector(s); }
  function append(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { append(el, x); }); return; }
    el.appendChild(c.nodeType ? c : document.createTextNode(String(c)));
  }
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === 'class') el.className = v;
        else if (k.indexOf('on') === 0) el.addEventListener(k.slice(2), v);
        else if (v === true) el.setAttribute(k, '');
        else el.setAttribute(k, v);
      });
    }
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function fmtTime(sec) {
    sec = Math.max(0, Math.round(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return bn(m) + ':' + bn(s < 10 ? '0' + s : s);
  }
  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function starsFor(acc) { return acc >= 98 ? 3 : acc >= 95 ? 2 : acc >= 90 ? 1 : 0; }
  function starsEl(n) {
    return h('span', { class: 'stars', 'aria-label': bn(n) + ' তারা' },
      [0, 1, 2].map(function (i) { return h('span', { class: i < n ? '' : 'off' }, '★'); }));
  }

  /* ---------- সংরক্ষণ (localStorage, নিরাপদে) ---------- */
  var Store = (function () {
    var KEY = 'bijoy-typing-v1';
    var data;
    function fresh() {
      return {
        lessons: {}, tests: [], days: {}, seconds: 0,
        settings: { sound: true, lessonKb: true, testKb: false, testDur: 2, testSrc: 'mix', fontSize: 40 },
      };
    }
    function merge(base, d) {
      if (!d || typeof d !== 'object') return base;
      ['lessons', 'days'].forEach(function (k) { if (d[k] && typeof d[k] === 'object' && !Array.isArray(d[k])) base[k] = d[k]; });
      if (Array.isArray(d.tests)) base.tests = d.tests.slice(-200);
      if (typeof d.seconds === 'number') base.seconds = d.seconds;
      if (d.settings && typeof d.settings === 'object') Object.keys(base.settings).forEach(function (k) {
        if (typeof d.settings[k] === typeof base.settings[k]) base.settings[k] = d.settings[k];
      });
      return base;
    }
    function load() {
      var d = null;
      try { var r = localStorage.getItem(KEY); if (r) d = JSON.parse(r); } catch (e) { d = null; }
      data = merge(fresh(), d);
    }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* ব্রাউজার বন্ধ করলে */ } }
    load();
    return {
      get: function () { return data; },
      save: save,
      reset: function () { data = fresh(); save(); },
      exportJson: function () { return JSON.stringify(data); },
      importJson: function (text) {
        var d = JSON.parse(text);
        if (!d || typeof d !== 'object') throw new Error('ভুল ফাইল');
        data = merge(fresh(), d); save();
      },
      exercise: function (l, i) { return (data.lessons[l] || {})[i] || null; },
      recordExercise: function (l, i, res) {
        var L = data.lessons[l] = data.lessons[l] || {};
        var o = L[i] = L[i] || { wpm: 0, acc: 0, stars: 0, tries: 0 };
        o.wpm = Math.max(o.wpm, res.wpm); o.acc = Math.max(o.acc, res.acc);
        o.stars = Math.max(o.stars, starsFor(res.acc)); o.tries += 1;
        save();
      },
      addTime: function (sec) {
        if (sec <= 0) return;
        var k = todayKey();
        data.days[k] = (data.days[k] || 0) + sec; data.seconds += sec; save();
      },
      addTest: function (t) { data.tests.push(t); if (data.tests.length > 200) data.tests.shift(); save(); },
      setting: function (k, v) { if (v === undefined) return data.settings[k]; data.settings[k] = v; save(); },
      streak: function () {
        var n = 0, d = new Date();
        var key = function (x) { return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
        if (!data.days[key(d)]) d.setDate(d.getDate() - 1);
        while (data.days[key(d)]) { n++; d.setDate(d.getDate() - 1); }
        return n;
      },
      lessonProgress: function (l) {
        var lesson = Cur.getLesson(l), done = 0;
        lesson.exerciseList.forEach(function (_, i) { var e = (data.lessons[l] || {})[i]; if (e && e.stars >= 1) done++; });
        return { done: done, total: lesson.exerciseList.length };
      },
    };
  })();

  /* ---------- শব্দ ---------- */
  var Sound = {
    ctx: null,
    beep: function (freq, dur, vol, type) {
      if (!Store.setting('sound')) return;
      try {
        if (!this.ctx) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; this.ctx = new AC(); }
        var c = this.ctx; if (c.state === 'suspended') c.resume();
        var o = c.createOscillator(), g = c.createGain();
        o.type = type; o.frequency.value = freq;
        g.gain.setValueAtTime(vol, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
        o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + dur);
      } catch (e) { /* শব্দ না চললেও সমস্যা নেই */ }
    },
    ok: function () { this.beep(880, 0.03, 0.04, 'square'); },
    bad: function () { this.beep(150, 0.14, 0.07, 'sawtooth'); },
    done: function () { this.beep(660, 0.12, 0.06, 'triangle'); },
  };

  /* ---------- অন-স্ক্রিন কীবোর্ড ---------- */
  var COMBINING = /^[ঁ-ঃা-্ৗ]/;
  function disp(ch) { return COMBINING.test(ch) ? '◌' + ch : ch; }
  var MODLABEL = { _Backspace: '⌫', _Tab: 'Tab', _Caps: 'Caps', _Enter: 'Enter', ShiftLeft: 'Shift', ShiftRight: 'Shift', _sp1: 'Ctrl  Alt', _sp2: 'Alt  Ctrl' };

  function buildKeyboard(opts) {
    opts = opts || {};
    var el = h('div', { class: 'kb' + (opts.compact ? ' kb-compact' : ''), 'aria-hidden': 'true' });
    var keys = {};
    Lay.ROWS.forEach(function (row) {
      var r = h('div', { class: 'kb-row' });
      row.forEach(function (k) {
        var code = k[0], w = k[1], kel;
        var style = 'flex:' + w + ' 1 0';
        if (Lay.MAP[code]) {
          var pair = Lay.MAP[code];
          kel = h('div', { class: 'key f-' + Lay.FINGER[code].charAt(1), style: style },
            pair[1] ? h('span', { class: 'k-sh' }, disp(pair[1])) : null,
            h('span', { class: 'k-nm' }, disp(pair[0])),
            h('span', { class: 'k-en' }, Lay.enLabel(code)));
        } else if (code === 'Space') {
          kel = h('div', { class: 'key f-1', style: style }, h('span', { class: 'k-en', style: 'position:static' }, 'Space'));
        } else {
          kel = h('div', { class: 'key ' + (code.charAt(0) === '_' && code.indexOf('_sp') === 0 ? 'key-gap' : 'mod'), style: style }, MODLABEL[code] || '');
        }
        keys[code] = kel; r.appendChild(kel);
      });
      el.appendChild(r);
    });

    var tgt = [], pressTimers = {};
    return {
      el: el,
      setTarget: function (step) {
        tgt.forEach(function (k) { k.classList.remove('target', 'target-shift'); });
        tgt = [];
        if (!step) return;
        var k = keys[step.code];
        if (k) { k.classList.add('target'); tgt.push(k); }
        if (step.shift) {
          var sc = Lay.handOf(step.code) === 'L' ? 'ShiftRight' : 'ShiftLeft';
          keys[sc].classList.add('target-shift'); tgt.push(keys[sc]);
        }
      },
      flash: function (code, ok) {
        var k = keys[code]; if (!k) return;
        var cls = ok ? 'pressed-ok' : 'pressed-bad';
        k.classList.add(cls); clearTimeout(pressTimers[code]);
        pressTimers[code] = setTimeout(function () { k.classList.remove(cls); }, 130);
      },
      markNew: function (newCodes, learnedCodes) {
        Object.keys(keys).forEach(function (c) {
          if (!Lay.MAP[c] && c !== 'Space') return;
          keys[c].classList.toggle('is-new', newCodes.has(c));
          keys[c].classList.toggle('dim', !newCodes.has(c) && !learnedCodes.has(c));
        });
      },
    };
  }

  function fingerLegend() {
    var items = [['f5', 'কনিষ্ঠা'], ['f4', 'অনামিকা'], ['f3', 'মধ্যমা'], ['f2', 'তর্জনী'], ['f1', 'বুড়ো আঙুল']];
    return h('div', { class: 'legend' }, items.map(function (i) {
      return h('span', null, h('i', { style: 'background:var(--' + i[0] + ')' }), i[1]);
    }));
  }

  /* ---------- টাইপিং সেশন ---------- */
  function createSession(box, opts) {
    // opts: text, extend(), timeLimit(সেকেন্ড), onUpdate(state), onPress(code, ok), onFinish(result)
    var units = [], ui = 0, si = 0;
    var started = false, finished = false, startT = 0, correct = 0, total = 0, errors = 0, spaces = 0;
    var missed = {}, spans = [], timer = null, pendingErr = false;

    function addText(text) {
      var u = Conv.toUnits(text);
      if (units.length) u = [{ text: ' ', steps: [{ code: 'Space', shift: false }] }].concat(u);
      u.forEach(function (x) {
        units.push(x);
        var s = h('span', { class: 'u' }, x.text);
        spans.push(s); box.appendChild(s);
      });
    }
    function reset() {
      box.textContent = ''; box.scrollTop = 0;
      units = []; spans = []; ui = 0; si = 0; started = false; finished = false;
      correct = total = errors = spaces = 0; missed = {}; pendingErr = false;
      clearInterval(timer);
      addText(opts.text);
      spans[0].classList.add('cur'); box.classList.add('active');
      update();
    }
    function elapsed() { return started ? (performance.now() - startT) / 1000 : 0; }
    function stats() {
      var t = elapsed(), min = Math.max(t, 1) / 60;
      return {
        time: t, wpm: started ? (correct / 5) / min : 0, wps: started ? spaces / min : 0, kpm: started ? correct / min : 0,
        acc: total ? (correct / total) * 100 : 100, errors: errors, correct: correct, total: total,
        remaining: opts.timeLimit ? Math.max(0, opts.timeLimit - t) : null,
      };
    }
    function update() {
      var st = stats(); st.unit = units[ui]; st.stepIdx = si; st.step = units[ui] && units[ui].steps[si];
      if (opts.onUpdate) opts.onUpdate(st);
    }
    function scrollToCur() {
      var s = spans[ui]; if (!s) return;
      var top = s.offsetTop, lh = parseFloat(getComputedStyle(box).lineHeight) || 40;
      if (top > box.scrollTop + lh * 2.5 || top < box.scrollTop) box.scrollTop = Math.max(0, top - lh);
    }
    function finish(reason) {
      if (finished) return;
      finished = true; clearInterval(timer); box.classList.remove('active');
      var st = stats();
      if (reason === 'complete') st.wps = (spaces + 1) / (Math.max(st.time, 1) / 60);
      st.reason = reason; st.missed = missed;
      if (opts.onFinish) opts.onFinish(st);
    }
    function onKey(e) {
      if (finished) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Escape') { e.preventDefault(); reset(); return; }
      if (e.key === 'Backspace') { e.preventDefault(); return; }
      var code = e.code;
      if (!Lay.MAP[code] && code !== 'Space') return;
      e.preventDefault();
      if (e.repeat) return;
      var step = units[ui].steps[si];
      if (!started) { started = true; startT = performance.now(); timer = setInterval(tick, 250); }
      var ok = code === step.code && (code === 'Space' || !!e.shiftKey === step.shift);
      total++;
      if (opts.onPress) opts.onPress(code, ok);
      if (ok) {
        correct++; Sound.ok(); si++;
        if (code === 'Space') spaces++;
        if (si >= units[ui].steps.length) {
          spans[ui].classList.remove('cur', 'err');
          spans[ui].classList.add(pendingErr ? 'fix' : 'done');
          pendingErr = false; ui++; si = 0;
          if (opts.extend && units.length - ui < 40) addText(opts.extend());
          if (ui >= units.length) { update(); finish('complete'); return; }
          spans[ui].classList.add('cur'); scrollToCur();
        }
      } else {
        errors++; Sound.bad(); pendingErr = true;
        var id = Lay.keyId(step); missed[id] = (missed[id] || 0) + 1;
        var s = spans[ui]; s.classList.remove('err'); void s.offsetWidth; s.classList.add('err');
      }
      update();
    }
    function onKeyUp(e) { if (e.code === 'Space' && !finished) e.preventDefault(); }
    function tick() {
      var st = stats();
      if (opts.timeLimit && st.remaining <= 0) { finish('time'); return; }
      update();
    }
    document.activeElement && document.activeElement.blur && document.activeElement.blur();
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    reset();
    return {
      restart: reset,
      stats: stats,
      destroy: function () {
        window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKeyUp);
        clearInterval(timer);
        if (started && !finished) Store.addTime(elapsed());
      },
      isFinished: function () { return finished; },
    };
  }

  /* ---------- রাউটার ---------- */
  var app = $('#app');
  var cleanup = null;
  function setCleanup(fn) { cleanup = fn; }

  function route() {
    if (cleanup) { try { cleanup(); } catch (e) { /* ignore */ } cleanup = null; }
    var hash = location.hash.replace(/^#\/?/, '');
    var p = hash.split('/');
    var page = p[0] || 'home';
    document.querySelectorAll('#nav a').forEach(function (a) {
      var n = a.getAttribute('data-nav');
      a.classList.toggle('active', n === page || (n === 'home' && (page === 'lesson' || page === 'home')));
    });
    app.textContent = '';
    window.scrollTo(0, 0);
    try {
      if (page === 'home') viewHome();
      else if (page === 'lesson' && p[2] === 'ex') viewExercise(+p[1], +p[3]);
      else if (page === 'lesson') viewLesson(+p[1]);
      else if (page === 'test') viewTest();
      else if (page === 'guide') viewGuide();
      else if (page === 'progress') viewProgress();
      else viewHome();
    } catch (e) {
      app.appendChild(h('div', { class: 'card' }, h('h2', null, 'কিছু একটা সমস্যা হয়েছে'), h('p', null, String(e && e.message || e)), h('a', { class: 'btn', href: '#/' }, 'হোমে ফিরুন')));
      if (window.console) console.error(e);
    }
    app.focus({ preventScroll: true });
  }

  function touchNotice() {
    if (window.matchMedia && matchMedia('(pointer: coarse)').matches) {
      return h('div', { class: 'notice', style: 'margin-bottom:16px' }, 'এই অ্যাপে টাইপ অনুশীলনের জন্য কম্পিউটার বা ল্যাপটপের কীবোর্ড লাগবে। ফোনের স্ক্রিন কীবোর্ডে অনুশীলন করা যাবে না।');
    }
    return null;
  }

  /* ---------- হোম ---------- */
  function nextLesson() {
    for (var i = 1; i <= Cur.lessons.length; i++) {
      var p = Store.lessonProgress(i);
      if (p.done < p.total) return i;
    }
    return Cur.lessons.length;
  }
  function viewHome() {
    var d = Store.get();
    var best = 0; d.tests.forEach(function (t) { if (t.wpm > best) best = t.wpm; });
    var next = nextLesson(), started = Object.keys(d.lessons).length > 0;
    append(app, touchNotice());
    app.appendChild(h('section', { class: 'hero' },
      h('div', null,
        h('h1', null, 'বিজয় কীবোর্ডে বাংলা টাচ টাইপিং শিখুন'),
        h('p', { class: 'lead' }, 'হোম রো থেকে শুরু করে যুক্তাক্ষর ও অনুচ্ছেদ পর্যন্ত — ধাপে ধাপে পাঠ, প্রতি পাঠে অনেকগুলো অনুশীলনী, আর গতি পরীক্ষা। সরকারি চাকরির বাংলা টাইপিং পরীক্ষার প্রস্তুতির জন্য।'),
        h('div', { class: 'row' },
          h('a', { class: 'btn primary', href: '#/lesson/' + next }, started ? 'পাঠ ' + bn(next) + '-এ চালিয়ে যান' : 'পাঠ ১ থেকে শুরু করুন'),
          h('a', { class: 'btn', href: '#/test' }, 'গতি পরীক্ষা দিন'),
          h('a', { class: 'btn', href: '#/guide' }, 'শেখার গাইড'))),
      h('div', { class: 'stat-grid' },
        h('div', { class: 'stat' }, h('b', null, bn(Store.streak())), h('span', null, 'দিনের ধারাবাহিকতা')),
        h('div', { class: 'stat' }, h('b', null, bn(Math.round(d.seconds / 60))), h('span', null, 'মিনিট অনুশীলন')),
        h('div', { class: 'stat' }, h('b', null, bn(Math.round(best))), h('span', null, 'সেরা গতি (WPM)')),
        h('div', { class: 'stat' }, h('b', null, bn(d.tests.length)), h('span', null, 'পরীক্ষা দিয়েছেন')))));

    app.appendChild(h('h2', null, 'পাঠসমূহ'));
    var grid = h('div', { class: 'lesson-grid' });
    Cur.lessons.forEach(function (l) {
      var p = Store.lessonProgress(l.id), done = p.done === p.total;
      grid.appendChild(h('a', { class: 'card lesson-card' + (done ? ' done' : ''), href: '#/lesson/' + l.id },
        h('div', { class: 'row' }, h('span', { class: 'lesson-no' }, bn(l.id)), h('h3', { style: 'margin:0' }, l.title)),
        h('div', { class: 'lesson-sub' }, l.subtitle),
        h('div', { class: 'muted', style: 'font-size:15px' }, l.desc),
        h('div', { class: 'bar' }, h('i', { style: 'width:' + (p.done / p.total * 100) + '%' })),
        h('div', { class: 'row' }, h('span', { class: 'badge' + (done ? ' good' : '') }, bn(p.done) + '/' + bn(p.total) + ' অনুশীলনী'))));
    });
    app.appendChild(grid);
  }

  /* ---------- পাঠের পাতা ---------- */
  function viewLesson(id) {
    var l = Cur.getLesson(id);
    if (!l) { location.hash = '#/'; return; }
    app.appendChild(h('div', { class: 'crumbs' }, h('a', { href: '#/' }, 'পাঠসমূহ'), ' › পাঠ ' + bn(id)));
    app.appendChild(h('h1', null, 'পাঠ ' + bn(id) + ': ' + l.title));
    app.appendChild(h('p', { class: 'lead' }, l.desc));

    if (l.newUnits.length) {
      app.appendChild(h('div', { class: 'card' }, h('h3', null, 'এই পাঠে নতুন'),
        h('div', { class: 'chips' }, l.newUnits.map(function (u) { return h('span', { class: 'chip' }, u); }))));
    }
    var newCodes = new Set(), learned = new Set();
    Object.keys(Cur.intro).forEach(function (kid) {
      var code = kid.replace('Shift+', '');
      if (Cur.intro[kid] === id) newCodes.add(code); else if (Cur.intro[kid] < id) learned.add(code);
    });
    if (l.keys.length) {
      var kb = buildKeyboard({ compact: true });
      kb.markNew(newCodes, learned);
      app.appendChild(h('h2', null, 'কীবোর্ডে দেখুন'));
      app.appendChild(kb.el);
      app.appendChild(h('p', { class: 'muted', style: 'font-size:14px;margin-top:8px' }, 'ড্যাশ-দাগ ঘেরা কী-গুলো এই পাঠের নতুন কী। প্রতিটি কী-র উপরের ছোট অক্ষর শিফট চেপে পাওয়া যায়, নিচের বড় অক্ষর সাধারণ চাপে। রং বলে দেয় কোন আঙুল দিয়ে চাপবেন।'));
      app.appendChild(fingerLegend());
    }
    app.appendChild(h('h2', null, 'টিপস'));
    app.appendChild(h('div', { class: 'card' }, h('ul', { class: 'tips' }, l.tips.map(function (t) { return h('li', null, t); }))));

    app.appendChild(h('h2', null, 'অনুশীলনী'));
    var list = h('div', { class: 'ex-list' });
    l.exerciseList.forEach(function (ex, i) {
      var r = Store.exercise(id, i), passed = r && r.stars >= 1;
      list.appendChild(h('div', { class: 'card ex-item' + (passed ? ' passed' : '') },
        h('span', { class: 'ex-no' }, passed ? '✓' : bn(i + 1)),
        h('div', { class: 'ex-body' }, h('b', null, ex.title), h('small', null, ex.desc),
          r ? h('small', null, 'সেরা: ' + bn(Math.round(r.wpm)) + ' WPM · নির্ভুলতা ' + bn(Math.round(r.acc)) + '%') : null),
        r ? starsEl(r.stars) : null,
        h('a', { class: 'btn small primary', href: '#/lesson/' + id + '/ex/' + i }, r ? 'আবার' : 'শুরু')));
    });
    app.appendChild(list);
    var nav = h('div', { class: 'row', style: 'margin-top:20px' });
    if (id > 1) nav.appendChild(h('a', { class: 'btn', href: '#/lesson/' + (id - 1) }, '← আগের পাঠ'));
    nav.appendChild(h('span', { class: 'spacer' }));
    if (id < Cur.lessons.length) nav.appendChild(h('a', { class: 'btn', href: '#/lesson/' + (id + 1) }, 'পরের পাঠ →'));
    app.appendChild(nav);
  }

  /* ---------- অনুশীলনীর পাতা ---------- */
  function hintBlock(kb) {
    var cur = h('div', { class: 'hint-cur' }, ' ');
    var steps = h('div', { class: 'hint-steps' });
    var finger = h('div', { class: 'hint-finger' });
    var box = h('div', { class: 'card hint-panel' }, cur, steps, finger);
    var lastUnit = null;
    return {
      el: box,
      update: function (st) {
        if (!st.unit) return;
        var u = st.unit;
        if (u !== lastUnit) {
          lastUnit = u;
          cur.textContent = u.text === ' ' ? '␣' : u.text;
          steps.textContent = '';
          u.steps.forEach(function (s, i) {
            if (i) steps.appendChild(h('span', { class: 'plus' }, '›'));
            steps.appendChild(h('span', { class: 'kcap' }, (s.shift ? '⇧ ' : '') + Lay.enLabel(s.code),
              h('small', null, s.code === 'Space' ? '' : Lay.charOfKeyId(Lay.keyId(s)).replace(/^্/, '◌্'))));
          });
        }
        Array.prototype.forEach.call(steps.querySelectorAll('.kcap'), function (k, i) {
          k.classList.toggle('now', i === st.stepIdx);
          k.classList.toggle('done', i < st.stepIdx);
        });
        var s = st.step;
        if (s) {
          var f = Lay.FINGER[s.code] || 'R1';
          finger.textContent = Lay.FINGER_NAMES[f] + ' দিয়ে চাপুন' + (s.shift ? ' · সঙ্গে ' + (Lay.handOf(s.code) === 'L' ? 'ডান' : 'বাম') + ' হাতের কনিষ্ঠা দিয়ে Shift ধরে রাখুন' : '');
        }
        if (kb) kb.setTarget(st.step);
      },
    };
  }

  // লেখার আকার বাড়ানো/কমানোর বোতাম (পছন্দ মনে রাখে)
  function sizeControl(box) {
    var MIN = 24, MAX = 72;
    function apply() { box.style.setProperty('--tsize', Store.setting('fontSize') + 'px'); }
    function change(d) {
      var v = Math.max(MIN, Math.min(MAX, Store.setting('fontSize') + d));
      Store.setting('fontSize', v); apply();
    }
    apply();
    return h('span', { class: 'row', style: 'gap:6px', role: 'group', 'aria-label': 'লেখার আকার' },
      h('span', { class: 'muted', style: 'font-size:14px' }, 'লেখার আকার'),
      h('button', { class: 'btn small', type: 'button', 'aria-label': 'লেখা ছোট করুন', onclick: function (e) { change(-4); e.currentTarget.blur(); } }, 'অ−'),
      h('button', { class: 'btn small', type: 'button', 'aria-label': 'লেখা বড় করুন', onclick: function (e) { change(4); e.currentTarget.blur(); } }, 'অ+'));
  }

  function hud() {
    var els = {
      time: h('b', null, '০:০০'), wpm: h('b', null, '০'), acc: h('b', null, '১০০%'), err: h('b', null, '০'),
    };
    var el = h('div', { class: 'hud' },
      h('div', { class: 'stat' }, els.time, h('span', null, 'সময়')),
      h('div', { class: 'stat' }, els.wpm, h('span', null, 'WPM')),
      h('div', { class: 'stat' }, els.acc, h('span', null, 'নির্ভুলতা')),
      h('div', { class: 'stat' }, els.err, h('span', null, 'ভুল')));
    return {
      el: el,
      set: function (st, countdown) {
        els.time.textContent = fmtTime(countdown && st.remaining != null ? st.remaining : st.time);
        els.wpm.textContent = bn(Math.round(st.wpm));
        els.acc.textContent = bn(Math.round(st.acc)) + '%';
        els.err.textContent = bn(st.errors);
      },
    };
  }

  function missedKeysEl(missed) {
    var ids = Object.keys(missed).sort(function (a, b) { return missed[b] - missed[a]; }).slice(0, 6);
    if (!ids.length) return null;
    return h('div', null, h('div', { class: 'muted' }, 'সবচেয়ে বেশি ভুল হয়েছে'),
      h('div', { class: 'missed' }, ids.map(function (id) { return h('span', null, Lay.charOfKeyId(id).replace(/^্/, '◌্') + ' (' + bn(missed[id]) + ')'); })));
  }

  function viewExercise(lid, ei) {
    var l = Cur.getLesson(lid);
    if (!l || !l.exerciseList[ei]) { location.hash = '#/'; return; }
    var ex = l.exerciseList[ei];
    app.appendChild(h('div', { class: 'crumbs' }, h('a', { href: '#/' }, 'পাঠসমূহ'), ' › ', h('a', { href: '#/lesson/' + lid }, 'পাঠ ' + bn(lid)), ' › অনুশীলনী ' + bn(ei + 1)));
    var wrap = h('div', { class: 'typing-wrap' });
    app.appendChild(h('h1', { style: 'font-size:24px' }, 'পাঠ ' + bn(lid) + ' · ' + ex.title + ' (' + bn(ei + 1) + '/' + bn(l.exerciseList.length) + ')'));
    append(app, touchNotice());
    app.appendChild(wrap);

    var showKb = Store.setting('lessonKb');
    var kb = buildKeyboard();
    var hb = hintBlock(kb);
    var hd = hud();
    var box = h('div', { class: 'text-box', 'aria-label': 'টাইপ করার লেখা' });
    var hint = h('p', { class: 'start-hint' }, 'প্রথম কী চাপলেই সময় শুরু হবে · Esc চাপলে নতুন করে শুরু');
    var kbWrap = h('div', null, kb.el, h('div', { style: 'margin-top:8px' }, fingerLegend()));
    kbWrap.classList.toggle('hidden', !showKb);
    var toggle = h('button', { class: 'btn small', type: 'button', onclick: function () {
      showKb = !showKb; Store.setting('lessonKb', showKb); kbWrap.classList.toggle('hidden', !showKb);
      toggle.textContent = showKb ? 'কীবোর্ড লুকান' : 'কীবোর্ড দেখান'; toggle.blur();
    } }, showKb ? 'কীবোর্ড লুকান' : 'কীবোর্ড দেখান');
    var restartBtn = h('button', { class: 'btn small', type: 'button', onclick: function () { session.restart(); restartBtn.blur(); } }, 'আবার শুরু (Esc)');
    wrap.appendChild(h('div', { class: 'row' }, h('span', { class: 'muted' }, ex.desc), h('span', { class: 'spacer' }), sizeControl(box), toggle, restartBtn));
    wrap.appendChild(hd.el); wrap.appendChild(box); wrap.appendChild(hint); wrap.appendChild(hb.el); wrap.appendChild(kbWrap);

    var session = createSession(box, {
      text: Cur.makeText(lid, ei),
      onUpdate: function (st) { hd.set(st); hb.update(st); if (st.time > 0) hint.textContent = ''; },
      onPress: function (code, ok) { kb.flash(code, ok); },
      onFinish: function (res) {
        Store.addTime(res.time);
        Sound.done();
        Store.recordExercise(lid, ei, res);
        showExerciseResult(wrap, lid, ei, res);
      },
    });
    setCleanup(function () { session.destroy(); });
  }

  function showExerciseResult(wrap, lid, ei, res) {
    var l = Cur.getLesson(lid), st = starsFor(res.acc), pass = st >= 1;
    var more = ei + 1 < l.exerciseList.length;
    var card = h('div', { class: 'card result' },
      h('h2', { class: pass ? 'pass' : 'failc' }, pass ? 'চমৎকার!' : 'আরেকটু নির্ভুল হতে হবে'),
      starsEl(st),
      h('div', { class: 'big' }, bn(Math.round(res.wpm)) + ' WPM'),
      h('div', { class: 'result-grid' },
        h('div', { class: 'stat' }, h('b', null, bn(Math.round(res.acc)) + '%'), h('span', null, 'নির্ভুলতা')),
        h('div', { class: 'stat' }, h('b', null, fmtTime(res.time)), h('span', null, 'সময়')),
        h('div', { class: 'stat' }, h('b', null, bn(Math.round(res.kpm))), h('span', null, 'কী/মিনিট')),
        h('div', { class: 'stat' }, h('b', null, bn(res.errors)), h('span', null, 'ভুল চাপ'))),
      pass ? null : h('p', { class: 'muted' }, 'পাস করতে অন্তত ৯০% নির্ভুলতা লাগে। গতি কমিয়ে প্রতিটি কী ঠিকঠাক চাপুন — গতি নিজে থেকেই বাড়বে।'),
      missedKeysEl(res.missed),
      h('div', { class: 'row', style: 'justify-content:center;margin-top:18px' },
        h('a', { class: 'btn', href: '#/lesson/' + lid + '/ex/' + ei, onclick: function () { setTimeout(route, 0); } }, 'আবার করুন'),
        more ? h('a', { class: 'btn primary', href: '#/lesson/' + lid + '/ex/' + (ei + 1) }, 'পরের অনুশীলনী →')
          : h('a', { class: 'btn primary', href: lid < Cur.lessons.length ? '#/lesson/' + (lid + 1) : '#/test' }, lid < Cur.lessons.length ? 'পরের পাঠ →' : 'গতি পরীক্ষা দিন →'),
        h('a', { class: 'btn', href: '#/lesson/' + lid }, 'পাঠে ফিরুন')));
    wrap.textContent = ''; wrap.appendChild(card);
    card.scrollIntoView({ block: 'center' });
  }

  /* ---------- গতি পরীক্ষা ---------- */
  var TEST_SRC = {
    mix: ['মিশ্র (পরীক্ষার ধাঁচ)', 'অনুচ্ছেদ, সংখ্যা ও চিহ্নসহ মিশ্র লেখা'],
    easy: ['সহজ অনুচ্ছেদ', 'সাধারণ শব্দের ছোট অনুচ্ছেদ'],
    hard: ['কঠিন অনুচ্ছেদ', 'যুক্তাক্ষর ও রেফসহ কঠিন অনুচ্ছেদ'],
    words: ['এলোমেলো শব্দ', 'শুধু শব্দ, কোনো বাক্য নয়'],
  };
  function makeProvider(src) {
    var pool = [], all = BT.PASSAGES;
    function nextPassage(filter) {
      if (!pool.length) pool = all.filter(filter).map(function (p) { return p.text; }).sort(function () { return Math.random() - 0.5; });
      return pool.pop();
    }
    var sents = BT.SENTENCES;
    var allWords = Cur.lessons[Cur.lessons.length - 1].allWords;
    var n = 0;
    return function () {
      n++;
      if (src === 'easy') return nextPassage(function (p) { return p.level <= 2; });
      if (src === 'hard') return nextPassage(function (p) { return p.level >= 2; });
      if (src === 'words') {
        var w = []; for (var i = 0; i < 40; i++) w.push(allWords[Math.floor(Math.random() * allWords.length)]); return w.join(' ');
      }
      if (n % 3 === 0) { var s = []; for (var j = 0; j < 4; j++) s.push(sents[Math.floor(Math.random() * sents.length)]); return s.join(' '); }
      return nextPassage(function () { return true; });
    };
  }

  function viewTest() {
    app.appendChild(h('h1', null, 'গতি পরীক্ষা'));
    app.appendChild(h('p', { class: 'lead' }, 'সময় বেঁধে টাইপ করুন, আপনার WPM ও নির্ভুলতা দেখুন। প্রথম কী চাপলেই সময় শুরু হবে।'));
    append(app, touchNotice());
    var dur = Store.setting('testDur'), src = Store.setting('testSrc'), kbOn = Store.setting('testKb');
    var setup = h('div', { class: 'card' });
    function group(items, cur, onPick) {
      var g = h('div', { class: 'opt-group' });
      items.forEach(function (it) {
        var b = h('button', { class: 'opt', type: 'button', 'aria-pressed': String(it[0] === cur), onclick: function () {
          cur = it[0]; onPick(cur);
          Array.prototype.forEach.call(g.children, function (c, i) { c.setAttribute('aria-pressed', String(items[i][0] === cur)); });
        } }, it[1]);
        g.appendChild(b);
      });
      return g;
    }
    setup.appendChild(h('div', { class: 'field' }, h('span', { class: 'lbl' }, 'সময়'),
      group([[1, '১ মিনিট'], [2, '২ মিনিট'], [3, '৩ মিনিট'], [5, '৫ মিনিট'], [10, '১০ মিনিট']], dur, function (v) { dur = v; Store.setting('testDur', v); })));
    setup.appendChild(h('div', { class: 'field' }, h('span', { class: 'lbl' }, 'লেখার ধরন'),
      group(Object.keys(TEST_SRC).map(function (k) { return [k, TEST_SRC[k][0]]; }), src, function (v) { src = v; Store.setting('testSrc', v); })));
    var cb = h('input', { type: 'checkbox', id: 'testkb' });
    cb.checked = kbOn;
    cb.addEventListener('change', function () { kbOn = cb.checked; Store.setting('testKb', kbOn); });
    setup.appendChild(h('div', { class: 'field' }, h('label', { class: 'check', for: 'testkb' }, cb, 'টাইপ করার সময় অন-স্ক্রিন কীবোর্ড দেখান (আসল পরীক্ষার মতো অভ্যাস করতে বন্ধ রাখুন)')));
    setup.appendChild(h('button', { class: 'btn primary', type: 'button', onclick: function () { runTest(dur, src, kbOn); } }, 'পরীক্ষা শুরু করুন'));
    app.appendChild(setup);

    var tests = Store.get().tests.slice(-8).reverse();
    if (tests.length) {
      app.appendChild(h('h2', null, 'সাম্প্রতিক ফলাফল'));
      app.appendChild(testTable(tests));
    }
  }

  function testTable(tests) {
    var t = h('table', null, h('thead', null, h('tr', null, ['তারিখ', 'সময়', 'ধরন', 'WPM', 'নির্ভুলতা'].map(function (x) { return h('th', null, x); }))));
    var tb = h('tbody');
    tests.forEach(function (x) {
      tb.appendChild(h('tr', null, h('td', null, bn(x.date)), h('td', null, bn(Math.round(x.dur / 60)) + ' মি.'),
        h('td', null, (TEST_SRC[x.src] || ['—'])[0]), h('td', null, h('b', null, bn(Math.round(x.wpm)))), h('td', null, bn(Math.round(x.acc)) + '%')));
    });
    t.appendChild(tb);
    return h('div', { class: 'card table-wrap' }, t);
  }

  function runTest(dur, src, kbOn) {
    app.textContent = '';
    var provider = makeProvider(src);
    var wrap = h('div', { class: 'typing-wrap' });
    app.appendChild(h('div', { class: 'crumbs' }, h('a', { href: '#/test' }, 'গতি পরীক্ষা'), ' › ' + bn(dur) + ' মিনিট · ' + TEST_SRC[src][0]));
    app.appendChild(wrap);
    var kb = buildKeyboard();
    var hb = hintBlock(kb);
    var hd = hud();
    var box = h('div', { class: 'text-box' });
    var hint = h('p', { class: 'start-hint' }, 'প্রথম কী চাপলেই ' + bn(dur) + ' মিনিটের সময় শুরু হবে · Esc চাপলে নতুন করে শুরু');
    var kbWrap = h('div', { class: kbOn ? '' : 'hidden' }, hb.el, h('div', { style: 'height:12px' }), kb.el);
    wrap.appendChild(h('div', { class: 'row' }, h('span', { class: 'spacer' }), sizeControl(box)));
    wrap.appendChild(hd.el); wrap.appendChild(box); wrap.appendChild(hint); wrap.appendChild(kbWrap);
    var session = createSession(box, {
      text: provider() + ' ' + provider(),
      extend: provider,
      timeLimit: dur * 60,
      onUpdate: function (st) { hd.set(st, true); if (kbOn) hb.update(st); if (st.time > 0) hint.textContent = ''; },
      onPress: function (code, ok) { if (kbOn) kb.flash(code, ok); },
      onFinish: function (res) {
        Store.addTime(res.time); Sound.done();
        var prevBest = 0; Store.get().tests.forEach(function (t) { if (t.wpm > prevBest) prevBest = t.wpm; });
        Store.addTest({ date: todayKey(), dur: dur * 60, src: src, wpm: res.wpm, acc: res.acc, errors: res.errors });
        wrap.textContent = '';
        var newBest = res.wpm > prevBest && res.wpm > 0;
        var card = h('div', { class: 'card result' },
          h('h2', null, newBest ? '🎉 নতুন সেরা গতি!' : 'পরীক্ষা শেষ'),
          h('div', { class: 'big' }, bn(Math.round(res.wpm)) + ' WPM'),
          h('div', { class: 'result-grid' },
            h('div', { class: 'stat' }, h('b', null, bn(Math.round(res.acc)) + '%'), h('span', null, 'নির্ভুলতা')),
            h('div', { class: 'stat' }, h('b', null, bn(Math.round(res.wps)) + ' টি'), h('span', null, 'শব্দ/মিনিট (স্পেস দিয়ে আলাদা)')),
            h('div', { class: 'stat' }, h('b', null, bn(Math.round(res.kpm))), h('span', null, 'কী/মিনিট')),
            h('div', { class: 'stat' }, h('b', null, bn(res.errors)), h('span', null, 'ভুল চাপ'))),
          h('p', { class: 'muted' }, res.acc < 90 ? 'নির্ভুলতা ৯০%-এর নিচে। গতি কমিয়ে নির্ভুলভাবে টাইপ করার চেষ্টা করুন — পরীক্ষায় ভুলই বেশি নম্বর কাটে।' : res.acc < 97 ? 'ভালো! আরেকটু নির্ভুল হলে গতি বাড়ানো সহজ হবে।' : 'দারুণ নির্ভুলতা! এবার ধীরে ধীরে গতি বাড়ান।'),
          missedKeysEl(res.missed),
          h('div', { class: 'row', style: 'justify-content:center;margin-top:18px' },
            h('button', { class: 'btn primary', type: 'button', onclick: function () { runTest(dur, src, kbOn); } }, 'আবার পরীক্ষা দিন'),
            h('a', { class: 'btn', href: '#/progress' }, 'অগ্রগতি দেখুন'),
            h('a', { class: 'btn', href: '#/test' }, 'সেটিংস বদলান')));
        wrap.appendChild(card);
      },
    });
    setCleanup(function () { session.destroy(); });
  }

  /* ---------- অগ্রগতি ---------- */
  function viewProgress() {
    var d = Store.get();
    app.appendChild(h('h1', null, 'আপনার অগ্রগতি'));
    var doneEx = 0, totalEx = 0, bestAcc = 0;
    Cur.lessons.forEach(function (l) { var p = Store.lessonProgress(l.id); doneEx += p.done; totalEx += p.total; });
    var bestW = 0; d.tests.forEach(function (t) { bestW = Math.max(bestW, t.wpm); bestAcc = Math.max(bestAcc, t.acc); });
    app.appendChild(h('div', { class: 'stat-grid', style: 'grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin:16px 0' },
      h('div', { class: 'stat' }, h('b', null, bn(doneEx) + '/' + bn(totalEx)), h('span', null, 'অনুশীলনী সম্পন্ন')),
      h('div', { class: 'stat' }, h('b', null, bn(Store.streak())), h('span', null, 'দিনের ধারাবাহিকতা')),
      h('div', { class: 'stat' }, h('b', null, bn(Math.round(d.seconds / 60))), h('span', null, 'মোট মিনিট')),
      h('div', { class: 'stat' }, h('b', null, bn(Math.round(bestW))), h('span', null, 'সেরা পরীক্ষার WPM'))));

    app.appendChild(h('h2', null, 'গতি পরীক্ষার ধারা'));
    if (!d.tests.length) {
      app.appendChild(h('div', { class: 'card muted' }, 'এখনো কোনো পরীক্ষা দেননি। ', h('a', { href: '#/test' }, 'প্রথম পরীক্ষা দিন')));
    } else {
      app.appendChild(h('div', { class: 'card' }, chart(d.tests.slice(-20))));
      app.appendChild(h('h2', null, 'সব পরীক্ষা'));
      app.appendChild(testTable(d.tests.slice(-20).reverse()));
    }

    app.appendChild(h('h2', null, 'ব্যাকআপ'));
    var file = h('input', { type: 'file', accept: '.json,application/json', class: 'hidden' });
    file.addEventListener('change', function () {
      var f = file.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () { try { Store.importJson(String(r.result)); alert('অগ্রগতি ফিরিয়ে আনা হয়েছে।'); route(); } catch (e) { alert('ফাইলটি পড়া যায়নি।'); } };
      r.readAsText(f);
    });
    app.appendChild(h('div', { class: 'card' },
      h('p', { class: 'muted', style: 'margin-top:0' }, 'আপনার অগ্রগতি শুধু এই ব্রাউজারে সংরক্ষিত থাকে। ব্রাউজারের ডেটা মুছলে বা অন্য কম্পিউটারে গেলে হারিয়ে যাবে, তাই ব্যাকআপ রেখে দিন।'),
      h('div', { class: 'row' },
        h('button', { class: 'btn', type: 'button', onclick: function () {
          var a = h('a', { href: URL.createObjectURL(new Blob([Store.exportJson()], { type: 'application/json' })), download: 'bijoy-typing-progress.json' });
          document.body.appendChild(a); a.click(); a.remove();
        } }, 'ব্যাকআপ ডাউনলোড'),
        h('button', { class: 'btn', type: 'button', onclick: function () { file.click(); } }, 'ব্যাকআপ থেকে ফেরান'), file,
        h('span', { class: 'spacer' }),
        h('button', { class: 'btn danger', type: 'button', onclick: function () {
          if (confirm('সব অগ্রগতি মুছে যাবে। নিশ্চিত?')) { Store.reset(); route(); }
        } }, 'সব মুছে ফেলুন'))));
  }

  function chart(tests) {
    var W = 640, H = 180, pad = 28, max = Math.max.apply(null, tests.map(function (t) { return t.wpm; }).concat([10]));
    max = Math.ceil(max / 10) * 10;
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('class', 'chart'); svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'সাম্প্রতিক পরীক্ষাগুলোর WPM');
    function el(n, a, txt) { var e = document.createElementNS(ns, n); Object.keys(a).forEach(function (k) { e.setAttribute(k, a[k]); }); if (txt != null) e.textContent = txt; svg.appendChild(e); return e; }
    [0, 0.5, 1].forEach(function (f) {
      var y = H - pad - f * (H - pad * 1.6);
      el('line', { x1: pad, x2: W - 6, y1: y, y2: y, class: 'grid' });
      el('text', { x: 2, y: y + 4 }, bn(Math.round(max * f)));
    });
    var bw = (W - pad - 10) / tests.length;
    tests.forEach(function (t, i) {
      var bh = (t.wpm / max) * (H - pad * 1.6);
      el('rect', { x: pad + i * bw + bw * 0.15, y: H - pad - bh, width: bw * 0.7, height: Math.max(bh, 1), rx: 3, class: 'bar-r' });
    });
    return svg;
  }

  /* ---------- গাইড ---------- */
  function viewGuide() {
    app.appendChild(h('h1', null, 'শেখার গাইড'));
    app.appendChild(h('p', { class: 'lead' }, 'টাচ টাইপিং মানে কীবোর্ডের দিকে না তাকিয়ে, ১০ আঙুলে টাইপ করা। প্রথম কয়েক দিন ধীর লাগবে — এটাই স্বাভাবিক।'));

    var g = function (title, body) { return h('div', { class: 'card guide-box', style: 'margin-bottom:14px' }, h('h3', null, title), body); };
    app.appendChild(g('১. বসার ভঙ্গি', h('ul', { class: 'tips' },
      h('li', null, 'পিঠ সোজা রাখুন, পা মেঝেতে। কনুই প্রায় ৯০° বাঁকা।'),
      h('li', null, 'পর্দা চোখের সামনে, কীবোর্ড কনুইয়ের সমান উচ্চতায়। কব্জি ঝুলিয়ে বা টেবিলে ভর দিয়ে রাখবেন না।'),
      h('li', null, 'প্রতি ৩০–৪৫ মিনিটে ছোট বিরতি নিন।'))));

    var kb = buildKeyboard({ compact: true });
    app.appendChild(g('২. কোন আঙুল কোন কী', h('div', null,
      h('p', null, 'বাম হাতের আঙুল A S D F-এ, ডান হাতের আঙুল J K L ; -এ রাখুন — এটাই হোম রো। বুড়ো আঙুল স্পেসে। প্রতিটি কী চাপার পর আঙুল হোম রো-তে ফিরিয়ে আনুন।'),
      kb.el, h('div', { style: 'margin-top:8px' }, fingerLegend()))));

    var rules = [
      ['কি', 'ি-কার, ে-কার, ৈ-কার ব্যঞ্জনের আগে টাইপ হয়', 'D, J'],
      ['কা', 'া, ী, ু, ূ, ৃ ব্যঞ্জনের পরে টাইপ হয়', 'J, F'],
      ['কো', 'ো = ে + া (ে ব্যঞ্জনের আগে, া পরে)', 'C, J, F'],
      ['কৌ', 'ৌ = ে + ৗ (ে আগে, ৗ = Shift+X পরে)', 'C, J, ⇧X'],
      ['ক্ষ', 'যুক্তাক্ষর = ব্যঞ্জন + G (হসন্ত) + ব্যঞ্জন', 'J, G, ⇧N'],
      ['ক্র', 'র-ফলা আলাদা Z কী-তে', 'J, Z'],
      ['ক্য', 'য-ফলা = G + W (য)', 'J, G, W'],
      ['কর্ম', 'রেফ (র্) = Shift+A, যে ব্যঞ্জনের উপর বসবে তার পরে', 'J, M, ⇧A'],
      ['আ', 'অ ও ও ছাড়া স্বরবর্ণ = G + কার-কী', 'G, F'],
    ];
    var tb = h('tbody');
    rules.forEach(function (r) { tb.appendChild(h('tr', null, h('td', null, r[0]), h('td', null, r[1]), h('td', null, h('code', { class: 'k' }, r[2])))); });
    app.appendChild(g('৩. বিজয়ের মূল নিয়ম', h('div', { class: 'table-wrap' }, h('table', { class: 'rule-table' }, tb))));

    app.appendChild(g('৪. অনুশীলনের কৌশল', h('ul', { class: 'tips' },
      h('li', null, 'আগে নির্ভুলতা, পরে গতি। নির্ভুলতা ৯৫%-এর নিচে থাকলে গতি বাড়াবেন না।'),
      h('li', null, 'কীবোর্ডের দিকে তাকাবেন না। প্রয়োজনে কীবোর্ড লুকিয়ে অনুশীলন করুন (অনুশীলনীর উপরের "কীবোর্ড লুকান" বোতাম)।'),
      h('li', null, 'প্রতিদিন ২০–৩০ মিনিট, নিয়মিত। একদিনে দুই ঘণ্টার চেয়ে প্রতিদিন আধঘণ্টা ভালো।'),
      h('li', null, 'একটি পাঠে অন্তত ৯০% নির্ভুলতায় সব অনুশীলনী পাস করে পরের পাঠে যান। কঠিন কী-গুলো ফলাফল পাতার "বেশি ভুল" তালিকায় দেখুন।'),
      h('li', null, 'শেষ দিকের পাঠের পর রোজ একটি গতি পরীক্ষা দিন, অগ্রগতি পাতায় ধারা দেখুন।'))));

    app.appendChild(g('৫. WPM কীভাবে মাপা হয়', h('p', null, 'এখানে WPM = (সঠিক কী-স্ট্রোক ÷ ৫) ÷ মিনিট। ভুল চাপ গতিতে যোগ হয় না, শুধু নির্ভুলতা কমায়। বাংলা যুক্তাক্ষরে একাধিক কী লাগে বলে এটি শব্দ গুনে মাপা গতির (শব্দ/মিনিট) সঙ্গে ভিন্ন হতে পারে — তাই ফলাফলে দুটোই দেখানো হয়। সরকারি পরীক্ষায় গতি কীভাবে মাপা হয় ও কত গতি লাগে তা নিয়োগ বিজ্ঞপ্তিতে দেখে নিন।')));

    app.appendChild(g('৬. আসল কম্পিউটারে বিজয় বায়ান্ন', h('ul', { class: 'tips' },
      h('li', null, 'এই অ্যাপ কীবোর্ডের "ফিজিক্যাল কী" দেখে, তাই আপনার কম্পিউটারের ভাষা ইংরেজি থাকলেও কাজ করে। আলাদা কিছু ইনস্টল লাগে না।'),
      h('li', null, 'পরীক্ষার কম্পিউটারে সাধারণত বিজয় বায়ান্ন বা অনুরূপ সফটওয়্যারে লিখতে হয়। এই অ্যাপে কী-পজিশন শিখে সেখানে অনুশীলন করে দেখে নিন।'),
      h('li', null, 'কিছু কী (যেমন ঁ ঃ ৎ ও রেফ) আপনার ব্যবহৃত সংস্করণে ভিন্ন জায়গায় থাকতে পারে। সেক্ষেত্রে অ্যাপের কী-পজিশন বদলানো যায়: js/layout.js ফাইলের MAP তালিকা দেখুন (README-তে নির্দেশ আছে)।'))));
  }

  /* ---------- শুরু ---------- */
  var soundBtn = $('#btn-sound');
  function syncSound() { soundBtn.textContent = Store.setting('sound') ? '🔊' : '🔇'; }
  soundBtn.addEventListener('click', function () { Store.setting('sound', !Store.setting('sound')); syncSound(); soundBtn.blur(); });
  syncSound();
  if (CONFIG.REPO_URL) {
    $('#footer-links').appendChild(h('a', { href: CONFIG.REPO_URL, target: '_blank', rel: 'noopener' }, 'GitHub-এ দেখুন ও অবদান রাখুন'));
  }
  window.addEventListener('hashchange', route);
  route();
})();
