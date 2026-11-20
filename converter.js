/*
 * converter.js — Unicode বাংলা লেখা -> বিজয় কী-সিকোয়েন্স
 *
 * বিজয়ের নিয়ম (যা এখানে বাস্তবায়ন করা হয়েছে):
 *  - ি ে ৈ কার ব্যঞ্জনের আগে টাইপ করতে হয়          (কি = D, J)
 *  - ো = ে + া  (ব্যঞ্জনের আগে ে, পরে া)            (কো = C, J, F)
 *  - ৌ = ে + ৗ  (ব্যঞ্জনের আগে ে, পরে Shift+X)      (কৌ = C, J, Shift+X)
 *  - া ী ু ূ ৃ ব্যঞ্জনের পরে
 *  - যুক্তাক্ষর: ব্যঞ্জন + G (হসন্ত) + ব্যঞ্জন         (ক্ষ = J, G, Shift+N)
 *  - র-ফলা (্র) = Z                                  (ক্র = J, Z)
 *  - রেফ (র্) = Shift+A, যে ব্যঞ্জনের উপর বসবে তার পরে (কর্ম = J, M, Shift+A)
 *  - আ ই ঈ উ ঊ ঋ এ ঐ ঔ = G + সংশ্লিষ্ট কার-কী
 */
(function (root) {
  'use strict';
  const BT = (root.BT = root.BT || {});
  const L = BT.layout;
  const REV = L.REV;
  const HAS = L.HAS;

  const S = function (code, shift) { return { code: code, shift: !!shift }; };
  const G = S('KeyG');
  const SPACE = S('Space');
  const RAPHALA = S('KeyZ');
  const REPH = S('KeyA', true);

  const isCons = function (c) {
    return !!c && ((c >= 'ক' && c <= 'হ') || c === 'ড়' || c === 'ঢ়' || c === 'য়');
  };
  const POST = new Set(['া', 'ী', 'ু', 'ূ', 'ৃ', 'ৗ']); // া ী ু ূ ৃ ৗ
  const MOD = new Set(['ং', 'ঃ', 'ঁ']); // ং ঃ ঁ

  // স্বাধীন স্বরবর্ণ
  const IND = {
    'অ': [S('KeyF', true)],
    'আ': [G, S('KeyF')],
    'ই': [G, S('KeyD')],
    'ঈ': [G, S('KeyD', true)],
    'উ': [G, S('KeyS')],
    'ঊ': [G, S('KeyS', true)],
    'ঋ': [G, S('KeyA')],
    'এ': [G, S('KeyC')],
    'ঐ': [G, S('KeyC', true)],
    'ও': [S('KeyX')],
    'ঔ': [G, S('KeyX', true)],
  };

  function stepFor(ch) {
    const k = REV[ch];
    if (!k) {
      const hex = ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0');
      throw new Error('বিজয়ে এই অক্ষর পাওয়া যায়নি: "' + ch + '" (U+' + hex + ')');
    }
    return S(k.code, k.shift);
  }

  function normalize(t) {
    return String(t)
      .replace(/\r?\n|\t/g, ' ')
      .replace(/ড়/g, 'ড়')
      .replace(/ঢ়/g, 'ঢ়')
      .replace(/য়/g, 'য়')
      .replace(/ো/g, 'ো')
      .replace(/ৌ/g, 'ৌ')
      .replace(/ +/g, ' ')
      .trim();
  }

  // কার/চিহ্ন পড়ে pre (আগে টাইপ) ও post (পরে টাইপ) তালিকায় রাখে
  function readMarks(t, i, pre, post) {
    while (i < t.length) {
      const k = t[i];
      if (k === 'ি' || k === 'ে' || k === 'ৈ') {
        pre.push(stepFor(k));
      } else if (k === 'ো') { // ো
        pre.push(stepFor('ে'));
        post.push(stepFor('া'));
      } else if (k === 'ৌ') { // ৌ
        pre.push(stepFor('ে'));
        post.push(stepFor('ৗ'));
      } else if (POST.has(k) || MOD.has(k)) {
        post.push(stepFor(k));
      } else {
        break;
      }
      i++;
    }
    return i;
  }

  /** text -> [{ text, steps: [{code, shift}] }] (প্রতিটি আইটেম একটি "ইউনিট": অক্ষর/যুক্তাক্ষর) */
  function toUnits(raw) {
    const t = normalize(raw);
    const out = [];
    let i = 0;
    while (i < t.length) {
      const start = i;
      const c = t[i];

      if (c === ' ') {
        out.push({ text: ' ', steps: [SPACE] });
        i++;
        continue;
      }

      if (isCons(c)) {
        const pre = [];
        const core = [];
        const post = [];
        let reph = false;
        if (c === 'র' && t[i + 1] === HAS && isCons(t[i + 2])) {
          reph = true; // র + ্ + ব্যঞ্জন = রেফ
          i += 2;
        }
        core.push(stepFor(t[i]));
        i++;
        while (t[i] === HAS && isCons(t[i + 1])) {
          const nx = t[i + 1];
          if (nx === 'র') {
            core.push(RAPHALA);
          } else {
            core.push(G);
            core.push(stepFor(nx));
          }
          i += 2;
        }
        i = readMarks(t, i, pre, post);
        out.push({
          text: t.slice(start, i),
          steps: [].concat(pre, core, reph ? [REPH] : [], post),
        });
        continue;
      }

      if (IND[c]) {
        i++;
        const pre = [];
        const post = [];
        i = readMarks(t, i, pre, post);
        out.push({ text: t.slice(start, i), steps: [].concat(IND[c], pre, post) });
        continue;
      }

      // সংখ্যা, চিহ্ন, ৎ, একা ঁ ঃ ং ইত্যাদি
      out.push({ text: c, steps: [stepFor(c)] });
      i++;
    }
    return out;
  }

  function toSteps(text) {
    return toUnits(text).reduce(function (a, u) { return a.concat(u.steps); }, []);
  }

  BT.converter = {
    toUnits: toUnits,
    toSteps: toSteps,
    normalize: normalize,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = BT.converter;
})(typeof window !== 'undefined' ? window : globalThis);
