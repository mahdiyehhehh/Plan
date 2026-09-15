/* ===================== 7 Day Plan — app.js ===================== */

const STORAGE_KEY = "sevenDayPlan.v1";
const DAY_KEYS = ["mon","tue","wed","thu","fri","sat","sun"];
const DAY_LABELS = {mon:"Monday",tue:"Tuesday",wed:"Wednesday",thu:"Thursday",fri:"Friday",sat:"Saturday",sun:"Sunday"};
const GERMAN_GOAL = 64;

/* ---------- icons (stroke/fill = currentColor) ---------- */
const ICONS = {
  german:  `<svg viewBox="0 0 24 24" width="12" height="12"><path d="M4 4h13l3 4-3 4H4V4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 12v8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  classes: `<svg viewBox="0 0 24 24" width="12" height="12"><path d="M12 3L1 8l11 5 9-4.1V16h2V8L12 3z" fill="currentColor"/><path d="M5 10.5V16c0 1.7 3.1 4 7 4s7-2.3 7-4v-5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  money:   `<svg viewBox="0 0 24 24" width="12" height="12"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v10M9.5 9.3c0-1.3 1.1-2 2.5-2s2.5.8 2.5 2-1 1.7-2.5 2-2.5.7-2.5 2 1.1 2 2.5 2 2.5-.7 2.5-2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  job:     `<svg viewBox="0 0 24 24" width="12" height="12"><rect x="3" y="8" width="18" height="12" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 13h18" stroke="currentColor" stroke-width="1.8"/></svg>`,
  project: `<svg viewBox="0 0 24 24" width="12" height="12"><rect x="3" y="4" width="18" height="12" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M1 20h22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  cert:    `<svg viewBox="0 0 24 24" width="12" height="12"><path d="M4 20V6a1 1 0 011-1h9l5 5v10a1 1 0 01-1 1H5a1 1 0 01-1-1z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M7 12h8M7 15.5h8M7 8.5h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`
};

const emptyDay = () => ({
  germanVideos:"", germanNotes:"",
  classesDone:false, classesNotes:"",
  money:"", moneyNotes:"",
  jobHours:"", jobNotes:"",
  projectStatus:"", projectUsers:"", projectNotes:"",
  certVideos:"", certNotes:""
});

const emptyWeek = () => ({
  days:{mon:emptyDay(),tue:emptyDay(),wed:emptyDay(),thu:emptyDay(),fri:emptyDay(),sat:emptyDay(),sun:emptyDay()},
  priorities:["","",""],
  notes:"",
  reflectGood:"",
  reflectBetter:"",
  germanLevel:"",
  projectName:"",
  favorite:false
});

/* ---------- storage ---------- */
function loadData(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return {weeks:{}};
    const parsed = JSON.parse(raw);
    if(!parsed.weeks) parsed.weeks = {};
    return parsed;
  }catch(e){
    console.error("Could not read saved data, starting fresh.", e);
    return {weeks:{}};
  }
}
function saveData(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
let state = loadData();

/* ---------- date helpers ---------- */
function toISO(d){
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,"0"), day=String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function mondayOf(date){
  const d = new Date(date);
  const dow = d.getDay(); // 0 Sun .. 6 Sat
  const diff = (dow === 0 ? -6 : 1) - dow;
  d.setDate(d.getDate()+diff);
  d.setHours(0,0,0,0);
  return d;
}
function addDays(date,n){ const d=new Date(date); d.setDate(d.getDate()+n); return d; }
function fmtShort(d){ return d.toLocaleDateString(undefined,{month:"short",day:"numeric"}); }
function fmtLong(d){ return d.toLocaleDateString(undefined,{month:"long",day:"numeric",year:"numeric"}); }

let currentMonday = mondayOf(new Date());
let currentMonthCursor = new Date(); currentMonthCursor.setDate(1);
let currentYearCursor = new Date().getFullYear();

function getWeek(mondayISO){
  if(!state.weeks[mondayISO]) state.weeks[mondayISO] = emptyWeek();
  const w = state.weeks[mondayISO];
  if(w.germanLevel===undefined) w.germanLevel="";
  if(w.projectName===undefined) w.projectName="";
  if(w.favorite===undefined) w.favorite=false;
  return w;
}

function num(v){ const n = parseFloat(v); return isNaN(n) ? 0 : n; }
function esc(v){
  if(v===undefined||v===null) return "";
  return String(v).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
}

/* ---- Forvo pronunciation links: every German word (and now every number)
   inside an example or phrase sentence becomes a link straight to that
   word's Forvo page, so tapping "ich" or "bin" opens forvo.com/word/ich/
   or /word/bin/, and tapping "22" opens the page for "zweiundzwanzig". ---- */
function forvoLink(word){
  return `https://forvo.com/word/${encodeURIComponent(word.toLowerCase())}/#de`;
}
const GERMAN_ONES = ["null","eins","zwei","drei","vier","fünf","sechs","sieben","acht","neun","zehn","elf","zwölf","dreizehn","vierzehn","fünfzehn","sechzehn","siebzehn","achtzehn","neunzehn"];
const GERMAN_TENS = {2:"zwanzig",3:"dreißig",4:"vierzig",5:"fünfzig",6:"sechzig",7:"siebzig",8:"achtzig",9:"neunzig"};
function germanBelowHundred(n){
  if(n<20) return GERMAN_ONES[n];
  const t = Math.floor(n/10), r = n%10;
  if(r===0) return GERMAN_TENS[t];
  return (r===1?"ein":GERMAN_ONES[r]) + "und" + GERMAN_TENS[t];
}
function germanBelowThousand(n){
  if(n<100) return germanBelowHundred(n);
  const h = Math.floor(n/100), r = n%100;
  const hPart = (h===1?"":GERMAN_ONES[h]) + "hundert";
  return r===0 ? hPart : hPart + germanBelowHundred(r);
}
function germanNumberWord(n){
  if(n===0) return "null";
  if(n<1000) return germanBelowThousand(n);
  const th = Math.floor(n/1000), r = n%1000;
  const thPart = (th===1?"":germanBelowThousand(th)) + "tausend";
  return r===0 ? thPart : thPart + germanBelowThousand(r);
}
function forvoWords(text){
  if(!text) return "";
  return String(text).split(/([A-Za-zÄÖÜäöüß]+|\d+)/).map(part=>{
    if(/^[A-Za-zÄÖÜäöüß]+$/.test(part)){
      return `<a class="fv-word" href="${forvoLink(part)}" target="_blank" rel="noopener noreferrer" title="Hear &quot;${esc(part)}&quot; on Forvo">${esc(part)}</a>`;
    }
    if(/^\d+$/.test(part)){
      // Numbers like "0153" (phone digits) are spoken digit-by-digit in
      // German, so link each digit on its own. Plain numbers like "22"
      // are spoken as one word, so link the whole thing at once.
      if(part.length>1 && part[0]==="0"){
        return part.split("").map(d=>{
          const w = GERMAN_ONES[+d];
          return `<a class="fv-word" href="${forvoLink(w)}" target="_blank" rel="noopener noreferrer" title="Hear &quot;${w}&quot; on Forvo">${d}</a>`;
        }).join("");
      }
      const n = parseInt(part,10);
      if(n>999999) return esc(part);
      const w = germanNumberWord(n);
      return `<a class="fv-word" href="${forvoLink(w)}" target="_blank" rel="noopener noreferrer" title="Hear &quot;${w}&quot; (${esc(part)}) on Forvo">${esc(part)}</a>`;
    }
    return esc(part);
  }).join("");
}

/* ---------- category definitions ---------- */
const CATEGORIES = [
  {
    id:"german", label:"German Learning", icon:ICONS.german,
    labelExtra:(week)=>{
      const total = DAY_KEYS.reduce((s,dk)=>s+num(week.days[dk].germanVideos),0);
      return `
        <div class="label-field">
          <label>Level</label>
          <input type="text" data-weekfield="germanLevel" value="${esc(week.germanLevel)}" placeholder="e.g. A1">
        </div>
        <span class="sub">Watched <strong id="germanTotal">${total}/${GERMAN_GOAL}</strong></span>`;
    },
    cell:(d)=>`
      <div class="cell-field">
        <div class="cell-inline">
          <input type="number" min="0" data-field="germanVideos" value="${esc(d.germanVideos)}" placeholder="0">
          <span class="suffix">/${GERMAN_GOAL}</span>
        </div>
        <textarea data-field="germanNotes" placeholder="Notes">${esc(d.germanNotes)}</textarea>
      </div>`
  },
  {
    id:"classes", label:"University Classes", icon:ICONS.classes,
    cell:(d)=>`
      <div class="cell-field">
        <div class="cell-inline">
          <input type="checkbox" data-field="classesDone" ${d.classesDone?"checked":""}>
          <span class="suffix">Attended</span>
        </div>
        <textarea data-field="classesNotes" placeholder="Notes">${esc(d.classesNotes)}</textarea>
      </div>`
  },
  {
    id:"money", label:"Amount of Money Saved", icon:ICONS.money,
    cell:(d)=>`
      <div class="cell-field">
        <div class="cell-inline">
          <span class="suffix">$</span>
          <input type="number" min="0" step="0.01" data-field="money" value="${esc(d.money)}" placeholder="0">
        </div>
        <textarea data-field="moneyNotes" placeholder="Notes">${esc(d.moneyNotes)}</textarea>
      </div>`
  },
  {
    id:"job", label:"Job", icon:ICONS.job,
    labelExtra:()=>`<span class="sub">Hours worked</span>`,
    cell:(d)=>`
      <div class="cell-field">
        <div class="cell-inline">
          <input type="number" min="0" step="0.5" data-field="jobHours" value="${esc(d.jobHours)}" placeholder="0">
          <span class="suffix">hrs</span>
        </div>
        <textarea data-field="jobNotes" placeholder="Notes">${esc(d.jobNotes)}</textarea>
      </div>`
  },
  {
    id:"project", label:"Project", icon:ICONS.project,
    labelExtra:(week)=>`
      <div class="label-field">
        <label>Name</label>
        <input type="text" data-weekfield="projectName" value="${esc(week.projectName)}" placeholder="Project name">
      </div>`,
    cell:(d)=>`
      <div class="cell-field">
        <input type="text" data-field="projectStatus" value="${esc(d.projectStatus)}" placeholder="Status">
        <input type="text" data-field="projectUsers" value="${esc(d.projectUsers)}" placeholder="Users">
        <textarea data-field="projectNotes" placeholder="Notes">${esc(d.projectNotes)}</textarea>
      </div>`
  },
  {
    id:"cert", label:"Accounting Certificate", icon:ICONS.cert,
    labelExtra:(week)=>{
      const total = DAY_KEYS.reduce((s,dk)=>s+num(week.days[dk].certVideos),0);
      return `<span class="sub">Watched <strong id="certTotal">${total}</strong> videos</span>`;
    },
    cell:(d)=>`
      <div class="cell-field">
        <div class="cell-inline">
          <input type="number" min="0" data-field="certVideos" value="${esc(d.certVideos)}" placeholder="0">
          <span class="suffix">videos</span>
        </div>
        <textarea data-field="certNotes" placeholder="Notes">${esc(d.certNotes)}</textarea>
      </div>`
  }
];

/* ---------- render: week view (single-page grid sheet) ---------- */
function renderWeekView(){
  const mondayISO = toISO(currentMonday);
  const week = getWeek(mondayISO);
  const sunday = addDays(currentMonday,6);
  document.getElementById("weekRange").textContent = `${fmtShort(currentMonday)} – ${fmtLong(sunday)}`;

  const favBtn = document.getElementById("favWeek");
  favBtn.setAttribute("aria-pressed", week.favorite ? "true" : "false");
  favBtn.onclick = ()=>{ week.favorite = !week.favorite; saveData(); renderWeekView(); };

  const grid = document.getElementById("sheetGrid");
  let html = `<div class="head-cell corner"></div>` +
    DAY_KEYS.map(dk=>`<div class="head-cell">${DAY_LABELS[dk]}</div>`).join("");

  CATEGORIES.forEach(cat=>{
    const extra = cat.labelExtra ? cat.labelExtra(week) : "";
    html += `<div class="row-label">
        <div class="row-label-inner">
          <span class="row-icon">${cat.icon}</span>
          <span class="row-label-title">${cat.label}</span>
        </div>
        ${extra}
      </div>`;
    html += DAY_KEYS.map(dk=>`<div class="day-cell" data-day="${dk}" data-day-label="${DAY_LABELS[dk]}" data-cat="${cat.id}">${cat.cell(week.days[dk])}</div>`).join("");
  });

  grid.innerHTML = html;

  // bind per-day inputs
  grid.querySelectorAll("[data-field]").forEach(el=>{
    const handler = ()=>{
      const cell = el.closest("[data-day]");
      const dk = cell.dataset.day;
      const field = el.dataset.field;
      const val = el.type==="checkbox" ? el.checked : el.value;
      week.days[dk][field] = val;
      saveData();
      if(field==="germanVideos"){
        const t = document.getElementById("germanTotal");
        if(t) t.textContent = `${DAY_KEYS.reduce((s,k)=>s+num(week.days[k].germanVideos),0)}/${GERMAN_GOAL}`;
      }
      if(field==="certVideos"){
        const t = document.getElementById("certTotal");
        if(t) t.textContent = DAY_KEYS.reduce((s,k)=>s+num(week.days[k].certVideos),0);
      }
    };
    el.addEventListener(el.tagName==="TEXTAREA"||el.type==="text"||el.type==="number" ? "input" : "change", handler);
  });

  // bind week-level fields (row label column)
  grid.querySelectorAll("[data-weekfield]").forEach(el=>{
    el.addEventListener("input", ()=>{
      week[el.dataset.weekfield] = el.value;
      saveData();
    });
  });

  // priorities / notes / reflection
  document.querySelectorAll("[data-priority]").forEach(inp=>{
    inp.value = week.priorities[inp.dataset.priority] || "";
    inp.oninput = ()=>{ week.priorities[inp.dataset.priority] = inp.value; saveData(); };
  });
  const notesEl = document.getElementById("weekNotes");
  notesEl.value = week.notes || "";
  notesEl.oninput = ()=>{ week.notes = notesEl.value; saveData(); };

  const goodEl = document.getElementById("reflectGood");
  goodEl.value = week.reflectGood || "";
  goodEl.oninput = ()=>{ week.reflectGood = goodEl.value; saveData(); };

  const betterEl = document.getElementById("reflectBetter");
  betterEl.value = week.reflectBetter || "";
  betterEl.oninput = ()=>{ week.reflectBetter = betterEl.value; saveData(); };

  fitPlanner();
}

/* ---------- fit-to-screen: scale the whole sheet so it always shows
   in full, with no page scrolling, like a printable planner sheet.
   Generalized to handle all three "single sheet" views (week, month,
   year) — previously this only ever fit the week view; month and year
   used the exact same fixed-1120px markup but nothing ever scaled them
   down, so on a phone they rendered at full desktop width and required
   horizontal scrolling to see the rest of the sheet. ---------- */
const STAGE_MAP = {
  week:  {stageId:"plannerStage", canvasId:"plannerCanvas", viewId:"weekView"},
  month: {stageId:"monthStage",   canvasId:"monthCanvas",   viewId:"monthView"},
  year:  {stageId:"yearStage",    canvasId:"yearCanvas",    viewId:"yearView"}
};
let fitRaf = null;
function fitStage(key){
  const map = STAGE_MAP[key];
  if(!map) return;
  const stage = document.getElementById(map.stageId);
  const canvas = document.getElementById(map.canvasId);
  const view = document.getElementById(map.viewId);
  if(!stage || !canvas || !view) return;
  if(view.classList.contains("hidden")) return;

  canvas.style.transform = "scale(1)";
  const stageW = stage.clientWidth;
  const stageH = stage.clientHeight;
  const naturalW = canvas.offsetWidth;
  const naturalH = canvas.offsetHeight;
  if(!stageW || !stageH || !naturalW || !naturalH) return;

  const scale = Math.min(stageW/naturalW, stageH/naturalH, 1.4);
  canvas.style.transform = `scale(${scale})`;
}
function fitActiveStage(){
  if(fitRaf) cancelAnimationFrame(fitRaf);
  fitRaf = requestAnimationFrame(()=>{
    Object.keys(STAGE_MAP).forEach(fitStage);
  });
}
/* kept for backwards compatibility with any other callers */
function fitPlanner(){ fitActiveStage(); }

function debounce(fn,ms){
  let t;
  return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args),ms); };
}
const debouncedFit = debounce(fitActiveStage,80);
window.addEventListener("resize", debouncedFit);
window.addEventListener("orientationchange", debouncedFit);
if(document.fonts && document.fonts.ready){
  document.fonts.ready.then(fitActiveStage);
}
if(window.ResizeObserver){
  const ro = new ResizeObserver(debouncedFit);
  window.addEventListener("DOMContentLoaded", ()=>{
    ["plannerStage","monthStage","yearStage"].forEach(id=>{
      const stage = document.getElementById(id);
      if(stage) ro.observe(stage);
    });
  });
}

