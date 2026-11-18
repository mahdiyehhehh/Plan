/* ===================== ext-fun.js — Step 3a (Today screen + habit system) =====================
   - "Today" tab (first tab of the A1 -> B2 area): ONE big 10-minute quest =
       10 flashcards + 1 short listening + 1 sentence to say or write.
   - XP, levels, badges, confetti, "Day X / 240", an EARNED streak freeze (1 per 7 active days),
     five honest skill bars (Wortschatz, Hören, Lesen, Sprechen, Schreiben),
     weekly mini-review, B1 checkpoint / B2 mock milestones, on-track / behind / ahead estimate.
   - Friendly nudge replaces the guilt nudge. Rest Day stays; rest days keep the streak alive.
   Needs (loaded before): app.js, ext-glossary.js, ext-chunks.js, ext-words.js.
   SAVED DATA: only ADDS state.german.fun (safe defaults). Nothing existing is renamed, changed or deleted.
   XP is derived from your real records, so it never double-counts and never drifts.
   Remove this script tag and the site behaves exactly as before.
   ============================================================================================ */
(function(){
  "use strict";
  if(window.__EXT_FUN__) return;
  if(typeof state === "undefined" || typeof saveData !== "function" || typeof toISO !== "function"){ console.warn("ext-fun: app.js not ready"); return; }
  const nav = document.getElementById("germanSubnav"), dailySec = document.getElementById("germanDaily"), gView = document.getElementById("germanView");
  if(!nav || !dailySec || !gView){ console.warn("ext-fun: German tabs not found"); return; }
  window.__EXT_FUN__ = true;

  /* =============================== helpers =============================== */
  const E = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const TOTAL = (typeof TOTAL_CORE_DAYS === "number") ? TOTAL_CORE_DAYS : 240;
  const WORD_TARGET = 4000;                         // honest target: 4,000 words by day 240 (about 17-20 new a day)
  const today = () => toISO(new Date());
  const dt = iso => { const p = String(iso).split("-").map(Number); return new Date(p[0], p[1]-1, p[2]); };
  const plusDays = (iso, n) => { const d = dt(iso); d.setDate(d.getDate() + n); return toISO(d); };
  const daysBetween = (a, b) => Math.round((dt(b) - dt(a)) / 86400000);
  const mondayOf = iso => { const d = dt(iso), w = d.getDay(); d.setDate(d.getDate() + (w === 0 ? -6 : 1) - w); return toISO(d); };
  const persist = () => { try{ saveData(); }catch(e){ console.warn("ext-fun: could not save", e); } };
  const reduced = () => { try{ return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }catch(e){ return false; } };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };

  /* =============================== saved data (state.german.fun) =============================== */
  function F(){
    if(!state.german || typeof state.german !== "object") state.german = {};
    const g = state.german;
    if(!g.fun || typeof g.fun !== "object") g.fun = {};
    const f = g.fun;
    if(!f.quest || typeof f.quest !== "object") f.quest = {};      // { "YYYY-MM-DD": {created, lb, started, say, replayL, done, doneAt, mins} }
    if(!f.badges || typeof f.badges !== "object") f.badges = {};   // { id: "YYYY-MM-DD" }
    if(!f.minutes || typeof f.minutes !== "object") f.minutes = {};// { "YYYY-MM-DD": minutes }
    if(!Array.isArray(f.sentences)) f.sentences = [];              // [{d, mode:"say"|"write", t, p}]
    if(!f.weekly || typeof f.weekly !== "object") f.weekly = {};   // { "<monday>": {date, score, n} }
    if(!f.res || typeof f.res !== "object") f.res = {};            // Step 3b: { "YYYY-MM-DD": { resourceId: "listen"|"read"|"speak"|"write"|"vocab" } }
    if(!f.extra || typeof f.extra !== "object") f.extra = {listen:0, read:0};
    if(typeof f.planStart !== "string") f.planStart = "";
    return f;
  }
  const G = () => state.german || {};
  const listOf = n => { try{ return (0,eval)("typeof " + n + " !== 'undefined' ? " + n + " : []"); }catch(e){ return []; } };

  /* =============================== activity + streak (earned freeze) =============================== */
  function activity(){
    const f = F(), g = G(), act = new Set(), rest = new Set(g.restDates || []);
    Object.keys(f.quest).forEach(d => { if(f.quest[d] && f.quest[d].done) act.add(d); });
    Object.keys(f.res).forEach(d => { if(f.res[d] && Object.keys(f.res[d]).length) act.add(d); });
    const days = g.days || {};
    Object.keys(days).forEach(k => {
      const r = days[k];
      if(r && r.doneDate && Array.isArray(r.lessons) && r.lessons.length && r.lessons.every(l => l && l.done)) act.add(r.doneDate);
    });
    return {act, rest};
  }
  /* Streak rules (no guilt): every active day (quest, finished lesson, or a resource tick) adds 1.
     Rest Day = neutral: keeps the streak alive, adds nothing. Every 7th active day in a row EARNS a freeze;
     a freeze automatically covers one missed day when you have a streak of 3+. Pure function of your records. */
  function timeline(){
    const {act, rest} = activity(), all = Array.from(act).concat(Array.from(rest)).sort();
    const t = today();
    const out = {run:0, best:0, earned:0, spent:0, freezes:0, todayActive:act.has(t), restToday:rest.has(t), frozen:[], start:all[0] || t};
    if(!all.length) return out;
    let d = all[0], run = 0, guard = 0;
    if(daysBetween(d, t) > 900) d = plusDays(t, -900);
    while(d <= t && guard++ < 1000){
      if(act.has(d)){ run++; if(run > out.best) out.best = run; if(run % 7 === 0) out.earned++; }
      else if(rest.has(d)){ /* neutral */ }
      else if(d === t){ /* today still open */ }
      else if(run >= 3 && out.earned - out.spent > 0){ out.spent++; out.frozen.push(d); }
      else run = 0;
      d = plusDays(d, 1);
    }
    out.run = run; out.freezes = out.earned - out.spent;
    return out;
  }
  const origStreak = (typeof germanCurrentStreak === "function") ? germanCurrentStreak : function(){ return 0; };
  window.germanCurrentStreak = function(){
    let a = 0, b = 0;
    try{ a = origStreak(); }catch(e){}
    try{ b = timeline().run; }catch(e){}
    return Math.max(a, b);
  };

  /* =============================== counts, XP, levels, skills =============================== */
  const submittedIds = store => Object.keys(G()[store] || {}).filter(id => { const r = G()[store][id]; return r && (r.submitted || r.done); });
  function completedDays(){
    let n = 0, hi = 0; const days = G().days || {};
    for(let d = 1; d <= TOTAL; d++){ if(days[d] && dayIsDone(d)){ n++; hi = d; } }
    return {n, hi};
  }
  function questCount(){ const f = F(); return Object.keys(f.quest).filter(d => f.quest[d] && f.quest[d].done).length; }
  function totals(){
    const g = G(), f = F(), v = g.vocab || {}, log = v.log || {}, cards = v.cards || {};
    let cardsN = 0, chunkN = 0;
    Object.keys(log).forEach(d => { cardsN += (log[d].cards || 0); chunkN += (log[d].chunks || 0); });
    const ids = Object.keys(cards);
    const learned = ids.filter(i => (cards[i].box || 0) >= 1).length, known = ids.filter(i => (cards[i].box || 0) >= 5).length;
    const lIds = submittedIds("listening"), rIds = submittedIds("reading");
    const score = store => Object.keys(g[store] || {}).reduce((s, id) => s + ((g[store][id] && g[store][id].score) || 0), 0);
    let resTicks = 0; const resBy = {listen:0, read:0, speak:0, write:0, vocab:0};
    Object.keys(f.res).forEach(d => Object.keys(f.res[d] || {}).forEach(id => { resTicks++; const k = f.res[d][id]; if(resBy[k] !== undefined) resBy[k]++; }));
    const said = f.sentences.filter(s => s.mode === "say").length, written = f.sentences.filter(s => s.mode === "write").length;
    const days = g.days || {};
    const lessonWrites = Object.keys(days).filter(k => days[k] && typeof days[k].writing === "string" && days[k].writing.trim().length >= 15).length;
    const speakDays = Object.keys(days).filter(k => days[k] && days[k].speakingDone).length;
    const cd = completedDays(), quests = questCount(), weekly = Object.keys(f.weekly).length;
    const listenN = lIds.length + (f.extra.listen || 0) + resBy.listen, readN = rIds.length + (f.extra.read || 0) + resBy.read;
    const speakN = chunkN + said + speakDays + resBy.speak, writeN = written + lessonWrites + resBy.write;
    const xp = cardsN*2 + chunkN*2 + lIds.length*20 + score("listening")*5 + rIds.length*20 + score("reading")*5
             + quests*50 + f.sentences.length*10 + weekly*40 + cd.n*30 + resTicks*10 + ((f.extra.listen||0)+(f.extra.read||0))*10;
    const level = Math.floor(Math.sqrt(xp / 60)) + 1;
    return {cardsN, chunkN, deck:ids.length, learned, known, listenN, readN, speakN, writeN, said, written, quests, weekly, lessonDays:cd.n, highest:cd.hi, xp, level, resTicks, cur:60*(level-1)*(level-1), next:60*level*level};
  }
  function planStart(){
    const f = F(); if(/^\d{4}-\d{2}-\d{2}$/.test(f.planStart)) return f.planStart;
    const ds = []; const days = G().days || {};
    Object.keys(days).forEach(k => { if(days[k] && days[k].doneDate) ds.push(days[k].doneDate); });
    Object.keys(f.quest).forEach(d => ds.push(d));
    ds.sort(); return ds[0] || today();
  }
  const dayIdx = () => Math.max(1, Math.min(TOTAL, daysBetween(planStart(), today()) + 1));
  const SKILLS = [
    {k:"vocab",  name:"Wortschatz", target:WORD_TARGET, unit:"words in your deck", get:t => t.learned},
    {k:"listen", name:"Hören",      target:150,         unit:"listening texts",    get:t => t.listenN},
    {k:"read",   name:"Lesen",      target:100,         unit:"reading texts",      get:t => t.readN},
    {k:"speak",  name:"Sprechen",   target:1000,        unit:"chunks & sentences said aloud (self-rated)", get:t => t.speakN},
    {k:"write",  name:"Schreiben",  target:200,         unit:"sentences / texts written", get:t => t.writeN}
  ];
  function minutesWeek(){ const f = F(), t = today(); let m = 0; for(let i=0;i<7;i++) m += (+f.minutes[plusDays(t,-i)] || 0); return m; }
  function pace(){
    const t = totals(), cd = completedDays(), idx = dayIdx(), rests = (G().restDates || []).length;
    const expected = Math.max(0, Math.min(TOTAL, idx - rests)), behind = expected - cd.n;
    const left = Math.max(1, TOTAL - cd.n), need = Math.max(0, (WORD_TARGET - t.learned) / left);
    let status = "on", label = "On track";
    if(behind > 10 || need > 30){ status = "behind"; label = "Behind"; }
    else if(behind > 3 || need > 22){ status = "slight"; label = "Slightly behind"; }
    else if(behind <= -3 && need <= 18){ status = "ahead"; label = "Ahead"; }
    return {status, label, behind, expected, done:cd.n, need:Math.round(need), learned:t.learned, idx, mins:minutesWeek(), start:planStart()};
  }
  const levelOfDay = day => { try{ const m = /^(A1|A2|B1|B2)/.exec(phaseForDay(day).label); return m ? m[1] : "B2"; }catch(e){ return "B1"; } };
  const nextDay = () => Math.min(TOTAL, completedDays().hi + 1);
  const curDay = () => (typeof germanCurrentDay === "number" && germanCurrentDay > 0) ? germanCurrentDay : nextDay();

  /* =============================== badges =============================== */
  const BADGES = [
    ["first-quest","🌱","First quest",c => c.quests >= 1],["quests-10","🔟","10 quests",c => c.quests >= 10],["quests-30","🏅","30 quests",c => c.quests >= 30],
    ["streak-3","🔥","3 days in a row",c => c.best >= 3],["streak-7","⚡","7 days in a row",c => c.best >= 7],["streak-14","🚀","14 days in a row",c => c.best >= 14],["streak-30","👑","30 days in a row",c => c.best >= 30],
    ["words-100","📘","100 words",c => c.t.learned >= 100],["words-500","📗","500 words",c => c.t.learned >= 500],["words-1000","📙","1,000 words",c => c.t.learned >= 1000],["words-2500","📚","2,500 words",c => c.t.learned >= 2500],
    ["listen-1","🎧","First listening",c => c.t.listenN >= 1],["listen-10","🎧","10 listenings",c => c.t.listenN >= 10],["read-1","📖","First reading",c => c.t.readN >= 1],["read-10","📖","10 readings",c => c.t.readN >= 10],
    ["say-1","🗣️","First sentence said",c => c.t.said >= 1],["write-10","✍️","10 pieces written",c => c.t.writeN >= 10],
    ["review-1","🧠","First weekly review",c => c.t.weekly >= 1],["lvl-5","⭐","Level 5",c => c.t.level >= 5],["lvl-10","🌟","Level 10",c => c.t.level >= 10],
    ["days-30","📅","30 lesson days",c => c.t.lessonDays >= 30],["days-60","📅","60 lesson days",c => c.t.lessonDays >= 60],["days-120","🎯","120 lesson days",c => c.t.lessonDays >= 120],["days-240","🏆","All 240 days",c => c.t.lessonDays >= 240],
    ["mock-b1","📝","B1 checkpoint mock",c => c.b1 >= 1],["mock-b2","🎓","B2 mock exam",c => c.b2 >= 1]
  ];
  function mockCount(level){ return ((G().mockRuns) || []).filter(r => r && r.level === level).length; }
  let toasts = [];
  function checkBadges(){
    const f = F(), t = totals(), tl = timeline(), c = {t, quests:t.quests, best:tl.best, b1:mockCount("B1"), b2:mockCount("B2")};
    const first = !f.badgesInit; let fresh = [];
    BADGES.forEach(b => { if(!f.badges[b[0]] && b[3](c)){ f.badges[b[0]] = today(); fresh.push(b); } });
    if(first) f.badgesInit = true;
    if(fresh.length || first) persist();
    if(!first && fresh.length){ fresh.forEach(b => toast(b[1] + " New badge: " + b[2])); confetti(0.5); }
  }

  /* =============================== confetti + toast =============================== */
  function confetti(power){
    if(reduced()) return;
    try{
      const cv = document.createElement("canvas"); cv.className = "fn-confetti";
      const w = cv.width = window.innerWidth, h = cv.height = window.innerHeight; document.body.appendChild(cv);
      const ctx = cv.getContext && cv.getContext("2d"); if(!ctx){ cv.remove(); return; }
      const cols = ["#c0392b","#f4b942","#2e7d32","#2d7ff9","#8e44ad","#ffffff"], n = Math.round(110 * (power || 1));
      const ps = Array.from({length:n}, () => ({x:w/2 + (Math.random()-.5)*w*.3, y:h*.62, vx:(Math.random()-.5)*11, vy:-Math.random()*13-4, s:4+Math.random()*6, r:Math.random()*6, vr:(Math.random()-.5)*.4, c:pick(cols)}));
      let f = 0;
      (function step(){
        ctx.clearRect(0,0,w,h);
        ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .38; p.vx *= .992; p.r += p.vr; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6); ctx.restore(); });
        if(++f < 130) requestAnimationFrame(step); else cv.remove();
      })();
    }catch(e){}
  }
  function toast(msg){
    try{
      let box = document.getElementById("fnToasts");
      if(!box){ box = document.createElement("div"); box.id = "fnToasts"; document.body.appendChild(box); }
      const el = document.createElement("div"); el.className = "fn-toast"; el.textContent = msg; box.appendChild(el);
      setTimeout(() => el.classList.add("out"), 3200); setTimeout(() => el.remove(), 3700);
    }catch(e){}
  }

  /* =============================== quest =============================== */
  function quest(){
    const f = F(), t = today();
    if(!f.quest[t]) f.quest[t] = {created:Date.now(), lb:submittedIds("listening"), rb:submittedIds("reading")};
    const q = f.quest[t]; if(!Array.isArray(q.lb)) q.lb = []; return q;
  }
  function steps(){
    const q = quest(); let cards;
    if(window.XW && typeof XW.stats === "function"){
      const s = XW.stats(), d = (s.log && s.log.cards) || 0, avail = s.due + Math.min(s.fresh, s.newLeft), need = Math.min(10, d + avail);
      cards = {need, done:d, ok:need === 0 || d >= need, na:need === 0};
    }else cards = {need:0, done:0, ok:true, na:true};
    const lb = new Set(q.lb), newly = submittedIds("listening").filter(id => !lb.has(id));
    const listen = !!q.replayL || newly.length > 0, say = !!q.say;
    return {cards, listen, say, all:cards.ok && listen && say};
  }
  function ensureDeck(){
    if(!window.XW) return 0;
    const s = XW.stats(), have = s.due + Math.min(s.fresh, s.newLeft);
    if(have >= 10) return 0;
    let want = Math.min(10 - have, Math.max(0, s.newLeft - Math.min(s.fresh, s.newLeft))), added = 0;
    const days = listOf("GERMAN_DAYS"), from = curDay();
    for(let d = from; d < from + 20 && want > 0; d++){
      const day = days[d - 1]; if(!day || !day.lessons) continue;
      day.lessons.forEach(l => {
        if(want <= 0) return;
        let m; try{ m = XW.wordsIn([l.example, l.natural]).main; }catch(e){ m = []; }
        m.forEach(e => { if(want > 0 && XW.addCard(e, "quest")){ want--; added++; } });
      });
    }
    if(added) persist();
    return added;
  }
  function pickItem(kind){
    const store = kind === "listen" ? "listening" : "reading";
    const items = listOf(kind === "listen" ? "LISTENING_EXERCISES" : "READING_PASSAGES");
    if(!items.length) return null;
    const done = new Set(submittedIds(store)), want = ["A1","A2","B1","B2"].indexOf(levelOfDay(curDay()));
    const dist = it => Math.abs(["A1","A2","B1","B2"].indexOf(it.level) - want);
    const fresh = items.filter(i => !done.has(i.id)).sort((a, b) => dist(a) - dist(b));
    if(fresh.length) return fresh[0];
    return null;
  }
  function goView(){ const b = document.querySelector('#viewSwitch button[data-view="german"]'); if(b && gView.classList.contains("hidden")) b.click(); }
  function tab(sub){ goView(); const b = nav.querySelector('button[data-sub="' + sub + '"]'); if(b) b.click(); }
  function openItem(kind, id){
    try{
      if(kind === "listen"){ germanOpenListening = id; renderListeningList(); tab("listening"); }
      else{ germanOpenReading = id; renderReadingList(); tab("reading"); }
      setTimeout(() => { const el = document.querySelector('.test-card[data-item="' + id + '"]'); if(el && el.scrollIntoView) el.scrollIntoView({behavior:"smooth", block:"start"}); }, 90);
    }catch(e){ console.warn("ext-fun: open item", e); }
  }
  function openWords(mode){
    tab("words");
    const sec = document.getElementById("germanWords"), b = sec && sec.querySelector('[data-wx="' + mode + '"]');
    if(b) b.click();
  }
  function finishQuest(){
    const f = F(), t = today(), q = quest();
    if(q.done) return;
    q.done = true; q.doneAt = Date.now();
    const m = q.started ? Math.max(3, Math.min(25, Math.round((q.doneAt - q.started) / 60000))) : 10;
    q.mins = m; f.minutes[t] = (+f.minutes[t] || 0) + m;
    persist();
    toast("🎉 Quest complete! +50 XP");
    confetti(1);
    checkBadges();
    const tl = timeline();
    if(tl.run > 0 && tl.run % 7 === 0) setTimeout(() => toast("❄️ You earned a streak freeze!"), 900);
    lastSig = ""; refresh();
  }

  /* =============================== sentence prompts =============================== */
  const PROMPTS = [
    {l:"A1", en:"Say who is in your family.", de:"In meiner Familie sind wir drei Personen."},
    {l:"A1", en:"Order a coffee.", de:"Ich hätte gern einen Kaffee, bitte."},
    {l:"A1", en:"Say what you are doing right now.", de:"Ich lerne gerade Deutsch."},
    {l:"A1", en:"Say what time you get up.", de:"Ich stehe um sieben Uhr auf."},
    {l:"A1", en:"Say what you eat for breakfast.", de:"Zum Frühstück esse ich Brot und trinke Tee."},
    {l:"A1", en:"Say where you live.", de:"Ich wohne in Berlin."},
    {l:"A2", en:"Tell your husband what you did yesterday.", de:"Gestern habe ich eingekauft und gekocht."},
    {l:"A2", en:"Suggest a plan for the weekend.", de:"Wollen wir am Samstag ins Kino gehen?"},
    {l:"A2", en:"Say what you still need to buy.", de:"Ich muss noch Milch und Brot kaufen."},
    {l:"A2", en:"Describe your street.", de:"In meiner Straße gibt es einen Supermarkt und einen Park."},
    {l:"A2", en:"Ask the family what they would like to eat.", de:"Was möchtet ihr heute essen?"},
    {l:"A2", en:"Say why you are learning German.", de:"Ich lerne Deutsch, weil ich hier arbeiten möchte."},
    {l:"A2", en:"Make an appointment at the doctor's.", de:"Ich möchte einen Termin machen, bitte."},
    {l:"A2", en:"Say what you did at the weekend.", de:"Am Wochenende bin ich spazieren gegangen."},
    {l:"B1", en:"Tell your husband's family about your plan for the Ausbildung.", de:"Ich möchte eine Ausbildung zur Steuerfachangestellten machen."},
    {l:"B1", en:"Explain a problem and ask for help.", de:"Ich habe ein Problem. Könnten Sie mir bitte helfen?"},
    {l:"B1", en:"Give your opinion on something simple.", de:"Meiner Meinung nach ist das eine gute Idee."},
    {l:"B1", en:"Tell a short story about your last holiday.", de:"Letztes Jahr waren wir im Urlaub. Das Wetter war schön."},
    {l:"B1", en:"Politely say no to an invitation.", de:"Leider kann ich nicht kommen, weil ich arbeiten muss."},
    {l:"B1", en:"Compare the city and a village.", de:"In der Stadt ist es lauter als auf dem Dorf."},
    {l:"B1", en:"Say what you read in the news today.", de:"Ich habe gelesen, dass die Preise steigen."},
    {l:"B1", en:"Describe your normal day.", de:"Morgens lerne ich Deutsch, nachmittags arbeite ich."},
    {l:"B2", en:"Explain to the family why accounting interests you.", de:"Mich interessiert Buchhaltung, weil man genau arbeitet und mit Zahlen zu tun hat."},
    {l:"B2", en:"Complain politely about a delivery.", de:"Leider ist meine Bestellung noch nicht angekommen."},
    {l:"B2", en:"Give one argument for and one against working from home.", de:"Einerseits spart man Zeit, andererseits fehlt der Kontakt zu den Kollegen."},
    {l:"B2", en:"Describe a plan and what could go wrong.", de:"Falls es regnet, bleiben wir zu Hause."},
    {l:"B2", en:"Give advice to a friend who wants to move to Germany.", de:"An deiner Stelle würde ich zuerst die Sprache lernen."},
    {l:"B2", en:"Explain one difference between your home country and Germany.", de:"In meiner Heimat ist vieles anders als hier."},
    {l:"B2", en:"Summarise a news story in two or three sentences.", de:"In dem Artikel geht es darum, dass ..."},
    {l:"B2", en:"Tell the family about a problem at work or university.", de:"Gestern hatte ich ein Problem bei der Arbeit, aber ich habe es gelöst."}
  ];
  let UI = {offset:0, mode:"say", draft:"", rev:null};
  function todaysPrompt(){
    const lv = levelOfDay(curDay()), pool = PROMPTS.filter(p => p.l === lv);
    return pool[(daysBetween("2026-01-01", today()) + UI.offset) % pool.length];
  }

  /* =============================== weekly mini-review =============================== */
  function entryOfCard(id, c){
    if(c && c.t === "c") return {w:c.w, en:c.en, label:c.w};
    if(!window.XW) return null;
    const word = id.slice(2).replace(/#\d+$/, ""), isN = id.indexOf("n:") === 0;
    let r; try{ r = XW.resolve(isN ? word.charAt(0).toUpperCase() + word.slice(1) : word, false); }catch(e){ return null; }
    const e = r && r.e; if(!e || e.id.replace(/#\d+$/, "") !== id.replace(/#\d+$/, "")) return null;
    return {w:e.w, en:(e.en || "").replace(/\s*\(.*$/, ""), label:(e.t === "n" && e.g ? e.g + " " : "") + e.w};
  }
  function buildReview(){
    const cards = (G().vocab && G().vocab.cards) || {}, t = today();
    const ids = Object.keys(cards).filter(i => (cards[i].box || 0) >= 1 || cards[i].seen);
    const recent = shuffle(ids.filter(i => cards[i].added && daysBetween(cards[i].added, t) <= 14)), rest = shuffle(ids.filter(i => recent.indexOf(i) < 0));
    const ents = recent.concat(rest).map(i => entryOfCard(i, cards[i])).filter(e => e && e.en);
    if(ents.length < 4) return null;
    const qs = ents.slice(0, 6).map(e => {
      const wrong = shuffle(ents.filter(x => x.label !== e.label)).slice(0, 3).map(x => x.label);
      return {en:e.en, right:e.label, opts:shuffle([e.label].concat(wrong))};
    });
    return {q:qs, i:0, score:0, picked:null};
  }
  function weeklyHtml(){
    const f = F(), wk = mondayOf(today()), done = f.weekly[wk], R = UI.rev;
    const cards = (G().vocab && G().vocab.cards) || {};
    if(R){
      if(R.i >= R.q.length){
        return `<div class="fn-h">Weekly mini-review</div><div class="fn-big">${R.score} / ${R.q.length}</div><div class="fn-sub">${R.score >= R.q.length - 1 ? "Very solid." : R.score >= R.q.length / 2 ? "Good — the missed ones will come back in your cards." : "Those words need more time. That's normal — keep going."} +40 XP</div><button class="fn-btn" data-fn="rev-end">Done</button>`;
      }
      const q = R.q[R.i];
      return `<div class="fn-h">Weekly mini-review <small>${R.i + 1} / ${R.q.length}</small></div><div class="fn-sub">What is this in German?</div><div class="fn-big">${E(q.en)}</div>
        <div class="fn-opts">${q.opts.map(o => `<button class="fn-opt ${R.picked ? (o === q.right ? "good" : (o === R.picked ? "bad" : "")) : ""}" data-fn="rev-pick" data-o="${E(o)}" ${R.picked ? "disabled" : ""}>${E(o)}</button>`).join("")}</div>
        ${R.picked ? `<button class="fn-btn" data-fn="rev-next">${R.i + 1 >= R.q.length ? "Finish" : "Next →"}</button>` : ""}`;
    }
    const wd = Array.from({length:7}, (_, i) => plusDays(wk, i)), {act, rest} = activity(), vl = (G().vocab && G().vocab.log) || {};
    const activeDays = wd.filter(d => act.has(d) || rest.has(d)).length, cardsWk = wd.reduce((s, d) => s + ((vl[d] && vl[d].cards) || 0), 0);
    const questsWk = wd.filter(d => f.quest[d] && f.quest[d].done).length, sentWk = f.sentences.filter(s => wd.indexOf(s.d) >= 0).length;
    const can = Object.keys(cards).length >= 4;
    return `<div class="fn-h">This week</div>
      <div class="fn-mini"><span><b>${activeDays}</b>/7 active days</span><span><b>${questsWk}</b> quests</span><span><b>${cardsWk}</b> cards</span><span><b>${sentWk}</b> sentences</span></div>
      ${done ? `<div class="fn-sub">✅ Weekly mini-review done (${done.score}/${done.n}). Nice. You can do it again any time.</div>` : `<div class="fn-sub">A 6-question check on the words you collected recently. No pressure — it just shows what to refresh.</div>`}
      ${can ? `<button class="fn-btn ${done ? "ghost" : ""}" data-fn="rev-start">${done ? "Again" : "Start mini-review"}</button>` : `<div class="fn-sub">Add a few words to your deck first (at least 4) and the review appears here.</div>`}`;
  }

  /* =============================== milestones =============================== */
  function milestonesHtml(){
    const cd = completedDays().n, b1 = mockCount("B1"), b2 = mockCount("B2");
    const row = (icon, title, sub, state, btn) => `<div class="fn-ms ${state}"><span class="fn-ms-ic">${icon}</span><div class="fn-grow"><b>${title}</b><small>${sub}</small></div>${btn || ""}</div>`;
    const open = `<button class="fn-btn ghost" data-fn="mock">Open timed mock exam</button>`;
    const b1State = b1 ? "done" : (cd >= 105 ? "now" : "soon"), b2State = b2 >= 2 ? "done" : (cd >= 205 ? "now" : "soon");
    return row("🎯", "Goethe B1 checkpoint", b1 ? `${b1} B1 timed mock${b1 > 1 ? "s" : ""} done` : (cd >= 105 ? "Due now (around day 120, month 4): run a B1 timed mock" : `Around day 120 (month 4) — ${Math.max(0, 105 - cd)} lesson days until it opens`), b1State, b1State === "now" ? open : "")
         + row("🎓", "B2 mock exams", b2 ? `${b2} B2 timed mock${b2 > 1 ? "s" : ""} done (aim for at least 2, in month 8)` : (cd >= 205 ? "Month 8 is here: run B2 timed mocks" : "Month 8 (days 211–240) — real B2 mocks start there"), b2State, b2State === "now" ? open : "")
         + `<div class="fn-sub">Honest note: mock exams here are self-checked. Reading and listening are scored; speaking and writing are self-rated.</div>`;
  }

  /* =============================== Today screen =============================== */
  const sec = document.createElement("div"); sec.className = "german-sub hidden"; sec.id = "germanToday";
  dailySec.before(sec);
  const strip = document.createElement("div"); strip.id = "funStrip"; strip.className = "fn-strip"; nav.before(strip);
  const tbtn = document.createElement("button"); tbtn.setAttribute("data-sub", "today");
  tbtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none"><path d="M13 3L5 13.5h6L10 21l8-10.5h-6L13 3z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg> Today`;
  nav.insertBefore(tbtn, nav.firstChild);
  const todayVisible = () => !sec.classList.contains("hidden") && !gView.classList.contains("hidden");
  let lastSig = "";

  function skillBars(){
    const t = totals(), idx = dayIdx();
    return SKILLS.map(s => {
      const n = s.get(t), pct = Math.min(100, n / s.target * 100), exp = Math.min(100, idx / TOTAL * 100);
      return `<div class="fn-sk"><div class="fn-sk-top"><b>${s.name}</b><span>${n.toLocaleString("en")} / ${s.target.toLocaleString("en")}</span></div>
        <div class="fn-bar"><i style="width:${pct.toFixed(1)}%"></i><u style="left:${exp.toFixed(1)}%" title="where you would be at an even pace"></u></div><small>${E(s.unit)}</small></div>`;
    }).join("");
  }
  function badgesHtml(){
    const f = F();
    return `<div class="fn-badges">${BADGES.map(b => `<div class="fn-badge ${f.badges[b[0]] ? "on" : ""}" title="${E(b[2])}${f.badges[b[0]] ? " · " + f.badges[b[0]] : ""}"><span>${b[1]}</span><small>${E(b[2])}</small></div>`).join("")}</div>`;
  }
  function stripHtml(){
    const tl = timeline(), t = totals(), cd = completedDays().n;
    return `<span title="Active days in a row">🔥 <b>${tl.run}</b></span><span title="Streak freezes you have earned">❄️ <b>${tl.freezes}</b></span><span title="Level">⭐ Lv <b>${t.level}</b></span><span>${t.xp.toLocaleString("en")} XP</span><span class="fn-grow"></span><span>Day <b>${Math.min(TOTAL, cd + 1)}</b> / ${TOTAL}</span>`;
  }
  function stepRow(n, title, detail, done, label, action){
    return `<div class="fn-step ${done ? "done" : ""}"><span class="fn-chk">${done ? "✓" : n}</span><div class="fn-grow"><b>${title}</b><small>${detail}</small></div>${done ? "" : `<button class="fn-btn" data-fn="${action}">${label}</button>`}</div>`;
  }
  function renderToday(){
    try{
      const f = F(), t = today(), q = quest(), st = steps(), tl = timeline(), tot = totals(), pc = pace(), cd = completedDays();
      const isRest = (G().restDates || []).indexOf(t) >= 0, p = todaysPrompt();
      const nextL = pickItem("listen"), nextR = pickItem("read"), lv = levelOfDay(curDay());
      const left = TOTAL - cd.n, pct = Math.round(cd.n / TOTAL * 100);
      const cardsDetail = st.cards.na ? "No cards available yet — tap words in a lesson to build your deck." : `${Math.min(st.cards.done, st.cards.need)} / ${st.cards.need} done · uses your deck (today's lesson words are added if it's empty)`;
      const listenDetail = st.listen ? "Done — nice ears." : (nextL ? `${E(nextL.title)} · ${E(nextL.level)} · play it, answer 3 questions, tap Check Answers` : "You've done every listening text — replay one and tick below.");
      const hdr = tot.xp - tot.cur, span = tot.next - tot.cur;
      sec.innerHTML = `
      <div class="fn-card fn-day">
        <div class="fn-day-top"><div><div class="fn-eyebrow">${E(lv)} · month ${Math.min(8, Math.ceil(Math.min(TOTAL, cd.n + 1) / 30))}</div><div class="fn-day-n">Day ${Math.min(TOTAL, cd.n + 1)} <span>/ ${TOTAL}</span></div></div>
          <div class="fn-day-r"><b>${left}</b> lesson days to go<br><small>${pct}% of the plan done</small></div></div>
        <div class="fn-bar thick"><i style="width:${pct}%"></i></div>
        <div class="fn-xp"><span>⭐ Level ${tot.level}</span><div class="fn-bar"><i style="width:${Math.min(100, hdr / span * 100).toFixed(1)}%"></i></div><span>${tot.xp.toLocaleString("en")} / ${tot.next.toLocaleString("en")} XP</span></div>
      </div>

      <div class="fn-card fn-quest ${q.done ? "done" : ""}">
        ${q.done
          ? `<div class="fn-qtitle">✅ Quest complete — that's today.</div><div class="fn-sub">Your streak is safe. Everything below is a bonus (and counts for XP).</div>`
          : `<div class="fn-qtitle">Today's 10-minute quest</div><div class="fn-sub">${isRest ? "🌙 Today is a Rest Day — your streak is safe. The quest is optional." : "Three small things. That's enough to keep the habit alive."}</div>
             <button class="fn-go" data-fn="go">▶ ${q.started ? "Continue" : "Start"} quest</button>`}
        ${stepRow(1, "10 flashcards", cardsDetail, st.cards.ok, "Cards", "cards")}
        ${stepRow(2, "1 short listening", listenDetail, st.listen, nextL ? "Listen" : "Done", nextL ? "listen" : "listen-replay")}
        ${stepRow(3, "1 sentence to say or write", E(p.en), st.say, "Below ↓", "sent-scroll")}
        ${st.say ? "" : `<div class="fn-sent" id="fnSent">
          <div class="fn-sent-p">${E(p.en)}</div>
          <div class="fn-sent-m">Model: <i>${E(p.de)}</i> <button class="fn-btn ghost" data-fn="hear">🔊</button> <button class="fn-btn ghost" data-fn="prompt-next">Another prompt</button></div>
          <textarea id="fnDraft" rows="2" placeholder="Write your own sentence here — or just say it out loud and tap the button.">${E(UI.draft)}</textarea>
          <div class="fn-row"><button class="fn-btn" data-fn="said">🗣️ I said it out loud</button><button class="fn-btn" data-fn="wrote">✍️ Save what I wrote</button></div>
          <small class="fn-note">Speaking is self-rated — nobody can grade it here. Say it three times; the third time should feel easier.</small></div>`}
      </div>

      <div class="fn-card"><div class="fn-h">Streak</div>
        <div class="fn-streak"><div><b>${tl.run}</b><small>days in a row</small></div><div><b>${tl.freezes}</b><small>❄️ freezes saved</small></div><div><b>${tl.best}</b><small>best run</small></div></div>
        <div class="fn-sub">${tl.todayActive ? "Today is counted. " : ""}Every 7th day in a row earns a ❄️ freeze; a freeze quietly covers one missed day. Rest Days keep your streak alive without adding to it.</div>
        <div class="fn-row"><button class="fn-btn ghost" data-fn="rest">${isRest ? "🌙 Today is a Rest Day — undo" : "🌙 Take a Rest Day today"}</button></div>
      </div>

      <div class="fn-card"><div class="fn-h">Bonus (optional)</div>
        <div class="fn-chips">
          <button class="fn-chip" data-fn="x-qa">🗣️ Chunk Q&amp;A</button><button class="fn-chip" data-fn="x-shadow">🔊 Say it aloud</button>
          <button class="fn-chip" data-fn="x-cloze">✍️ Fill the gap</button><button class="fn-chip" data-fn="x-read" ${nextR ? "" : "disabled"}>📖 A reading text${nextR ? "" : " (all done)"}</button>
          <button class="fn-chip" data-fn="x-lesson">📘 Lesson of the day</button>
        </div>
        <div class="fn-sub" style="margin-top:10px">Time studied today: <b>${+f.minutes[t] || 0} min</b> · this week <b>${pc.mins} min</b> <span class="fn-grow"></span>
          <button class="fn-chip sm" data-fn="min" data-m="15">+15</button><button class="fn-chip sm" data-fn="min" data-m="30">+30</button><button class="fn-chip sm" data-fn="min" data-m="60">+60</button></div>
      </div>

      <div class="fn-card"><div class="fn-h">Are you on track? <span class="fn-pill ${pc.status}">${pc.label}</span></div>
        <div class="fn-lines">
          <div>📅 Lesson days: <b>${pc.done}</b> done, about <b>${pc.expected}</b> expected by now (plan start ${E(pc.start)}) → ${pc.behind > 0 ? `<b>${pc.behind} behind</b>` : pc.behind < 0 ? `<b>${-pc.behind} ahead</b>` : "exactly on pace"}</div>
          <div>📚 Words in deck: <b>${pc.learned}</b> of ${WORD_TARGET.toLocaleString("en")}. To get there in the lesson days left you need about <b>${pc.need} new words a day</b> (20 a day is the plan).</div>
          <div>⏱ Tracked this week: <b>${Math.round(pc.mins / 6) / 10} h</b>. For B2 by day 240 the honest need is about <b>2 to 2.5 hours a day</b> (14–17 h a week). The 10-minute quest is the floor that keeps the habit alive — it is not the whole plan.</div>
        </div>
        <label class="fn-plan">Plan start date <input type="date" id="fnPlanStart" value="${E(pc.start)}"></label>
      </div>

      <div class="fn-card"><div class="fn-h">Skills <small>marker = where an even pace would be today</small></div>${skillBars()}
        <div class="fn-sub">Bars come from your real records: deck, listening and reading checks, chunks and sentences said, texts written. Speaking is self-rated; the browser voice is robotic, so also use real German speech (resources coming in 3b).</div></div>

      <div class="fn-card" id="fnWeekly">${weeklyHtml()}</div>
      <div class="fn-card"><div class="fn-h">Milestones</div>${milestonesHtml()}</div>
      <div class="fn-card"><div class="fn-h">Badges <small>${Object.keys(f.badges).length} / ${BADGES.length}</small></div>${badgesHtml()}</div>`;
      const ta = document.getElementById("fnDraft"); if(ta) ta.addEventListener("input", () => { UI.draft = ta.value; });
      const ps = document.getElementById("fnPlanStart"); if(ps) ps.addEventListener("change", () => { F().planStart = ps.value; persist(); refresh(); });
      updateStrip();
    }catch(e){ console.warn("ext-fun: render", e); sec.innerHTML = `<div class="fn-card"><div class="fn-sub">Today could not be drawn (${E(e && e.message)}). Your saved data is safe.</div></div>`; }
  }
  function updateStrip(){ try{ strip.innerHTML = stripHtml(); }catch(e){} }
  function refresh(){ lastSig = ""; if(todayVisible()) renderToday(); updateStrip(); updateBar(); }
  window.FUN = {refresh, data:F, timeline, totals, pace, toast, confetti, today, checkBadges, markResource:null};

  /* ---- actions ---- */
  sec.addEventListener("click", ev => {
    const b = ev.target.closest("[data-fn]"); if(!b || b.disabled) return;
    const a = b.dataset.fn, q = quest(), f = F(), t = today();
    const start = () => { if(!q.started){ q.started = Date.now(); persist(); } };
    if(a === "go"){
      start(); ensureDeck(); const st = steps();
      if(!st.cards.ok){ return openWords("cards"); }
      if(!st.listen){ const it = pickItem("listen"); return it ? openItem("listen", it.id) : (q.replayL = true, persist(), refresh()); }
      const el = document.getElementById("fnSent"); if(el && el.scrollIntoView) el.scrollIntoView({behavior:"smooth", block:"center"}); return;
    }
    if(a === "cards"){ start(); ensureDeck(); lastSig = ""; return openWords("cards"); }
    if(a === "listen"){ start(); const it = pickItem("listen"); if(it) openItem("listen", it.id); return; }
    if(a === "listen-replay"){ start(); q.replayL = true; f.extra.listen = (f.extra.listen || 0) + 1; persist(); lastSig = ""; return tick(); }
    if(a === "sent-scroll"){ start(); const el = document.getElementById("fnSent"); if(el && el.scrollIntoView) el.scrollIntoView({behavior:"smooth", block:"center"}); return; }
    if(a === "hear"){ try{ speakGerman(todaysPrompt().de, 0.85); }catch(e){} return; }
    if(a === "prompt-next"){ UI.offset++; return renderToday(); }
    if(a === "said" || a === "wrote"){
      const txt = (document.getElementById("fnDraft") || {value:UI.draft}).value.trim();
      if(a === "wrote" && txt.split(/\s+/).filter(Boolean).length < 3){ toast("Write at least a few words, then save."); return; }
      start(); f.sentences.push({d:t, mode:a === "said" ? "say" : "write", t:a === "wrote" ? txt : "", p:todaysPrompt().en});
      q.say = true; UI.draft = ""; persist(); toast(a === "said" ? "🗣️ Said it — +10 XP" : "✍️ Saved — +10 XP"); lastSig = ""; checkBadges(); return tick();
    }
    if(a === "rest"){ try{ toggleRestDay(t); renderGermanProgressRing(); }catch(e){} return refresh(); }
    if(a === "min"){ f.minutes[t] = (+f.minutes[t] || 0) + (+b.dataset.m || 0); persist(); return refresh(); }
    if(a === "x-qa") return openWords("qa");
    if(a === "x-shadow") return openWords("shadow");
    if(a === "x-cloze") return openWords("cloze");
    if(a === "x-lesson") return tab("daily");
    if(a === "x-read"){ const it = pickItem("read"); if(it) openItem("read", it.id); return; }
    if(a === "mock") return tab("examrun");
    if(a === "rev-start"){ UI.rev = buildReview(); if(!UI.rev) toast("Add a few more words first."); return refresh(); }
    if(a === "rev-pick"){ if(UI.rev && !UI.rev.picked){ UI.rev.picked = b.dataset.o; if(b.dataset.o === UI.rev.q[UI.rev.i].right) UI.rev.score++; } return reviewPaint(); }
    if(a === "rev-next"){ if(UI.rev){ UI.rev.i++; UI.rev.picked = null; } return reviewPaint(); }
    if(a === "rev-end"){
      if(UI.rev){ f.weekly[mondayOf(t)] = {date:t, score:UI.rev.score, n:UI.rev.q.length}; persist(); if(UI.rev.score >= UI.rev.q.length - 1) confetti(.6); toast("🧠 Weekly review done +40 XP"); UI.rev = null; checkBadges(); }
      return refresh();
    }
  });
  function reviewPaint(){ const w = document.getElementById("fnWeekly"); if(w) w.innerHTML = weeklyHtml(); }

  /* ---- floating quest bar (shown while you are in another tab mid-quest) ---- */
  const bar = document.createElement("div"); bar.id = "funBar"; bar.className = "fn-bar-float hidden"; document.body.appendChild(bar);
  bar.addEventListener("click", () => tab("today"));
  function updateBar(){
    try{
      const q = quest();
      if(gView.classList.contains("hidden") || todayVisible() || !q.started || q.done){ bar.classList.add("hidden"); return; }
      const st = steps();
      bar.innerHTML = `<b>Quest</b> · cards ${st.cards.na ? "–" : Math.min(st.cards.done, st.cards.need) + "/" + st.cards.need} · listening ${st.listen ? "✓" : "–"} · sentence ${st.say ? "✓" : "–"} <span>Back to Today ▸</span>`;
      bar.classList.remove("hidden");
    }catch(e){}
  }

  /* ---- tab wiring: show/hide Today, default landing ---- */
  nav.addEventListener("click", ev => {
    const b = ev.target.closest("button[data-sub]"); if(!b) return;
    const on = b.dataset.sub === "today";
    sec.classList.toggle("hidden", !on);
    if(on){ nav.querySelectorAll("button").forEach(x => x.classList.toggle("active", x === b)); renderToday(); }
    updateBar();
  });
  let landed = false;
  const vs = document.getElementById("viewSwitch");
  if(vs) vs.addEventListener("click", ev => {
    const b = ev.target.closest('button[data-view="german"]'); if(!b) return;
    updateStrip();
    if(!landed){ landed = true; tbtn.click(); } else updateBar();
  });

  /* =============================== friendly nudge (replaces the guilt one) =============================== */
  function friendlyNudge(wrap){
    try{
      const t = today(), tl = timeline();
      if(tl.todayActive || tl.restToday || (F().quest[t] && F().quest[t].done)){ wrap.remove(); return; }
      const card = wrap.querySelector(".nudge-card"); if(!card) return;
      const cd = completedDays().n, run = tl.run;
      const title = card.querySelector(".nudge-title"), desc = card.querySelector(".nudge-desc"), pct = card.querySelector(".nudge-pct"), fill = card.querySelector(".nudge-fill");
      if(title) title.textContent = pick(["Welcome back! Your 10-minute quest is ready.", "A little German today? Ten minutes is plenty.", "Ready when you are — today's quest takes about 10 minutes."]);
      if(desc) desc.textContent = (run > 0 ? `You're on a ${run}-day run — nice.` : "Every short session counts, and a fresh start is always fine.") + (tl.freezes > 0 ? ` You have ❄️ ${tl.freezes} streak freeze${tl.freezes > 1 ? "s" : ""} saved for a rough day.` : "");
      if(pct) pct.textContent = `Day ${Math.min(TOTAL, cd + 1)} of ${TOTAL}`;
      if(fill) fill.style.width = Math.round(cd / TOTAL * 100) + "%";
      const old = card.querySelector(".nudge-btn");
      if(old){
        const go = old.cloneNode(false); go.textContent = "Start my 10-minute quest"; go.type = "button";
        old.replaceWith(go);
        const close = () => { wrap.classList.remove("show"); setTimeout(() => wrap.remove(), 300); };
        go.addEventListener("click", () => { close(); tab("today"); });
        const rest = document.createElement("button"); rest.type = "button"; rest.className = "fn-nudge-link"; rest.textContent = "Not today — take a Rest Day 🌙";
        rest.addEventListener("click", () => { try{ toggleRestDay(t); renderGermanProgressRing(); }catch(e){} close(); refresh(); });
        go.after(rest);
      }
    }catch(e){ console.warn("ext-fun: nudge", e); }
  }
  try{
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if(n && n.id === "dailyNudge") friendlyNudge(n); }))).observe(document.body, {childList:true});
    const existing = document.getElementById("dailyNudge"); if(existing) friendlyNudge(existing);
  }catch(e){}

  /* =============================== styles =============================== */
  const css = document.createElement("style"); css.id = "funCss";
  css.textContent = `
  #germanToday{padding-bottom:70px;}
  .fn-strip{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:9px 14px;margin:0 0 10px;border:1px solid var(--line);border-radius:var(--radius-md);background:var(--white);font-size:13px;color:var(--grey-dark);}
  .fn-strip b{color:var(--black);} .fn-grow{flex:1 1 auto;min-width:0;}
  .fn-card{border:1px solid var(--line);border-radius:var(--radius-md);background:var(--white);padding:14px;margin:0 0 12px;color:var(--black);}
  .fn-h{font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
  .fn-h small{font-weight:500;text-transform:none;letter-spacing:0;color:var(--grey);}
  .fn-sub,.fn-note{font-size:12.5px;color:var(--grey-dark);line-height:1.45;} .fn-note{display:block;margin-top:6px;}
  .fn-big{font-size:22px;font-weight:800;margin:6px 0 10px;}
  .fn-eyebrow{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--red);}
  .fn-day-top{display:flex;justify-content:space-between;align-items:flex-end;gap:10px;margin-bottom:10px;}
  .fn-day-n{font-size:34px;font-weight:900;line-height:1;} .fn-day-n span{font-size:16px;font-weight:600;color:var(--grey);}
  .fn-day-r{text-align:right;font-size:13px;color:var(--grey-dark);} .fn-day-r b{font-size:20px;color:var(--black);}
  .fn-bar{position:relative;height:7px;border-radius:6px;background:var(--line);overflow:visible;flex:1;} .fn-bar.thick{height:10px;margin-bottom:10px;}
  .fn-bar i{display:block;height:100%;border-radius:6px;background:var(--red);}
  .fn-bar u{position:absolute;top:-3px;width:2px;height:13px;background:var(--black);opacity:.55;text-decoration:none;}
  .fn-xp{display:flex;align-items:center;gap:10px;font-size:12px;color:var(--grey-dark);white-space:nowrap;} .fn-xp .fn-bar{min-width:60px;}
  .fn-quest{border:2px solid var(--black);} .fn-quest.done{border-color:var(--red);}
  .fn-qtitle{font-size:19px;font-weight:900;margin-bottom:4px;}
  .fn-go{display:block;width:100%;margin:12px 0;padding:16px;border:0;border-radius:var(--radius-md);background:var(--red);color:#fff;font:800 18px var(--font);cursor:pointer;}
  .fn-go:active{transform:scale(.99);}
  .fn-step{display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid var(--line);} .fn-step small{display:block;color:var(--grey-dark);font-size:12px;line-height:1.35;margin-top:2px;}
  .fn-chk{flex:0 0 26px;height:26px;border-radius:50%;border:2px solid var(--black);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;}
  .fn-step.done .fn-chk{background:var(--red);border-color:var(--red);color:#fff;} .fn-step.done b{text-decoration:line-through;opacity:.6;}
  .fn-btn{border:1.5px solid var(--black);background:var(--black);color:var(--white);border-radius:var(--radius-sm);padding:8px 13px;font:700 13px var(--font);cursor:pointer;white-space:nowrap;}
  .fn-btn.ghost{background:transparent;color:var(--black);} .fn-btn:disabled{opacity:.4;}
  .fn-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;}
  .fn-sent{margin-top:6px;padding:12px;border-radius:var(--radius-md);background:var(--offwhite);border:1px dashed var(--line-strong);}
  .fn-sent-p{font-weight:800;font-size:15px;margin-bottom:6px;} .fn-sent-m{font-size:13px;color:var(--grey-dark);margin-bottom:8px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
  #fnDraft{width:100%;box-sizing:border-box;border:1px solid var(--line);border-radius:var(--radius-sm);padding:9px;font:15px var(--font);background:var(--white);color:var(--black);resize:vertical;}
  .fn-streak{display:flex;gap:10px;margin-bottom:8px;} .fn-streak div{flex:1;text-align:center;padding:8px;border-radius:var(--radius-sm);background:var(--offwhite);} .fn-streak b{font-size:24px;display:block;} .fn-streak small{font-size:11px;color:var(--grey-dark);}
  .fn-chips{display:flex;gap:8px;flex-wrap:wrap;} .fn-chip{border:1px solid var(--line-strong);background:transparent;color:var(--black);border-radius:20px;padding:8px 13px;font:600 13px var(--font);cursor:pointer;} .fn-chip.sm{padding:4px 10px;font-size:12px;margin-left:4px;} .fn-chip:disabled{opacity:.4;}
  .fn-pill{font-size:11px;padding:3px 9px;border-radius:12px;text-transform:none;letter-spacing:0;color:#fff;background:#2e7d32;} .fn-pill.slight{background:#c77d0a;} .fn-pill.behind{background:var(--red);} .fn-pill.ahead{background:#1e6fd9;}
  .fn-lines div{font-size:13px;line-height:1.5;margin:6px 0;color:var(--grey-dark);} .fn-lines b{color:var(--black);}
  .fn-plan{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--grey-dark);margin-top:8px;} .fn-plan input{font:13px var(--font);background:var(--white);color:var(--black);border:1px solid var(--line);border-radius:6px;padding:4px 6px;}
  .fn-sk{margin:10px 0;} .fn-sk-top{display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px;} .fn-sk small{font-size:11px;color:var(--grey);}
  .fn-mini{display:flex;gap:14px;flex-wrap:wrap;font-size:13px;color:var(--grey-dark);margin-bottom:8px;} .fn-mini b{color:var(--black);font-size:17px;}
  .fn-opts{display:grid;gap:8px;margin:8px 0;} .fn-opt{text-align:left;border:1.5px solid var(--line-strong);background:transparent;color:var(--black);border-radius:var(--radius-sm);padding:11px;font:600 15px var(--font);cursor:pointer;}
  .fn-opt.good{background:rgba(46,125,50,.2);border-color:#2e7d32;} .fn-opt.bad{background:var(--red-tint);border-color:var(--red);}
  .fn-ms{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid var(--line);} .fn-ms:first-of-type{border-top:0;} .fn-ms small{display:block;font-size:12px;color:var(--grey-dark);} .fn-ms-ic{font-size:22px;} .fn-ms.done .fn-ms-ic{filter:none;} .fn-ms.soon{opacity:.75;}
  .fn-badges{display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));gap:8px;} .fn-badge{text-align:center;padding:8px 4px;border-radius:var(--radius-sm);border:1px solid var(--line);opacity:.35;filter:grayscale(1);} .fn-badge.on{opacity:1;filter:none;border-color:var(--red);} .fn-badge span{font-size:24px;display:block;} .fn-badge small{font-size:10.5px;line-height:1.2;display:block;}
  .fn-confetti{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:99999;}
  #fnToasts{position:fixed;left:0;right:0;bottom:calc(76px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;align-items:center;gap:8px;z-index:99998;pointer-events:none;}
  .fn-toast{background:var(--black);color:var(--white);padding:10px 16px;border-radius:22px;font:700 13.5px var(--font);box-shadow:0 4px 14px rgba(0,0,0,.3);transition:opacity .4s,transform .4s;} .fn-toast.out{opacity:0;transform:translateY(8px);}
  .fn-bar-float{position:fixed;left:10px;right:10px;bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:9000;background:var(--black);color:var(--white);padding:11px 14px;border-radius:14px;font:600 13px var(--font);cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.3);display:flex;gap:6px;flex-wrap:wrap;align-items:center;}
  .fn-bar-float.hidden{display:none;} .fn-bar-float span{margin-left:auto;color:#ffb3a8;}
  .fn-nudge-link{display:block;margin:10px auto 0;background:none;border:0;color:var(--grey-dark);font:600 12.5px var(--font);text-decoration:underline;cursor:pointer;}
  @media print{#germanToday,#funStrip,#funBar,#fnToasts{display:none !important;}}
  `;
  document.head.appendChild(css);

  /* =============================== loop =============================== */
  function tick(){
    try{
      const q = quest(), st = steps();
      if(!q.done && st.all) finishQuest();
      const sig = JSON.stringify([st.cards.done, st.cards.need, st.listen, st.say, !!q.done, today()]);
      if(sig !== lastSig){ lastSig = sig; if(todayVisible()) renderToday(); updateStrip(); }
      updateBar();
    }catch(e){ console.warn("ext-fun: tick", e); }
  }
  setInterval(tick, 1500);
  try{ checkBadges(); }catch(e){}
  updateStrip();
})();
