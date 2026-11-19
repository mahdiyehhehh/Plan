/* ===================== ext-kind.js — Step 4 (kinder wording, clearer Today screen, study blocks) =====================
   Loaded LAST (after ext-fun.js and ext-resources.js). It only changes what the Today screen shows and adds one thing:
   - Study blocks: 6 blocks of 30 minutes = 3 hours a day, done at any time of day, in any order.
     A block can be ticked and un-ticked. Each tick adds 30 minutes to "Time studied today" and counts as an active day
     for the streak. Missing a block never takes anything away.
   - Kinder wording: "Behind" becomes "Catching up", no "N behind" line, no where-you-should-be marker on the skill bars,
     and the deck line no longer shows a target you "need" to hit.
   - Clearer layout: the Today screen shows only what matters first (day, study blocks, quest, real-German links). Streak, extras, pace,
     skills, weekly review, milestones and badges sit under one "More" fold. Larger text, bigger buttons, and the next
     undone step is highlighted.
   SAVED DATA: only adds state.german.fun.blocks = { "YYYY-MM-DD": [block numbers done] } and, per ticked block,
   one entry in state.german.fun.res[date] ("block-N": "block") and +30 in state.german.fun.minutes[date].
   Remove the script tag and the site behaves exactly as before.
   ====================================================================================================== */