/* ---------- aggregation helpers ---------- */
function aggregateWeek(week){
  let g=0,c=0,m=0,j=0,cv=0;
  DAY_KEYS.forEach(dk=>{
    const d = week.days[dk];
    g += num(d.germanVideos);
    if(d.classesDone) c += 1;
    m += num(d.money);
    j += num(d.jobHours);
    cv += num(d.certVideos);
  });
  return {germanVideos:g, classes:c, money:m, jobHours:j, certVideos:cv};
}

function weeksOverlappingRange(startDate,endDate){
  const out = [];
  Object.keys(state.weeks).forEach(mondayISO=>{
    const monday = new Date(mondayISO+"T00:00:00");
    const sunday = addDays(monday,6);
    if(sunday >= startDate && monday <= endDate){
      out.push({mondayISO, monday, week:state.weeks[mondayISO]});
    }
  });
  out.sort((a,b)=>a.monday-b.monday);
  return out;
}

function statCard(num_,label,accent){
  return `<div class="stat-card ${accent?"accent":""}"><div class="num">${num_}</div><div class="lbl">${label}</div></div>`;
}

/* ---------- render: month view ---------- */
function renderMonthView(){
  const y = currentMonthCursor.getFullYear(), m = currentMonthCursor.getMonth();
  const start = new Date(y,m,1);
  const end = new Date(y,m+1,0,23,59,59);
  document.getElementById("monthRange").textContent = start.toLocaleDateString(undefined,{month:"long",year:"numeric"});

  const rows = weeksOverlappingRange(start,end);
  let totals = {germanVideos:0,classes:0,money:0,jobHours:0,certVideos:0};
  const tbody = document.getElementById("monthTableBody");
  tbody.innerHTML = "";
  if(rows.length===0){
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--grey);padding:22px;">No entries logged this month yet.</td></tr>`;
  }
  rows.forEach(r=>{
    const a = aggregateWeek(r.week);
    Object.keys(totals).forEach(k=> totals[k]+=a[k]);
    const sunday = addDays(r.monday,6);
    tbody.innerHTML += `<tr>
      <td data-label="Week of">${fmtShort(r.monday)} – ${fmtShort(sunday)}</td>
      <td data-label="German videos">${a.germanVideos}</td>
      <td data-label="Classes attended">${a.classes} / 7</td>
      <td data-label="Money saved">$${a.money.toFixed(2)}</td>
      <td data-label="Job hours">${a.jobHours}</td>
      <td data-label="Certificate videos">${a.certVideos}</td>
    </tr>`;
  });

  document.getElementById("monthStats").innerHTML = [
    statCard(totals.germanVideos,"German videos this month",true),
    statCard(totals.classes,"Classes attended"),
    statCard(`$${totals.money.toFixed(2)}`,"Money saved"),
    statCard(totals.jobHours,"Hours worked"),
    statCard(totals.certVideos,"Certificate videos"),
  ].join("");

  fitActiveStage();
}

/* ---------- render: year view ---------- */
function renderYearView(){
  document.getElementById("yearRange").textContent = currentYearCursor;
  const tbody = document.getElementById("yearTableBody");
  tbody.innerHTML = "";
  let yearTotals = {germanVideos:0,classes:0,money:0,jobHours:0,certVideos:0};

  for(let m=0;m<12;m++){
    const start = new Date(currentYearCursor,m,1);
    const end = new Date(currentYearCursor,m+1,0,23,59,59);
    const rows = weeksOverlappingRange(start,end);
    let totals = {germanVideos:0,classes:0,money:0,jobHours:0,certVideos:0};
    rows.forEach(r=>{
      const a = aggregateWeek(r.week);
      Object.keys(totals).forEach(k=> totals[k]+=a[k]);
    });
    Object.keys(yearTotals).forEach(k=> yearTotals[k]+=totals[k]);
    const monthName = start.toLocaleDateString(undefined,{month:"long"});
    tbody.innerHTML += `<tr>
      <td data-label="Month">${monthName}</td>
      <td data-label="German videos">${totals.germanVideos}</td>
      <td data-label="Classes attended">${totals.classes}</td>
      <td data-label="Money saved">$${totals.money.toFixed(2)}</td>
      <td data-label="Job hours">${totals.jobHours}</td>
      <td data-label="Certificate videos">${totals.certVideos}</td>
    </tr>`;
  }

  document.getElementById("yearStats").innerHTML = [
    statCard(yearTotals.germanVideos,"German videos this year",true),
    statCard(yearTotals.classes,"Classes attended"),
    statCard(`$${yearTotals.money.toFixed(2)}`,"Money saved"),
    statCard(yearTotals.jobHours,"Hours worked"),
    statCard(yearTotals.certVideos,"Certificate videos"),
  ].join("");

  fitActiveStage();
}

/* ===================== German A1 → B1 hub ===================== */

function ensureGerman(){
  if(!state.german) state.german = {};
  if(!state.german.days) state.german.days = {};
  if(!state.german.tests) state.german.tests = {};
  if(!state.german.mockExams) state.german.mockExams = [];
  if(!state.german.currentDay) state.german.currentDay = 1;
  germanCurrentDay = state.german.currentDay;
}
let germanCurrentDay = 1;
let germanOpenTest = null;

function lessonCountForDay(day){
  const d = GERMAN_DAYS[day-1];
  if(!d) return 0; // phase not authored yet
  return (d.lessons && d.lessons.length) || 1;
}
function getDayRecord(day){
  let rec = state.german.days[day];
  if(!rec){
    rec = {lessons:[]};
    state.german.days[day] = rec;
  }
  // migrate legacy single-lesson save shape ({answer,notes,done}) into lessons[0]
  if(!rec.lessons){
    rec = {lessons:[{answer:rec.answer||"", notes:rec.notes||"", done:!!rec.done}]};
    state.german.days[day] = rec;
  }
  const count = lessonCountForDay(day);
  while(rec.lessons.length < count) rec.lessons.push({answer:"", notes:"", done:false});
  if(rec.writing===undefined) rec.writing = "";
  if(rec.listeningDone===undefined) rec.listeningDone = false;
  if(rec.listeningNotes===undefined) rec.listeningNotes = "";
  if(rec.speakingDone===undefined) rec.speakingDone = false;
  if(rec.speakingNotes===undefined) rec.speakingNotes = "";
  return rec;
}
function dayIsDone(day){
  const rec = getDayRecord(day);
  return rec.lessons.length>0 && rec.lessons.every(l=>l.done);
}
function getTestRecord(id){
  if(!state.german.tests[id]) state.german.tests[id] = {done:false, dateTaken:"", review:"", userAnswers:{}, submitted:false, score:null};
  const r = state.german.tests[id];
  if(!r.userAnswers) r.userAnswers = {};
  return r;
}

/* ---- 30-day A1 curriculum. Each day has 1–2 lessons, so every grammar
   point and vocab set a full A1 exam needs is covered by Day 30. ---- */
