/* ===================== ext-plan.js — Today = 6 blocks of 30 minutes =====================
   The Today tab now shows ONE thing: the day you are on, split into 6 blocks of 30 minutes (3 hours).
   Tap a block -> a short list of tasks for those 30 minutes -> tap a task -> it opens the real lesson / flashcards /
   listening / reading and a "Back to my plan" button brings you home. The old Today cards are still there under
   "Show the old Today screen". Display + navigation only; nothing is deleted or renamed.
   DAY PAGES: every day listed in days-meta.js (window.DAY_META) has ONE page with everything for that day (words,
   grammar, practice, story, speaking, writing). Its 6 tiles show that day's own titles, open the page, and read the
   ticks saved by the page. To add a day, add a line to days-meta.js. This file does not change.
   SAVED DATA: only adds state.german.fun.plan = { "<day>": { done:{taskId:true}, items:{l:[ids], r:[ids]} } }
   and, when every task of a block is ticked, the same block record ext-kind.js uses (blocks / minutes / res).
   LOOK: the header card (phase, Day N / 240, topic, progress, Start button) was restyled in an Apple-like way.
   Only the markup of home() and the CSS at the bottom changed; every data-pl hook and saved value is the same.
   Remove the <script> tag and the site behaves exactly as before. */
(function(){
  "use strict";
  if(window.__EXT_PLAN__) return;
  const gView = document.getElementById("germanView"), nav = document.getElementById("germanSubnav"), sec = document.getElementById("germanToday");
  if(!gView || !nav || !sec || !window.FUN){ console.warn("ext-plan: needs ext-fun.js"); return; }
  window.__EXT_PLAN__ = true;

  const E = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const persist = () => { try{ saveData(); }catch(e){ console.warn("ext-plan: could not save", e); } };
  const F = () => window.FUN.data();
  const TOTAL = (typeof TOTAL_CORE_DAYS === "number") ? TOTAL_CORE_DAYS : 240;
  const day = () => (typeof germanCurrentDay === "number" && germanCurrentDay > 0) ? germanCurrentDay : 1;
  const list = n => { try{ return (0,eval)("typeof " + n + " !== 'undefined' ? " + n + " : []"); }catch(e){ return []; } };
  const levelOfDay = d => { try{ const m = /^(A1|A2|B1|B2)/.exec(phaseForDay(d).label); return m ? m[1] : "B2"; }catch(e){ return "B1"; } };
  const submitted = store => { const g = (state.german || {})[store] || {}; return new Set(Object.keys(g).filter(id => g[id] && (g[id].submitted || g[id].done))); };

  /* ---------- days that have ONE full page with everything inside: listed in days-meta.js ---------- */
  const pageFor = d => { const m = (window.DAY_META || {})[d]; return m ? {url:m.url || ("day.html?d=" + d), key:m.key || ("day" + d + ".v1"), titles:m.titles, topic:m.topic} : null; };
  const pageState = d => { try{ const pg = pageFor(d); return (pg && JSON.parse(localStorage.getItem(pg.key))) || {}; }catch(e){ return {}; } };
  (function(){
    try{
      const s = document.createElement("script"); s.src = "days-meta.js?t=" + Date.now();
      s.onload = () => { try{ if(host && !host.classList.contains("hidden")) render(); }catch(e){} };
      document.head.appendChild(s);
    }catch(e){ console.warn("ext-plan: could not load days-meta.js", e); }
  })();

  /* ---------- saved plan record for the current day ---------- */
  function P(){
    const f = F();
    if(!f.plan || typeof f.plan !== "object") f.plan = {};
    const k = String(day());
    if(!f.plan[k] || typeof f.plan[k] !== "object") f.plan[k] = {};
    const p = f.plan[k];
    if(!p.done || typeof p.done !== "object") p.done = {};
    if(!p.items || typeof p.items !== "object") p.items = {};
    return p;
  }
  /* the 2 listening / 2 reading texts for today are chosen once and kept, so the list never changes under you */
  function texts(kind){
    const p = P(), all = list(kind === "l" ? "LISTENING_EXERCISES" : "READING_PASSAGES");
    let ids = p.items[kind];
    if(!Array.isArray(ids) || !ids.length || ids.some(id => !all.some(i => i.id === id))){
      const done = submitted(kind === "l" ? "listening" : "reading"), order = ["A1","A2","B1","B2"], want = order.indexOf(levelOfDay(day()));
      const dist = it => Math.abs(order.indexOf(it.level) - want);
      const rank = a => a.map((i, ix) => ({i, ix})).sort((x, y) => dist(x.i) - dist(y.i) || x.ix - y.ix).map(x => x.i);
      const fresh = rank(all.filter(i => !done.has(i.id)));
      ids = (fresh.length >= 2 ? fresh : rank(all)).slice(0, 2).map(i => i.id);
      p.items[kind] = ids; persist();
    }
    return ids.map(id => all.find(i => i.id === id)).filter(Boolean);
  }

  /* ---------- navigation helpers (same moves as the buttons in the old Today screen) ---------- */
  function tab(sub){
    const v = document.querySelector('#viewSwitch button[data-view="german"]'); if(v && gView.classList.contains("hidden")) v.click();
    const b = nav.querySelector('button[data-sub="' + sub + '"]'); if(b) b.click();
  }
  function openWords(mode){ tab("words"); const w = document.getElementById("germanWords"), b = w && w.querySelector('[data-wx="' + mode + '"]'); if(b) b.click(); }
  function openItem(kind, id){
    try{
      if(kind === "listen"){ germanOpenListening = id; renderListeningList(); tab("listening"); }
      else{ germanOpenReading = id; renderReadingList(); tab("reading"); }
      setTimeout(() => { const el = document.querySelector('.test-card[data-item="' + id + '"]'); if(el && el.scrollIntoView) el.scrollIntoView({behavior:"smooth", block:"start"}); }, 90);
    }catch(e){ console.warn("ext-plan: open item", e); }
  }
  function openDaily(sel, i, focus){
    tab("daily");
    setTimeout(() => {
      const els = document.querySelectorAll(sel), el = els[i || 0] || els[0];
      if(el){ if(el.scrollIntoView) el.scrollIntoView({behavior:"smooth", block:"start"}); if(focus){ try{ el.focus({preventScroll:true}); }catch(e){} } }
    }, 140);
  }

  /* ---------- today's 6 blocks ---------- */
  function blocks(){
    const dc = list("GERMAN_DAYS")[day() - 1], lessons = (dc && dc.lessons) || [], n = lessons.length;
    const ls = texts("l"), rs = texts("r");
    const challenge = (typeof DAILY_CHALLENGES !== "undefined" && DAILY_CHALLENGES[day() - 1]) || "Say 3 sentences about today's topic out loud.";
    const lSub = it => it.title + " · " + it.level + " · play it, answer 3 questions, tap Check Answers";
    const rSub = it => it.title + " · " + it.level + " · read it, answer 3 questions, tap Check Answers";
    const readMin = n > 1 ? 10 : 15;
    const b2 = lessons.map((l, i) => ({id:"b2-read-" + i, min:readMin, title:(n > 1 ? "Lesson " + (i + 1) + ": " : "Lesson: ") + l.topic, sub:"Read the two example sentences, tap any word you don't know.", go:() => openDaily(".g-lesson", i)}));
    b2.push({id:"b2-say", min:n > 1 ? 10 : 15, title:"Say every example out loud 3 times", sub:"Use the speaker on each word. Slow first, then fast.", go:() => openDaily(".g-lesson", 0)});
    const hw = n ? Math.max(5, Math.floor(25 / n / 5) * 5) : 10;
    const b6 = lessons.map((l, i) => ({id:"b6-hw-" + i, min:hw, title:"Homework" + (n > 1 ? " " + (i + 1) : "") + ": " + l.topic, sub:l.homework, go:() => openDaily(".lesson-answer", i, true)}));
    b6.push({id:"b6-complete", min:5, title:"Tick “Mark this lesson complete”", sub:"This is what finishes Day " + day() + ".", go:() => openDaily(".g-done-row", n ? n - 1 : 0)});
    const out = [
      {when:"Morning", title:"New words", tasks:[
        {id:"b1-cards", min:15, title:"Flashcards", sub:"Review old cards and learn up to 20 new words.", go:() => openWords("cards")},
        {id:"b1-cloze", min:15, title:"Fill the gap", sub:"Type the missing word. The situation is your only clue.", go:() => openWords("cloze")}]},
      {when:"Morning", title:"Today's lesson", tasks:b2},
      {when:"Afternoon", title:"Listening", tasks:[]
        .concat(ls.slice(0, 2).map((it, i) => ({id:"b3-l" + i, min:10, title:"Listen " + (i + 1) + ": " + it.title, sub:lSub(it), auto:() => submitted("listening").has(it.id), go:() => openItem("listen", it.id)})))
        .concat(ls[0] ? [{id:"b3-again", min:10, title:"Listen to text 1 again", sub:"Second time, without reading the transcript. Notice how much more you catch.", go:() => openItem("listen", ls[0].id)}] : [])},
      {when:"Afternoon", title:"Reading", tasks:[]
        .concat(rs.slice(0, 2).map((it, i) => ({id:"b4-r" + i, min:10, title:"Read " + (i + 1) + ": " + it.title, sub:rSub(it), auto:() => submitted("reading").has(it.id), go:() => openItem("read", it.id)})))
        .concat(rs[0] ? [{id:"b4-words", min:10, title:"Tap 5 new words and add them to your deck", sub:"Inside a text, tap a word, then “Add to my deck”.", go:() => openItem("read", rs[0].id)}] : [])},
      {when:"Evening", title:"Speaking", tasks:[
        {id:"b5-shadow", min:10, title:"Say it aloud", sub:"Shadow 5 chunks. Rate each “automatic” or “still thinking”.", go:() => openWords("shadow")},
        {id:"b5-qa", min:10, title:"Chunk Q&A", sub:"See the scene, say the chunk, then check.", go:() => openWords("qa")},
        {id:"b5-chal", min:10, title:"Speaking challenge", sub:challenge, go:() => openDaily(".g-challenge", 0)}]},
      {when:"Evening", title:"Writing and finish", tasks:b6}
    ];
    /* a day with its own full page: the tiles carry that day's titles and open the page */
    const pg = pageFor(day());
    if(pg) out.forEach((b, i) => { b.page = pg.url; b.idx = i + 1; if(pg.titles && pg.titles[i]) b.title = pg.titles[i]; });
    return out;
  }

  /* ---------- ticking (a block counts as done when all its tasks are done) ---------- */
  const isDone = (p, t) => !!(t.auto ? (t.auto() || p.done[t.id]) : p.done[t.id]);
  const blockDone = (p, b) => b.page ? !!pageState(day())[b.idx] : (b.tasks.length > 0 && b.tasks.every(t => isDone(p, t)));
  function syncBlock(i, on){
    try{
      const f = F(), t = window.FUN.today();
      if(!f.blocks || typeof f.blocks !== "object") f.blocks = {};
      if(!Array.isArray(f.blocks[t])) f.blocks[t] = [];
      if(!f.minutes || typeof f.minutes !== "object") f.minutes = {};
      if(!f.res || typeof f.res !== "object") f.res = {};
      const arr = f.blocks[t], at = arr.indexOf(i); let changed = false;
      if(on && at < 0){
        changed = true;
        arr.push(i); f.minutes[t] = (+f.minutes[t] || 0) + 30;
        if(!f.res[t] || typeof f.res[t] !== "object") f.res[t] = {};
        f.res[t]["block-" + i] = "block";
        window.FUN.toast(arr.length === 6 ? "All 6 blocks done — 3 hours. Day " + day() + " finished." : "Block done. Nice.");
        if(arr.length === 6){ try{ window.FUN.confetti(); }catch(e){} }
      }else if(!on && at >= 0){
        changed = true;
        arr.splice(at, 1); f.minutes[t] = Math.max(0, (+f.minutes[t] || 0) - 30);
        if(f.res[t]){ delete f.res[t]["block-" + i]; if(!Object.keys(f.res[t]).length) delete f.res[t]; }
      }
      if(changed) persist();
    }catch(e){ console.warn("ext-plan: sync", e); }
  }
  /* on render we only ever ADD finished blocks (never remove), so changing the day can't wipe today's minutes */
  function syncAll(){ try{ const p = P(); blocks().forEach((b, i) => { if(blockDone(p, b)) syncBlock(i, true); }); }catch(e){} }

  /* ---------- screen ---------- */
  const host = document.createElement("div"); host.id = "planToday"; host.className = "german-sub hidden";
  sec.before(host);
  let view = {block:null}, oldMode = false, lastOpen = null;

  function setDay(d){
    d = Math.max(1, Math.min(TOTAL, d));
    germanCurrentDay = d; state.german.currentDay = d; persist();
    try{ renderDayPicker(); renderDailyCard(); renderSlangCard(); renderGermanProgressRing(); }catch(e){}
    view.block = null; lastOpen = null; render();
  }
  function home(bs, p){
    const pg = pageFor(day());
    const dc = list("GERMAN_DAYS")[day() - 1], topics = (pg && pg.topic) || (dc ? dc.lessons.map(l => l.topic).join(" and ") : "Daily habit day");
    const done = bs.filter(b => blockDone(p, b)).length;
    const tiles = bs.map((b, i) => {
      const d = b.tasks.filter(t => isDone(p, t)).length, all = blockDone(p, b), mins = b.tasks.reduce((s, t) => s + t.min, 0);
      const em = b.page ? (all ? "Done" : "30 min · tap to open") : `${b.tasks.length} tasks · ${d} done${mins !== 30 ? " · " + mins + " min" : ""}`;
      const act = b.page ? `data-pl="page" data-href="${E(b.page)}"` : `data-pl="open" data-b="${i}"`;
      return `<button class="pl-tile ${all ? "done" : ""}" ${act}><span class="pl-num">${all ? "✓" : i + 1}</span>
        <span class="pl-tx"><small>${b.when} · 30 min</small><b>${E(b.title)}</b><em>${em}</em></span><span class="pl-chev">›</span></button>`;
    }).join("");
    const label = done === 6 ? "Open Day " + day() + " again" : (done > 0 ? "Continue Day " + day() : "Start Day " + day());
    const start = pg ? `<button class="pl-main" data-pl="page" data-href="${E(pg.url)}">${label}</button>` : "";
    const next = done === 6 && day() < TOTAL ? `<button class="pl-main" data-pl="next-day">Day ${day()} finished — go to Day ${day() + 1}</button>` : "";
    return `<div class="pl-card">
      <div class="pl-head"><button class="pl-sq" data-pl="prev" ${day() <= 1 ? "disabled" : ""} aria-label="Previous day">‹</button>
        <div class="pl-grow"><div class="pl-eye">${E(phaseForDay(day()).label)}</div><div class="pl-day">Day ${day()} <span>/ ${TOTAL}</span></div></div>
        <button class="pl-sq" data-pl="next" ${day() >= TOTAL ? "disabled" : ""} aria-label="Next day">›</button></div>
      <div class="pl-topic">${E(topics)}</div>
      <div class="pl-prog"><b>${done} of 6 blocks</b><span>${done * 0.5} of 3 hours</span></div>
      <div class="pl-bar" role="progressbar" aria-label="Blocks done today" aria-valuemin="0" aria-valuemax="6" aria-valuenow="${done}"><i style="width:${done / 6 * 100}%"></i></div>
      ${start}
      <div class="pl-hint">${pg ? "Everything for today is on one page: words, grammar, practice, a story and homework. Do the blocks in order." : "This day is not written yet. The old plan below still works. The new full page for it is coming."}</div></div>
      <div class="pl-tiles">${tiles}</div>${next}
      <button class="pl-link" data-pl="old">Show the old Today screen</button>`;
  }
  function blockView(bs, p, i){
    const b = bs[i], rows = b.tasks.map(t => {
      const auto = t.auto && t.auto(), on = isDone(p, t);
      return `<div class="pl-task ${on ? "done" : ""}"><button class="pl-tick" data-pl="tick" data-t="${t.id}" ${auto ? "disabled" : ""} aria-label="Mark done">${on ? "✓" : ""}</button>
        <div class="pl-grow"><b>${E(t.title)}</b><small>${E(t.sub)}</small><span class="pl-min">${t.min} min</span></div>
        <button class="pl-start" data-pl="go" data-t="${t.id}">${on ? "Open again" : "Start"}</button></div>`;
    }).join("");
    const nxt = i < bs.length - 1 ? `<button class="pl-main" data-pl="open" data-b="${i + 1}">Next block: ${E(bs[i + 1].title)} ›</button>` : "";
    return `<button class="pl-back" data-pl="home">‹ All blocks</button>
      <div class="pl-card"><div class="pl-eye">Day ${day()} · Block ${i + 1} of 6 · ${b.when}</div><div class="pl-day" style="font-size:26px">${E(b.title)}</div>
      <div class="pl-hint">${blockDone(p, b) ? "This block is done." : "Do these in order. Tap Start, study, then come back with the button at the bottom."}</div></div>
      <div class="pl-list">${rows || '<div class="pl-hint">Nothing to do here today.</div>'}</div>${blockDone(p, b) ? nxt : ""}`;
  }
  function render(){
    try{
      const bs = blocks(), p = P(); syncAll();
      host.innerHTML = view.block == null ? home(bs, p) : blockView(bs, p, view.block);
      updateBack();
    }catch(e){ console.warn("ext-plan: render", e); host.innerHTML = '<div class="pl-card"><div class="pl-hint">The plan could not be drawn (' + E(e && e.message) + '). Tap “Show the old Today screen”.</div><button class="pl-link" data-pl="old">Show the old Today screen</button></div>'; }
  }
  host.addEventListener("click", ev => {
    const b = ev.target.closest("[data-pl]"); if(!b || b.disabled) return;
    const a = b.dataset.pl, bs = blocks(), p = P();
    if(a === "page"){ if(b.dataset.href) window.location.href = b.dataset.href; return; }
    if(a === "open"){ view.block = +b.dataset.b; render(); try{ window.scrollTo({top:0}); }catch(e){} return; }
    if(a === "home"){ view.block = null; render(); return; }
    if(a === "prev") return setDay(day() - 1);
    if(a === "next" || a === "next-day") return setDay(day() + 1);
    if(a === "old"){ oldMode = true; sync(); return; }
    const t = view.block == null ? null : bs[view.block].tasks.find(x => x.id === b.dataset.t);
    if(a === "tick" && t){
      p.done[t.id] = !p.done[t.id]; persist();
      if(!p.done[t.id] && !blockDone(p, bs[view.block])) syncBlock(view.block, false);
      return render();
    }
    if(a === "go" && t){ lastOpen = {day:day(), block:view.block}; updateBack(); t.go(); }
  });

  /* ---------- show / hide: the plan replaces the old Today screen unless "old" is chosen ---------- */
  const old = document.createElement("div"); old.id = "planOldBar"; old.className = "hidden";
  old.innerHTML = '<button class="pl-link" data-pl="new">‹ Back to my 6-block plan</button>'; sec.before(old);
  old.addEventListener("click", () => { oldMode = false; sync(); });
  function sync(){
    const todayOn = !sec.classList.contains("hidden");
    sec.classList.toggle("pl-old", oldMode);
    host.classList.toggle("hidden", !todayOn || oldMode);
    old.classList.toggle("hidden", !todayOn || !oldMode);
    if(todayOn && !oldMode) render();
    updateBack();
  }
  try{ new MutationObserver(sync).observe(sec, {attributes:true, attributeFilter:["class"]}); }catch(e){}
  nav.addEventListener("click", () => sync());                       /* runs after ext-fun's own tab handler */
  const vsw = document.getElementById("viewSwitch"); if(vsw) vsw.addEventListener("click", () => setTimeout(sync, 0));
  /* coming back from a day page (browser back button): redraw so the ticks made there show up */
  window.addEventListener("pageshow", () => { try{ if(!host.classList.contains("hidden")) render(); }catch(e){} });
  document.addEventListener("visibilitychange", () => { try{ if(!document.hidden && !host.classList.contains("hidden")) render(); }catch(e){} });

  /* ---------- floating "back to my plan" button ---------- */
  const back = document.createElement("button"); back.id = "planBack"; back.className = "hidden"; back.type = "button"; document.body.appendChild(back);
  back.addEventListener("click", () => { if(lastOpen){ view.block = lastOpen.block; } oldMode = false; tab("today"); setTimeout(sync, 30); });
  function updateBack(){
    const away = !gView.classList.contains("hidden") && sec.classList.contains("hidden");
    if(lastOpen && away){ back.textContent = "‹ Back to my plan · Day " + lastOpen.day + (lastOpen.block != null ? " · Block " + (lastOpen.block + 1) : ""); back.classList.remove("hidden"); }
    else back.classList.add("hidden");
  }
  setInterval(updateBack, 700);

  /* ---------- look ---------- */
  const css = document.createElement("style"); css.id = "planCss";
  css.textContent = `
  #germanToday:not(.pl-old){display:none !important;}
  #planToday,#planOldBar{padding:4px 0 90px;}
  #planToday.hidden,#planOldBar.hidden,#planBack.hidden{display:none !important;}
  #planToday *{box-sizing:border-box;}
  #planToday{--pl-on:#fff;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro Display",Inter,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased;}
  :root[data-theme="dark"] #planToday{--pl-on:#1c0b09;}

  /* header card */
  .pl-card{background:var(--g-surface,#fff);border:1px solid var(--g-hairline,rgba(0,0,0,.08));border-radius:28px;box-shadow:var(--g-shadow-soft,0 1px 8px rgba(0,0,0,.08));padding:26px 24px 22px;margin:10px 0;}
  .pl-head{display:flex;align-items:flex-start;gap:12px;}
  .pl-grow{flex:1;min-width:0;}
  .pl-eye{font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;line-height:1.35;color:var(--g-crimson,#c0152f);}
  .pl-day{font-size:clamp(36px,10vw,48px);font-weight:700;line-height:1.05;letter-spacing:-.03em;color:var(--g-ink,#111);margin-top:6px;}
  .pl-day span{font-size:20px;font-weight:500;letter-spacing:0;color:var(--g-ink-faint,#777);}
  .pl-topic{font-size:19px;line-height:1.4;font-weight:500;letter-spacing:-.01em;color:var(--g-ink-soft,#444);margin:12px 0 0;}
  .pl-sq{width:44px;height:44px;border-radius:50%;border:0;background:var(--g-warm-wash,#f3efe9);color:var(--g-ink-soft,#444);font-size:22px;line-height:1;cursor:pointer;flex:none;transition:background .15s ease,transform .15s ease;}
  .pl-sq:hover:not(:disabled){background:var(--g-crimson-tint,#f7e8e6);}
  .pl-sq:active:not(:disabled){transform:scale(.94);}
  .pl-sq:disabled{opacity:.3;cursor:default;}
  .pl-prog{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-top:24px;font-size:15px;color:var(--g-ink-faint,#777);}
  .pl-prog b{font-size:16px;font-weight:600;color:var(--g-ink,#111);}
  .pl-bar{height:4px;border-radius:99px;background:var(--g-hairline,rgba(0,0,0,.08));margin-top:10px;overflow:hidden;}
  .pl-bar i{display:block;height:100%;background:var(--g-crimson,#c0152f);border-radius:99px;transition:width .4s cubic-bezier(.2,.8,.2,1);}
  .pl-hint{font-size:14px;line-height:1.5;color:var(--g-ink-faint,#777);margin-top:12px;}
  .pl-main + .pl-hint{text-align:center;margin-top:12px;}
  .pl-main{display:block;width:100%;margin:22px 0 0;border:0;border-radius:16px;background:var(--g-crimson,#c0152f);color:var(--pl-on,#fff);font:inherit;font-size:17px;font-weight:600;letter-spacing:-.005em;min-height:56px;cursor:pointer;box-shadow:0 8px 20px -10px var(--g-crimson,#c0152f);transition:transform .15s ease,filter .15s ease,box-shadow .15s ease;}
  .pl-main:hover{filter:brightness(1.07);box-shadow:0 12px 26px -10px var(--g-crimson,#c0152f);}
  .pl-main:active{transform:scale(.985);filter:brightness(.95);}
  .pl-tiles + .pl-main{margin-top:16px;}
  #planToday button:focus-visible{outline:3px solid var(--g-crimson-line,rgba(154,43,43,.4));outline-offset:3px;}

  /* block tiles */
  .pl-tiles{display:flex;flex-direction:column;gap:10px;}
  .pl-tile{display:flex;align-items:center;gap:14px;width:100%;text-align:left;border:1px solid var(--g-hairline,rgba(0,0,0,.06));background:var(--g-surface,#fff);border-radius:20px;box-shadow:var(--g-shadow-soft,0 1px 8px rgba(0,0,0,.08));padding:14px 16px;min-height:76px;cursor:pointer;color:var(--g-ink,#111);font:inherit;transition:transform .15s ease,box-shadow .15s ease;}
  .pl-tile:hover{box-shadow:var(--g-shadow-lift,0 6px 20px rgba(0,0,0,.12));}
  .pl-tile:active,.pl-start:active{transform:scale(.98);}
  .pl-tile.done{background:#e8f6ee;}
  :root[data-theme="dark"] .pl-tile.done{background:#14301f;}
  .pl-num{width:38px;height:38px;border-radius:50%;background:var(--g-crimson,#c0152f);color:var(--pl-on,#fff);display:flex;align-items:center;justify-content:center;font-weight:600;font-size:17px;flex:none;}
  .pl-tile.done .pl-num{background:#1f8a4c;color:#fff;}
  .pl-tx{display:flex;flex-direction:column;flex:1;min-width:0;}
  .pl-tx small{font-size:12.5px;color:var(--g-ink-faint,#777);}
  .pl-tx b{font-size:18px;font-weight:600;letter-spacing:-.01em;}
  .pl-tx em{font-style:normal;font-size:14px;color:var(--g-ink-faint,#777);}
  .pl-chev{font-size:28px;color:var(--g-ink-faint,#999);}
  .pl-back,.pl-link{border:0;background:none;color:var(--g-crimson,#c0152f);font:inherit;font-size:16px;font-weight:600;padding:12px 4px;cursor:pointer;min-height:44px;}
  .pl-link{display:block;margin:12px auto 0;color:var(--g-ink-faint,#777);font-weight:500;}

  /* tasks inside a block */
  .pl-list{display:flex;flex-direction:column;gap:10px;}
  .pl-task{display:flex;align-items:flex-start;gap:12px;background:var(--g-surface,#fff);border:1px solid var(--g-hairline,rgba(0,0,0,.06));border-radius:20px;box-shadow:var(--g-shadow-soft,0 1px 8px rgba(0,0,0,.08));padding:14px;}
  .pl-task.done{background:#e8f6ee;}
  :root[data-theme="dark"] .pl-task.done{background:#14301f;}
  .pl-task b{display:block;font-size:17px;font-weight:600;color:var(--g-ink,#111);}
  .pl-task small{display:block;font-size:14.5px;color:var(--g-ink-faint,#777);margin-top:3px;line-height:1.4;}
  .pl-min{display:inline-block;margin-top:6px;font-size:12.5px;font-weight:600;color:var(--g-crimson,#c0152f);}
  .pl-tick{width:34px;height:34px;border-radius:50%;border:2px solid var(--g-ink-faint,#aaa);background:none;color:#fff;font-size:18px;flex:none;cursor:pointer;margin-top:2px;}
  .pl-task.done .pl-tick{background:#1f8a4c;border-color:#1f8a4c;}
  .pl-start{flex:none;border:0;border-radius:99px;background:var(--g-crimson,#c0152f);color:var(--pl-on,#fff);font:inherit;font-size:15px;font-weight:600;padding:0 18px;min-height:44px;cursor:pointer;align-self:center;transition:transform .15s ease;}
  .pl-task.done .pl-start{background:var(--g-warm-wash,#eee);color:var(--g-ink,#111);}
  #planBack{position:fixed;left:12px;right:12px;bottom:14px;z-index:60;border:0;border-radius:99px;background:var(--g-crimson,#c0152f);color:#fff;font:inherit;font-size:16px;font-weight:700;min-height:52px;box-shadow:0 4px 18px rgba(0,0,0,.3);cursor:pointer;max-width:520px;margin:0 auto;}
  @media (max-width:480px){.pl-card{padding:22px 18px 18px;border-radius:24px;}.pl-topic{font-size:18px;}}
  @media (prefers-reduced-motion:reduce){.pl-tile,.pl-start,.pl-main,.pl-sq{transition:none;}.pl-tile:active,.pl-start:active,.pl-main:active,.pl-sq:active{transform:none;}.pl-bar i{transition:none;}}`;
  document.head.appendChild(css);

  sync();
  window.PLAN = {render, setDay};
})();