(function(){
  "use strict";
  if(window.__EXT_KIND__) return;
  if(!window.FUN || typeof saveData !== "function"){ console.warn("ext-kind: ext-fun.js must load first"); return; }
  window.__EXT_KIND__ = true;

  const BLOCK_MIN = 30;
  const BLOCKS = [
    ["Morning", "Flashcards and new words"],
    ["Morning", "Lesson of the day"],
    ["Afternoon", "Listening"],
    ["Afternoon", "Reading"],
    ["Evening", "Say it aloud"],
    ["Evening", "Write a few sentences"]
  ];
  const GOAL_MIN = BLOCKS.length * BLOCK_MIN;
  const F = () => window.FUN.data();
  const today = () => window.FUN.today();
  const persist = () => { try{ saveData(); }catch(e){ console.warn("ext-kind: could not save", e); } };
  const hoursText = m => { const h = Math.round(m / 6) / 10; return String(h).replace(/\.0$/, ""); };

  function todays(){
    const f = F();
    if(!f.blocks || typeof f.blocks !== "object") f.blocks = {};
    const t = today();
    if(!Array.isArray(f.blocks[t])) f.blocks[t] = [];
    return f.blocks[t];
  }

  function toggle(i){
    const f = F(), t = today(), arr = todays(), at = arr.indexOf(i);
    if(!f.minutes || typeof f.minutes !== "object") f.minutes = {};
    if(!f.res || typeof f.res !== "object") f.res = {};
    if(at < 0){
      arr.push(i);
      f.minutes[t] = (+f.minutes[t] || 0) + BLOCK_MIN;
      if(!f.res[t] || typeof f.res[t] !== "object") f.res[t] = {};
      f.res[t]["block-" + i] = "block";
    }else{
      arr.splice(at, 1);
      f.minutes[t] = Math.max(0, (+f.minutes[t] || 0) - BLOCK_MIN);
      if(f.res[t]){ delete f.res[t]["block-" + i]; if(!Object.keys(f.res[t]).length) delete f.res[t]; }
    }
    persist();
    try{
      if(at < 0){
        if(arr.length === BLOCKS.length){ window.FUN.toast("All 6 blocks done — 3 hours. Great day."); try{ window.FUN.confetti(); }catch(e){} }
        else window.FUN.toast("Block done — " + hoursText(arr.length * BLOCK_MIN) + " h today. Nice.");
      }
    }catch(e){}
    try{ window.FUN.checkBadges(); }catch(e){}
    window.FUN.refresh();
  }

  function blocksHtml(){
    const done = todays(), mins = done.length * BLOCK_MIN, pct = Math.min(100, mins / GOAL_MIN * 100);
    const items = BLOCKS.map((b, i) => {
      const on = done.indexOf(i) >= 0;
      return '<button type="button" class="fk-b' + (on ? " on" : "") + '" data-fk="' + i + '" aria-pressed="' + (on ? "true" : "false") + '">' +
        '<span class="fk-chk">' + (on ? "✓" : (i + 1)) + '</span><span class="fk-bt"><b>' + b[0] + ' · ' + BLOCK_MIN + ' min</b><small>' + b[1] + '</small></span></button>';
    }).join("");
    return '<div class="fk-head"><div class="fk-title">Today\'s study time</div><div class="fk-count"><b>' + done.length + '</b> of ' + BLOCKS.length + ' blocks · ' + hoursText(mins) + ' of ' + hoursText(GOAL_MIN) + ' h</div></div>' +
      '<div class="fn-bar thick"><i style="width:' + pct.toFixed(1) + '%"></i></div>' +
      '<div class="fk-grid">' + items + '</div>' +
      '<div class="fk-note">Do the blocks at any time of day and in any order. One block is already a good day, and a block you skip never takes anything away.</div>';
  }

  const titleOf = c => { const h = c.querySelector(".fn-h"); return h ? h.textContent.trim() : ""; };

  function softenPace(c){
    const pill = c.querySelector(".fn-pill");
    if(pill){
      const map = {"Behind": "Catching up", "Slightly behind": "Nearly there"}, t = pill.textContent.trim();
      if(map[t]) pill.textContent = map[t];
      if(pill.classList.contains("behind")){ pill.classList.remove("behind"); pill.classList.add("slight"); }
    }
    const ls = c.querySelectorAll(".fn-lines > div");
    if(ls[0]) ls[0].innerHTML = ls[0].innerHTML.replace(/<b>(\d+) behind<\/b>/, (m, n) => { n = parseInt(n, 10); return n <= 1 ? "today's lesson is waiting" : "<b>" + n + " days</b> to catch up"; });
    if(ls[1]){
      const b = ls[1].querySelector("b"), n = b ? b.textContent : "0";
      ls[1].innerHTML = "📚 Words in your deck: <b>" + n + "</b>. Every word you tap in a lesson and add to your deck counts. A good daily aim is 15–20 new words.";
    }
    if(ls[2]){
      const b = ls[2].querySelector("b"), wk = b ? b.textContent : "0";
      ls[2].innerHTML = "⏱ This week: <b>" + wk + "</b>. Your goal is about <b>3 hours a day</b>, split into the small blocks above. The 10-minute quest is the minimum for a very busy day, not the whole plan.";
    }
  }
  function softenSkills(c){
    const s = c.querySelector(".fn-h small"); if(s) s.textContent = "your progress so far";
    const sub = c.querySelector(".fn-sub");
    if(sub) sub.textContent = "Bars come from your real records: deck, listening and reading checks, chunks and sentences said, texts written. Speaking is self-rated. The browser voice is robotic, so also use the real-voice links in \"Real German for today\".";
  }

  let patching = false, moreOpen = false;
  function patch(){
    if(patching) return;
    const sec = document.getElementById("germanToday"); if(!sec) return;
    if(sec.querySelector(".fk-blocks")) return;
    const cards = Array.prototype.slice.call(sec.children).filter(n => n.classList && n.classList.contains("fn-card"));
    if(!cards.length) return;
    patching = true;
    try{
      const day = sec.querySelector(".fn-card.fn-day"), quest = sec.querySelector(".fn-card.fn-quest");
      const bl = document.createElement("div"); bl.className = "fn-card fk-blocks"; bl.innerHTML = blocksHtml();
      if(day) day.after(bl); else sec.insertBefore(bl, sec.firstChild);
      cards.forEach(c => {
        const t = titleOf(c);
        if(/^Are you on track/.test(t)) softenPace(c);
        else if(/^Skills/.test(t)) softenSkills(c);
      });
      const nx = sec.querySelector(".fn-step:not(.done)"); if(nx) nx.classList.add("fk-next");
      /* the "Real German for today" card (id rsCard, from ext-resources.js) stays visible next to the quest, not inside the fold */
      const rest = cards.filter(c => c !== day && c !== quest && c.id !== "rsCard");
      if(rest.length){
        const d = document.createElement("details"); d.className = "fk-more"; if(moreOpen) d.open = true;
        const s = document.createElement("summary"); s.textContent = "More: streak, extras, pace, skills, badges"; d.appendChild(s);
        rest[0].before(d);
        rest.forEach(c => d.appendChild(c));
        d.addEventListener("toggle", () => { moreOpen = d.open; });
      }
    }catch(e){ console.warn("ext-kind: patch", e); }
    finally{ patching = false; }
  }

  const sec = document.getElementById("germanToday");
  if(!sec){ console.warn("ext-kind: Today screen not found"); return; }
  sec.addEventListener("click", ev => {
    const b = ev.target && ev.target.closest ? ev.target.closest("[data-fk]") : null;
    if(!b) return;
    ev.preventDefault();
    toggle(parseInt(b.getAttribute("data-fk"), 10));
  });
  new MutationObserver(patch).observe(sec, {childList: true});
  patch();

  const css = document.createElement("style"); css.id = "kindCss";
  css.textContent = `
  #germanToday .fn-card{padding:18px 16px;margin-bottom:14px;}
  #germanToday .fn-sub{font-size:15px;line-height:1.5;color:var(--black);}
  #germanToday .fn-qtitle{font-size:20px;line-height:1.25;}
  #germanToday .fn-step b{font-size:16px;} #germanToday .fn-step small{font-size:14px;line-height:1.4;color:var(--grey-dark);}
  #germanToday .fn-step{padding:12px 0;}
  #germanToday .fn-step.fk-next{background:var(--offwhite);border-radius:12px;padding:12px 10px;outline:2px solid var(--red);}
  #germanToday .fn-btn,#germanToday .fn-chip,#germanToday .fn-go{min-height:44px;font-size:15px;}
  #germanToday .fn-go{width:100%;margin:10px 0;}
  #germanToday .fn-lines div{font-size:15px;line-height:1.55;}
  #germanToday .fn-bar u{display:none;}
  #germanToday .fn-sk-top{font-size:15px;} #germanToday .fn-sk small{font-size:13px;}
  .fk-head{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:10px;}
  .fk-title{font-size:20px;font-weight:800;} .fk-count{font-size:15px;color:var(--grey-dark);} .fk-count b{color:var(--black);font-size:18px;}
  .fk-grid{display:grid;grid-template-columns:1fr;gap:8px;margin:14px 0 10px;}
  .fk-b{display:flex;align-items:center;gap:12px;text-align:left;width:100%;min-height:56px;padding:10px 12px;border-radius:12px;border:1.5px solid var(--line-strong);background:transparent;color:var(--black);font:inherit;cursor:pointer;}
  .fk-b .fk-chk{flex:0 0 32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;border:1.5px solid var(--line-strong);}
  .fk-b .fk-bt b{display:block;font-size:16px;} .fk-b .fk-bt small{display:block;font-size:14px;color:var(--grey-dark);margin-top:2px;}
  .fk-b.on{background:rgba(46,125,50,.16);border-color:#2e7d32;} .fk-b.on .fk-chk{background:#2e7d32;border-color:#2e7d32;color:#fff;}
  .fk-note{font-size:14px;line-height:1.5;color:var(--grey-dark);}
  .fk-more{margin:0 0 14px;} .fk-more > summary{cursor:pointer;font-weight:800;font-size:16px;padding:14px 16px;border-radius:12px;border:1.5px solid var(--line-strong);list-style:none;}
  .fk-more > summary::-webkit-details-marker{display:none;} .fk-more[open] > summary{margin-bottom:14px;}
  @media (min-width:640px){.fk-grid{grid-template-columns:1fr 1fr;}}
  `;
  document.head.appendChild(css);
})();