function L(topic,homework,example,natural){ return {topic,homework,example,natural}; }
const GERMAN_DAYS = [
  {lessons:[ // Day 1
    L("Greetings & Introductions","Write 5 sentences introducing yourself: your name, nationality, age, city, and a language you speak.","Ich heiße Lisa. Ich bin 22 Jahre alt. Ich komme aus Italien und ich spreche Italienisch und ein bisschen Deutsch.","Ich bin Lisa, 22. Komm' aus Italien und spreche Italienisch und n bisschen Deutsch. Und du, wie heißt du?"),
    L("Formal vs. Informal: du vs. Sie","Write the same self-introduction twice: once informally to a friend (du), once formally to a stranger (Sie).","Guten Tag, mein Name ist Frau Keller. Wie ist Ihr Name?","Hey, ich bin Lisa. Und du, wie heißt du?")
  ]},
  {lessons:[ // Day 2
    L("Numbers 0–20","Write the numbers 0–20 in German, then write out 5 simple addition sums in words.","eins, zwei, drei ... zehn. Drei plus vier ist sieben.","Drei und vier macht sieben. — Warte, wie viel war das nochmal?"),
    L("Phone Numbers & Basic Math","Write your phone number out digit by digit in German, then write 3 subtraction sums in words.","Meine Nummer ist null-eins-fünf-drei... Zehn minus drei ist sieben.","Meine Nummer ist 0153... — Wart, sag's nochmal langsamer.")
  ]},
  {lessons:[ // Day 3
    L("The Alphabet & Spelling","Spell your first and last name out loud using the German alphabet, then write it letter by letter.","M-A-R-I-A = Em – A – Er – I – A.","Buchstabier das nochmal, ich hab's nicht ganz verstanden."),
    L("Survival Classroom Phrases","Write 5 phrases you'd use if you don't understand something in a conversation.","Wie bitte? Können Sie das bitte wiederholen? Ich verstehe nicht.","Wie bitte? Kannst du das nochmal sagen? Ich check's grad nicht.")
  ]},
  {lessons:[ // Day 4
    L("Personal Pronouns & \"sein\"","Conjugate the verb \"sein\" (to be) for all pronouns, then write 3 sentences using it.","ich bin, du bist, er/sie/es ist, wir sind, ihr seid, sie sind. Ich bin müde.","Ich bin echt müde heute. Bist du auch so kaputt?"),
    L("Basic Adjectives with sein","Write 6 sentences describing people or things using sein + an adjective (groß, klein, glücklich, müde, nett...).","Er ist groß. Sie ist sehr nett. Das Wetter ist schlecht.","Er ist echt groß, oder? Und sie ist total nett.")
  ]},
  {lessons:[ // Day 5
    L("Family Members","List your family tree and label each person in German (Mutter, Vater, Bruder, Schwester...).","Das ist meine Mutter. Sie heißt Anna. Das ist mein Bruder. Er heißt Tom.","Das ist meine Mama, und das da ist mein kleiner Bruder.")
  ]},
  {lessons:[ // Day 6
    L("Articles: der / die / das","Sort 10 household nouns into der / die / das using a dictionary or app.","der Tisch, die Lampe, das Buch, der Stuhl, die Tür.","Kannst du mir mal das Buch da geben? Genau, das auf'm Tisch."),
    L("Possessive Articles (mein/dein/sein/ihr)","Rewrite 6 sentences from Day 5 using possessive articles instead of der/die/das (mein Vater, meine Schwester...).","Das ist mein Vater. Das ist meine Schwester. Das ist unser Haus.","Das ist mein Dad, und das da meine Schwester.")
  ]},
  {lessons:[ // Day 7
    L("Present Tense — Regular Verbs","Fully conjugate 3 regular verbs: spielen, wohnen, lernen.","ich spiele, du spielst, er spielt, wir spielen, ihr spielt, sie spielen.","Ich lern grad Deutsch, deshalb spiel ich abends immer diese Vokabel-App."),
    L("Frequency Adverbs","Write 6 sentences about how often you do things, using immer, oft, manchmal, selten, nie.","Ich lerne jeden Tag Deutsch. Ich gehe selten ins Kino.","Ich lern eigentlich jeden Tag n bisschen, aber ins Kino geh ich selten.")
  ]},
  {lessons:[ // Day 8
    L("Numbers 20–100 & Age","Write your age and the ages of 5 family members in full German words.","Meine Schwester ist einundzwanzig Jahre alt. Mein Vater ist neunundfünfzig Jahre alt.","Meine Schwester ist einundzwanzig, glaub ich — oder ist sie schon zweiundzwanzig?"),
    L("Ordinal Numbers & Dates","Write today's date and 3 important dates using ordinal numbers (der Erste, der Zweite...).","Heute ist der fünfzehnte September. Mein Geburtstag ist der dritte Mai.","Heut ist der Fünfzehnte, glaub ich — und mein Geburtstag ist am dritten Mai.")
  ]},
  {lessons:[ // Day 9
    L("Telling Time","Write your daily schedule using 5 clock times in German (\"Es ist ... Uhr\").","Es ist halb neun. Ich frühstücke. Es ist Viertel nach zwölf. Ich esse zu Mittag.","Es ist halb neun, wir müssen los! — Wie spät ist es? — Kurz nach halb."),
    L("Asking About Time & Schedules","Write a short dialogue (4 lines) asking someone what time a train, meeting, or movie starts.","Wann beginnt der Film? — Um neunzehn Uhr.","Wann geht der Film los? — Um sieben, glaub ich.")
  ]},
  {lessons:[ // Day 10
    L("Days, Months, Seasons","List the 7 days and 12 months in German, then write which season you like best and why.","Mein Lieblingsmonat ist Juli, im Sommer, weil es warm ist.","Ich mag den Sommer am liebsten, im Juli ist's einfach am schönsten.")
  ]},
  {lessons:[ // Day 11
    L("Daily Routine (Separable Verbs)","Write 8 sentences describing your typical day using separable verbs (aufstehen, anziehen, fernsehen...).","Ich stehe um sieben Uhr auf. Ich ziehe mich an. Abends sehe ich fern.","Ich steh um sieben auf, zieh mich schnell an, und abends häng ich vorm Fernseher."),
    L("More Separable Verbs","Write 5 more sentences about your week using einkaufen, anrufen, aufräumen, einschlafen.","Ich kaufe samstags ein. Ich rufe meine Mutter an.","Ich kauf immer samstags ein, und ruf danach meine Mama an.")
  ]},
  {lessons:[ // Day 12
    L("Food & Drink Vocabulary","Write a shopping list of 10 foods with their articles, plus one sentence about your favorite meal.","der Reis, die Milch, das Brot. Ich esse gern Nudeln mit Tomatensoße.","Ich hab total Bock auf Nudeln mit Tomatensoße heute Abend."),
    L("Asking for Quantities at the Market","Write a short dialogue buying groceries, asking for specific amounts (ein Kilo, ein Liter, ein Stück).","Ich hätte gern ein Kilo Äpfel und einen Liter Milch.","Ich brauch noch n Kilo Äpfel und n bisschen Milch.")
  ]},
  {lessons:[ // Day 13
    L("At the Restaurant","Write a short dialogue (at least 6 lines) ordering food at a restaurant.","Guten Tag! Ich möchte bitte einen Kaffee und ein Stück Kuchen. — Gerne, sonst noch etwas?","Für mich bitte 'nen Kaffee und n Stück Kuchen. — Kommt sofort! — Super, danke.")
  ]},
  {lessons:[ // Day 14
    L("Akkusativ Case","Rewrite 8 sentences putting the direct object into the Akkusativ (den / einen / eine / ein).","Ich sehe den Mann. Ich kaufe einen Apfel. Ich habe eine Katze.","Ich hol mir noch schnell nen Apfel, ich hab nämlich voll Hunger."),
    L("Dativ Case Basics","Write 6 sentences using dative pronouns (mir, dir, ihm, ihr, uns) — e.g. \"Das gefällt mir.\"","Das Buch gehört mir. Er hilft ihr. Das gefällt mir sehr.","Das gefällt mir echt gut, ehrlich.")
  ]},
  {lessons:[ // Day 15
    L("Shopping & Clothes","Describe an outfit you're wearing today using at least 6 clothing words and colors.","Ich trage eine blaue Jacke, ein weißes T-Shirt und schwarze Schuhe.","Ich hab heute meine blaue Jacke an und die schwarzen Schuhe von letzter Woche."),
    L("Colors, Sizes & Prices","Write a short shopping dialogue asking about the size and price of a piece of clothing.","Haben Sie das in Größe M? Was kostet das?","Habt ihr das noch in M? Und was kostet's?")
  ]},
  {lessons:[ // Day 16
    L("Modal Verbs: können, müssen, wollen","Write 6 sentences (two per verb) about things you can, must, and want to do.","Ich muss heute lernen. Ich will Deutsch sprechen. Ich kann gut kochen.","Ich muss heut echt noch lernen, aber ich hab eigentlich keinen Bock.")
  ]},
  {lessons:[ // Day 17
    L("The Weather","Describe the weather for each day of this week in German.","Heute ist es sonnig und warm. Morgen regnet es und es ist windig.","Heute ist's richtig schön warm, aber morgen soll's angeblich wieder regnen."),
    L("Talking About Weather Naturally","Write a short weather small-talk dialogue (4–5 lines) as you'd have with a neighbor.","Schönes Wetter heute, nicht wahr? — Ja, endlich mal Sonne!","Endlich mal schönes Wetter, oder? — Ja, wurde auch Zeit!")
  ]},
  {lessons:[ // Day 18
    L("Directions & Prepositions","Write directions from your home to the nearest supermarket using links, rechts, geradeaus.","Gehen Sie geradeaus, dann links. Der Supermarkt ist neben der Bank.","Einfach geradeaus, dann links, das ist gleich neben der Bank — nicht zu verfehlen."),
    L("Understanding Directions Given to You","Write directions someone might give you, then repeat them back in your own words to check you understood.","Gehen Sie zuerst rechts, dann die zweite Straße links.","Erst rechts, dann die zweite links — hab ich's richtig verstanden?")
  ]},
  {lessons:[ // Day 19
    L("Places in the City","List 10 places in a city with their articles and one sentence for each about what you do there.","In der Bibliothek lese ich Bücher. Im Park spiele ich Fußball.","Wir treffen uns im Park, ja? Da spielen wir immer Fußball.")
  ]},
  {lessons:[ // Day 20
    L("Past Tense — Perfekt (basics)","Write 6 sentences about yesterday using the Perfekt tense with haben or sein.","Ich habe gestern Deutsch gelernt. Ich bin ins Kino gegangen.","Ich hab gestern noch Deutsch gelernt und bin dann ins Kino gegangen."),
    L("Perfekt: haben vs. sein Verbs","Sort 8 verbs into \"takes haben\" or \"takes sein\" in the Perfekt, then write one sentence with each group.","Ich habe gegessen (haben). Ich bin gefahren (sein).","Ich hab gestern echt viel gegessen, und bin dann früh ins Bett.")
  ]},
  {lessons:[ // Day 21
    L("Hobbies & Free Time","Write a paragraph (5–6 sentences) about your hobbies and how often you do them.","Ich spiele gern Fußball. Ich mache das zweimal pro Woche. Ich lese auch gern.","Ich zock gern und spiel zweimal die Woche Fußball, sonst chill ich meistens.")
  ]},
  {lessons:[ // Day 22
    L("Making Plans & Invitations","Write a short dialogue inviting a friend to do something this weekend.","Hast du am Samstag Zeit? — Ja, warum? — Wollen wir ins Kino gehen?","Hast du Samstag Bock auf Kino? — Klar, bin dabei!"),
    L("On the Phone: Making Plans","Write a short phone-call dialogue (6+ lines) confirming a time and place to meet up.","Hallo, hier ist Anna. Treffen wir uns um drei? — Ja, gerne, am Bahnhof?","Hey, hier Anna! Treffen wir uns um drei? — Klar, am Bahnhof, wie immer?")
  ]},
  {lessons:[ // Day 23
    L("The Body & Health","Label 10 body parts, then write 3 sentences about how you feel today (\"Mir tut ... weh\").","der Kopf, der Arm, das Bein. Mir tut der Kopf weh. Ich bin ein bisschen krank.","Mir tut voll der Kopf weh, ich glaub ich werd krank."),
    L("Talking About Feelings & Emotions","Write 6 sentences describing how you feel in different situations (froh, traurig, nervös, aufgeregt).","Ich bin heute sehr froh. Ich war gestern ein bisschen nervös.","Ich bin heut mega gut drauf, ehrlich.")
  ]},
  {lessons:[ // Day 24
    L("At the Doctor's","Write a short dialogue at the doctor's office describing your symptoms.","Ich habe Fieber und Halsschmerzen. — Seit wann haben Sie das?","Ich hab seit gestern Fieber und mir tut voll der Hals weh.")
  ]},
  {lessons:[ // Day 25
    L("Comparisons (Adjectives)","Write 6 comparative sentences comparing things around you.","Berlin ist größer als München. Mein Bruder ist am größten in der Familie.","Berlin ist schon viel größer als München, find ich."),
    L("Superlatives","Write 5 superlative sentences about people or places you know (am größten, am besten, am schönsten).","Mein Bruder ist am größten in der Familie. Berlin ist am schönsten im Sommer.","Mein Bruder ist eindeutig der Größte von uns allen.")
  ]},
  {lessons:[ // Day 26
    L("Housing & Furniture","Describe your home or room, listing at least 8 furniture items with their articles.","In meinem Zimmer gibt es ein Bett, einen Schrank und einen Schreibtisch.","Meine Bude ist klein, aber ich hab n Bett, n Schrank und n Schreibtisch — reicht mir.")
  ]},
  {lessons:[ // Day 27
    L("Public Transport & Travel","Write a dialogue buying a train ticket and asking about departure times.","Wann fährt der nächste Zug nach Berlin? — Um 14 Uhr, Gleis 5.","Wann geht der nächste Zug nach Berlin? — Um zwei, Gleis fünf, beeil dich!"),
    L("Travel Vocabulary & Booking","Write a short dialogue booking a hotel room or asking about a travel connection.","Ich möchte ein Einzelzimmer für zwei Nächte buchen.","Ich brauch n Einzelzimmer für zwei Nächte, geht das?")
  ]},
  {lessons:[ // Day 28
    L("Negation: nicht / kein","Write 8 sentences using nicht and kein correctly.","Ich habe kein Auto. Ich trinke nicht gern Kaffee. Das ist nicht richtig.","Ich hab kein Auto, deshalb nehm ich meistens den Bus. — Echt nicht? Krass."),
    L("Connecting Ideas: weil & dass","Write 5 sentences giving reasons with weil and 5 opinions with dass (verb goes to the end).","Ich lerne Deutsch, weil ich nach Berlin ziehen möchte. Ich glaube, dass Deutsch schwer ist.","Ich lern Deutsch, weil ich unbedingt nach Berlin will.")
  ]},
  {lessons:[ // Day 29
    L("Question Words Review","Write one question for every question word (wer, was, wann, wo, warum, wie, wie viel) and answer it.","Wo wohnst du? — Ich wohne in Berlin. Warum lernst du Deutsch? — Weil ich nach Deutschland ziehe.","Wo wohnst du eigentlich? — In Berlin. — Ah cool, wieso lernst du dann Deutsch, kannst du's nicht schon?"),
    L("Giving Commands: the Imperative","Write 5 imperative sentences (informal and formal) you might use at home or work.","Mach das Fenster zu! Setzen Sie sich bitte.","Mach mal das Fenster zu, mir ist kalt.")
  ]},
  {lessons:[ // Day 30
    L("Full A1 Self-Review","Write a 10-sentence self-introduction combining everything: name, family, job/studies, hobbies, daily routine, and one sentence in the past tense.","Ich heiße ... und komme aus ... Ich bin Student und lerne seit 30 Tagen Deutsch. Gestern habe ich viel gelernt.","Ich bin ... und komm aus ... Ich studier gerade und lern jetzt seit 30 Tagen Deutsch. Gestern hab ich echt viel gelernt, war anstrengend!"),
    L("Write a Short Formal Message","Write a short formal email or postcard (6–8 sentences) introducing yourself and making a simple request — a real Goethe/telc A1 writing-task format.","Sehr geehrte Damen und Herren, mein Name ist ... Ich möchte gern einen Termin vereinbaren. Mit freundlichen Grüßen, ...","Hi, ich bin's — wollte nur kurz fragen, ob wir nen Termin ausmachen können. Danke schon mal!")
  ]}
];

