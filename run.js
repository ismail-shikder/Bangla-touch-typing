/*
 * tests/run.js — প্রকল্পের মূল যুক্তি যাচাই করে।
 * চালানোর নিয়ম:  node tests/run.js
 */
const path = require('path');
const load = (f) => require(path.join(__dirname, '..', 'js', f));
load('layout.js');
load('converter.js');
load('words.js');
load('passages.js');
load('lessons.js');

const BT = globalThis.BT;
const { toUnits } = BT.converter;
const L = BT.layout;
let failed = 0;
const fail = (m) => { failed++; console.error('✗ ' + m); };
const ok = (m) => console.log('✓ ' + m);

const label = (s) => (s.shift ? 'Shift+' : '') + L.enLabel(s.code);
const seq = (text) => toUnits(text).map((u) => u.steps.map(label).join(' ')).join(' | ');

// ১) পরিচিত শব্দের কী-সিকোয়েন্স
const expect = {
  'ক্ষ': 'J G Shift+N',
  'দিক': 'D L | J',
  'কো': 'C J F',
  'নৌকা': 'C B Shift+X | J F',
  'কর্ম': 'J | M Shift+A',
  'সূর্য': 'N Shift+S | W Shift+A',
  'ক্রিয়া': 'D J Z | Shift+W F',
  'আমি': 'G F | D M',
  'বাংলা': 'H F Shift+Q | Shift+V F',
  'স্বপ্ন': 'N G H | R G B',
  'ক্র': 'J Z',
  'ত্র': 'K Z',
  'স্ত্র': 'N G K Z',
  'ক্ত': 'J G K',
  'জ্ঞ': 'U G Shift+I',
  'ড়': 'P',
  'ওষুধ': 'X | Shift+N S | Shift+L',
};
Object.keys(expect).forEach((w) => {
  const got = seq(w);
  if (got === expect[w]) ok(w + ' → ' + got);
  else fail(w + ': পেলাম "' + got + '", আশা ছিল "' + expect[w] + '"');
});

// ২) decomposed ড় ঢ় য় একই ফল দেয়
['ড়', 'ঢ়', 'য়'].forEach((w) => {
  const a = seq(w), b = seq(w.normalize('NFC').replace(/ড়/, 'ড়').replace(/ঢ়/, 'ঢ়').replace(/য়/, 'য়'));
  if (a === b && a) ok('nukta-রূপ ঠিক: ' + a); else fail('nukta-রূপ সমস্যা ' + a + ' vs ' + b);
});

// ৩) প্রতিটি শব্দ/বাক্য/অনুচ্ছেদ কনভার্ট হয় এবং ইউনিট জোড়া লাগালে মূল লেখাই ফেরে
const roundTrip = (text, name) => {
  try {
    const joined = toUnits(text).map((u) => u.text).join('');
    if (joined !== BT.converter.normalize(text)) fail(name + ': round-trip মেলেনি');
  } catch (e) { fail(name + ': ' + e.message); }
};
BT.WORDS.forEach((w) => roundTrip(w, 'শব্দ ' + w));
BT.SENTENCES.forEach((s) => roundTrip(s, 'বাক্য ' + s));
BT.PASSAGES.forEach((p) => roundTrip(p.text, 'অনুচ্ছেদ ' + p.id));
ok('সব শব্দ (' + BT.WORDS.length + '), বাক্য (' + BT.SENTENCES.length + '), অনুচ্ছেদ (' + BT.PASSAGES.length + ') কনভার্ট করা হয়েছে');

// ৪) প্রতিটি অনুচ্ছেদের প্রতিটি কী কোনো-না-কোনো পাঠে শেখানো হয়
const C = BT.curriculum;
BT.PASSAGES.forEach((p) => {
  try { const r = C.requirementOf(p.text); ok('অনুচ্ছেদ ' + p.id + ' → পাঠ ' + r + '-এর পরে টাইপযোগ্য'); }
  catch (e) { fail('অনুচ্ছেদ ' + p.id + ': ' + e.message); }
});

// ৫) প্রতিটি পাঠের newUnits ও সংশ্লিষ্ট কী যাচাই; ড্রিলে কোনো নতুন-নয় এমন কী আসে কিনা
C.lessons.forEach((l) => {
  l.newUnits.forEach((u) => {
    try {
      toUnits(u).forEach((x) => x.steps.forEach((s) => {
        const id = L.keyId(s);
        if (id !== 'Space' && C.intro[id] === undefined) fail('পাঠ ' + l.id + ' ইউনিট ' + u + ': ' + id + ' কোনো পাঠে নেই');
        else if (id !== 'Space' && C.intro[id] > l.id) fail('পাঠ ' + l.id + ' ইউনিট ' + u + ': ' + id + ' পরের পাঠে (' + C.intro[id] + ') শেখানো হয়');
      }));
    } catch (e) { fail('পাঠ ' + l.id + ' ইউনিট ' + u + ': ' + e.message); }
  });
});

// ৬) প্রতিটি পাঠের প্রতিটি অনুশীলনী কয়েকবার তৈরি করে দেখি
C.lessons.forEach((l) => {
  l.exerciseList.forEach((ex, i) => {
    for (let t = 0; t < 8; t++) {
      try {
        const txt = C.makeText(l.id, i);
        if (!txt || txt.length < 3) { fail('পাঠ ' + l.id + ' অনুশীলনী ' + (i + 1) + ' খালি'); break; }
        const units = toUnits(txt);
        units.forEach((u) => u.steps.forEach((s) => {
          const id = L.keyId(s);
          if (id !== 'Space' && C.intro[id] > l.id && ex.kind !== 'passage') throw new Error('অশেখা কী ' + id + ' (' + u.text + ')');
        }));
      } catch (e) { fail('পাঠ ' + l.id + ' অনুশীলনী ' + (i + 1) + ' (' + ex.kind + '): ' + e.message); break; }
    }
  });
});
ok('সব অনুশীলনী তৈরি হয়েছে');

// ৭) পাঠভিত্তিক শব্দ সংখ্যা
C.lessons.forEach((l) => console.log('  পাঠ ' + l.id + ' (' + l.title + '): নতুন শব্দ ' + l.newWords.length + ', মোট শব্দ ' + l.allWords.length + ', বাক্য ' + l.sentences.length));

if (failed) { console.error('\n' + failed + 'টি সমস্যা পাওয়া গেছে'); process.exit(1); }
console.log('\nসব পরীক্ষা পাস ✔');
