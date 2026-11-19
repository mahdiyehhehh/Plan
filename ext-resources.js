/* ===================== ext-resources.js — Step 3b (external resources + "done today" ticks) =====================
   Adds a "Real German for today" card to the Today screen (ext-fun.js). Each resource sits in a daily slot
   (listening / reading / speaking / writing / words), is matched to your current level (A1-B2), opens in a NEW TAB,
   and has a "done today" tick. A tick is saved in state.german.fun.res["YYYY-MM-DD"][resourceId] = slot, which
   ext-fun.js already counts for the streak, XP and the Hören / Lesen / Sprechen / Schreiben bars.
   Nothing is embedded (no iframes): no site here has been checked for embedding permission, so links only.
   Needs (loaded before): app.js, ext-fun.js. Remove this script tag and the site behaves exactly as before.
   ====================================================================================================== */
(function(){
  "use strict";
  if(window.__EXT_RES__) return;
  const sec = document.getElementById("germanToday");
  if(!sec || !window.FUN || typeof state === "undefined" || typeof saveData !== "function" || typeof toISO !== "function"){ console.warn("ext-resources: ext-fun.js not ready"); return; }
  window.__EXT_RES__ = true;

  const E = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const ALL = ["A1","A2","B1","B2"];

  /* v (checked on 2026-11-19):
        "live"  = this exact address was opened, or came back from a search with its real page content;
        "cited" = this exact address is quoted by independent course pages or by the site itself (not opened);
        "home"  = the site's front page only; the site exists, the exact page was not opened. */
  const RES = [
    // ---- listening ----
    {id:"dw-nicos-a1", slot:"listen", lv:["A1"], t:"Nicos Weg A1 (DW)", n:"Short video episodes with exercises. Watch once with subtitles, once without.", u:"https://learngerman.dw.com/en/beginners/c-36519789", v:"cited"},
    {id:"dw-langsam", slot:"listen", lv:["A2","B1"], t:"Langsam gesprochene Nachrichten (DW)", n:"Open DW Deutsch lernen, then Audios. News read slowly, with a transcript.", u:"https://learngerman.dw.com/de/", v:"home"},
    {id:"easy-german", slot:"listen", lv:["A2","B1","B2"], t:"Easy German (YouTube)", n:"Street interviews in real spoken German with subtitles. Pick one 5-10 minute episode.", u:"https://www.youtube.com/@EasyGerman", v:"cited"},
    {id:"bibi-bilanzierung", slot:"listen", lv:["B1","B2"], t:"Bibi Bilanzierung (Uni Gießen)", n:"Free cartoon series on accounting basics (Buchführung, Soll und Haben). The page explains the series and where to watch it. Watch one episode and say the main idea aloud.", u:"https://uni-giessen.de/fbz/fb02/fb/professuren/bwl/BWL-VII/bibi-bilanzierung-1/bibi-bilanzierung-und-das-geheimnis-hinter-soll-an-haben", v:"cited"},
    {id:"tagesschau", slot:"listen", lv:["B1","B2"], t:"tagesschau (ARD)", n:"Standard news German with a northern flavour. One short bulletin is enough.", u:"https://www.tagesschau.de/", v:"home"},
    {id:"ndr", slot:"listen", lv:["B1","B2"], t:"NDR (Norddeutscher Rundfunk)", n:"Northern German radio and video: the accent you will hear in Hamburg, Bremen and Berlin families.", u:"https://www.ndr.de/", v:"home"},
    {id:"radiobremen", slot:"listen", lv:["B2"], t:"Radio Bremen", n:"Home page of the Bremen broadcaster. Follow it to Bremen Eins or Bremen Zwei (radio) or buten un binnen (regional news), then say one report's main point aloud.", u:"https://www.radiobremen.de/", v:"home"},
    // ---- reading ----
    {id:"nachrichtenleicht", slot:"read", lv:["A2","B1"], t:"Nachrichtenleicht (Deutschlandfunk)", n:"Real news in simple German. Read one article, then say what happened in two sentences.", u:"https://www.nachrichtenleicht.de/", v:"home"},
    {id:"dw-topthema", slot:"read", lv:["B1","B2"], t:"Top-Thema mit Vokabeln (DW)", n:"Open DW Deutsch lernen, then Audios and Top-Thema. A short article with a word list and audio.", u:"https://learngerman.dw.com/de/", v:"home"},
    {id:"studyflix-buchungssatz", slot:"read", lv:["B1","B2"], t:"Studyflix: Buchungssätze (Accounting)", n:"Real work German: Soll an Haben explained in short text and video. Read one section, then say one Buchungssatz aloud.", u:"https://studyflix.de/kaufmaennisches/buchungssatze-2336", v:"cited"},
    {id:"buchfuehrung-einfach", slot:"read", lv:["B1","B2"], t:"Buchführung einfach erklärt (Accounting)", n:"Plain-German article on double-entry bookkeeping, Kontenrahmen and GoB. Read one section and note 5 work words for your deck.", u:"https://selbststaendigkeit.de/buchhaltung-fuer-gruender/buchfuehrung-einfach-erklaert/", v:"cited"},
    {id:"goethe-ueben", slot:"read", lv:ALL, t:"Goethe-Institut: Deutsch üben", n:"Free practice material from A1 to B2 (reading, listening, grammar). Take one exercise at your level.", u:"https://www.goethe.de/de/spr/ueb.html", v:"cited"},
    {id:"goethe-mini", slot:"read", lv:["A1"], t:"Goethe-Institut: Erste Wege in Deutschland", n:"Nevin's first weeks in Germany: 8 short video episodes (bus, job search, doctor, flat) with exercises.", u:"https://www.goethe.de/prj/mwd/de/deu/ewd.html", v:"live"},
    // ---- speaking ----
    {id:"forvo", slot:"speak", lv:ALL, t:"Forvo", n:"Hear real people say a word. Pick 3 words from today, listen, then say each one twice.", u:"https://forvo.com/languages/de/", v:"live"},
    {id:"easy-german-shadow", slot:"speak", lv:["A2","B1","B2"], t:"Shadowing with Easy German", n:"Replay 30 seconds of one interview and speak along with the speaker, a little after them.", u:"https://www.youtube.com/@EasyGerman", v:"cited"},
    // ---- writing ----
    {id:"goethe-schreiben", slot:"write", lv:["A2","B1","B2"], t:"Goethe-Institut: Deutsch üben (writing)", n:"Write 3-5 sentences about a text you just read: an email, a forum post, or a short complaint. Self-checked.", u:"https://www.goethe.de/de/spr/ueb.html", v:"cited"},
    // ---- words ----
    {id:"dictcc", slot:"vocab", lv:ALL, t:"dict.cc", n:"Look up one word you met today and check its article and plural.", u:"https://www.dict.cc/", v:"live"},
    {id:"wiktionary", slot:"vocab", lv:ALL, t:"Wiktionary", n:"Forms, plural and an example for one word. Good for verbs (Präteritum and Partizip).", u:"https://en.wiktionary.org/", v:"home"},
    {id:"tatoeba", slot:"vocab", lv:ALL, t:"Tatoeba", n:"Real example sentences with English. Copy one into your head, not into a list.", u:"https://tatoeba.org/", v:"home"}
  ];
  const SLOTS = [
    {k:"listen", ic:"🎧", name:"Listening"}, {k:"read", ic:"📖", name:"Reading"}, {k:"speak", ic:"🗣️", name:"Speaking"},
    {k:"write", ic:"✍️", name:"Writing"}, {k:"vocab", ic:"📘", name:"Words"}
  ];

  const today = () => toISO(new Date());
  const persist = () => { try{ saveData(); }catch(e){ console.warn("ext-resources: could not save", e); } };
  function level(){
    try{
      const d = (typeof germanCurrentDay === "number" && germanCurrentDay > 0) ? germanCurrentDay : 1;
      const m = /^(A1|A2|B1|B2)/.exec(phaseForDay(d).label); return m ? m[1] : "B1";
    }catch(e){ return "B1"; }
  }
  /* ticks for today, without the study blocks that ext-kind.js stores under "block-N" in the same record */
  const doneToday = () => {
    try{
      const r = (FUN.data().res || {})[today()] || {}, o = {};
      Object.keys(r).forEach(k => { if(k.indexOf("block-") !== 0) o[k] = r[k]; });
      return o;
    }catch(e){ return {}; }
  };

  function toggle(id){
    const r = RES.find(x => x.id === id); if(!r) return;
    const f = FUN.data(), t = today();
    if(!f.res[t] || typeof f.res[t] !== "object") f.res[t] = {};
    const was = !!f.res[t][id];
    if(was){ delete f.res[t][id]; if(!Object.keys(f.res[t]).length) delete f.res[t]; }
    else f.res[t][id] = r.slot;
    persist();
    try{ FUN.refresh(); }catch(e){}
    if(!was){ try{ FUN.toast("✓ " + r.t + " — +10 XP"); FUN.checkBadges(); }catch(e){} }
  }
  window.FUN.markResource = toggle;

  function row(r, done){
    return `<div class="fn-step rs-row ${done ? "done" : ""}"><button class="fn-chk rs-tick" data-rs="${E(r.id)}" aria-pressed="${done}" aria-label="Done today: ${E(r.t)}">${done ? "✓" : ""}</button>
      <div class="fn-grow"><b>${E(r.t)}</b> <span class="rs-lv">${r.lv.length === 4 ? "A1–B2" : E(r.lv.join(" · "))}</span><small>${E(r.n)}</small></div>
      <a class="fn-btn ghost" href="${E(r.u)}" target="_blank" rel="noopener noreferrer">Open ↗</a></div>`;
  }
  function cardHtml(){
    const lv = level(), done = doneToday(), n = Object.keys(done).length;
    const mine = RES.filter(r => r.lv.indexOf(lv) >= 0);
    const bySlot = s => mine.filter(r => r.slot === s.k);
    const main = SLOTS.map(s => { const l = bySlot(s); return l.length ? `<div class="rs-slot">${s.ic} ${s.name}</div>${l.map(r => row(r, !!done[r.id])).join("")}` : ""; }).join("");
    const others = RES.filter(r => r.lv.indexOf(lv) < 0);
    return `<div class="fn-h">Real German for today <small>level ${E(lv)} · ${n} ticked today</small></div>
      <div class="fn-sub">Pick what fits your time. Open it, use it for a few minutes, then tick it. A tick counts for your streak and your skill bars.</div>
      ${main}
      ${others.length ? `<details class="rs-more"><summary>Other levels (${others.length})</summary>${others.map(r => row(r, !!done[r.id])).join("")}</details>` : ""}
      <div class="fn-sub rs-foot">Links open in a new tab. Ticks are self-reported — nothing here can check that you really did it. Browser text-to-speech is robotic; these real-voice sources are the fix.</div>`;
  }

  /* ---- inject into the Today screen (it is redrawn by innerHTML, so re-insert after each redraw) ---- */
  let busy = false;
  const mo = new MutationObserver(() => place());
  function place(){
    if(busy) return;
    busy = true; mo.disconnect();
    try{
      if(sec.querySelector(".fn-quest") && !sec.querySelector("#rsCard")){
        const card = document.createElement("div"); card.className = "fn-card"; card.id = "rsCard"; card.innerHTML = cardHtml();
        sec.querySelector(".fn-quest").after(card);
      }
    }catch(e){ console.warn("ext-resources: place", e); }
    busy = false; mo.observe(sec, {childList:true});
  }
  sec.addEventListener("click", ev => {
    const b = ev.target.closest("[data-rs]"); if(!b) return;
    ev.stopPropagation(); toggle(b.dataset.rs);
  });
  mo.observe(sec, {childList:true});
  place();

  const css = document.createElement("style"); css.id = "resCss";
  css.textContent = `
  .rs-slot{font-size:12px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;margin:12px 0 2px;color:var(--grey-dark);}
  .rs-row .fn-chk{background:transparent;cursor:pointer;color:var(--black);padding:0;font-family:var(--font);}
  .rs-row.done .fn-chk{color:#fff;}
  .rs-row.done b{text-decoration:none;opacity:1;}
  .rs-lv{font-size:10.5px;font-weight:700;border:1px solid var(--line-strong);border-radius:8px;padding:1px 6px;color:var(--grey-dark);margin-left:4px;}
  .rs-row a.fn-btn{text-decoration:none;display:inline-block;}
  .rs-more{margin-top:12px;} .rs-more summary{cursor:pointer;font-size:13px;font-weight:700;color:var(--grey-dark);}
  .rs-foot{margin-top:10px;}
  `;
  document.head.appendChild(css);
})();