/* ---- 60-day A2 curriculum (Days 31-90), being written in batches.
   Days 31-40 written so far — covers Präteritum, Perfekt review,
   Genitiv, adjective endings, reflexive verbs, subordinate/relative
   clauses, and indirect questions, with office/Ausbildung vocabulary
   woven in from Day 40 onward since that's the end goal. ---- */
const GERMAN_DAYS_A2 = [
  {lessons:[ // Day 31
    L("Präteritum: sein, haben & Modal Verbs","Rewrite 8 sentences about your childhood or last year using war, hatte, konnte, musste, wollte.","Ich war letztes Jahr in Berlin. Ich hatte keine Zeit. Ich musste viel arbeiten.","Ich war letztes Jahr in Berlin, hatte aber kaum Zeit — musste die ganze Zeit arbeiten."),
    L("When to Use Präteritum vs. Perfekt","Write 4 sentences you'd say out loud (Perfekt) and rewrite the same 4 as you'd write them in a story or email (Präteritum).","Ich habe gestern gearbeitet. → Ich arbeitete gestern viel.","Ich hab gestern echt viel gearbeitet, war stressig.")
  ]},
  {lessons:[ // Day 32
    L("Perfekt Review: Irregular Participles","Write 10 sentences about last week, using 10 different irregular past participles (gegangen, gesehen, genommen, geschrieben...).","Ich bin ins Büro gegangen. Ich habe einen Brief geschrieben. Ich habe das Formular genommen.","Ich bin heut ins Büro gegangen und hab noch schnell nen Brief geschrieben.")
  ]},
  {lessons:[ // Day 33
    L("Genitiv Case Basics","Write 6 sentences showing possession with the genitive (des Mannes, der Frau, meines Bruders).","Das Büro des Chefs ist im ersten Stock. Die Tasche meiner Kollegin ist neu.","Das ist glaub ich der Schreibtisch von unserem Chef."),
    L("Genitiv vs. \"von\" in Spoken German","Rewrite 5 genitive sentences the way Germans actually say them in speech, using von + Dativ.","Das Auto meines Vaters ist rot. → formal genitive.","Das Auto von meinem Vater ist rot. — so sagt man das eigentlich meistens.")
  ]},
  {lessons:[ // Day 34
    L("Adjective Endings after der/die/das","Write 8 sentences describing things using adjectives after definite articles (der große Tisch, die neue Kollegin).","Der neue Kollege ist sehr freundlich. Ich mag die große Küche im Büro.","Der Neue ist echt nett, hab ich gemerkt."),
    L("Adjective Endings after ein/kein/mein","Rewrite the same 8 ideas using indefinite/possessive articles instead (ein großer Tisch, meine neue Kollegin).","Das ist ein großer Tisch. Meine neue Kollegin heißt Julia.","Wir haben n großen Tisch bekommen fürs neue Büro.")
  ]},
  {lessons:[ // Day 35
    L("Adjective Endings with No Article","Write 5 sentences describing general things with no article at all (kalter Kaffee, frische Luft).","Ich trinke gern starken Kaffee. Frisches Obst ist gesund.","Ich brauch jetzt echt n starken Kaffee.")
  ]},
  {lessons:[ // Day 36
    L("Reflexive Verbs (Akkusativ)","Write 6 sentences about your daily routine using reflexive verbs (sich freuen, sich setzen, sich beeilen, sich erinnern).","Ich freue mich auf das Wochenende. Ich muss mich beeilen.","Ich freu mich schon voll aufs Wochenende, ehrlich."),
    L("Reflexive Verbs (Dativ)","Write 4 sentences using dative reflexive verbs (sich etwas vorstellen, sich die Zähne putzen).","Ich kann mir das gut vorstellen. Ich putze mir jeden Morgen die Zähne.","Kann ich mir gut vorstellen, ehrlich gesagt.")
  ]},
  {lessons:[ // Day 37
    L("Subordinate Clauses: obwohl, wenn, als","Write 6 sentences using obwohl (although), wenn (if/whenever), and als (when, single past event).","Obwohl es regnete, sind wir spazieren gegangen. Als ich jung war, wollte ich Lehrerin werden.","Wir sind trotzdem raus, obwohl's geregnet hat.")
  ]},
  {lessons:[ // Day 38
    L("Relative Clauses (Nominativ & Akkusativ)","Write 6 sentences describing people or things using der/die/das as relative pronouns.","Das ist die Kollegin, die im ersten Stock arbeitet. Der Bericht, den ich schreibe, ist fast fertig.","Das ist die Kollegin, die immer so früh kommt."),
    L("Relative Clauses (Dativ)","Write 4 sentences using dative relative pronouns (dem, der, denen).","Das ist der Kollege, dem ich geholfen habe. Die Leute, denen ich vertraue, sind wenige.","Das ist der Typ, dem ich neulich geholfen hab.")
  ]},
  {lessons:[ // Day 39
    L("Indirect Questions","Rewrite 6 direct questions as indirect ones using ob or a question word (Weißt du, ob...? / Ich weiß nicht, wann...).","Weißt du, ob das Büro heute offen ist? Ich weiß nicht, wann die Besprechung anfängt.","Weißt du zufällig, ob das Büro heut offen hat?"),
    L("Comparisons Review (A2 depth)","Write 5 sentences comparing two work situations, using je... desto (the more... the more).","Je mehr ich übe, desto besser spreche ich Deutsch.","Je mehr ich übe, umso besser wird's, ganz ehrlich.")
  ]},
  {lessons:[ // Day 40
    L("Office & Ausbildung Vocabulary I","Write 10 sentences using office vocabulary: die Rechnung, der Beleg, die Buchhaltung, der Auftrag, die Abteilung.","Ich bearbeite heute die Rechnungen. Die Buchhaltung braucht den Beleg bis Freitag.","Ich muss heut noch die Rechnungen fertig machen, sonst gibt's Stress."),
    L("A2 Checkpoint: Talking About Your Goals","Write a short paragraph (6-8 sentences) explaining why you want to do an Ausbildung in accounting, using Perfekt, Präteritum, and at least one relative clause.","Ich habe schon immer gern mit Zahlen gearbeitet. Letztes Jahr habe ich beschlossen, dass ich eine Ausbildung machen möchte, die zu mir passt.","Ich wollt schon immer irgendwas mit Zahlen machen, deshalb mach ich jetzt die Ausbildung.")
  ]},
  {lessons:[ // Day 41
    L("Futur I: werden + Infinitiv","Write 6 sentences about your plans for next year using werden (e.g. \"Ich werde eine Ausbildung machen\").","Ich werde nächstes Jahr eine Ausbildung in Buchhaltung beginnen. Ich werde jeden Tag Deutsch lernen.","Ich mach nächstes Jahr die Ausbildung, das steht schon fest."),
    L("Future: werden vs. Present Tense","Rewrite 5 of your Futur I sentences the way Germans usually say them instead — present tense + time word.","Ich werde morgen anrufen. → Ich rufe morgen an.","Ich ruf morgen einfach an, kein Ding.")
  ]},
  {lessons:[ // Day 42
    L("Passive Voice: Present Tense","Write 6 sentences describing office processes in the passive (werden + Partizip II) — e.g. \"Die Rechnung wird geprüft.\"","Die Rechnung wird von der Buchhaltung geprüft. Die Formulare werden jeden Montag verschickt.","Die Rechnung wird grad geprüft, dauert noch n bisschen."),
    L("Passive Voice: Past Tense (wurde)","Write 4 sentences about something that was done, using wurde + Partizip II.","Der Auftrag wurde gestern bearbeitet. Die E-Mail wurde schon beantwortet.","Der Auftrag wurde schon erledigt, keine Sorge.")
  ]},
  {lessons:[ // Day 43
    L("Konjunktiv II: würde + Infinitiv","Write 6 polite requests or hypothetical sentences using würde (e.g. \"Ich würde gern...\", \"Würden Sie...?\").","Ich würde gern einen Termin vereinbaren. Würden Sie mir bitte helfen?","Würdest du mir kurz helfen? Das wär echt nett."),
    L("Konjunktiv II: hätte & wäre","Write 4 sentences about how things would be different, using hätte gern or wäre.","Ich hätte gern mehr Zeit. Das wäre eine gute Lösung.","Wär schon cool, wenn ich mehr Zeit hätte, ehrlich.")
  ]},
  {lessons:[ // Day 44
    L("dass-Sätze vs. Infinitiv mit zu","Write 4 pairs of sentences: one with dass, one rephrased with um...zu or ohne...zu.","Ich lerne Deutsch, um die Ausbildung zu bekommen. Ich glaube, dass ich das schaffe.","Ich lern Deutsch, um die Ausbildung zu kriegen, ganz einfach.")
  ]},
  {lessons:[ // Day 45
    L("Doppelkonjunktionen","Write 6 sentences using sowohl...als auch, entweder...oder, and weder...noch.","Ich spreche sowohl Deutsch als auch Englisch. Ich habe weder Zeit noch Geld dafür.","Ich sprech sowohl Deutsch als auch Englisch, geht schon ganz gut.")
  ]},
  {lessons:[ // Day 46
    L("Wechselpräpositionen Review (in, an, auf)","Write 8 sentences showing the difference between location (Dativ) and movement (Akkusativ) with in, an, auf.","Ich lege den Beleg auf den Tisch. Der Beleg liegt auf dem Tisch.","Ich leg den Beleg einfach auf'n Tisch, findest du dann.")
  ]},
  {lessons:[ // Day 47
    L("Telefonate im Büro","Write a formal business phone call (8+ lines): answering, stating your name/company, asking how you can help.","Guten Tag, hier ist [Name] von der Firma Müller. Wie kann ich Ihnen helfen?","Hallo, hier [Name] von Müller — wie kann ich helfen?"),
    L("Formelle E-Mails schreiben","Write a formal business email (6-8 sentences) requesting information or confirming an appointment, with proper Anrede and Grußformel.","Sehr geehrte Frau Schmidt, ich schreibe Ihnen bezüglich... Mit freundlichen Grüßen","Hi Frau Schmidt, kurze Frage wegen...")
  ]},
  {lessons:[ // Day 48
    L("Rechnungen & Zahlen im Detail","Write 6 sentences with invoice details: amounts, due dates, invoice numbers, spelled out in German.","Die Rechnungsnummer ist 4521. Der Betrag beträgt 350 Euro und ist bis zum 15. Mai fällig.","Die Rechnung ist über 350 Euro und muss bis zum 15. bezahlt werden.")
  ]},
  {lessons:[ // Day 49
    L("Höflich reklamieren","Write a polite complaint (6+ lines) about a mistake or delay, using Konjunktiv II to stay formal.","Es wäre schön, wenn Sie das so schnell wie möglich korrigieren könnten. Das wäre sehr hilfreich.","Wär echt nett, wenn ihr das schnell fixen könntet.")
  ]},
  {lessons:[ // Day 50
    L("A2 Checkpoint: Bewerbungsgespräch","Write out full answers (2-3 sentences each) to 4 common interview questions: Warum diese Ausbildung? Was sind Ihre Stärken? Warum sollten wir Sie nehmen? Haben Sie Fragen?","Ich möchte diese Ausbildung machen, weil ich gerne mit Zahlen arbeite und sehr organisiert bin. Meine größte Stärke ist meine Sorgfalt.","Ich mach die Ausbildung gern, weil ich echt gut mit Zahlen bin und immer organisiert."),
    L("A2 Grammar Review","Pick 5 grammar points from Days 31-49 that felt hardest and write one fresh example sentence for each, from memory.","Review sentence using your weakest point, written without looking at the answer key.","Same, but how you'd actually say it out loud.")
  ]}
];
GERMAN_DAYS.push(...GERMAN_DAYS_A2);

