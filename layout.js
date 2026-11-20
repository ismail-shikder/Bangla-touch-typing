/*
 * layout.js — বিজয় কীবোর্ড লেআউট (কী-পজিশন) ও আঙুলের ম্যাপ
 *
 * MAP: কীবোর্ডের physical key (KeyboardEvent.code) -> [স্বাভাবিক, Shift চাপলে]
 * যে কোনো OS/কীবোর্ড সেটিংয়েই কাজ করে, কারণ আমরা event.code (physical key) দেখি।
 *
 * ⚠ বিরল তিনটি কী (ঁ ঃ ৎ) এবং রেফ (র্) যদি আপনার বিজয় কীবোর্ডে অন্য জায়গায় থাকে,
 *   তাহলে শুধু নিচের MAP-এ বদলে দিলেই সব ঠিক হয়ে যাবে।
 */
(function (root) {
  'use strict';
  const BT = (root.BT = root.BT || {});

  // Unicode escapes ব্যবহার করা হয়েছে যাতে ড় ঢ় য় সবসময় একটি code point থাকে।
  const DRA = 'ড়'; // ড়
  const DHRA = 'ঢ়'; // ঢ়
  const YRA = 'য়'; // য়
  const HAS = '্'; // হসন্ত ্

  const MAP = {
    Backquote: ['ঃ', 'ৎ'],
    Digit1: ['১', '!'],
    Digit2: ['২', '@'],
    Digit3: ['৩', '#'],
    Digit4: ['৪', '৳'],
    Digit5: ['৫', '%'],
    Digit6: ['৬', '^'],
    Digit7: ['৭', 'ঁ'],
    Digit8: ['৮', '*'],
    Digit9: ['৯', '('],
    Digit0: ['০', ')'],
    Minus: ['-', '_'],
    Equal: ['=', '+'],

    KeyQ: ['ঙ', 'ং'],
    KeyW: ['য', YRA],
    KeyE: ['ড', 'ঢ'],
    KeyR: ['প', 'ফ'],
    KeyT: ['ট', 'ঠ'],
    KeyY: ['চ', 'ছ'],
    KeyU: ['জ', 'ঝ'],
    KeyI: ['হ', 'ঞ'],
    KeyO: ['গ', 'ঘ'],
    KeyP: [DRA, DHRA],
    BracketLeft: ['[', '{'],
    BracketRight: [']', '}'],
    Backslash: ['\\', '|'],

    KeyA: ['ৃ', 'র' + HAS], // Shift+A = রেফ (র্)
    KeyS: ['ু', 'ূ'],
    KeyD: ['ি', 'ী'],
    KeyF: ['া', 'অ'],
    KeyG: [HAS, '।'],
    KeyH: ['ব', 'ভ'],
    KeyJ: ['ক', 'খ'],
    KeyK: ['ত', 'থ'],
    KeyL: ['দ', 'ধ'],
    Semicolon: [';', ':'],
    Quote: ["'", '"'],

    KeyZ: [HAS + 'র', ''], // Z = র-ফলা (্র)। Shift+Z এই অ্যাপে ব্যবহার হয় না
    KeyX: ['ও', 'ৗ'], // Shift+X = ৗ (ঔ-কার/ৌ এর অংশ)
    KeyC: ['ে', 'ৈ'],
    KeyV: ['র', 'ল'],
    KeyB: ['ন', 'ণ'],
    KeyN: ['স', 'ষ'],
    KeyM: ['ম', 'শ'],
    Comma: [',', '<'],
    Period: ['.', '>'],
    Slash: ['/', '?'],
  };

  // কোন কী কোন আঙুলে। L = বাম, R = ডান; 1 = বুড়ো, 2 = তর্জনী, 3 = মধ্যমা, 4 = অনামিকা, 5 = কনিষ্ঠা
  const FINGER = {
    Backquote: 'L5', Digit1: 'L5', Digit2: 'L4', Digit3: 'L3', Digit4: 'L2', Digit5: 'L2',
    Digit6: 'R2', Digit7: 'R2', Digit8: 'R3', Digit9: 'R4', Digit0: 'R5', Minus: 'R5', Equal: 'R5',
    KeyQ: 'L5', KeyW: 'L4', KeyE: 'L3', KeyR: 'L2', KeyT: 'L2',
    KeyY: 'R2', KeyU: 'R2', KeyI: 'R3', KeyO: 'R4', KeyP: 'R5',
    BracketLeft: 'R5', BracketRight: 'R5', Backslash: 'R5',
    KeyA: 'L5', KeyS: 'L4', KeyD: 'L3', KeyF: 'L2', KeyG: 'L2',
    KeyH: 'R2', KeyJ: 'R2', KeyK: 'R3', KeyL: 'R4', Semicolon: 'R5', Quote: 'R5',
    KeyZ: 'L5', KeyX: 'L4', KeyC: 'L3', KeyV: 'L2', KeyB: 'L2',
    KeyN: 'R2', KeyM: 'R2', Comma: 'R3', Period: 'R4', Slash: 'R5',
    Space: 'R1',
  };

  const FINGER_NAMES = {
    L5: 'বাম হাতের কনিষ্ঠা (ছোট আঙুল)',
    L4: 'বাম হাতের অনামিকা',
    L3: 'বাম হাতের মধ্যমা',
    L2: 'বাম হাতের তর্জনী',
    L1: 'বাম হাতের বুড়ো আঙুল',
    R1: 'ডান হাতের বুড়ো আঙুল',
    R2: 'ডান হাতের তর্জনী',
    R3: 'ডান হাতের মধ্যমা',
    R4: 'ডান হাতের অনামিকা',
    R5: 'ডান হাতের কনিষ্ঠা (ছোট আঙুল)',
  };

  const EN_LABEL = {
    Backquote: '`', Minus: '-', Equal: '=', BracketLeft: '[', BracketRight: ']', Backslash: '\\',
    Semicolon: ';', Quote: "'", Comma: ',', Period: '.', Slash: '/', Space: 'Space',
  };
  function enLabel(code) {
    if (EN_LABEL[code]) return EN_LABEL[code];
    if (code.startsWith('Key')) return code.slice(3);
    if (code.startsWith('Digit')) return code.slice(5);
    return code;
  }

  // কীবোর্ডের সারি (দৃশ্যমান কীবোর্ড আঁকার জন্য)। প্রতিটি আইটেম [code, প্রস্থ]
  const ROWS = [
    [['Backquote', 1], ['Digit1', 1], ['Digit2', 1], ['Digit3', 1], ['Digit4', 1], ['Digit5', 1], ['Digit6', 1],
      ['Digit7', 1], ['Digit8', 1], ['Digit9', 1], ['Digit0', 1], ['Minus', 1], ['Equal', 1], ['_Backspace', 2]],
    [['_Tab', 1.5], ['KeyQ', 1], ['KeyW', 1], ['KeyE', 1], ['KeyR', 1], ['KeyT', 1], ['KeyY', 1], ['KeyU', 1],
      ['KeyI', 1], ['KeyO', 1], ['KeyP', 1], ['BracketLeft', 1], ['BracketRight', 1], ['Backslash', 1.5]],
    [['_Caps', 1.75], ['KeyA', 1], ['KeyS', 1], ['KeyD', 1], ['KeyF', 1], ['KeyG', 1], ['KeyH', 1], ['KeyJ', 1],
      ['KeyK', 1], ['KeyL', 1], ['Semicolon', 1], ['Quote', 1], ['_Enter', 2.25]],
    [['ShiftLeft', 2.25], ['KeyZ', 1], ['KeyX', 1], ['KeyC', 1], ['KeyV', 1], ['KeyB', 1], ['KeyN', 1], ['KeyM', 1],
      ['Comma', 1], ['Period', 1], ['Slash', 1], ['ShiftRight', 2.75]],
    [['_sp1', 3.5], ['Space', 8], ['_sp2', 3.5]],
  ];

  // উল্টো ম্যাপ: অক্ষর -> {code, shift}
  const REV = {};
  Object.keys(MAP).forEach(function (code) {
    const pair = MAP[code];
    [0, 1].forEach(function (s) {
      const ch = pair[s];
      if (ch.length === 1 && !(ch in REV)) REV[ch] = { code: code, shift: s === 1 };
    });
  });
  REV[' '] = { code: 'Space', shift: false };

  const SPECIAL = {
    hasanta: { code: 'KeyG', shift: false },
    raphala: { code: 'KeyZ', shift: false },
    reph: { code: 'KeyA', shift: true },
  };

  function keyId(step) {
    return (step.shift ? 'Shift+' : '') + step.code;
  }
  function handOf(code) {
    return (FINGER[code] || 'R1').charAt(0);
  }
  // যে আঙুল দিয়ে Shift চাপতে হবে (বিপরীত হাতের কনিষ্ঠা)
  function shiftFingerFor(code) {
    return handOf(code) === 'L' ? 'R5' : 'L5';
  }
  function charOfKeyId(id) {
    const shift = id.indexOf('Shift+') === 0;
    const code = shift ? id.slice(6) : id;
    if (code === 'Space') return 'স্পেস';
    return MAP[code] ? MAP[code][shift ? 1 : 0] : '';
  }

  BT.layout = {
    MAP: MAP,
    FINGER: FINGER,
    FINGER_NAMES: FINGER_NAMES,
    ROWS: ROWS,
    REV: REV,
    SPECIAL: SPECIAL,
    enLabel: enLabel,
    keyId: keyId,
    handOf: handOf,
    shiftFingerFor: shiftFingerFor,
    charOfKeyId: charOfKeyId,
    HAS: HAS,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = BT.layout;
})(typeof window !== 'undefined' ? window : globalThis);
