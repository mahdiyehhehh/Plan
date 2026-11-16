// Read-only audit: which German words appear in tests/quizzes before they were taught?
// Usage: node tools/audit-vocab.js [maxDay]   (default 30)
const fs = require("fs");
const src = fs.readFileSync(__dirname + "/../app.js", "utf8");
const grab = (a, b) => src.slice(src.indexOf(a), src.indexOf(b));
const D = new Function(grab("function L(topic", "const PHASES") + ";return GERMAN_DAYS;")();
const T = new Function(grab("const GERMAN_TESTS", "function renderGermanProgressRing") + ";return GERMAN_TESTS;")();
const maxDay = +process.argv[2] || 30;
const tok = s => (String(s).toLowerCase().match(/[a-zäöüß]+/g) || []);
// words "taught" on day N = German text of lessons up to and including N (example, natural, vocab)
const taughtBy = {};
const seen = new Set();
D.slice(0, maxDay).forEach((d, i) => {
  d.lessons.forEach(l => [l.example, l.natural, ...(l.vocab || [])].forEach(t => tok(t).forEach(w => seen.add(w))));
  taughtBy[i + 1] = new Set(seen);
});
// Tests: assume test N is taken after day N*3 (placeholder mapping, to be confirmed with the user)
T.slice(0, 10).forEach((t, i) => {
  const day = Math.min(maxDay, (i + 1) * 3);
  const taught = taughtBy[day];
  const unknown = new Set();
  t.questions.forEach(q => [q.q, ...q.options].forEach(s => tok(s).forEach(w => { if (!taught.has(w) && w.length > 2) unknown.add(w); })));
  console.log(`${t.id} "${t.title}" (checked vs Day ${day}): ${unknown.size} unseen words ->`, [...unknown].slice(0, 25).join(", "));
});