/* ---- Full plan: A1 -> A2 -> B1, sized for a 6-7 month timeline at
   ~2.5 hrs/day (roughly matches Goethe's published hour estimates per
   level). A1 (Days 1-30) is fully written out above. A2 and B1 content
   is being added phase by phase — CONTENT_END_DAY marks how far the
   real lessons currently reach; days beyond that still track your daily
   writing/listening/speaking so nothing goes unlogged while content
   catches up. ---- */
/* ---- Full plan: A1 -> A2 -> B1 -> B2, restructured for an 8-month
   timeline (240 days) aimed at genuine working/comfortable fluency,
   not just an exam pass — B1 lands around month 5 so applications can
   go out while B2 work continues underneath. Content is written phase
   by phase — CONTENT_END_DAY marks how far the real lessons currently
   reach; days beyond that still track your daily writing/immersion/
   speaking so nothing goes unlogged while content catches up. ---- */
const PHASES = [
  {id:"a1",  from:1,   to:30,  label:"A1 — Foundations",                        months:"Month 1"},
  {id:"a2",  from:31,  to:90,  label:"A2 — Building Fluency",                   months:"Months 2–3"},
  {id:"b1",  from:91,  to:150, label:"B1 — Grammar + Application-Ready",        months:"Months 4–5"},
  {id:"b2w", from:151, to:210, label:"B2 — Workplace & Everyday Fluency",       months:"Months 6–7"},
  {id:"b2p", from:211, to:240, label:"B2 — Exam Prep & Mock Tests",             months:"Month 8"},
  {id:"buf", from:241, to:270, label:"Buffer & Review",                        months:"Month 9 (if needed)"}
];
function phaseForDay(day){
  return PHASES.find(p=>day>=p.from && day<=p.to) || PHASES[PHASES.length-1];
}
const A1_PHASE_END = 30;
const CONTENT_END_DAY = 50; // raise this as more phases get written
const TOTAL_CORE_DAYS = 240; // 8-month core plan (Days 1-240) to B2, buffer is extra

/* ---- daily real-life speaking challenge, tied to each day's topic ----
   Always shown alongside the normal homework, before AND after A1 is finished. */
const DAILY_CHALLENGES = [
  "Tell your husband your name, where you're from, and one thing about yourself — all in German.",
  "Count from 1 to 10 out loud to your husband in German.",
  "Spell your name out loud to your husband using the German alphabet.",
  "Tell your husband how you feel today in German, then ask him how he feels.",
  "Tell your husband one sentence about a family member, in German.",
  "Look around you and say 3 things you see in German, using der/die/das.",
  "Tell your husband one thing you do every day, in German.",
  "Tell your husband your age and one family member's age, in German.",
  "Tell your husband what time it is right now, in German.",
  "Tell your husband what day it is today and your favorite season, in German.",
  "Tell your husband about your day so far, in simple German.",
  "Tell your husband what you ate today, in German.",
  "Tell your husband about your favorite food, in German.",
  "Tell your husband one thing you need or want to buy, using \"Ich brauche...\" or \"Ich möchte...\".",
  "Describe what you're wearing today to your husband, in German.",
  "Tell your husband one thing you want to do and one thing you must do today, in German.",
  "Tell your husband what the weather is like today, in German.",
  "Give your husband simple directions to a room in your home, in German.",
  "Tell your husband one place you like to go and why, in simple German.",
  "Tell your husband one thing you did yesterday, in German.",
  "Tell your husband about your favorite hobby, in German.",
  "Ask your husband one simple question in German, like inviting him to do something together.",
  "Tell your husband how your body feels today, in German.",
  "Tell your husband if anything hurts today — or that you feel great — in German.",
  "Compare two things around you out loud in German (e.g. \"größer als\").",
  "Describe your room to your husband in 3 simple German sentences.",
  "Tell your husband about a trip you'd like to take, in simple German.",
  "Tell your husband one thing you like and one thing you don't like, in German.",
  "Ask your husband 3 simple questions in German and let him answer.",
  "Introduce yourself fully to your husband in German — as if it's the first time you're meeting.",
  "Tell your husband what you did yesterday and what you're doing tomorrow, in German — past and future in one breath.",
  "Retell your husband a short story from your day using at least 3 Perfekt-tense verbs.",
  "Tell your husband something that belongs to someone else, using a genitive phrase (e.g. \"das Auto meines Bruders\").",
  "Describe your husband to your husband, in German, using at least 3 adjectives with correct endings.",
  "Describe your dream apartment or house to your husband, using adjectives with correct endings.",
  "Tell your husband one thing you do for yourself every day, using a reflexive verb (e.g. \"Ich freue mich...\").",
  "Tell your husband something you'd do if you had more time, starting with \"Obwohl...\" or \"Wenn...\".",
  "Describe a person you know to your husband using a relative clause (e.g. \"Das ist die Frau, die...\").",
  "Ask your husband an indirect question in German (e.g. \"Weißt du, ob...\").",
  "Tell your husband three things about your ideal office job, in German — what you'd do, organize, or manage.",
  "Tell your husband one thing you'll do next week, using werden + infinitive.",
  "Describe a task at work or home as if someone else does it, using the passive voice (e.g. \"Die Rechnung wird bezahlt\").",
  "Ask your husband politely for something using würde or könnte (e.g. \"Würdest du mir bitte helfen?\").",
  "Tell your husband a reason for something using \"um...zu\" (in order to).",
  "Tell your husband two things you're doing at once, using \"sowohl...als auch\" or \"weder...noch\".",
  "Tell your husband where you put something, using a Wechselpräposition correctly (in, an, auf).",
  "Pretend to call your husband about a work matter and leave a short formal voicemail in German.",
  "Tell your husband a made-up invoice number and due date out loud, in German.",
  "Politely complain to your husband about something small, using Konjunktiv II (e.g. \"Das wäre schön, wenn...\").",
  "Practice answering \"Warum möchten Sie diese Ausbildung machen?\" out loud to your husband, in German."
];

/* ---- extra homework that unlocks once all 30 A1 days are complete.
   These are ADDED on top of the normal homework + daily challenge above,
   never a replacement, and stay tied to that day's A1 topic. ---- */
const POST_A1_VLOG_TASK = "Watch a short German A1 vlog on YouTube and practice understanding it.";
const POST_A1_SPEAKING_TEMPLATES = [
  (topic)=>`Talk about today's topic — ${topic} — in German with your husband.`,
  (topic)=>`Explain today's topic (${topic}) to your husband using simple German.`,
  (topic)=>`Have a 5-minute German conversation with your husband about ${topic}.`,
  (topic)=>`Ask your husband 3 questions in German about ${topic}.`,
  (topic)=>`Try to speak only German for 5 minutes with your husband while you talk about ${topic}.`
];
function isA1FullyComplete(){
  if(!state.german || !state.german.days) return false;
  for(let d=1; d<=A1_PHASE_END; d++){
    if(!dayIsDone(d)) return false;
  }
  return true;
}
function getPostA1Speaking(day, topic){
  const tmpl = POST_A1_SPEAKING_TEMPLATES[(day-1) % POST_A1_SPEAKING_TEMPLATES.length];
  return tmpl(topic);
}

/* ---- "Never Miss This Page" — phrase Germans actually use every day,
   paired with the textbook-correct version, cycling with the day picker
   so it stays fresh alongside the daily lesson. ---- */
const SLANG_OF_DAY = [
  {natural:"Alles klar?", exam:"Wie geht es dir?", meaning:"You good? / Everything alright?", note:"The everyday check-in you'll hear constantly — from friends, cashiers, coworkers. Way more common than the textbook question."},
  {natural:"Kein Ding.", exam:"Das ist kein Problem.", meaning:"No worries / no big deal.", note:"The casual reply when someone thanks you or apologizes for something small."},
  {natural:"Mach's gut!", exam:"Auf Wiedersehen.", meaning:"Take care! (casual goodbye)", note:"Used with people you know reasonably well — friends, colleagues, neighbors. Not for formal settings."},
  {natural:"Na?", exam:"Wie geht es dir?", meaning:"Hey. / What's up.", note:"One syllable, said constantly between people who see each other often. Tone carries the meaning."},
  {natural:"Ich hab kein Bock.", exam:"Ich habe keine Lust.", meaning:"I don't feel like it.", note:"Extremely common, slightly informal — fine with friends, avoid with your boss."},
  {natural:"Krass!", exam:"Das ist unglaublich!", meaning:"Wow! / No way! / Crazy!", note:"An all-purpose reaction to good or bad news alike — context decides the meaning."},
  {natural:"Kein Plan.", exam:"Ich weiß es nicht.", meaning:"No idea.", note:"Quick, casual way to say you don't know — used far more than the full textbook sentence."},
  {natural:"Passt schon.", exam:"Das ist in Ordnung.", meaning:"It's fine / good enough / don't worry about it.", note:"A very German shrug-in-words — reassuring, low-effort, said all the time."},
  {natural:"Digga, ehrlich?", exam:"Wirklich? Im Ernst?", meaning:"Seriously? / For real?", note:"\"Digga\" (like \"dude\") is youth/casual slang — great to recognize, but save it for close friends."},
  {natural:"Mega gut!", exam:"Sehr gut!", meaning:"Really good! / Awesome!", note:"\"Mega\" and \"voll\" are everyday intensifiers that replace \"sehr\" in casual speech."},
  {natural:"Ich bin pleite.", exam:"Ich habe kein Geld.", meaning:"I'm broke.", note:"Common, mildly self-deprecating way to say you're low on cash — totally normal among friends."},
  {natural:"Lass uns abhauen.", exam:"Lass uns gehen.", meaning:"Let's get out of here.", note:"\"Abhauen\" = to take off/bail — used when a party or place gets boring."},
  {natural:"Ehrlich jetzt?", exam:"Ist das wirklich wahr?", meaning:"Are you serious right now?", note:"Reaction to surprising news, said with a rising, incredulous tone."},
  {natural:"Es nieselt.", exam:"Es regnet ein bisschen.", meaning:"It's drizzling.", note:"A specific everyday weather word Germans use constantly — worth knowing beyond just \"es regnet\"."},
  {natural:"Ich muss aufs Klo.", exam:"Ich muss zur Toilette.", meaning:"I need the bathroom.", note:"\"Klo\" is the normal, casual word for toilet — you'll hear it far more than \"Toilette\" in daily life."},
  {natural:"Bock drauf?", exam:"Hast du Lust dazu?", meaning:"You up for it?", note:"Short version of \"Hast du Bock drauf?\" — a quick, casual way to propose plans."},
  {natural:"Mir geht's nicht so gut.", exam:"Ich fühle mich nicht wohl.", meaning:"I'm not feeling great.", note:"Softer and more natural than the formal version — good for everyday small talk about health."},
  {natural:"Ich chill nur.", exam:"Ich entspanne mich gerade.", meaning:"I'm just relaxing / hanging out.", note:"\"Chillen\" is a borrowed English verb fully at home in casual German now."},
  {natural:"Nix da.", exam:"Nein, das gibt es nicht.", meaning:"Nothing doing / no way.", note:"Blunt, casual refusal — short for \"nichts da\". Common between friends, not for polite requests."},
  {natural:"Wieso das denn?", exam:"Warum ist das so?", meaning:"Why's that, then?", note:"Adding \"denn\" makes questions sound more natural and conversational, less like an interrogation."},
  {natural:"Bis dann!", exam:"Bis später. Auf Wiedersehen.", meaning:"See ya!", note:"Quick, friendly goodbye when you'll see someone again soon."},
  {natural:"Ich nehm die Bahn.", exam:"Ich nehme die U-Bahn.", meaning:"I'll take the train.", note:"Dropping the final -e (\"nehm\" not \"nehme\") is standard in relaxed spoken German."},
  {natural:"Alter, warte mal.", exam:"Moment bitte, warte.", meaning:"Dude, hold on a sec.", note:"\"Alter\" (lit. \"old man\") is a filler word among friends, like \"dude\" or \"man\" in English."},
  {natural:"Läuft bei dir!", exam:"Das machst du sehr gut!", meaning:"You're doing great! / Nice one!", note:"An encouraging, playful compliment — common among younger speakers."},
  {natural:"Ich schau mal.", exam:"Ich werde es überprüfen.", meaning:"I'll take a look / I'll see.", note:"A relaxed, noncommittal way to say you'll check on something."},
  {natural:"Voll gut, ehrlich.", exam:"Wirklich sehr gut.", meaning:"Really good, honestly.", note:"\"Voll\" as an intensifier (like \"total\") is everywhere in spoken German — no direct textbook equivalent."},
  {natural:"Ich hab's verpeilt.", exam:"Ich habe es vergessen.", meaning:"I totally forgot / spaced it.", note:"\"Verpeilen\" = to mess up or space out on something — very common, slightly self-mocking."},
  {natural:"Geht klar.", exam:"Das ist in Ordnung. Ja, gerne.", meaning:"Sounds good / will do.", note:"A quick, agreeable \"okay\" — used constantly to confirm plans or requests."},
  {natural:"Was geht ab?", exam:"Wie geht es dir? Was machst du?", meaning:"What's up? What's going on?", note:"Casual greeting among friends, especially younger speakers — livelier than \"Wie geht's?\"."},
  {natural:"Bis bald, mach's gut!", exam:"Auf Wiedersehen, bis zum nächsten Mal.", meaning:"See you soon, take care!", note:"A warm, casual sign-off combining two phrases from this list — you've now got the whole toolkit."}
];

