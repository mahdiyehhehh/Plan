/* ===================== ext-words.js — Step 2 (engine) =====================
   Words & chunks the way a German child learns them:
   - tap any German word (lessons, tests, reading, listening) -> meaning, article + plural,
     an example sentence, Forvo, dict.cc / Wiktionary, "add to my deck"
   - "Words you'll meet" before every test / listening / reading / mock exam
   - "Words in this lesson" under every lesson that has no vocabulary list
   - new "Words" tab: flashcards (Leitner boxes, max 20 new words a day), chunk Q&A
     (scene + question -> say the chunk), fill-the-gap, say-it-aloud, chunk library, my words
   - nouns are colour-coded everywhere: der blue, die red, das green
   Needs (loaded before this file): ext-glossary.js, ext-chunks.js.
   SAVED DATA: only ADDS state.german.vocab (safe defaults). Nothing existing is renamed,
   changed or deleted. Remove this script tag and the site behaves exactly as before.
   ======================================================================== */
(function(){
  "use strict";
  if(typeof state === "undefined" || typeof saveData !== "function"){ console.warn("ext-words: app.js not ready"); return; }
  if(!Array.isArray(window.XW_GLOSS_RAW) || !Array.isArray(window.XW_CHUNKS)){ console.warn("ext-words: load ext-glossary.js and ext-chunks.js first"); return; }

  /* ---- safety net (same as Step 1; does nothing if the backup already exists) ---- */
  try{
    const raw = localStorage.getItem(STORAGE_KEY), bk = STORAGE_KEY + ".backup-before-boost";
    if(raw && !localStorage.getItem(bk)) localStorage.setItem(bk, raw);
  }catch(e){}

  /* =============================== helpers =============================== */
  const E = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const pad = n => String(n).padStart(2,"0");
  const isoOf = d => d.getFullYear() + "-" + pad(d.getMonth()+1) + "-" + pad(d.getDate());
  const today = () => isoOf(new Date());
  const plusDays = (iso,n) => { const p = iso.split("-").map(Number); return isoOf(new Date(p[0],p[1]-1,p[2]+n)); };
  const shuffle = a => { a = a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const G = name => { try{ return (0,eval)(name); }catch(e){ return null; } };
  const TOKRE = /[A-Za-zÄÖÜäöüß]+/g;
  const ENGLISH = new Set("the and you your this that is are to of with for not it or be as have what when how was will can".split(" "));
  const NEW_CAP = 20;                              // new words introduced per day
  const BOX_DAYS = [0,1,2,4,7,14,30];              // Leitner boxes 1..6 -> days until next review
  const gcls = g => g ? "xw-" + g : "";
  const art = g => g ? `<span class="xw-art ${gcls(g)}">${g}</span> ` : "";
  const say = (text, rate) => { try{ if(window.speechSynthesis && typeof speakGerman === "function") speakGerman(text, rate || 0.9); }catch(e){} };
  const forvo = w => "https://forvo.com/word/" + encodeURIComponent(String(w).toLowerCase()) + "/#de";
  const dictcc = w => "https://www.dict.cc/?s=" + encodeURIComponent(w);
  const wikt = w => "https://de.wiktionary.org/wiki/" + encodeURIComponent(w);
  const ext = (url, label) => `<a class="xw-link" href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  const hl = s => E(s).replace(/\[\[(.+?)\]\]/g, '<mark class="xw-hl">$1</mark>');
  const plain = s => String(s).replace(/\[\[(.+?)\]\]/g, "$1");

  /* =============================== saved data =============================== */
  function V(){
    if(!state.german || typeof state.german !== "object") state.german = {};
    const g = state.german;
    if(!g.vocab || typeof g.vocab !== "object") g.vocab = {};
    const v = g.vocab;
    if(!v.cards)  v.cards = {};                      // flashcards  { id: {box,due,added,seen,ok,...} }
    if(!v.chunks) v.chunks = {};                     // chunk drills { "family-id#variant": {box,due,seen,ok,think} }
    if(!v.newToday || typeof v.newToday !== "object") v.newToday = {date:"", n:0};
    if(!v.chunkToday || typeof v.chunkToday !== "object") v.chunkToday = {date:"", n:{}};
    if(!v.shadowToday || typeof v.shadowToday !== "object") v.shadowToday = {date:"", n:0};
    if(!v.log) v.log = {};                           // per-day counts (used by Step 3 progress)
    return v;
  }
  function persist(){ try{ saveData(); }catch(e){ console.warn("ext-words: could not save", e); } }
  function logToday(key, n){ const v = V(), t = today(); const d = v.log[t] || (v.log[t] = {}); d[key] = (d[key]||0) + (n||1); }

  /* =============================== glossary =============================== */
  const ENTS = [], FORM = new Map(), BYID = new Map();
  function addForm(f, e){
    f = String(f||"").toLowerCase().trim(); if(!f) return;
    let a = FORM.get(f); if(!a){ a = []; FORM.set(f, a); }
    if(a.indexOf(e) < 0) a.push(e);
  }
  function verbTokens(inf, part){
    let t = part.trim().split(/\s+/).filter(w => !/^(ist|hat|sich)$/.test(w));
    if(t.length > 1){ const last = t[t.length-1]; t = inf.replace(/^sich\s+/,"").indexOf(last) === 0 ? [t[0]] : [last]; }
    return t;
  }
  function register(e){
    let id = e.id, k = 2; while(BYID.has(id)) id = e.id + "#" + (k++);
    e.id = id; ENTS.push(e); BYID.set(id, e);
  }
  XW_GLOSS_RAW.forEach(line => {
    const p = String(line).split("|"), t = p[0], lem = p[1] || "", en = p[2] || "", extra = p[3] || "";
    const parts = lem.split(",").map(s => s.trim());
    let e = null;
    if(t === "n"){
      const m = parts[0].match(/^(der|die|das)\s+(.+)$/); if(!m) return;
      e = {id:"n:"+m[2].toLowerCase(), t:"n", g:m[1], w:m[2], pl:parts[1] || null, en};
      addForm(m[2], e); if(e.pl && e.pl !== "–") addForm(e.pl, e);
    }else if(t === "v"){
      const inf = parts[0];
      e = {id:"v:"+inf.toLowerCase(), t:"v", w:inf, forms:parts.slice(1), en};
      addForm(inf.replace(/^sich\s+/,""), e); addForm(inf, e);
      parts.slice(1).forEach(pt => verbTokens(inf, pt).forEach(f => addForm(f, e)));
    }else if(t === "a"){
      e = {id:"a:"+parts[0].toLowerCase(), t:"a", w:parts[0], forms:parts.slice(1), en};
      addForm(parts[0], e);
      parts.slice(1).forEach(f => f.split(/\s+/).forEach(w => { if(w !== "am") addForm(w, e); }));
    }else{
      e = {id:"x:"+lem.toLowerCase(), t:"x", w:lem, en};
      addForm(lem, e);
    }
    extra.split(/\s+/).forEach(w => addForm(w, e));
    register(e);
  });

  /* chunk data: nouns that appear in chunks but not in the glossary still become words */
  const CH = window.XW_CHUNKS, FAM = window.XW_FAMILIES || [];
  const NOUNCH = {};                                 // noun (lowercase) -> [ "ins Kino", "im Kino" ]
  CH.forEach(c => c.v.forEach(v => {
    if(!v.n) return;
    const m = v.s.match(/\[\[(.+?)\]\]/); if(!m) return;
    const key = v.n.toLowerCase(), phrase = m[1] + " " + v.n;
    const a = NOUNCH[key] || (NOUNCH[key] = []);
    if(a.indexOf(phrase) < 0) a.push(phrase);
    if(v.g && !(FORM.get(key)||[]).some(x => x.t === "n")){
      register({id:"n:"+key, t:"n", g:v.g, w:v.n, pl:null, en:v.en.replace(/\.$/,""), chunkOnly:true});
      addForm(v.n, BYID.get("n:"+key));
    }
  }));
  if(FORM.has("haus") && !FORM.has("hause")){ FORM.get("haus").forEach(e => addForm("hause", e)); }
  if(NOUNCH.hause) NOUNCH.haus = NOUNCH.hause;

  const SUF = ["en","er","es","em","e","n","s","t","st","te","ten","et"];
  function resolve(tok, atStart){
    const low = tok.toLowerCase(), cap = /^[A-ZÄÖÜ]/.test(tok);
    let c = FORM.get(low);
    if(c && c.length){
      const pick = (cap && !atStart) ? c.find(x => x.t === "n") : c.find(x => x.t !== "n");
      return {e: pick || c[0], via:false};
    }
    for(const suf of SUF){
      if(low.endsWith(suf) && low.length - suf.length >= 3){
        const base = low.slice(0, -suf.length);
        for(const cand of [base, base+"en", base+"e", base+"n"]){
          const hit = FORM.get(cand);
          if(hit && hit.length){ const p = cap && !atStart ? hit.find(x => x.t === "n") : hit.find(x => x.t !== "n"); if(p) return {e:p, via:true}; }
        }
      }
    }
    return {e:null, via:false};
  }

  /* =============================== example sentences =============================== */
  let IDX = null;
  function buildIdx(){
    IDX = new Map();
    const put = (text, locked) => {
      String(text||"").split(/(?<=[.!?])\s+|\n+/).forEach(s => {
        s = s.trim(); if(s.length < 12 || s.length > 110) return;
        const toks = s.match(TOKRE) || []; if(toks.length < 2) return;
        if(toks.some(w => ENGLISH.has(w.toLowerCase()))) return;
        const seenIds = new Set();
        toks.forEach((tk,i) => {
          const hit = FORM.get(tk.toLowerCase()); if(!hit) return;
          hit.forEach(e => {
            if(seenIds.has(e.id)) return; seenIds.add(e.id);
            const cur = IDX.get(e.id), score = Math.abs(s.length - 45);
            if(!cur || (!cur.locked && (locked || score < cur.score))) IDX.set(e.id, {s, score, locked: !!locked});
          });
        });
      });
    };
    CH.forEach(c => c.v.forEach(v => put(plain(v.s), true)));
    ["GERMAN_DAYS","GERMAN_DAYS_A2","GERMAN_DAYS_B1","GERMAN_DAYS_B2_PART1","GERMAN_DAYS_B2_PART2","GERMAN_DAYS_B2_PART3"].forEach(n => {
      const a = G(n); if(Array.isArray(a)) a.forEach(d => (d.lessons||[]).forEach(l => { put(l.natural); put(l.example); }));
    });
    (G("LISTENING_EXERCISES")||[]).forEach(x => put(x.script));
    (G("READING_PASSAGES")||[]).forEach(x => put(x.passage));
    (G("GERMAN_TESTS")||[]).forEach(t => t.questions.forEach(q => put(q.q)));
  }
  function exampleFor(e){ if(!IDX) buildIdx(); const r = IDX.get(e.id); return r ? r.s : ""; }

  /* =============================== words inside a text =============================== */
  function wordsIn(texts){
    const seen = new Set(), main = [], small = [], unknown = [];
    texts.forEach(txt => {
      const s = String(txt||"");
      let m; TOKRE.lastIndex = 0;
      while((m = TOKRE.exec(s))){
        const tk = m[0]; if(tk.length < 2) continue;
        const before = s.slice(0, m.index).trimEnd().slice(-1);
        const r = resolve(tk, !before || /[.!?:\n]/.test(before));
        if(r.e){
          if(seen.has(r.e.id)) continue; seen.add(r.e.id);
          (r.e.t === "x" ? small : main).push(r.e);
        }else{
          const k = "u:" + tk.toLowerCase(); if(seen.has(k) || tk.length < 4 || ENGLISH.has(tk.toLowerCase())) continue;
          seen.add(k); unknown.push(tk);
        }
      }
    });
    return {main, small, unknown};
  }
  const isKnown = e => { const c = V().cards[e.id]; return !!(c && c.box >= 3); };
  const inDeck  = id => !!V().cards[id];

  /* =============================== deck =============================== */
  function addCard(e, src, custom){
    const v = V(), id = custom ? custom.id : e.id;
    if(v.cards[id]) return false;
    v.cards[id] = Object.assign({box:0, due:today(), added:today(), seen:0, ok:0, src:src||"tap"}, custom ? {t:"c", w:custom.w, en:custom.en, ex:custom.ex||""} : {});
    return true;
  }
  function rateCard(card, ok){
    const t = today(), v = V();
    if(!card.box){ v.newToday = v.newToday.date === t ? v.newToday : {date:t, n:0}; v.newToday.n++; }
    card.seen = (card.seen||0) + 1;
    if(ok){ card.ok = (card.ok||0) + 1; card.box = Math.min(6, (card.box||0) + 1); card.due = plusDays(t, BOX_DAYS[card.box]); }
    else{ card.box = 1; card.due = t; }
    card.last = t; logToday("cards"); persist();
  }
  function rateChunk(key, ok){
    const v = V(), t = today(); const c = v.chunks[key] || (v.chunks[key] = {box:0, due:t, seen:0, ok:0});
    c.seen++; 
    if(ok){ c.ok++; c.box = Math.min(6, (c.box||0) + 1); c.due = plusDays(t, BOX_DAYS[c.box]); c.think = false; }
    else{ c.box = 1; c.due = t; c.think = true; }
    c.last = t; logToday("chunks"); persist();
  }
  function bumpFamily(fam){
    const v = V(), t = today(); if(v.chunkToday.date !== t) v.chunkToday = {date:t, n:{}};
    v.chunkToday.n[fam] = (v.chunkToday.n[fam]||0) + 1;
  }
  const famToday = fam => { const v = V(); return v.chunkToday.date === today() ? (v.chunkToday.n[fam]||0) : 0; };
  const newLeft = () => { const v = V(); return Math.max(0, NEW_CAP - (v.newToday.date === today() ? v.newToday.n : 0)); };
  function stats(){
    const v = V(), t = today(), cards = Object.values(v.cards);
    const due = cards.filter(c => c.box >= 1 && c.due <= t).length, fresh = cards.filter(c => !c.box).length;
    let chunksDue = 0; Object.values(v.chunks).forEach(c => { if(c.box >= 1 && c.due <= t) chunksDue++; });
    return {deck:cards.length, due, fresh, newLeft:newLeft(), newToday:NEW_CAP - newLeft(), chunksDue, mastered:cards.filter(c => c.box >= 5).length, log:v.log[t]||{}};
  }
  window.XW = {stats, addCard, resolve, wordsIn, say};

  /* =============================== card front / back =============================== */
  const entryOf = c => c.t === "c" ? {id:c.id, t:"c", w:c.w, en:c.en, custom:true} : BYID.get(c.id);
  function gapped(card){
    const e = entryOf(card); if(!e) return null;
    let sent = card.t === "c" ? (card.ex || "") : exampleFor(e);
    if(sent){
      let out = null, m; TOKRE.lastIndex = 0;
      while((m = TOKRE.exec(sent))){
        const tk = m[0], hit = e.custom ? (tk.toLowerCase() === e.w.toLowerCase()) : (FORM.get(tk.toLowerCase())||[]).indexOf(e) >= 0;
        if(hit){ out = {gap: E(sent.slice(0,m.index)) + '<span class="xw-gap">＿＿＿</span>' + E(sent.slice(m.index + tk.length)), full: E(sent.slice(0,m.index)) + '<mark class="xw-hl">' + E(tk) + '</mark>' + E(sent.slice(m.index + tk.length)), plain: sent}; break; }
      }
      if(out) return out;
    }
    if(e.t === "n"){ const s = "Das ist " + e.g + " " + e.w + "."; return {gap:'Das ist <span class="xw-gap">＿＿＿ ＿＿＿</span>.', full:'Das ist ' + art(e.g) + '<mark class="xw-hl">' + E(e.w) + '</mark>.', plain:s}; }
    if(e.t === "v"){ return {gap:'Ich kann <span class="xw-gap">＿＿＿</span>.', full:'Ich kann <mark class="xw-hl">' + E(e.w) + '</mark>.', plain:"Ich kann " + e.w + "."}; }
    if(e.t === "a"){ return {gap:'Es ist <span class="xw-gap">＿＿＿</span>.', full:'Es ist <mark class="xw-hl">' + E(e.w) + '</mark>.', plain:"Es ist " + e.w + "."}; }
    return null;
  }
  function lemmaHtml(e){
    if(e.custom) return `<span class="xw-lemma">${E(e.w)}</span>`;
    if(e.t === "n"){
      const pl = e.pl ? ` <span class="xw-pl">· ${e.pl === "–" ? "no plural / unchanged" : "die " + E(e.pl)}</span>` : "";
      return `<span class="xw-lemma">${art(e.g)}<b class="${gcls(e.g)}">${E(e.w)}</b></span>${pl}`;
    }
    if(e.t === "v" || e.t === "a"){
      return `<span class="xw-lemma"><b>${E(e.w)}</b></span>` + (e.forms && e.forms.length ? ` <span class="xw-pl">· ${e.forms.map(E).join(" · ")}</span>` : "");
    }
    return `<span class="xw-lemma"><b>${E(e.w)}</b></span>`;
  }
  const chunkForms = e => (e.t === "n" && NOUNCH[e.w.toLowerCase()]) ? `<div class="xw-forms">${art(e.g)}<b class="${gcls(e.g)}">${E(e.w)}</b> <span class="xw-dot">/</span> ${NOUNCH[e.w.toLowerCase()].map(p => `<b class="${gcls(e.g)}">${E(p)}</b>`).join(' <span class="xw-dot">/</span> ')}</div>` : "";

  /* =============================== CSS =============================== */
  const css = `
  :root{--xw-der:#2563b8;--xw-die:#c0392b;--xw-das:#2e7d32;}
  :root[data-theme="dark"]{--xw-der:#7db4ff;--xw-die:#ff8a7a;--xw-das:#79d68f;}
  .xw-der{color:var(--xw-der);} .xw-die{color:var(--xw-die);} .xw-das{color:var(--xw-das);}
  .xw-art{font-weight:700;}
  .xw-w{cursor:pointer;border-bottom:1px dotted var(--grey,#8f8f8f);}
  .xw-w:hover{background:var(--red-tint,rgba(192,57,43,.1));}
  .xw-w.xw-der,.xw-w.xw-die,.xw-w.xw-das,a.fv-word.xw-der,a.fv-word.xw-die,a.fv-word.xw-das{font-weight:600;}
  .xw-pop{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.28);display:flex;align-items:flex-end;justify-content:center;}
  .xw-pop.hidden{display:none;}
  .xw-pop-card{position:relative;width:100%;max-width:520px;max-height:82vh;overflow:auto;background:var(--white);color:var(--black);border:1px solid var(--line);border-radius:16px 16px 0 0;padding:18px 18px 22px;box-shadow:0 -10px 30px rgba(0,0,0,.25);font-size:14px;line-height:1.45;}
  @media(min-width:700px){.xw-pop{align-items:center}.xw-pop-card{border-radius:16px}}
  .xw-x{position:absolute;top:8px;right:10px;border:0;background:none;color:var(--grey);font-size:20px;cursor:pointer;padding:6px 10px;}
  .xw-lemma{font-size:20px;}
  .xw-pl{color:var(--grey-dark);font-size:13px;}
  .xw-en{font-size:16px;margin:6px 0 10px;font-weight:600;}
  .xw-ex{background:var(--offwhite);border:1px solid var(--line);border-radius:10px;padding:10px 12px;margin:8px 0;font-size:14px;}
  .xw-note{color:var(--grey-dark);font-size:12.5px;margin:6px 0;}
  .xw-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px;}
  .xw-btn{font-family:var(--font);font-weight:600;font-size:13px;padding:10px 14px;border-radius:999px;border:1px solid var(--line-strong);background:var(--black);color:var(--white);cursor:pointer;}
  .xw-btn.ghost{background:var(--white);color:var(--black);}
  .xw-btn.ok{background:var(--das-bg,#2e7d32);border-color:#2e7d32;color:#fff;}
  .xw-btn.no{background:var(--red);border-color:var(--red);color:#fff;}
  .xw-btn[disabled]{opacity:.5;cursor:default;}
  .xw-link{font-size:12.5px;font-weight:600;color:var(--red);text-decoration:underline;text-underline-offset:2px;}
  .xw-in{font-family:var(--font);font-size:15px;padding:10px 12px;border:1px solid var(--line-strong);border-radius:10px;background:var(--white);color:var(--black);width:100%;margin-top:8px;}
  .xw-forms{margin:8px 0;font-size:15px;} .xw-dot{color:var(--grey);margin:0 4px;}
  mark.xw-hl{background:var(--red-tint,rgba(192,57,43,.14));color:inherit;border-radius:4px;padding:0 3px;font-weight:700;}
  .xw-gap{display:inline-block;min-width:54px;text-align:center;border-bottom:2px solid var(--red);color:var(--red);font-weight:700;letter-spacing:2px;}
  .xw-meet{border:1px solid var(--line);border-radius:10px;background:var(--offwhite);padding:10px 12px;margin:0 0 14px;}
  .xw-meet summary{cursor:pointer;font-weight:700;font-size:13px;}
  .xw-meet-list{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 6px;}
  .xw-chip{font-family:var(--font);font-size:12.5px;padding:6px 10px;border-radius:999px;border:1px solid var(--line);background:var(--white);color:var(--black);cursor:pointer;text-align:left;}
  .xw-chip small{color:var(--grey-dark);margin-left:4px;font-size:11.5px;}
  .xw-chip.done{opacity:.55;}
  .xw-lw{margin:10px 0;}
  #germanWords{padding-bottom:40px;}
  .xw-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;}
  .xw-stat{border:1px solid var(--line);border-radius:10px;background:var(--white);padding:10px 6px;text-align:center;}
  .xw-stat b{display:block;font-size:20px;} .xw-stat span{font-size:11px;color:var(--grey-dark);}
  .xw-hubgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0;}
  @media(max-width:520px){.xw-hubgrid{grid-template-columns:1fr}}
  .xw-big{font-family:var(--font);text-align:left;padding:14px 16px;border-radius:12px;border:1px solid var(--line-strong);background:var(--white);color:var(--black);cursor:pointer;font-size:15px;font-weight:700;}
  .xw-big small{display:block;font-weight:500;font-size:12px;color:var(--grey-dark);margin-top:3px;}
  .xw-big.primary{background:var(--black);color:var(--white);} .xw-big.primary small{color:inherit;opacity:.75;}
  .xw-fams{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 4px;}
  .xw-fam{font-family:var(--font);font-size:12.5px;font-weight:600;padding:7px 12px;border-radius:999px;border:1px solid var(--line);background:var(--white);color:var(--black);cursor:pointer;}
  .xw-fam.on{background:var(--red);border-color:var(--red);color:#fff;}
  .xw-h{font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--grey-dark);margin:16px 0 6px;}
  .xw-stage{border:1px solid var(--line);border-radius:14px;background:var(--white);padding:18px 16px;margin-top:8px;text-align:center;}
  .xw-top{display:flex;justify-content:space-between;align-items:center;font-size:12.5px;color:var(--grey-dark);margin-bottom:10px;text-align:left;}
  .xw-scene{font-size:46px;line-height:1.2;margin:6px 0;}
  .xw-q{font-size:19px;font-weight:700;margin:6px 0;}
  .xw-sent{font-size:18px;margin:10px 0;line-height:1.5;}
  .xw-sub{color:var(--grey-dark);font-size:14px;margin:4px 0;}
  .xw-ans{font-size:24px;font-weight:800;margin:10px 0 4px;}
  .xw-opts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:14px 0 4px;}
  .xw-opt{font-family:var(--font);font-size:16px;font-weight:700;padding:14px 8px;border-radius:12px;border:1px solid var(--line-strong);background:var(--white);color:var(--black);cursor:pointer;}
  .xw-opt.good{background:#2e7d32;border-color:#2e7d32;color:#fff;} .xw-opt.bad{background:var(--red);border-color:var(--red);color:#fff;}
  .xw-pair{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:6px 0;}
  .xw-cell{border:1px solid var(--line);border-radius:10px;padding:8px 10px;background:var(--offwhite);}
  .xw-cell small{display:block;color:var(--grey-dark);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;}
  .xw-cell b{font-size:16px;}
  .xw-lib{border:1px solid var(--line);border-radius:12px;background:var(--white);margin:8px 0;padding:4px 12px;}
  .xw-lib>summary{cursor:pointer;font-weight:700;padding:10px 0;}
  .xw-why{font-size:13px;color:var(--grey-dark);margin:4px 0 8px;}
  .xw-back{font-family:var(--font);background:none;border:0;color:var(--red);font-weight:700;font-size:13px;cursor:pointer;padding:6px 0;}
  .xw-deckrow{display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--line);padding:8px 0;font-size:14px;}
  .xw-deckrow .xw-grow{flex:1;min-width:0;} .xw-boxdots{letter-spacing:2px;color:var(--red);font-size:11px;}
  .xw-done{font-size:42px;margin:6px 0;}
  @media print{#germanWords,#xwPop{display:none !important;}}
  `;
  const styleEl = document.createElement("style"); styleEl.textContent = css; document.head.appendChild(styleEl);

  /* =============================== popover (tap a word) =============================== */
  let pop = document.getElementById("xwPop");
  if(!pop){ pop = document.createElement("div"); pop.id = "xwPop"; pop.className = "xw-pop hidden"; pop.setAttribute("role","dialog"); document.body.appendChild(pop); }
  const closePop = () => pop.classList.add("hidden");
  function popBody(tok, e, ctx, via){
    let h = "";
    if(e){
      h += `<div>${lemmaHtml(e)}</div>`;
      if(via) h += `<div class="xw-note">“${E(tok)}” looks like a form of this word.</div>`;
      h += `<div class="xw-en">${E(e.en || "")}</div>`;
      h += chunkForms(e);
      const ex = ctx || exampleFor(e);
      if(ex) h += `<div class="xw-ex">${E(ex)} <button class="xw-btn ghost" data-say="${E(ex)}" aria-label="Hear it">🔊</button></div>`;
      const has = inDeck(e.id);
      h += `<div class="xw-row"><button class="xw-btn ghost" data-say="${E(e.t === "n" ? e.g + " " + e.w : e.w)}">🔊 Hear</button>`
         + `<button class="xw-btn" data-xw="add" data-id="${E(e.id)}" ${has ? "disabled" : ""}>${has ? "✓ In my deck" : "＋ Add to my deck"}</button></div>`;
      h += `<div class="xw-row">${ext(forvo(e.w), "Forvo (native speakers)")} ${ext(dictcc(e.w), "dict.cc")} ${ext(wikt(e.w), "Wiktionary")}</div>`;
    }else{
      h += `<div><span class="xw-lemma"><b>${E(tok)}</b></span></div>`;
      h += `<div class="xw-note">This word isn’t in my word list yet. Look it up, then save it with your own meaning.</div>`;
      h += `<div class="xw-row">${ext(dictcc(tok), "dict.cc")} ${ext(wikt(tok), "Wiktionary")} ${ext(forvo(tok), "Forvo")}</div>`;
      h += `<input class="xw-in" id="xwMeaning" placeholder="Meaning in English (what you found)" autocomplete="off">`;
      h += `<div class="xw-row"><button class="xw-btn" data-xw="add-custom" data-w="${E(tok)}" data-ctx="${E(ctx||"")}">＋ Save to my deck</button><button class="xw-btn ghost" data-say="${E(tok)}">🔊 Hear</button></div>`;
    }
    return h;
  }
  function openPop(tok, e, ctx, via){
    pop.innerHTML = `<div class="xw-pop-card"><button class="xw-x" data-xw="close" aria-label="Close">✕</button>${popBody(tok, e, ctx, via)}</div>`;
    pop.classList.remove("hidden");
  }
  function ctxOf(el, tok){
    const box = el.closest(".g-phrase-box,.reading-passage,.test-question,.g-vocab-line,.test-explain,.mock-stage") || el.parentElement;
    if(!box) return "";
    const clone = box.cloneNode(true);
    clone.querySelectorAll(".g-phrase-tag,.tatoeba-links,.xw-meet,.test-options,.test-actions").forEach(n => n.remove());
    const text = (clone.textContent||"").replace(/\s+/g," ").trim();
    const s = text.split(/(?<=[.!?])\s+/).find(x => x.indexOf(tok) >= 0) || "";
    return s.trim().slice(0,160);
  }
  function atStartOf(el){
    const prev = el.previousSibling;
    if(!prev) return true;
    const t = (prev.textContent||"").trimEnd().slice(-1);
    return !t || /[.!?:]/.test(t);
  }

  /* one delegated click handler for everything this file adds */
  document.addEventListener("click", ev => {
    const t = ev.target; if(!t || !t.closest) return;
    // 1) tap-to-translate on words
    const w = t.closest("a.fv-word, .xw-w");
    if(w && !w.closest("#xwPop") && !w.closest("#germanWords")){
      const tok = (w.textContent||"").trim();
      if(/^[A-Za-zÄÖÜäöüß]+$/.test(tok)){
        ev.preventDefault(); ev.stopPropagation();
        const r = resolve(tok, atStartOf(w));
        openPop(tok, r.e, ctxOf(w, tok), r.via);
        return;
      }
    }
    if(t === pop){ closePop(); return; }
    const say_ = t.closest("[data-say]");
    if(say_){ ev.preventDefault(); say(say_.getAttribute("data-say"), +say_.getAttribute("data-rate") || 0.9); return; }
    const a = t.closest("[data-xw]");
    if(!a) return;
    const act = a.getAttribute("data-xw");
    if(act === "close"){ closePop(); }
    else if(act === "add"){
      const e = BYID.get(a.dataset.id); if(e && addCard(e, "tap")){ persist(); }
      a.disabled = true; a.textContent = "✓ In my deck";
      refreshMeetState(); refreshWordsTab();
    }
    else if(act === "add-custom"){
      const inp = document.getElementById("xwMeaning"), en = inp ? inp.value.trim() : "";
      if(!en){ if(inp){ inp.focus(); inp.placeholder = "Please type the meaning first"; } return; }
      addCard(null, "tap", {id:"c:" + a.dataset.w.toLowerCase(), w:a.dataset.w, en, ex:a.dataset.ctx});
      persist(); a.disabled = true; a.textContent = "✓ Saved";
    }
    else if(act === "tap-entry"){ const e = BYID.get(a.dataset.id); if(e) openPop(e.w, e, "", false); }
    else if(act === "add-many"){
      let n = 0; (a.dataset.ids||"").split("|").forEach(id => { const e = BYID.get(id); if(e && addCard(e, a.dataset.src || "preview")) n++; });
      persist(); a.disabled = true; a.textContent = n ? "✓ " + n + " words added to my deck" : "✓ Already in your deck";
      refreshMeetState(); refreshWordsTab();
    }
  }, true);
  document.addEventListener("keydown", ev => { if(ev.key === "Escape") closePop(); });

  /* =============================== decorate: tappable words + gender colours =============================== */
  const SKIP = "a,button,textarea,input,script,style,.xw-w,.xw-meet,.xw-lw,#xwPop,#germanWords";
  function wrapTexts(root){
    const nodes = [], walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {acceptNode: n => {
      if(!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const p = n.parentElement; return (!p || p.closest(SKIP)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    }});
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      const txt = n.nodeValue, frag = document.createDocumentFragment(); let last = 0, m, any = false;
      TOKRE.lastIndex = 0;
      while((m = TOKRE.exec(txt))){
        const tk = m[0]; if(tk.length < 2) continue;
        const before = txt.slice(0, m.index).trimEnd().slice(-1);
        const start = before ? /[.!?:]/.test(before) : !n.previousSibling;
        const r = resolve(tk, start);
        if(m.index > last) frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
        const sp = document.createElement("span"); sp.className = "xw-w";
        if(r.e && r.e.t === "n" && /^[A-ZÄÖÜ]/.test(tk) && r.e.g) sp.classList.add(gcls(r.e.g));
        sp.textContent = tk; frag.appendChild(sp); last = m.index + tk.length; any = true;
      }
      if(!any) return;
      if(last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
      n.parentNode.replaceChild(frag, n);
    });
  }
  function colourAnchors(root){
    root.querySelectorAll("a.fv-word:not([data-xwc])").forEach(a => {
      a.setAttribute("data-xwc","1");
      const tk = (a.textContent||"").trim(); if(!/^[A-ZÄÖÜ][A-Za-zÄÖÜäöüß]+$/.test(tk)) return;
      const r = resolve(tk, atStartOf(a));
      if(r.e && r.e.t === "n" && r.e.g) a.classList.add(gcls(r.e.g));
    });
  }

  /* =============================== "Words you'll meet" and "Words in this lesson" =============================== */
  function chipHtml(e){
    const known = inDeck(e.id) ? " done" : "";
    const lab = e.t === "n" ? `${art(e.g)}<b class="${gcls(e.g)}">${E(e.w)}</b>` : `<b>${E(e.w)}</b>`;
    return `<button class="xw-chip${known}" data-xw="tap-entry" data-id="${E(e.id)}">${lab}<small>${E((e.en||"").replace(/\s*\(.*$/,"").slice(0,28))}</small></button>`;
  }
  function meetBlock(texts, title, src){
    const w = wordsIn(texts), fresh = w.main.filter(e => !isKnown(e)), notInDeck = fresh.filter(e => !inDeck(e.id));
    if(!w.main.length && !w.small.length) return null;
    const box = document.createElement("details"); box.className = "xw-meet";
    box.innerHTML = `<summary>📚 ${E(title)} — ${w.main.length} words${fresh.length ? `, ${fresh.length} new for you` : " (all known)"}</summary>`
      + `<div class="xw-note">Tap a word for its meaning. Learn them first, then the questions hold no surprises.</div>`
      + `<div class="xw-meet-list">${w.main.map(chipHtml).join("")}</div>`
      + (w.small.length ? `<div class="xw-note">Small words: ${w.small.map(e => `<span class="xw-w" data-xwsmall="${E(e.id)}">${E(e.w)}</span>`).join(", ")}</div>` : "")
      + `<div class="xw-row"><button class="xw-btn" data-xw="add-many" data-src="${E(src)}" data-ids="${notInDeck.map(e => e.id).join("|")}" ${notInDeck.length ? "" : "disabled"}>${notInDeck.length ? "＋ Add " + notInDeck.length + " new words to my deck" : "✓ All in your deck"}</button></div>`;
    return box;
  }
  function refreshWordsTab(){
    if(typeof sec === "undefined" || !sec || sec.classList.contains("hidden")) return;
    if(UI.view === "cards") startCards(); else if(UI.view === "hub" || UI.view === "deck") render();
  }
  function refreshMeetState(){
    document.querySelectorAll(".xw-meet .xw-chip, .xw-lw .xw-chip").forEach(c => { c.classList.toggle("done", inDeck(c.dataset.id)); });
  }
  function itemTexts(item, kind){
    const out = [];
    if(kind === "test") item.questions.forEach(q => out.push(q.q, ...q.options));
    else{
      out.push(kind === "listen" ? item.script : item.passage);
      item.questions.forEach(q => out.push(q.q, ...q.options));
    }
    return out;
  }
  function addMeetBlocks(){
    document.querySelectorAll("#testsList .test-card[data-test] .test-body").forEach(body => {
      if(body.querySelector(".xw-meet")) return;
      const t = (G("GERMAN_TESTS")||[]).find(x => x.id === body.closest(".test-card").dataset.test); if(!t) return;
      const b = meetBlock(itemTexts(t,"test"), "Words you’ll meet in this test", "test"); if(b) body.insertBefore(b, body.firstChild);
    });
    [["#listeningList","LISTENING_EXERCISES","listen","Words you’ll hear"],["#readingList","READING_PASSAGES","read","Words you’ll read"]].forEach(([sel,name,kind,title]) => {
      document.querySelectorAll(sel + " .test-card[data-item] .test-body").forEach(body => {
        if(body.querySelector(".xw-meet")) return;
        const it = (G(name)||[]).find(x => x.id === body.closest(".test-card").dataset.item); if(!it) return;
        const b = meetBlock(itemTexts(it,kind), title, kind); if(b) body.insertBefore(b, body.firstChild);
      });
    });
    const stage = document.querySelector("#mockRunArea .mock-stage");
    if(stage && !stage.querySelector(".xw-meet") && typeof mockRun !== "undefined" && mockRun){
      let it = null, kind = "";
      if(mockRun.stage === "reading"){ it = (G("READING_PASSAGES")||[]).find(x => x.id === mockRun.readingId); kind = "read"; }
      else if(mockRun.stage === "listening"){ it = (G("LISTENING_EXERCISES")||[]).find(x => x.id === mockRun.listeningId); kind = "listen"; }
      if(it){ const b = meetBlock(itemTexts(it,kind), "Words you’ll meet in this exam text", "exam"); const h = stage.querySelector("h3"); if(b && h) h.after(b); }
    }
  }
  function addLessonWords(){
    const card = document.getElementById("dailyCard"); if(!card) return;
    const day = (G("GERMAN_DAYS")||[])[(typeof germanCurrentDay !== "undefined" ? germanCurrentDay : 1) - 1]; if(!day) return;
    card.querySelectorAll(".g-lesson").forEach((el, i) => {
      if(el.querySelector(".xw-lw") || el.querySelector(".g-vocab-box")) return;
      const l = day.lessons[i]; if(!l) return;
      const w = wordsIn([l.example, l.natural]), list = w.main;
      if(!list.length) return;
      const box = document.createElement("div"); box.className = "g-field xw-lw";
      const fresh = list.filter(e => !inDeck(e.id));
      box.innerHTML = `<div class="g-field-label"><span class="dot"></span>Words in this lesson <span class="g-tap-hint">tap a word for its meaning</span></div>`
        + `<div class="xw-meet-list">${list.map(chipHtml).join("")}</div>`
        + `<div class="xw-row"><button class="xw-btn ghost" data-xw="add-many" data-src="lesson" data-ids="${fresh.map(e => e.id).join("|")}" ${fresh.length ? "" : "disabled"}>${fresh.length ? "＋ Add " + fresh.length + " to my deck" : "✓ All in your deck"}</button></div>`;
      const anchor = el.querySelector(".g-field"); anchor ? anchor.before(box) : el.appendChild(box);
    });
  }

  let mo = null, queued = false;
  function decorateAll(){
    const root = document.getElementById("germanView"); if(!root) return;
    if(mo) mo.disconnect();
    try{
      root.querySelectorAll(".reading-passage, .test-question > p, .test-explain, .g-vocab-line").forEach(el => {
        if(el.closest("#germanWords") || el.dataset.xw) return; el.dataset.xw = "1"; wrapTexts(el);
      });
      root.querySelectorAll(".test-question.correct label, .test-question.wrong label").forEach(el => {
        if(el.dataset.xw) return; el.dataset.xw = "1"; wrapTexts(el);
      });
      colourAnchors(root);
      addMeetBlocks();
      addLessonWords();
    }catch(err){ console.warn("ext-words decorate", err); }
    if(mo) mo.observe(root, {childList:true, subtree:true});
  }
  function scheduleDecorate(){ if(queued) return; queued = true; requestAnimationFrame(() => { queued = false; decorateAll(); }); }

  /* =============================== the "Words" tab =============================== */
  const nav = document.getElementById("germanSubnav");
  const mockSec = document.getElementById("germanMock");
  if(!nav || !mockSec){ console.warn("ext-words: German tabs not found"); return; }
  const btn = document.createElement("button");
  btn.setAttribute("data-sub","words");
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h10M4 18h16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="18" cy="12" r="2.2" stroke="currentColor" stroke-width="1.7"/></svg> Words`;
  const readingBtn = nav.querySelector('button[data-sub="reading"]');
  readingBtn ? readingBtn.after(btn) : nav.appendChild(btn);
  const sec = document.createElement("div"); sec.className = "german-sub hidden"; sec.id = "germanWords";
  mockSec.after(sec);
  nav.addEventListener("click", ev => {
    const b = ev.target.closest("button[data-sub]"); if(!b) return;
    const on = b.dataset.sub === "words";
    sec.classList.toggle("hidden", !on);
    if(on){ nav.querySelectorAll("button").forEach(x => x.classList.toggle("active", x === b)); UI = {view:"hub", fam:UI.fam}; render(); }
  });

  let UI = {view:"hub", fam:"mix"}, S = null;     // UI = which screen, S = the running session
  const famName = id => id === "mix" ? "Mixed" : ((FAM.find(f => f.id === id)||{}).name || id).split("·")[0].trim();
  const backBtn = `<button class="xw-back" data-wx="hub">← Back to Words</button>`;

  function variantsOf(fam){
    const out = [];
    CH.forEach(c => { if(fam !== "mix" && c.fam !== fam) return; c.v.forEach((v,i) => out.push({key:c.id+"#"+i, c, v, i})); });
    return out;
  }
  function pickChunks(fam, n){
    const t = today(), ch = V().chunks, all = variantsOf(fam);
    const st = x => ch[x.key];
    const thinking = shuffle(all.filter(x => st(x) && st(x).think));
    const due = all.filter(x => st(x) && st(x).box >= 1 && st(x).due <= t && !st(x).think).sort((a,b) => st(a).due < st(b).due ? -1 : 1);
    const fresh = shuffle(all.filter(x => !st(x)));
    const rest = shuffle(all.filter(x => st(x) && st(x).box >= 1 && st(x).due > t));
    const seen = new Set(), out = [];
    [thinking, due, fresh, rest].forEach(g => g.forEach(x => { if(out.length < n && !seen.has(x.key)){ seen.add(x.key); out.push(x); } }));
    // mixed: spread the families out a little
    return fam === "mix" ? shuffle(out) : out;
  }
  function todaysLessonWords(){
    const day = (G("GERMAN_DAYS")||[])[(typeof germanCurrentDay !== "undefined" ? germanCurrentDay : 1) - 1]; if(!day) return [];
    const out = [], seen = new Set();
    day.lessons.forEach(l => wordsIn([l.example, l.natural]).main.forEach(e => { if(!seen.has(e.id) && !inDeck(e.id)){ seen.add(e.id); out.push(e); } }));
    return out;
  }

  function render(){
    if(UI.view === "hub") return renderHub();
    if(UI.view === "cards") return renderCards();
    if(UI.view === "qa") return renderQA();
    if(UI.view === "cloze") return renderCloze();
    if(UI.view === "shadow") return renderShadow();
    if(UI.view === "lib") return renderLib();
    if(UI.view === "deck") return renderDeck();
  }

  function renderHub(){
    const s = stats(), tw = todaysLessonWords().slice(0, Math.max(0, NEW_CAP));
    const famChips = ["mix"].concat(FAM.map(f => f.id)).map(id => `<button class="xw-fam ${UI.fam === id ? "on" : ""}" data-wx="fam" data-id="${id}">${E(famName(id))}${id !== "mix" ? ` <small>${Math.min(10, famToday(id))}/10</small>` : ""}</button>`).join("");
    sec.innerHTML = `
      <div class="xw-stats">
        <div class="xw-stat"><b>${s.deck}</b><span>words in deck</span></div>
        <div class="xw-stat"><b>${s.due}</b><span>due today</span></div>
        <div class="xw-stat"><b>${s.newLeft}</b><span>new left (max ${NEW_CAP})</span></div>
        <div class="xw-stat"><b>${s.chunksDue}</b><span>chunks due</span></div>
      </div>
      <div class="xw-hubgrid">
        <button class="xw-big primary" data-wx="cards">🃏 Flashcards<small>${s.due} to review · up to ${Math.min(s.newLeft, s.fresh)} new</small></button>
        <button class="xw-big" data-wx="qa">🗣️ Chunk Q&amp;A<small>10 quick rounds — see the scene, say the chunk</small></button>
        <button class="xw-big" data-wx="cloze">✍️ Fill the gap<small>the situation is your only clue</small></button>
        <button class="xw-big" data-wx="shadow">🔊 Say it aloud<small>shadow 5 chunks · “automatic” or “still thinking”</small></button>
        <button class="xw-big" data-wx="lib">📍 Chunk library<small>Wohin? / Wo? side by side, with audio</small></button>
        <button class="xw-big" data-wx="deck">📚 My words<small>${s.deck} saved · ${s.mastered} well known</small></button>
      </div>
      <div class="xw-h">Practise which family?</div>
      <div class="xw-fams">${famChips}</div>
      <div class="xw-note">No case tables. You hear a situation and say the whole chunk — “ins Kino”, “im Büro”, “zum Arzt” — until it is automatic.</div>
      ${tw.length ? `<div class="xw-h">Words from today’s lesson</div><div class="xw-meet-list">${tw.map(chipHtml).join("")}</div>
        <div class="xw-row"><button class="xw-btn" data-xw="add-many" data-src="lesson" data-ids="${tw.map(e => e.id).join("|")}">＋ Add ${tw.length} to my deck</button></div>` : ""}`;
    refreshMeetState();
  }

  /* ---- Flashcards ---- */
  function startCards(){
    const v = V(), t = today(), cards = Object.entries(v.cards).map(([id,c]) => (c.id = id, c));
    const due = cards.filter(c => c.box >= 1 && c.due <= t).sort((a,b) => a.due < b.due ? -1 : 1).slice(0, 40);
    const fresh = cards.filter(c => !c.box).sort((a,b) => (a.added||"") < (b.added||"") ? -1 : 1).slice(0, newLeft());
    S = {q: due.concat(fresh).map(c => c.id), i:0, again:{}, ok:0, no:0, show:false};
    UI.view = "cards"; render();
  }
  function renderCards(){
    if(!S || S.i >= S.q.length){
      const empty = !S || !S.q.length;
      const tw = todaysLessonWords();
      sec.innerHTML = backBtn + `<div class="xw-stage"><div class="xw-done">${empty ? "🌱" : "🎉"}</div>
        <div class="xw-q">${empty ? "Nothing due right now" : "Done for now!"}</div>
        <div class="xw-sub">${empty ? (newLeft() ? "Tap any word in a lesson or add today’s words to fill your deck." : "You have reached today’s limit of " + NEW_CAP + " new words.") : `${S.ok} knew it · ${S.no} to see again soon`}</div>
        ${empty && tw.length && newLeft() ? `<div class="xw-row" style="justify-content:center"><button class="xw-btn" data-xw="add-many" data-src="lesson" data-ids="${tw.slice(0,newLeft()).map(e => e.id).join("|")}">＋ Add ${Math.min(tw.length,newLeft())} words from today’s lesson</button></div>` : ""}</div>`;
      return;
    }
    const card = V().cards[S.q[S.i]]; if(!card){ S.i++; return renderCards(); }
    const e = entryOf(card), g = gapped(card);
    if(!e){ S.i++; return renderCards(); }
    const front = `<div class="xw-sub">What is this in German?</div><div class="xw-q">${E((e.en||"").replace(/\s*\(.*$/,""))}</div>${g ? `<div class="xw-sent">${g.gap}</div>` : ""}`;
    const back = `<div>${lemmaHtml(e)}</div>${chunkForms(e)}${g ? `<div class="xw-sent">${g.full} <button class="xw-btn ghost" data-say="${E(g.plain)}">🔊</button></div>` : ""}<div class="xw-sub">${E(e.en||"")}</div>`;
    sec.innerHTML = backBtn + `<div class="xw-stage"><div class="xw-top"><span>${S.i + 1} / ${S.q.length}</span><span>${!card.box ? "new" : "box " + card.box}</span></div>
      ${S.show ? back : front}
      <div class="xw-row" style="justify-content:center">${S.show
        ? `<button class="xw-btn no" data-wx="c-no">Again</button><button class="xw-btn ok" data-wx="c-ok">I knew it</button>`
        : `<button class="xw-btn" data-wx="c-show">Show answer</button>`}</div></div>`;
    if(S.show && g) say(g.plain, 0.9);
  }

  /* ---- Chunk Q&A ---- */
  function startQA(){
    const items = pickChunks(UI.fam, 10);
    S = {q: items, i:0, ok:0, no:0, show:false, again:{}};
    UI.view = "qa"; render();
  }
  function partner(it){ return it.c.v.length === 2 ? it.c.v[1 - it.i] : null; }
  function renderQA(){
    if(!S || S.i >= S.q.length){ return sessionEnd("qa", "Quick Q&A"); }
    const it = S.q[S.i], v = it.v, p = partner(it);
    const nowAns = `<div class="xw-ans ${gcls(v.g)}">${E(v.a)}</div><div class="xw-sent">${hl(v.s)} <button class="xw-btn ghost" data-say="${E(plain(v.s))}">🔊</button></div><div class="xw-sub">${E(v.en)}</div>`
      + (p ? `<div class="xw-sub">…and the other one: <b class="${gcls(p.g)}">${E(p.a)}</b></div>` : "");
    sec.innerHTML = backBtn + `<div class="xw-stage"><div class="xw-top"><span>${S.i + 1} / ${S.q.length}</span><span>${E(famName(it.c.fam))}</span></div>
      <div class="xw-scene">${v.sc}</div><div class="xw-q">${E(v.q)} <button class="xw-btn ghost" data-say="${E(v.q)}">🔊</button></div>
      ${S.show ? nowAns : `<div class="xw-sub">Say your answer out loud, then check.</div>`}
      <div class="xw-row" style="justify-content:center">${S.show
        ? `<button class="xw-btn no" data-wx="q-think">🤔 Still thinking</button><button class="xw-btn ok" data-wx="q-auto">✅ Automatic</button>`
        : `<button class="xw-btn" data-wx="q-show">Show answer</button>`}</div></div>`;
    if(!S.show) say(v.q, 0.95); else say(plain(v.s), 0.85);
  }

  /* ---- Fill the gap ---- */
  function startCloze(){
    const items = pickChunks(UI.fam, 10).filter(x => /\[\[.+?\]\]/.test(x.v.s));
    S = {q: items, i:0, ok:0, no:0, picked:null, again:{}};
    UI.view = "cloze"; render();
  }
  function optionsFor(it){
    const right = it.v.s.match(/\[\[(.+?)\]\]/)[1], pool = [];
    variantsOf(it.c.fam).forEach(x => { const m = x.v.s.match(/\[\[(.+?)\]\]/); if(m && m[1].toLowerCase() !== right.toLowerCase() && pool.indexOf(m[1]) < 0) pool.push(m[1]); });
    const pa = partner(it); if(pa){ const m = pa.s.match(/\[\[(.+?)\]\]/); if(m && m[1].toLowerCase() !== right.toLowerCase()){ const k = pool.indexOf(m[1]); if(k >= 0) pool.splice(k,1); pool.unshift(m[1]); } }
    const wrong = pool.slice(0,1).concat(shuffle(pool.slice(1))).slice(0, 3);
    return {right, opts: shuffle([right].concat(wrong))};
  }
  function renderCloze(){
    if(!S || S.i >= S.q.length){ return sessionEnd("cloze", "Fill the gap"); }
    const it = S.q[S.i], v = it.v; if(!S.o || S.o.key !== it.key + S.i) S.o = Object.assign({key: it.key + S.i}, optionsFor(it));
    const gapS = E(v.s).replace(/\[\[(.+?)\]\]/, '<span class="xw-gap">＿＿＿</span>');
    const picked = S.picked;
    sec.innerHTML = backBtn + `<div class="xw-stage"><div class="xw-top"><span>${S.i + 1} / ${S.q.length}</span><span>${E(famName(it.c.fam))}</span></div>
      <div class="xw-scene">${v.sc}</div><div class="xw-sub">${E(v.q)}</div>
      <div class="xw-sent">${picked ? hl(v.s) : gapS}</div><div class="xw-sub">${E(v.en)}</div>
      <div class="xw-opts">${S.o.opts.map(o => `<button class="xw-opt ${picked ? (o === S.o.right ? "good" : (o === picked ? "bad" : "")) : ""}" data-wx="z-pick" data-o="${E(o)}" ${picked ? "disabled" : ""}>${E(o)}</button>`).join("")}</div>
      ${picked ? `<div class="xw-row" style="justify-content:center"><button class="xw-btn" data-wx="z-next">Next →</button></div>` : ""}</div>`;
  }

  /* ---- Say it aloud (shadowing) ---- */
  function startShadow(){
    const items = pickChunks(UI.fam, 5);
    S = {q: items, i:0, ok:0, no:0, again:{}, reps:0};
    UI.view = "shadow"; render();
  }
  function renderShadow(){
    if(!S || S.i >= S.q.length){ return sessionEnd("shadow", "Say it aloud"); }
    const it = S.q[S.i], v = it.v;
    sec.innerHTML = backBtn + `<div class="xw-stage"><div class="xw-top"><span>${S.i + 1} / ${S.q.length}</span><span>listen → repeat 3×</span></div>
      <div class="xw-scene">${v.sc}</div><div class="xw-sent" style="font-size:22px">${hl(v.s)}</div><div class="xw-sub">${E(v.en)}</div>
      <div class="xw-row" style="justify-content:center"><button class="xw-btn ghost" data-say="${E(plain(v.s))}" data-rate="0.8">🔊 Slow</button><button class="xw-btn ghost" data-say="${E(plain(v.s))}" data-rate="1">🔊 Normal</button></div>
      <div class="xw-sub" style="margin-top:12px">Listen, then say it out loud three times. How did it feel?</div>
      <div class="xw-row" style="justify-content:center"><button class="xw-btn no" data-wx="s-think">🤔 Still thinking</button><button class="xw-btn ok" data-wx="s-auto">✅ Automatic</button></div></div>`;
    say(plain(v.s), 0.8);
  }

  function sessionEnd(kind, title){
    const v = V(), t = today();
    if(kind === "shadow" && S){ if(v.shadowToday.date !== t) v.shadowToday = {date:t, n:0}; v.shadowToday.n += S.q.length; persist(); }
    const n = S ? S.q.length : 0;
    sec.innerHTML = backBtn + `<div class="xw-stage"><div class="xw-done">${n ? "🎉" : "🌱"}</div><div class="xw-q">${n ? E(title) + " done!" : "Nothing to practise yet"}</div>
      <div class="xw-sub">${n ? `${S.ok} automatic · ${S.no} to come back soon` : "Try another family."}</div>
      <div class="xw-row" style="justify-content:center"><button class="xw-btn" data-wx="${kind}">Another round</button></div></div>`;
  }

  /* ---- Chunk library ---- */
  function renderLib(){
    let h = backBtn + `<div class="xw-note">Each pair shows moving there (Wohin?) and being there (Wo?). Tap 🔊 and say it with the scene in mind.</div>`;
    (FAM.length ? FAM : [{id:"orte",name:"Chunks",why:""}]).forEach((f, k) => {
      const groups = CH.filter(c => c.fam === f.id);
      h += `<details class="xw-lib" ${k === 0 ? "open" : ""}><summary>${E(f.name)} <small>(${groups.length})</small></summary>
        <details class="xw-why"><summary>Why? (optional)</summary><p>${E(f.why || "")}</p></details>`;
      groups.forEach(c => {
        h += c.v.length === 2
          ? `<div class="xw-pair">${c.v.map((v, i) => `<div class="xw-cell"><small>${i === 0 ? "Wohin? →" : "Wo? 📍"}</small><span style="font-size:20px">${v.sc.replace(/^🚶➡️|^📍/, "")}</span> <b class="${gcls(v.g)}">${E(v.a)}</b> <button class="xw-btn ghost" style="padding:4px 9px" data-say="${E(plain(v.s))}">🔊</button><div class="xw-note">${E(v.en)}</div></div>`).join("")}</div>`
          : c.v.map(v => `<div class="xw-cell" style="margin:6px 0"><span style="font-size:20px">${v.sc}</span> <b class="${gcls(v.g)}">${E(v.a)}</b> <button class="xw-btn ghost" style="padding:4px 9px" data-say="${E(plain(v.s))}">🔊</button><div class="xw-note">${E(v.q)} — ${E(v.en)}</div></div>`).join("");
      });
      h += `</details>`;
    });
    sec.innerHTML = h;
  }

  /* ---- My words ---- */
  function renderDeck(){
    const cards = Object.entries(V().cards).map(([id,c]) => (c.id = id, c)).sort((a,b) => (a.box||0) - (b.box||0) || (a.due < b.due ? -1 : 1));
    let h = backBtn + `<div class="xw-note">${cards.length} words. Dots show the box (more = better known). Tap a word to see it.</div>`;
    if(!cards.length) h += `<div class="xw-stage"><div class="xw-sub">Your deck is empty. Tap any German word in a lesson, test or reading text, then “Add to my deck”.</div></div>`;
    cards.forEach(c => {
      const e = entryOf(c); if(!e) return;
      h += `<div class="xw-deckrow"><div class="xw-grow" data-xw="tap-entry" data-id="${E(c.id)}" style="cursor:pointer">${lemmaHtml(e)}<div class="xw-note">${E((e.en||"").slice(0,60))}</div></div><span class="xw-boxdots">${"●".repeat(c.box||0) || "new"}</span><button class="xw-btn ghost" style="padding:6px 10px" data-wx="rm" data-id="${E(c.id)}" aria-label="Remove">✕</button></div>`;
    });
    sec.innerHTML = h;
  }

  /* custom (saved) words need an entry for the popover too */
  const _origTap = BYID.get.bind(BYID);
  BYID.get = id => { const e = _origTap(id); if(e) return e; const c = V().cards[id]; return c && c.t === "c" ? entryOf(Object.assign({id}, c)) : e; };

  /* =============================== events inside the Words tab =============================== */
  sec.addEventListener("click", ev => {
    const b = ev.target.closest("[data-wx]"); if(!b) return;
    const a = b.dataset.wx;
    if(a === "hub"){ UI.view = "hub"; S = null; return render(); }
    if(a === "fam"){ UI.fam = b.dataset.id; return renderHub(); }
    if(a === "cards") return startCards();
    if(a === "qa") return startQA();
    if(a === "cloze") return startCloze();
    if(a === "shadow") return startShadow();
    if(a === "lib"){ UI.view = "lib"; return render(); }
    if(a === "deck"){ UI.view = "deck"; return render(); }
    if(a === "rm"){ delete V().cards[b.dataset.id]; persist(); return renderDeck(); }
    if(!S) return;
    if(a === "c-show"){ S.show = true; return renderCards(); }
    if(a === "c-ok" || a === "c-no"){
      const card = V().cards[S.q[S.i]], ok = a === "c-ok";
      if(card){ rateCard(card, ok); if(ok) S.ok++; else { S.no++; if(!S.again[card.id]){ S.again[card.id] = 1; S.q.push(card.id); } } }
      S.i++; S.show = false; return renderCards();
    }
    if(a === "q-show"){ S.show = true; return renderQA(); }
    if(a === "q-auto" || a === "q-think"){
      const it = S.q[S.i], ok = a === "q-auto"; rateChunk(it.key, ok); bumpFamily(it.c.fam); persist();
      if(ok) S.ok++; else { S.no++; if(!S.again[it.key]){ S.again[it.key] = 1; S.q.splice(Math.min(S.q.length, S.i + 4), 0, it); } }
      S.i++; S.show = false; return renderQA();
    }
    if(a === "z-pick"){
      const it = S.q[S.i]; S.picked = b.dataset.o; const ok = S.picked === S.o.right;
      rateChunk(it.key, ok); bumpFamily(it.c.fam); persist();
      if(ok) S.ok++; else { S.no++; if(!S.again[it.key]){ S.again[it.key] = 1; S.q.splice(Math.min(S.q.length, S.i + 4), 0, it); } }
      renderCloze(); say(plain(it.v.s), ok ? 0.95 : 0.8);   // wrong answers: hear the correct chunk read aloud
      return;
    }
    if(a === "z-next"){ S.i++; S.picked = null; S.o = null; return renderCloze(); }
    if(a === "s-auto" || a === "s-think"){
      const it = S.q[S.i], ok = a === "s-auto"; rateChunk(it.key, ok); persist();
      if(ok) S.ok++; else S.no++;
      S.i++; return renderShadow();
    }
  });

  /* =============================== start =============================== */
  mo = new MutationObserver(scheduleDecorate);
  const gv = document.getElementById("germanView");
  if(gv){ mo.observe(gv, {childList:true, subtree:true}); decorateAll(); }
  console.info("ext-words: ready —", ENTS.length, "glossary entries,", CH.length, "chunk groups");
})();
