/*
 * lessons.js — পাঠ-তালিকা (curriculum) ও অনুশীলনী তৈরির যন্ত্র
 *
 * প্রতিটি পাঠে:
 *   keys     : এই পাঠে নতুন যে কী-গুলো শেখানো হয় (পরের পাঠে এগুলো "শেখা" ধরা হয়)
 *   newUnits : নতুন অক্ষর / অক্ষর-জোড়া, যা দিয়ে ড্রিল বানানো হয়
 *   tips     : পাঠের টিপস
 * শব্দ ও বাক্য words.js থেকে নেওয়া হয় — শুধু সেই শব্দই আসে যার সব কী আগেই শেখা হয়েছে।
 */
(function (root) {
  'use strict';
  const BT = (root.BT = root.BT || {});
  const Lay = BT.layout;
  const Conv = BT.converter;

  const BASES = ['ক', 'ত', 'দ', 'ব'];
  const combo = function (bases, marks) {
    const out = [];
    bases.forEach(function (b) { marks.forEach(function (m) { out.push(b + m); }); });
    return out;
  };

  const DEFAULT_EX = ['keys', 'pairs', 'triples', 'newwords', 'mix', 'phrases', 'speed', 'challenge'];

  const LESSONS = [
    {
      id: 1,
      title: 'হোম রো: ডান হাত',
      subtitle: 'ব  ক  ত  দ',
      desc: 'টাচ টাইপিংয়ের প্রথম ধাপ। হোম রো-তে আঙুল বসিয়ে ডান হাতের চারটি ব্যঞ্জন শিখুন।',
      keys: ['KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Space'],
      newUnits: ['ক', 'ত', 'দ', 'ব'],
      tips: [
        'বাম হাতের চার আঙুল A S D F কী-তে এবং ডান হাতের চার আঙুল J K L ; কী-তে রাখুন। এটাই "হোম রো"। F ও J কী-তে ছোট উঁচু দাগ থাকে — না তাকিয়ে আঙুল ঠিক জায়গায় আছে কিনা বুঝতে সেটা অনুভব করুন।',
        'ব (H) কী-তে যেতে ডান তর্জনী (J-এর আঙুল) সামান্য বাঁয়ে সরিয়ে চাপুন, তারপর সঙ্গে সঙ্গে J-তে ফিরে আসুন।',
        'স্পেস বার সবসময় ডান হাতের বুড়ো আঙুল দিয়ে চাপুন।',
        'কীবোর্ডের দিকে তাকাবেন না — চোখ থাকবে পর্দার লেখার দিকে। গতির চেয়ে নির্ভুলতা আগে।',
      ],
      exercises: DEFAULT_EX,
    },
    {
      id: 2,
      title: 'হোম রো: বাম হাত ও কার',
      subtitle: 'া  ি  ু  ৃ',
      desc: 'বাম হাতের হোম রো-র চারটি কার-চিহ্ন। বিজয়ের সবচেয়ে গুরুত্বপূর্ণ নিয়ম এখানেই শিখবেন।',
      keys: ['KeyF', 'KeyD', 'KeyS', 'KeyA'],
      newUnits: combo(BASES, ['া', 'ি', 'ু', 'ৃ']),
      tips: [
        'বিজয়ে ি-কার, ে-কার ও ৈ-কার ব্যঞ্জনের আগে টাইপ করতে হয়। যেমন "কি" লিখতে আগে D (ি), তারপর J (ক)।',
        'া ু ৃ ব্যঞ্জনের পরে টাইপ করুন। যেমন "কা" = J (ক) তারপর F (া)।',
        '"বাকি" লিখতে ক্রম হবে: H (ব), F (া), D (ি), J (ক)।',
        'অনুশীলনীতে নিচের "পরের কী" বক্সে দেখে নিন কোন কী-র পর কোনটি চাপতে হবে।',
      ],
      exercises: DEFAULT_EX,
    },
    {
      id: 3,
      title: 'উপরের সারি: ডান হাত',
      subtitle: 'চ  জ  হ  গ',
      desc: 'ডান হাত উপরের সারিতে উঠে চ, জ, হ, গ লিখতে শিখবে।',
      keys: ['KeyY', 'KeyU', 'KeyI', 'KeyO'],
      newUnits: ['চ', 'জ', 'হ', 'গ'],
      tips: [
        'আঙুল উপরে তুলে কী চাপার পর সবসময় আবার হোম রো-তে ফিরে আসুন।',
        'চ (Y) ও জ (U) ডান তর্জনী, হ (I) মধ্যমা, গ (O) অনামিকা দিয়ে চাপুন।',
        'হাত নয়, শুধু আঙুল নড়াবেন। কব্জি স্থির রাখুন।',
      ],
      exercises: DEFAULT_EX,
    },
    {
      id: 4,
      title: 'উপরের সারি: বাম হাত',
      subtitle: 'ঙ  য  ড  প  ট',
      desc: 'বাম হাতের উপরের সারির পাঁচটি ব্যঞ্জন।',
      keys: ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT'],
      newUnits: ['ঙ', 'য', 'ড', 'প', 'ট'],
      tips: [
        'ঙ (Q) বাম কনিষ্ঠা, য (W) অনামিকা, ড (E) মধ্যমা, প (R) ও ট (T) বাম তর্জনী।',
        'T চাপতে তর্জনী ডানে সামান্য বাড়ান, তারপর F-এ ফিরে আসুন।',
      ],
      exercises: DEFAULT_EX,
    },
    {
      id: 5,
      title: 'নিচের সারি: ন স ম র',
      subtitle: 'ন  স  ম  র',
      desc: 'নিচের সারির চারটি সবচেয়ে বেশি ব্যবহৃত ব্যঞ্জন।',
      keys: ['KeyB', 'KeyN', 'KeyM', 'KeyV'],
      newUnits: ['ন', 'স', 'ম', 'র'],
      tips: [
        'র (V) ও ন (B) বাম তর্জনী দিয়ে, স (N) ও ম (M) ডান তর্জনী দিয়ে চাপুন।',
        'নিচের সারিতে আঙুল ভেতরের দিকে গুটিয়ে আনতে হয়, কব্জি তুলে ফেলবেন না।',
      ],
      exercises: DEFAULT_EX,
    },
    {
      id: 6,
      title: 'ে, ো ও ও',
      subtitle: 'ে  ো  ও',
      desc: 'সবচেয়ে বেশি ব্যবহৃত ে-কার ও ো-কার, এবং স্বরবর্ণ ও।',
      keys: ['KeyC', 'KeyX'],
      newUnits: ['কে', 'তে', 'দে', 'বে', 'কো', 'তো', 'দো', 'বো', 'ও'],
      tips: [
        'ে-কার (C) ব্যঞ্জনের আগে টাইপ করতে হয়: "কে" = C তারপর J।',
        'ো-কার = ে + া। ব্যঞ্জনের আগে C, ব্যঞ্জনের পরে F: "কো" = C, J, F।',
        'ও (X) আলাদা কী-তে আছে — স্বরবর্ণ "ও" লিখতে সরাসরি X চাপুন।',
      ],
      exercises: DEFAULT_EX,
    },
    {
      id: 7,
      title: 'শিফট (১): ভ খ থ ধ ঘ ঞ ঝ ছ',
      subtitle: 'ভ  খ  থ  ধ  ঘ  ছ',
      desc: 'Shift চেপে ডান হাতের কী-গুলো থেকে মহাপ্রাণ বর্ণ লিখতে শিখুন।',
      keys: ['Shift+KeyH', 'Shift+KeyJ', 'Shift+KeyK', 'Shift+KeyL', 'Shift+KeyO', 'Shift+KeyI', 'Shift+KeyU', 'Shift+KeyY'],
      newUnits: ['ভ', 'খ', 'থ', 'ধ', 'ঘ', 'ঞ', 'ঝ', 'ছ'],
      tips: [
        'ডান হাতের কী-তে শিফট লাগলে বাম কনিষ্ঠা দিয়ে বাম শিফট চেপে ধরে রাখুন। বাম হাতের কী-তে শিফট লাগলে ডান কনিষ্ঠা দিয়ে ডান শিফট চাপুন।',
        'আগে শিফট চেপে ধরুন, তারপর অক্ষর-কী চাপুন, তারপর দুটোই ছাড়ুন।',
        'কীবোর্ডে প্রতিটি কী-র উপরের অক্ষরটি হলো শিফট-এর অক্ষর।',
      ],
      exercises: DEFAULT_EX,
    },
    {
      id: 8,
      title: 'শিফট (২): ল ণ ষ শ এবং ৈ ৌ',
      subtitle: 'ল  ণ  ষ  শ  ৈ  ৌ',
      desc: 'নিচের সারির শিফট-বর্ণ এবং ঐ-কার, ঔ-কার।',
      keys: ['Shift+KeyV', 'Shift+KeyB', 'Shift+KeyN', 'Shift+KeyM', 'Shift+KeyC', 'Shift+KeyX'],
      newUnits: ['ল', 'ণ', 'ষ', 'শ', 'কৈ', 'বৈ', 'তৈ', 'নৌ', 'কৌ', 'দৌ'],
      tips: [
        'ল = Shift+V, ণ = Shift+B, ষ = Shift+N, শ = Shift+M।',
        'ৈ-কার = Shift+C, ব্যঞ্জনের আগে টাইপ করতে হয়: "কৈ" = Shift+C, J।',
        'ৌ-কার = ে + ৗ: ব্যঞ্জনের আগে C, ব্যঞ্জনের পরে Shift+X: "নৌ" = C, B, Shift+X।',
      ],
      exercises: DEFAULT_EX,
    },
    {
      id: 9,
      title: 'শিফট (৩): ফ ঠ ঢ ং য় ড় ঢ়',
      subtitle: 'ফ  ঠ  ঢ  ং  য়  ড়',
      desc: 'বাম হাতের শিফট-বর্ণ এবং ড়, ঢ়, য় ও অনুস্বার।',
      keys: ['Shift+KeyR', 'Shift+KeyT', 'Shift+KeyE', 'Shift+KeyQ', 'Shift+KeyW', 'KeyP', 'Shift+KeyP'],
      newUnits: ['ফ', 'ঠ', 'ঢ', 'ং', 'য়', 'ড়', 'ঢ়'],
      tips: [
        'য় = Shift+W, ড় = P, ঢ় = Shift+P, ং = Shift+Q।',
        'শিফট-বর্ণ লিখে শিফট ছেড়ে দিতে ভুলবেন না, নইলে পরের অক্ষরও শিফটসহ বের হবে।',
        'P ডান কনিষ্ঠার কী — আঙুল বেশি নড়বে, তাই ধীরে ও নির্ভুলভাবে অভ্যাস করুন।',
      ],
      exercises: DEFAULT_EX,
    },
    {
      id: 10,
      title: 'শিফট (৪): ী ূ অ র্',
      subtitle: 'ী  ূ  অ  র্',
      desc: 'দীর্ঘ কার, অ এবং রেফ (র্) শিখুন।',
      keys: ['Shift+KeyD', 'Shift+KeyS', 'Shift+KeyF', 'Shift+KeyA'],
      newUnits: ['কী', 'তী', 'দী', 'বী', 'কূ', 'তূ', 'দূ', 'বূ', 'অ', 'র্ক', 'র্ত', 'র্দ', 'র্ব'],
      tips: [
        'ী = Shift+D, ূ = Shift+S, অ = Shift+F। এগুলো ব্যঞ্জনের পরে (অ আলাদা বর্ণ হিসেবে) টাইপ হয়।',
        'রেফ (র্) = Shift+A। রেফ যে ব্যঞ্জনের মাথায় বসবে, সেই ব্যঞ্জনটি টাইপ করার পর Shift+A চাপুন। যেমন "কর্ম" = J (ক), M (ম), Shift+A (রেফ)।',
        'রেফের পর ী ু ূ া ইত্যাদি কার থাকলে সেগুলো রেফের পরে টাইপ হবে।',
      ],
      exercises: DEFAULT_EX,
    },
    {
      id: 11,
      title: 'G কী: স্বরবর্ণ',
      subtitle: 'আ  ই  ঈ  উ  ঊ  ঋ  এ  ঐ  ঔ',
      desc: 'বিজয়ে অ ও ও ছাড়া বাকি স্বরবর্ণ G কী (হসন্ত) চেপে টাইপ হয়।',
      tag: 'vowel',
      keys: ['KeyG'],
      newUnits: ['আ', 'ই', 'ঈ', 'উ', 'ঊ', 'ঋ', 'এ', 'ঐ', 'ঔ'],
      tips: [
        'স্বরবর্ণ লিখতে প্রথমে G চাপুন, তারপর সংশ্লিষ্ট কার-কী: আ = G, F; ই = G, D; ঈ = G, Shift+D।',
        'উ = G, S; ঊ = G, Shift+S; ঋ = G, A; এ = G, C; ঐ = G, Shift+C; ঔ = G, Shift+X।',
        'G কী বাম তর্জনী দিয়ে চাপুন। G আর পরের কী দুটো পরপর, একসঙ্গে নয়।',
      ],
      exercises: DEFAULT_EX,
    },
    {
      id: 12,
      title: 'যুক্তাক্ষর ও ফলা',
      subtitle: 'ক্ত  ন্ত  ক্ষ  ক্র  ত্য',
      desc: 'যুক্তবর্ণ (জোড় অক্ষর), র-ফলা, য-ফলা ও ব-ফলা।',
      tag: 'conj',
      keys: ['KeyZ'],
      newUnits: ['ক্ত', 'ন্ত', 'ন্দ', 'ক্ষ', 'স্ত', 'স্ক', 'জ্ঞ', 'ঙ্ক', 'ত্ত', 'দ্ধ', 'ম্প', 'ক্র', 'প্র', 'ত্র', 'গ্র', 'ব্র', 'ক্য', 'ত্য', 'দ্য', 'ন্য', 'স্ব', 'ক্ল'],
      tips: [
        'যুক্তাক্ষর = প্রথম ব্যঞ্জন + G (হসন্ত) + দ্বিতীয় ব্যঞ্জন। যেমন ক্ত = J, G, K; ক্ষ = J, G, Shift+N; জ্ঞ = U, G, Shift+I।',
        'র-ফলা (্র) আলাদা কী Z-তে আছে: ক্র = J, Z; প্র = R, Z; ত্র = K, Z; স্ত্র = N, G, K, Z।',
        'য-ফলা (্য) = G, W: সত্য = N, K, G, W। ব-ফলা (্ব) = G, H: স্বপ্ন = N, G, H, R, G, B।',
        'ি ে ৈ কার যুক্তাক্ষরের আগে বসে: "ক্রিয়া" = D, J, Z, Shift+W, F।',
      ],
      exercises: DEFAULT_EX,
    },
    {
      id: 13,
      title: 'সংখ্যা ও বিরাম চিহ্ন',
      subtitle: '১২৩  ৳  ।  ,  ?',
      desc: 'বাংলা অঙ্ক, টাকার চিহ্ন, দাড়ি (।) এবং অন্যান্য বিরাম চিহ্ন।',
      keys: [
        'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0',
        'Shift+Digit4', 'Shift+KeyG', 'Comma', 'Period', 'Semicolon', 'Shift+Semicolon', 'Shift+Slash',
        'Shift+Digit1', 'Minus', 'Shift+Digit9', 'Shift+Digit0', 'Quote', 'Shift+Quote', 'Slash',
      ],
      newUnits: ['১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '০', '৳'],
      tips: [
        'উপরের সংখ্যার সারিতে আঙুল তুলতে হয়: ১ ২ = বাম কনিষ্ঠা/অনামিকা, ৩ = মধ্যমা, ৪ ৫ = বাম তর্জনী, ৬ ৭ = ডান তর্জনী, ৮ = মধ্যমা, ৯ = অনামিকা, ০ = কনিষ্ঠা।',
        'দাড়ি (।) = Shift+G। কমা (,) ও ডট (.) যথাক্রমে , ও . কী। প্রশ্নচিহ্ন (?) = Shift+/। ৳ = Shift+৪।',
        'বিজয়ে সংখ্যা ও চিহ্নের জন্য আলাদা কোনো সুইচ নেই — শুধু কী-গুলো মুখস্থ করে নিন।',
      ],
      exercises: ['keys', 'numbers', 'years', 'money', 'punct', 'sentences', 'sentences', 'challenge'],
    },
    {
      id: 14,
      title: 'চন্দ্রবিন্দু, বিসর্গ ও খণ্ড-ত',
      subtitle: 'ঁ  ঃ  ৎ',
      desc: 'কম ব্যবহৃত তিনটি চিহ্ন: ঁ (চন্দ্রবিন্দু), ঃ (বিসর্গ), ৎ (খণ্ড ত)।',
      keys: ['Shift+Digit7', 'Backquote', 'Shift+Backquote'],
      newUnits: ['কাঁ', 'চাঁ', 'বাঁ', 'হাঁ', 'কুঁ', 'দুঃ', 'নিঃ', 'ৎ'],
      tips: [
        'ঁ = Shift+৭, ঃ = ` (ব্যাকটিক, ১-এর বাঁ পাশের কী), ৎ = Shift+`।',
        'এই চিহ্নগুলো ব্যঞ্জন/কারের পরে টাইপ হয়: "চাঁদ" = Y, F, Shift+৭, L।',
        'বিরল কী হলেও পরীক্ষার লেখায় প্রায়ই আসে (চাঁদ, দুঃখ, হঠাৎ), তাই অভ্যাস রাখুন।',
      ],
      exercises: ['keys', 'pairs', 'triples', 'newwords', 'mix', 'sentences', 'speed', 'challenge'],
    },
    {
      id: 15,
      title: 'অনুচ্ছেদ অনুশীলন (সহজ–মাঝারি)',
      subtitle: 'পরিপূর্ণ অনুচ্ছেদ টাইপ',
      desc: 'সব কী শেখা শেষ। এবার সম্পূর্ণ অনুচ্ছেদ টাইপ করে গতি ও নির্ভুলতা বাড়ান।',
      keys: [],
      newUnits: [],
      tips: [
        'এখানে প্রতিটি অনুশীলনী একটি পূর্ণ অনুচ্ছেদ। আগে নির্ভুলতা ৯৫%-এর উপরে আনুন, তারপর গতি বাড়ান।',
        'থামবেন না: কোনো ভুল হলে সঠিক কী চাপলে তবেই এগোবে, তাই মনোযোগ ধরে রাখুন।',
      ],
      exercises: [
        { kind: 'passage', passage: 'family' },
        { kind: 'passage', passage: 'country' },
        { kind: 'passage', passage: 'village' },
        { kind: 'passage', passage: 'books' },
        { kind: 'passage', passage: 'monsoon' },
        { kind: 'passage', passage: 'digital' },
        { kind: 'passage', passage: 'time' },
      ],
    },
    {
      id: 16,
      title: 'অনুচ্ছেদ অনুশীলন (কঠিন)',
      subtitle: 'সরকারি পরীক্ষার প্রস্তুতি',
      desc: 'যুক্তাক্ষর, সংখ্যা ও চিহ্নসহ কঠিন অনুচ্ছেদ। সরকারি চাকরির টাইপিং পরীক্ষার উপযোগী অনুশীলন।',
      keys: [],
      newUnits: [],
      tips: [
        'এই অনুচ্ছেদগুলোতে যুক্তাক্ষর, রেফ, সংখ্যা ও বিরাম চিহ্ন আছে — ঠিক যেমন বাস্তব পরীক্ষায় থাকে।',
        'ধীরে শুরু করুন, ছন্দ (rhythm) ধরে রাখুন। ছন্দ ভাঙলে গতি ও নির্ভুলতা দুটোই কমে।',
      ],
      exercises: [
        { kind: 'passage', passage: 'health' },
        { kind: 'passage', passage: 'liberation' },
        { kind: 'passage', passage: 'language' },
        { kind: 'passage', passage: 'environment' },
        { kind: 'passage', passage: 'agriculture' },
        { kind: 'passage', passage: 'space' },
        { kind: 'passage', passage: 'application' },
      ],
    },
  ];

  const KIND_INFO = {
    keys: ['নতুন কী', 'এই পাঠের নতুন অক্ষরগুলো বারবার টাইপ করুন।'],
    pairs: ['জোড়া অনুশীলন', 'নতুন অক্ষরের দুই-দুইটি জোড়া।'],
    triples: ['মিশ্র অক্ষর', 'নতুন ও আগের অক্ষর মিশিয়ে তিন অক্ষরের দল।'],
    newwords: ['নতুন শব্দ', 'এই পাঠের কী ব্যবহার করে তৈরি বাস্তব শব্দ।'],
    mix: ['নতুন–পুরোনো মিশ্রণ', 'অক্ষরের দল ও শব্দ মিশিয়ে অনুশীলন।'],
    phrases: ['শব্দ অনুশীলন', 'শেখা কী-গুলো দিয়ে বিভিন্ন শব্দ।'],
    speed: ['গতি বাড়ান', 'লম্বা তালিকা — ছন্দ ধরে রেখে একটু দ্রুত টাইপ করুন।'],
    challenge: ['চ্যালেঞ্জ', 'এই পাঠের সব নতুন শব্দ আর আগের শব্দের মিশ্রণ।'],
    sentences: ['বাক্য অনুশীলন', 'বাক্য ও বিরাম চিহ্নসহ টাইপ।'],
    numbers: ['সংখ্যা অনুশীলন', 'বাংলা সংখ্যা টাইপ করুন।'],
    years: ['সাল ও তারিখ', 'চার অঙ্কের সাল ও তারিখ।'],
    money: ['টাকার অঙ্ক', '৳ চিহ্নসহ টাকার পরিমাণ।'],
    punct: ['বিরাম চিহ্ন', 'শব্দের পরে । , ? ! : ; - চিহ্ন।'],
  };

  // ---------- র‍্যান্ডম সহায়ক ----------
  const rnd = function (n) { return Math.floor(Math.random() * n); };
  function shuffle(a) {
    const b = a.slice();
    for (let i = b.length - 1; i > 0; i--) {
      const j = rnd(i + 1);
      const t = b[i]; b[i] = b[j]; b[j] = t;
    }
    return b;
  }
  function sample(a, n) {
    const out = [];
    let bag = [];
    if (!a.length) return out;
    while (out.length < n) {
      if (!bag.length) {
        bag = shuffle(a);
        if (out.length && bag.length > 1 && bag[bag.length - 1] === out[out.length - 1]) bag.reverse();
      }
      out.push(bag.pop());
    }
    return out;
  }
  const BN = '০১২৩৪৫৬৭৮৯';
  function bnNum(len) {
    let s = '';
    for (let i = 0; i < len; i++) s += BN[i === 0 && len > 1 ? 1 + rnd(9) : rnd(10)];
    return s;
  }

  // ---------- কারিকুলাম তৈরি ----------
  const intro = {}; // keyId -> পাঠ নম্বর
  LESSONS.forEach(function (l) {
    l.keys.forEach(function (id) { if (!(id in intro)) intro[id] = l.id; });
  });
  const lessonByTag = {};
  LESSONS.forEach(function (l) { if (l.tag) lessonByTag[l.tag] = l.id; });

  function requirementOf(text) {
    let req = 1;
    Conv.toUnits(text).forEach(function (u) {
      u.steps.forEach(function (s) {
        const id = Lay.keyId(s);
        if (id === 'Space') return;
        const lv = intro[id];
        if (lv === undefined) throw new Error('"' + text + '": ' + id + ' কী কোনো পাঠে নেই');
        if (lv > req) req = lv;
      });
      // যুক্তাক্ষর (ব্যঞ্জন + হসন্ত/র-ফলা) হলে যুক্তাক্ষর-পাঠের আগে আসবে না
      const first = u.text.charAt(0);
      const startsWithCons = first >= 'ক' && first <= 'হ';
      if (startsWithCons && u.steps.some(function (s) { return !s.shift && (s.code === 'KeyG' || s.code === 'KeyZ'); })) {
        req = Math.max(req, lessonByTag.conj);
      }
    });
    return req;
  }

  const allUnitsUpTo = [];
  LESSONS.forEach(function (l, idx) {
    l.index = idx;
    l.prevUnits = idx ? allUnitsUpTo[idx - 1] : [];
    allUnitsUpTo.push(l.prevUnits.concat(l.newUnits));
    l.allUnits = allUnitsUpTo[idx];
    l.newWords = [];
    l.allWords = [];
    l.newSentences = [];
    l.sentences = [];
  });

  BT.WORDS.forEach(function (w) {
    const r = requirementOf(w);
    LESSONS.forEach(function (l) {
      if (r === l.id) l.newWords.push(w);
      if (r <= l.id) l.allWords.push(w);
    });
  });
  BT.SENTENCES.forEach(function (s) {
    const r = requirementOf(s);
    LESSONS.forEach(function (l) {
      if (r === l.id) l.newSentences.push(s);
      if (r <= l.id) l.sentences.push(s);
    });
  });

  // exercises স্পেস -> [{kind,title,desc,...}]
  LESSONS.forEach(function (l) {
    l.exerciseList = l.exercises.map(function (e, i) {
      if (typeof e === 'object') {
        const p = BT.PASSAGES.filter(function (x) { return x.id === e.passage; })[0];
        return { kind: 'passage', title: p.title, desc: 'পূর্ণ অনুচ্ছেদ (' + BT.LEVEL_NAMES[p.level] + ')', passage: e.passage };
      }
      const info = KIND_INFO[e];
      let title = info[0];
      if (e === 'sentences' && l.exercises.filter(function (x) { return x === 'sentences'; }).length > 1) {
        title += i === l.exercises.indexOf('sentences') ? ' (১)' : ' (২)';
      }
      return { kind: e, title: title, desc: info[1] };
    });
  });

  function joinWords(arr) { return arr.join(' '); }

  function makeText(lessonId, exIndex) {
    const L = LESSONS[lessonId - 1];
    const ex = L.exerciseList[exIndex];
    const units = L.newUnits.length ? L.newUnits : L.allUnits;
    const pool = L.allUnits;
    const words = L.allWords;
    const nw = L.newWords;
    const pw = function (arr, n) { return joinWords(sample(arr, n)); };

    switch (ex.kind) {
      case 'passage': {
        return BT.PASSAGES.filter(function (x) { return x.id === ex.passage; })[0].text;
      }
      case 'keys': {
        const n = Math.max(10, Math.min(24, units.length * 2));
        const groups = sample(units, n);
        return groups.map(function (u) {
          const r = Conv.toUnits(u).length > 1 || u.length > 1 ? 2 : 3;
          return new Array(r + 1).join(u);
        }).join(' ');
      }
      case 'pairs': {
        const out = [];
        for (let i = 0; i < 20; i++) {
          const a = units[rnd(units.length)];
          let b = units[rnd(units.length)];
          if (units.length > 1) while (b === a) b = units[rnd(units.length)];
          out.push(a + b);
        }
        return joinWords(out);
      }
      case 'triples': {
        const weighted = units.concat(units, L.prevUnits.length ? L.prevUnits : []);
        const out = [];
        for (let i = 0; i < 18; i++) {
          let w = '';
          for (let k = 0; k < 3; k++) w += weighted[rnd(weighted.length)];
          out.push(w);
        }
        return joinWords(out);
      }
      case 'newwords':
        if (nw.length >= 3) return pw(nw, 20);
        return pw(words, 20);
      case 'mix': {
        const out = [];
        const real = sample(words, 14);
        const pseudo = [];
        for (let i = 0; i < 8; i++) {
          let w = '';
          for (let k = 0; k < 3; k++) w += pool[rnd(pool.length)];
          pseudo.push(w);
        }
        return joinWords(shuffle(out.concat(real, pseudo)));
      }
      case 'phrases':
        return pw(words, 26);
      case 'speed':
        return pw(words, 42);
      case 'challenge': {
        const base = nw.length >= 3 ? nw.concat(nw) : [];
        return joinWords(shuffle(base.concat(sample(words, Math.max(24, 50 - base.length)))));
      }
      case 'sentences': {
        const pools = L.newSentences.length >= 3 ? L.newSentences.concat(L.sentences) : L.sentences;
        if (pools.length < 2) return pw(words, 26);
        return joinWords(sample(Array.from(new Set(pools)), 6));
      }
      case 'numbers': {
        const out = [];
        for (let i = 0; i < 22; i++) out.push(bnNum(2 + rnd(3)));
        return joinWords(out);
      }
      case 'years': {
        const out = [];
        for (let i = 0; i < 18; i++) {
          const n = i % 3 === 2 ? 1 + rnd(31) : 1900 + rnd(200);
          out.push(String(n).replace(/\d/g, function (d) { return BN[d]; }));
        }
        return joinWords(out);
      }
      case 'money': {
        const out = [];
        for (let i = 0; i < 16; i++) out.push('৳' + bnNum(2 + rnd(4)));
        return joinWords(out);
      }
      case 'punct': {
        const marks = [',', '।', '?', '!', ':', ';', '-'];
        const ws = sample(words, 18);
        return joinWords(ws.map(function (w) { return w + marks[rnd(marks.length)]; }));
      }
      default:
        return pw(words, 24);
    }
  }

  BT.curriculum = {
    lessons: LESSONS,
    intro: intro,
    requirementOf: requirementOf,
    makeText: makeText,
    getLesson: function (id) { return LESSONS[id - 1]; },
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = BT.curriculum;
})(typeof window !== 'undefined' ? window : globalThis);