/* ---- 10 short A1 practice tests, 5 questions each ---- */
const GERMAN_TESTS = [
  {id:"t1", title:"Greetings & Introductions", topic:"Begrüßung & Vorstellung", questions:[
    {q:"Wie ___ du?", options:["heißt","heißen","heiße"], answer:0, explain:"With \"du\", regular verbs take -st: heißt."},
    {q:"Welcher Gruß passt am Morgen?", options:["Gute Nacht","Guten Morgen","Guten Appetit"], answer:1, explain:"\"Guten Morgen\" = Good morning."},
    {q:"Ich ___ aus Deutschland.", options:["komme","kommst","kommt"], answer:0, explain:"\"Ich\" pairs with the -e ending: komme."},
    {q:"Welches Pronomen ist die höfliche Form von \"du\"?", options:["ihr","Sie","wir"], answer:1, explain:"\"Sie\" (capitalized) is the formal \"you\"."},
    {q:"\"Auf Wiedersehen\" bedeutet:", options:["Hello","Goodbye","Thank you"], answer:1, explain:"It's a formal way to say goodbye."}
  ]},
  {id:"t2", title:"Numbers & Time", topic:"Zahlen & Uhrzeit", questions:[
    {q:"Was ist \"zwölf\"?", options:["10","11","12"], answer:2, explain:"zwölf = 12."},
    {q:"\"Wie spät ist es?\" fragt nach...", options:["dem Wetter","der Uhrzeit","dem Alter"], answer:1, explain:"It's asking \"what time is it?\""},
    {q:"Es ist 3 Uhr: \"Es ist ___ Uhr.\"", options:["drei","dritte","dreißig"], answer:0, explain:"Cardinal numbers are used for the hour: drei."},
    {q:"Was ist \"einundzwanzig\"?", options:["12","21","31"], answer:1, explain:"einundzwanzig = 21 (literally \"one-and-twenty\")."},
    {q:"\"Halb neun\" bedeutet:", options:["8:30","9:30","8:15"], answer:0, explain:"\"Halb neun\" = half way to nine = 8:30."}
  ]},
  {id:"t3", title:"Articles: der / die / das", topic:"Artikel & Substantive", questions:[
    {q:"___ Tisch (table)", options:["der","die","das"], answer:0, explain:"der Tisch is masculine."},
    {q:"___ Lampe (lamp)", options:["der","die","das"], answer:1, explain:"die Lampe is feminine."},
    {q:"___ Buch (book)", options:["der","die","das"], answer:2, explain:"das Buch is neuter."},
    {q:"Plural von \"das Kind\":", options:["die Kinder","die Kindes","der Kinder"], answer:0, explain:"die Kinder is the correct plural."},
    {q:"Ich habe ___ Bruder. (Akkusativ)", options:["ein","eine","einen"], answer:2, explain:"Masculine nouns take \"einen\" in the Akkusativ."}
  ]},
  {id:"t4", title:"Present Tense Verbs", topic:"Präsens — Verben", questions:[
    {q:"ich ___ (spielen)", options:["spiele","spielst","spielt"], answer:0, explain:"ich-form ends in -e: spiele."},
    {q:"du ___ (wohnen)", options:["wohne","wohnst","wohnt"], answer:1, explain:"du-form ends in -st: wohnst."},
    {q:"er ___ (arbeiten)", options:["arbeite","arbeitest","arbeitet"], answer:2, explain:"With stems ending in -t, an extra e is added: arbeitet."},
    {q:"wir ___ (lernen)", options:["lernen","lernt","lerne"], answer:0, explain:"wir-form matches the infinitive: lernen."},
    {q:"Welches Verb ist unregelmäßig?", options:["spielen","machen","sein"], answer:2, explain:"\"sein\" (to be) is irregular: bin, bist, ist..."}
  ]},
  {id:"t5", title:"Family & People", topic:"Familie & Personen", questions:[
    {q:"\"die Mutter\" bedeutet:", options:["father","mother","sister"], answer:1, explain:"die Mutter = mother."},
    {q:"\"der Bruder\" bedeutet:", options:["brother","uncle","son"], answer:0, explain:"der Bruder = brother."},
    {q:"\"meine Eltern\" bedeutet:", options:["my parents","my children","my grandparents"], answer:0, explain:"die Eltern = the parents."},
    {q:"\"die Schwester\" bedeutet:", options:["sister","aunt","daughter"], answer:0, explain:"die Schwester = sister."},
    {q:"Plural von \"der Sohn\":", options:["die Söhne","die Sohne","der Söhne"], answer:0, explain:"der Sohn → die Söhne (umlaut in the plural)."}
  ]},
  {id:"t6", title:"Food & Drink", topic:"Essen & Trinken", questions:[
    {q:"\"das Brot\" bedeutet:", options:["bread","butter","milk"], answer:0, explain:"das Brot = bread."},
    {q:"Ich möchte ___ Kaffee. (Akkusativ)", options:["einen","eine","ein"], answer:0, explain:"der Kaffee → einen Kaffee in the Akkusativ."},
    {q:"\"der Apfel\" bedeutet:", options:["apple","orange","banana"], answer:0, explain:"der Apfel = apple."},
    {q:"Wann sagt man \"Guten Appetit\"?", options:["vor dem Essen","nach dem Essen","vor dem Schlafen"], answer:0, explain:"It's said right before eating."},
    {q:"\"das Wasser\" bedeutet:", options:["water","juice","wine"], answer:0, explain:"das Wasser = water."}
  ]},
  {id:"t7", title:"Daily Routine", topic:"Tagesablauf", questions:[
    {q:"Ich stehe um sieben Uhr ___. (aufstehen)", options:["auf","an","aus"], answer:0, explain:"The separable prefix \"auf\" goes to the end: stehe ... auf."},
    {q:"\"aufstehen\" bedeutet:", options:["to get up","to go to bed","to eat"], answer:0, explain:"aufstehen = to get up."},
    {q:"Ich ziehe mich ___. (sich anziehen)", options:["an","auf","ab"], answer:0, explain:"sich anziehen = to get dressed."},
    {q:"\"Zuerst... dann... danach...\" benutzt man um...", options:["die Reihenfolge zu beschreiben","Fragen zu stellen","sich zu verabschieden"], answer:0, explain:"These words describe the order of actions."},
    {q:"\"Ich gehe um zehn Uhr ins Bett.\" bedeutet:", options:["I go to bed at 10","I wake up at 10","I eat at 10"], answer:0, explain:"ins Bett gehen = to go to bed."}
  ]},
  {id:"t8", title:"Weather & Seasons", topic:"Wetter & Jahreszeiten", questions:[
    {q:"\"Es ist sonnig\" bedeutet:", options:["It's sunny","It's raining","It's cold"], answer:0, explain:"sonnig = sunny."},
    {q:"Nach dem Herbst kommt...", options:["der Winter","der Sommer","der Frühling"], answer:0, explain:"Seasons order: Frühling, Sommer, Herbst, Winter."},
    {q:"\"Es regnet\" bedeutet:", options:["it's raining","it's snowing","it's windy"], answer:0, explain:"regnen = to rain."},
    {q:"Das Gegenteil von \"warm\" ist:", options:["kalt","heiß","nass"], answer:0, explain:"kalt = cold, the opposite of warm."},
    {q:"\"der Frühling\" bedeutet:", options:["spring","summer","autumn"], answer:0, explain:"der Frühling = spring."}
  ]},
  {id:"t9", title:"Modal Verbs & Plans", topic:"Modalverben", questions:[
    {q:"Ich ___ heute lernen. (müssen)", options:["muss","musst","müsst"], answer:0, explain:"ich-form of müssen is \"muss\"."},
    {q:"\"Wollen wir ins Kino gehen?\" bedeutet ungefähr:", options:["Shall we go to the cinema?","Are we going to the cinema?","Can we go to the cinema?"], answer:0, explain:"It's a friendly suggestion/invitation."},
    {q:"\"können\" bedeutet:", options:["can","must","want"], answer:0, explain:"können = to be able to / can."},
    {q:"\"Ich kann gut schwimmen.\" bedeutet:", options:["I can swim well","I must swim well","I want to swim well"], answer:0, explain:"können expresses ability."},
    {q:"\"Hast du am Samstag Zeit?\" fragt nach:", options:["deiner Verfügbarkeit am Samstag","dem Wetter am Samstag","Plänen für Sonntag"], answer:0, explain:"It's asking if you're free/available on Saturday."}
  ]},
  {id:"t10", title:"Question Words Review", topic:"Fragewörter — Wiederholung", questions:[
    {q:"\"Wo wohnst du?\" fragt nach:", options:["wo du wohnst","wer du bist","wann du angekommen bist"], answer:0, explain:"wo = where."},
    {q:"\"Warum\" bedeutet:", options:["why","where","when"], answer:0, explain:"warum = why."},
    {q:"\"Wie viel kostet das?\" fragt nach:", options:["dem Preis","der Zeit","der Entfernung"], answer:0, explain:"It's asking about price/cost."},
    {q:"\"Ich habe kein Auto.\" bedeutet:", options:["I don't have a car","I have a car","I want a car"], answer:0, explain:"kein negates a noun: no car."},
    {q:"\"Wer ist das?\" fragt:", options:["who is that","what is that","where is that"], answer:0, explain:"wer = who."}
  ]}
];

function renderGermanProgressRing(){
  let doneCount = 0;
  for(let d=1; d<=CONTENT_END_DAY; d++) if(dayIsDone(d)) doneCount++;
  const label = document.getElementById("germanRingLabel");
  const fg = document.getElementById("germanRingFg");
  if(!label || !fg) return;
  label.textContent = `${doneCount}/${TOTAL_CORE_DAYS}`;
  const circumference = 2*Math.PI*26;
  const pct = doneCount/TOTAL_CORE_DAYS;
  fg.style.strokeDasharray = `${circumference}`;
  fg.style.strokeDashoffset = `${circumference * (1 - pct)}`;
  const sub = document.getElementById("germanProgressSub");
  if(sub){
    const phase = phaseForDay(germanCurrentDay);
    sub.textContent = `Now in: ${phase.label} (${phase.months})`;
  }
}

function renderSlangCard(){
  const card = document.getElementById("slangCard");
  if(!card) return;
  const item = SLANG_OF_DAY[(germanCurrentDay-1) % SLANG_OF_DAY.length];
  card.innerHTML = `
    <span class="slang-card-eyebrow">How Germans Actually Say It <span class="day-of">· Day ${germanCurrentDay}</span></span>
    <div class="slang-card-pair">
      <div class="slang-card-phrase"><h4>${forvoWords(item.natural)}</h4></div>
      <span class="slang-card-exam">Exam-correct: <strong>${forvoWords(item.exam)}</strong></span>
    </div>
    <p class="slang-card-meaning">${esc(item.meaning)}</p>
    <p class="slang-card-note">${esc(item.note)}</p>
  `;
}

function renderDayPicker(){
  const wrap = document.getElementById("dayPicker");
  let html = "";
  PHASES.forEach(ph=>{
    if(ph.id==="buf") return; // buffer days only show once you're actually in Month 7
    html += `<div class="phase-group">
      <div class="phase-group-label">${esc(ph.label)} <span class="phase-months">${esc(ph.months)}</span></div>
      <div class="phase-pills">`;
    for(let d=ph.from; d<=ph.to; d++){
      const done = dayIsDone(d);
      const multi = lessonCountForDay(d) > 1;
      const upcoming = d > CONTENT_END_DAY;
      html += `<button class="day-pill ${d===germanCurrentDay?"active":""} ${done?"done":""} ${multi?"multi":""} ${upcoming?"upcoming":""}" data-day="${d}">${d}</button>`;
    }
    html += `</div></div>`;
  });
  wrap.innerHTML = html;
  wrap.querySelectorAll(".day-pill").forEach(btn=>{
    btn.onclick = ()=>{
      germanCurrentDay = parseInt(btn.dataset.day,10);
      state.german.currentDay = germanCurrentDay;
      saveData();
      renderDayPicker();
      renderDailyCard();
      renderSlangCard();
      renderGermanProgressRing();
    };
  });
}

/* ---- Writing / Immersion / Speaking logs. Goethe grades all four
   skills separately, so these run every day, in every phase — including
   days whose full lesson content hasn't been written yet. The Immersion
   block is deliberately modeled on how you got to C1 English — social
   media, music, shows — not formal listening drills. ---- */
function skillTracksHtml(rec){
  return `
    <div class="daily-block">
      <div class="daily-block-label"><span class="dot"></span>Writing Practice</div>
      <textarea class="skill-writing notes-area" placeholder="Write a few sentences in German — today's topic, your day, anything...">${esc(rec.writing)}</textarea>
    </div>
    <div class="daily-block">
      <div class="daily-block-label"><span class="dot"></span>Immersion (the way you did English)</div>
      <label class="skill-check-row"><input type="checkbox" class="skill-listening-done" ${rec.listeningDone?"checked":""}> Got German into my ears/eyes today — TikTok, music, a show, a podcast</label>
      <textarea class="skill-listening-notes notes-area" placeholder="What did you scroll, watch, or listen to? What did you catch — even just the vibe or a few words?">${esc(rec.listeningNotes)}</textarea>
    </div>
    <div class="daily-block">
      <div class="daily-block-label"><span class="dot"></span>Speaking Practice</div>
      <label class="skill-check-row"><input type="checkbox" class="skill-speaking-done" ${rec.speakingDone?"checked":""}> Spoke German out loud today</label>
      <textarea class="skill-speaking-notes notes-area" placeholder="What did you talk about? With who?">${esc(rec.speakingNotes)}</textarea>
    </div>`;
}
function wireSkillTracks(card, rec){
  const wTa = card.querySelector(".skill-writing");
  if(wTa) wTa.oninput = (e)=>{ rec.writing = e.target.value; saveData(); };
  const lCb = card.querySelector(".skill-listening-done");
  if(lCb) lCb.onchange = (e)=>{ rec.listeningDone = e.target.checked; saveData(); };
  const lTa = card.querySelector(".skill-listening-notes");
  if(lTa) lTa.oninput = (e)=>{ rec.listeningNotes = e.target.value; saveData(); };
  const sCb = card.querySelector(".skill-speaking-done");
  if(sCb) sCb.onchange = (e)=>{ rec.speakingDone = e.target.checked; saveData(); };
  const sTa = card.querySelector(".skill-speaking-notes");
  if(sTa) sTa.oninput = (e)=>{ rec.speakingNotes = e.target.value; saveData(); };
}

/* ---- Goal-progress toast: shown for a few seconds every time a lesson
   is marked complete, so "how close am I to the Ausbildung goal" is
   always visible right when it matters, not buried in another tab. ---- */
let goalToastTimer = null;
function goalProgressStats(){
  let completedDays = 0;
  for(let d=1; d<=TOTAL_CORE_DAYS; d++){ if(dayIsDone(d)) completedDays++; }
  const percent = Math.round((completedDays/TOTAL_CORE_DAYS)*100);
  const daysLeft = TOTAL_CORE_DAYS - completedDays;
  const phase = phaseForDay(germanCurrentDay);
  return {completedDays, percent, daysLeft, phase};
}
function showGoalProgressToast(){
  const {completedDays, percent, daysLeft, phase} = goalProgressStats();
  let toast = document.getElementById("goalToast");
  if(!toast){
    toast = document.createElement("div");
    toast.id = "goalToast";
    toast.className = "goal-toast";
    document.body.appendChild(toast);
  }
  toast.innerHTML = `
    <div class="goal-toast-title">${percent}% toward your Ausbildung goal</div>
    <div class="goal-toast-bar"><div class="goal-toast-fill" style="width:${percent}%"></div></div>
    <div class="goal-toast-sub">Day ${completedDays}/${TOTAL_CORE_DAYS} complete · ${esc(phase.label)} · ${daysLeft} days left in the plan</div>`;
  toast.classList.add("show");
  if(goalToastTimer) clearTimeout(goalToastTimer);
  goalToastTimer = setTimeout(()=>{ toast.classList.remove("show"); }, 4000);
}

function renderDailyCard(){
  const card = document.getElementById("dailyCard");
  const day = germanCurrentDay;
  const dayContent = GERMAN_DAYS[day-1];
  const rec = getDayRecord(day);
  const phase = phaseForDay(day);

  if(!dayContent){
    // This phase's full lessons haven't been written yet — the daily
    // habit (challenge + writing/listening/speaking) still works today.
    const challenge = DAILY_CHALLENGES[(day-1) % DAILY_CHALLENGES.length];
    card.innerHTML = `
      <div class="daily-card-head">
        <h2>Day ${day}</h2>
        <span class="day-topic-tag">${esc(phase.label)} · Day ${day}/${TOTAL_CORE_DAYS}</span>
      </div>
      <div class="daily-card-sub">${esc(phase.months)} — full lessons for this phase are coming in a future update. Keep the daily habit going below in the meantime.</div>

      <div class="daily-block">
        <div class="daily-block-label"><span class="dot"></span>Speaking Challenge</div>
        <div class="challenge-box">${esc(challenge)}</div>
      </div>

      ${skillTracksHtml(rec)}
    `;
    wireSkillTracks(card, rec);
    return;
  }

  const challenge = DAILY_CHALLENGES[day-1];
  const a1Done = isA1FullyComplete();
  const topicsLabel = dayContent.lessons.map(l=>l.topic).join(" & ");
  const multi = dayContent.lessons.length > 1;

  const postA1Html = a1Done ? `
    <div class="daily-block">
      <div class="daily-block-label"><span class="dot"></span>After A1: Practice &amp; Speak <span class="bonus-tag">Unlocked</span></div>
      <div class="postA1-box"><strong>+</strong> ${esc(POST_A1_VLOG_TASK)}</div>
      <div class="postA1-box"><strong>+</strong> ${esc(getPostA1Speaking(day, topicsLabel))}</div>
    </div>` : "";

  const lessonsHtml = dayContent.lessons.map((lesson,i)=>{
    const lrec = rec.lessons[i];
    return `
    <div class="lesson-block">
      <div class="lesson-block-head">
        <h3>${multi?`Lesson ${i+1} of ${dayContent.lessons.length} — `:""}${esc(lesson.topic)}</h3>
      </div>
      <div class="daily-block">
        <div class="daily-block-label"><span class="dot"></span>Homework</div>
        <div class="homework-prompt">${esc(lesson.homework)}</div>
        <textarea class="lesson-answer" data-lesson="${i}" placeholder="Write your answer here...">${esc(lrec.answer)}</textarea>
      </div>
      <div class="daily-block">
        <div class="daily-block-label"><span class="dot"></span>Example: Exam vs. Everyday</div>
        <div class="example-pair">
          <div class="example-box exam-box"><span class="example-tag">Goethe Exam-Correct</span>${forvoWords(lesson.example)}</div>
          <div class="example-box natural-box"><span class="example-tag">How Germans Actually Say It</span>${forvoWords(lesson.natural)}</div>
        </div>
      </div>
      <div class="daily-block">
        <div class="daily-block-label"><span class="dot"></span>Your Notes</div>
        <textarea class="lesson-notes notes-area" data-lesson-notes="${i}" placeholder="New words, grammar points, things to review...">${esc(lrec.notes)}</textarea>
      </div>
      <div class="daily-done-row">
        <label><input type="checkbox" class="lesson-done" data-lesson-done="${i}" ${lrec.done?"checked":""}> Mark this lesson complete</label>
      </div>
    </div>`;
  }).join("");

  card.innerHTML = `
    <div class="daily-card-head">
      <h2>Day ${day}</h2>
      <span class="day-topic-tag">${esc(phase.label)} · Day ${day}/${TOTAL_CORE_DAYS}</span>
    </div>
    <div class="daily-card-sub">${esc(topicsLabel)} — small steps today, closer to B1 tomorrow.</div>

    <div class="daily-block">
      <div class="daily-block-label"><span class="dot"></span>Real-Life Challenge</div>
      <div class="challenge-box">${esc(challenge)}</div>
    </div>

    ${lessonsHtml}
    ${skillTracksHtml(rec)}
    ${postA1Html}
  `;

  card.querySelectorAll(".lesson-answer").forEach(ta=>{
    ta.oninput = (e)=>{ rec.lessons[+ta.dataset.lesson].answer = e.target.value; saveData(); };
  });
  card.querySelectorAll(".lesson-notes").forEach(ta=>{
    ta.oninput = (e)=>{ rec.lessons[+ta.dataset.lessonNotes].notes = e.target.value; saveData(); };
  });
  card.querySelectorAll(".lesson-done").forEach(cb=>{
    cb.onchange = (e)=>{
      rec.lessons[+cb.dataset.lessonDone].done = e.target.checked;
      saveData();
      renderDayPicker();
      renderGermanProgressRing();
      renderDailyCard();
      if(e.target.checked) showGoalProgressToast();
    };
  });
  wireSkillTracks(card, rec);
}

function renderQuestion(test,q,qi,rec){
  const submitted = rec.submitted;
  const chosen = rec.userAnswers[qi];
  let stateClass = "";
  if(submitted) stateClass = chosen===q.answer ? "correct" : "wrong";
  const optsHtml = q.options.map((opt,oi)=>`
      <label>
        <input type="radio" name="${test.id}-q${qi}" data-test="${test.id}" data-q="${qi}" value="${oi}" ${chosen===oi?"checked":""} ${submitted?"disabled":""}>
        ${esc(opt)}
      </label>`).join("");
  let feedback = "";
  if(submitted){
    feedback = chosen===q.answer
      ? `<div class="answer-tag correct-tag">&check; Correct</div>`
      : `<div class="answer-tag wrong-tag">&cross; Correct answer: ${esc(q.options[q.answer])}</div>`;
    if(q.explain) feedback += `<div class="test-explain">${esc(q.explain)}</div>`;
  }
  return `<div class="test-question ${stateClass}">
    <p>${qi+1}. ${esc(q.q)}</p>
    <div class="test-options">${optsHtml}</div>
    ${feedback}
  </div>`;
}

function renderTestsList(){
  const wrap = document.getElementById("testsList");
  let html = "";
  GERMAN_TESTS.forEach((test,i)=>{
    const rec = getTestRecord(test.id);
    const isOpen = germanOpenTest===test.id;
    html += `<div class="test-card ${rec.done?"done":""} ${isOpen?"open":""}" data-test="${test.id}">
      <div class="test-card-head">
        <div class="test-card-title">
          <span class="test-num">${i+1}</span>
          <div>
            <h3>${esc(test.title)}</h3>
            <span class="test-topic">${esc(test.topic)}</span>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <span class="test-status">${rec.done ? "Completed" : "Not started"}</span>
          <svg class="test-chevron" viewBox="0 0 24 24" width="16" height="16"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>
      <div class="test-body">
        ${test.questions.map((q,qi)=>renderQuestion(test,q,qi,rec)).join("")}
        <div class="test-actions">
          <button class="btn-mini" data-action="check" data-test="${test.id}">Check Answers</button>
          <button class="btn-mini ghost" data-action="reset" data-test="${test.id}">Reset</button>
          ${rec.submitted ? `<span class="test-score">Score: ${rec.score}/${test.questions.length}</span>` : ""}
        </div>
        <label class="test-review-label">What to work on</label>
        <div class="test-review"><textarea data-test-review="${test.id}" placeholder="Grammar points, vocab, mistakes to revisit...">${esc(rec.review)}</textarea></div>
        <div class="test-done-row">
          <label><input type="checkbox" data-test-done="${test.id}" ${rec.done?"checked":""}> Mark test complete${rec.dateTaken?` · taken ${esc(rec.dateTaken)}`:""}</label>
        </div>
      </div>
    </div>`;
  });
  wrap.innerHTML = html;
  bindTestEvents();
}

function bindTestEvents(){
  const wrap = document.getElementById("testsList");
  wrap.querySelectorAll(".test-card-head").forEach(head=>{
    head.onclick = ()=>{
      const id = head.closest(".test-card").dataset.test;
      germanOpenTest = germanOpenTest===id ? null : id;
      renderTestsList();
    };
  });
  wrap.querySelectorAll('input[type="radio"][data-test]').forEach(radio=>{
    radio.onchange = ()=>{
      const rec = getTestRecord(radio.dataset.test);
      rec.userAnswers[radio.dataset.q] = parseInt(radio.value,10);
      saveData();
    };
  });
  wrap.querySelectorAll('[data-action="check"]').forEach(btn=>{
    btn.onclick = ()=>{
      const test = GERMAN_TESTS.find(t=>t.id===btn.dataset.test);
      const rec = getTestRecord(test.id);
      let score = 0;
      test.questions.forEach((q,qi)=>{ if(rec.userAnswers[qi]===q.answer) score++; });
      rec.submitted = true;
      rec.score = score;
      saveData();
      renderTestsList();
    };
  });
  wrap.querySelectorAll('[data-action="reset"]').forEach(btn=>{
    btn.onclick = ()=>{
      const rec = getTestRecord(btn.dataset.test);
      rec.userAnswers = {};
      rec.submitted = false;
      rec.score = null;
      saveData();
      renderTestsList();
    };
  });
  wrap.querySelectorAll('[data-test-review]').forEach(ta=>{
    ta.oninput = ()=>{
      const rec = getTestRecord(ta.dataset.testReview);
      rec.review = ta.value;
      saveData();
    };
  });
  wrap.querySelectorAll('[data-test-done]').forEach(cb=>{
    cb.onchange = ()=>{
      const rec = getTestRecord(cb.dataset.testDone);
      rec.done = cb.checked;
      rec.dateTaken = cb.checked ? fmtShort(new Date()) : "";
      saveData();
      renderTestsList();
    };
  });
}

/* ---- Mock exam tracker: log practice attempts across the four Goethe
   skills (Reading/Listening/Writing/Speaking) plus full mock exams.
   Manual log for now — real practice-test content comes with the
   exam-prep phase content. ---- */
function renderMockExams(){
  const wrap = document.getElementById("mockExamTracker");
  if(!wrap) return;
  const entries = state.german.mockExams.slice().sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  const rows = entries.map(e=>`
    <div class="mock-entry">
      <div class="mock-entry-head">
        <span class="mock-skill-tag">${esc(e.skill)}</span>
        <span class="mock-date">${esc(e.date)}</span>
        <button class="mock-delete" data-id="${esc(e.id)}" aria-label="Delete entry">&times;</button>
      </div>
      ${e.score?`<div class="mock-score">${esc(e.score)}</div>`:""}
      ${e.notes?`<div class="mock-notes">${esc(e.notes)}</div>`:""}
    </div>`).join("");
  wrap.innerHTML = `
    <div class="mock-form">
      <div class="mock-form-row">
        <select id="mockSkill">
          <option value="Reading">Reading</option>
          <option value="Listening">Listening</option>
          <option value="Writing">Writing</option>
          <option value="Speaking">Speaking</option>
          <option value="Full Mock Exam">Full Mock Exam</option>
        </select>
        <input type="date" id="mockDate" value="${toISO(new Date())}">
      </div>
      <input type="text" id="mockScore" placeholder="Score / result (e.g. 78%, 3/4 correct...)">
      <textarea id="mockNotes" placeholder="What to review, mistakes made..."></textarea>
      <button id="mockAddBtn" class="mock-add-btn">Log this attempt</button>
    </div>
    <div class="mock-list">${rows || '<p class="mock-empty">No practice attempts logged yet — this fills in once you reach the exam-prep phase, or start it early if you want.</p>'}</div>
  `;
  document.getElementById("mockAddBtn").onclick = ()=>{
    const skill = document.getElementById("mockSkill").value;
    const date = document.getElementById("mockDate").value || toISO(new Date());
    const score = document.getElementById("mockScore").value.trim();
    const notes = document.getElementById("mockNotes").value.trim();
    if(!score && !notes) return;
    state.german.mockExams.push({id:Date.now()+"", skill, date, score, notes});
    saveData();
    renderMockExams();
  };
  wrap.querySelectorAll(".mock-delete").forEach(btn=>{
    btn.onclick = ()=>{
      state.german.mockExams = state.german.mockExams.filter(e=>e.id!==btn.dataset.id);
      saveData();
      renderMockExams();
    };
  });
}

function renderGermanView(){
  ensureGerman();
  renderGermanProgressRing();
  renderSlangCard();
  renderDayPicker();
  renderDailyCard();
  renderTestsList();
  renderMockExams();
}

document.getElementById("germanSubnav").addEventListener("click",(e)=>{
  const btn = e.target.closest("button[data-sub]");
  if(!btn) return;
  document.querySelectorAll("#germanSubnav button").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("germanDaily").classList.toggle("hidden", btn.dataset.sub!=="daily");
  document.getElementById("germanTests").classList.toggle("hidden", btn.dataset.sub!=="tests");
  document.getElementById("germanMock").classList.toggle("hidden", btn.dataset.sub!=="mock");
});

/* ---------- navigation ---------- */
document.getElementById("prevWeek").onclick = ()=>{ currentMonday = addDays(currentMonday,-7); renderWeekView(); };
document.getElementById("nextWeek").onclick = ()=>{ currentMonday = addDays(currentMonday,7); renderWeekView(); };
document.getElementById("jumpToday").onclick = ()=>{ currentMonday = mondayOf(new Date()); renderWeekView(); };

document.getElementById("prevMonth").onclick = ()=>{ currentMonthCursor.setMonth(currentMonthCursor.getMonth()-1); renderMonthView(); };
document.getElementById("nextMonth").onclick = ()=>{ currentMonthCursor.setMonth(currentMonthCursor.getMonth()+1); renderMonthView(); };

document.getElementById("prevYear").onclick = ()=>{ currentYearCursor -= 1; renderYearView(); };
document.getElementById("nextYear").onclick = ()=>{ currentYearCursor += 1; renderYearView(); };

/* ---------- view switching ---------- */
const views = {week:document.getElementById("weekView"), month:document.getElementById("monthView"), year:document.getElementById("yearView"), german:document.getElementById("germanView")};
document.getElementById("viewSwitch").addEventListener("click",(e)=>{
  const btn = e.target.closest("button[data-view]");
  if(!btn) return;
  document.querySelectorAll("#viewSwitch button").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  Object.entries(views).forEach(([k,el])=>el.classList.toggle("hidden", k!==btn.dataset.view));
  if(btn.dataset.view==="week"){ renderWeekView(); }
  if(btn.dataset.view==="month") renderMonthView();
  if(btn.dataset.view==="year") renderYearView();
  if(btn.dataset.view==="german") renderGermanView();
});

/* ---------- export as image (beautiful print), with a real "save to phone" path ---------- */
function canvasToBlob(canvas){
  return new Promise((resolve)=>canvas.toBlob(resolve,"image/png"));
}
async function saveImageToDevice(canvas, filename){
  const blob = await canvasToBlob(canvas);
  if(!blob) throw new Error("Could not create image data.");
  const file = new File([blob], filename, {type:"image/png"});

  // On phones (iOS/Android Safari & Chrome), the share sheet's "Save Image"
  // is the only reliable way to get a PNG into Photos — a plain <a download>
  // click is silently ignored or just opens the image on iOS Safari.
  if(navigator.canShare && navigator.canShare({files:[file]})){
    try{
      await navigator.share({files:[file], title:filename});
      return "shared";
    }catch(err){
      if(err && err.name === "AbortError") return "cancelled";
      // fall through to the download/new-tab fallback below
    }
  }

  // Desktop browsers: a normal blob download works fine.
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 4000);

  // iOS Safari in particular ignores the download attribute for local/blob
  // files and just navigates — opening the image in a new tab as a backup
  // means there's always a way to long-press → Save Image even there.
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform==="MacIntel" && navigator.maxTouchPoints>1);
  if(isIOS) window.open(url, "_blank");
  return "downloaded";
}

document.getElementById("exportImage").onclick = async ()=>{
  const btn = document.getElementById("exportImage");
  if(typeof html2canvas === "undefined"){
    alert("Image export needs an internet connection to load once. Please check your connection and try again.");
    return;
  }
  const originalText = btn.textContent;
  btn.textContent = "Rendering…";
  btn.disabled = true;
  try{
    let target, prevTransform;
    if(!document.getElementById("weekView").classList.contains("hidden")){
      target = document.getElementById("plannerCanvas");
      prevTransform = target.style.transform;
      target.style.transform = "none";
    } else if(!document.getElementById("monthView").classList.contains("hidden")){
      target = document.getElementById("monthCanvas");
      prevTransform = target.style.transform;
      target.style.transform = "none";
    } else if(!document.getElementById("yearView").classList.contains("hidden")){
      target = document.getElementById("yearCanvas");
      prevTransform = target.style.transform;
      target.style.transform = "none";
    } else {
      target = document.querySelector("#germanView .report-page");
    }
    // Wait for the system font to be fully ready so html2canvas measures text correctly.
    if(document.fonts && document.fonts.ready) await document.fonts.ready;
    const bg = getComputedStyle(document.body).getPropertyValue("background-color").trim() || "#ffffff";
    const canvas = await html2canvas(target, {scale:2, backgroundColor:bg, useCORS:true, logging:false});
    if(prevTransform!==undefined) target.style.transform = prevTransform;
    await saveImageToDevice(canvas, `7-day-plan-${toISO(new Date())}.png`);
  }catch(err){
    console.error("Image export failed:", err);
    alert("Sorry, the image export failed. Please check your connection and try again.");
  }finally{
    btn.textContent = originalText;
    btn.disabled = false;
  }
};

/* ---------- export / import (JSON backup) ---------- */
document.getElementById("exportData").onclick = ()=>{
  const blob = new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `7-day-plan-backup-${toISO(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
document.getElementById("importData").onchange = (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const parsed = JSON.parse(reader.result);
      if(!parsed.weeks) throw new Error("Invalid file");
      state = parsed;
      saveData();
      renderWeekView();
      alert("Backup imported successfully.");
    }catch(err){
      alert("Could not import this file. Make sure it's a backup exported from this tracker.");
    }
  };
  reader.readAsText(file);
};

/* ---------- light / dark mode ---------- */
const THEME_KEY = "sevenDayPlan.theme";
function applyTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  const btn = document.getElementById("themeToggle");
  if(btn) btn.setAttribute("aria-pressed", theme==="dark" ? "true" : "false");
}
function initTheme(){
  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));
}
const themeToggleBtn = document.getElementById("themeToggle");
if(themeToggleBtn){
  themeToggleBtn.onclick = ()=>{
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    applyTheme(current === "dark" ? "light" : "dark");
  };
}
initTheme();

/* ---------- init ---------- */
renderWeekView();
