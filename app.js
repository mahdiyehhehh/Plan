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
function L(topic,homework,example,natural,en){ return {topic,homework,example,natural,en}; }
const GERMAN_DAYS = [
  {lessons:[ // Day 1
    L("Greetings & Introductions","Write 5 sentences introducing yourself: your name, nationality, age, city, and a language you speak.","Ich heiße Lisa. Ich bin 22 Jahre alt. Ich komme aus Italien und ich spreche Italienisch und ein bisschen Deutsch.","Ich bin Lisa, 22. Komm' aus Italien und spreche Italienisch und n bisschen Deutsch. Und du, wie heißt du?","My name is Lisa. I am 22 years old. I come from Italy and I speak Italian and a little German."),
    L("Formal vs. Informal: du vs. Sie","Write the same self-introduction twice: once informally to a friend (du), once formally to a stranger (Sie).","Guten Tag, mein Name ist Frau Keller. Wie ist Ihr Name?","Hey, ich bin Lisa. Und du, wie heißt du?","Good day, my name is Mrs. Keller. What is your name?")
  ]},
  {lessons:[ // Day 2
    L("Numbers 0–20","Write the numbers 0–20 in German, then write out 5 simple addition sums in words.","eins, zwei, drei ... zehn. Drei plus vier ist sieben.","Drei und vier macht sieben. — Warte, wie viel war das nochmal?","one, two, three ... ten. Three plus four is seven."),
    L("Phone Numbers & Basic Math","Write your phone number out digit by digit in German, then write 3 subtraction sums in words.","Meine Nummer ist null-eins-fünf-drei... Zehn minus drei ist sieben.","Meine Nummer ist 0153... — Wart, sag's nochmal langsamer.","My number is zero-one-five-three... Ten minus three is seven.")
  ]},
  {lessons:[ // Day 3
    L("The Alphabet & Spelling","Spell your first and last name out loud using the German alphabet, then write it letter by letter.","M-A-R-I-A = Em – A – Er – I – A.","Buchstabier das nochmal, ich hab's nicht ganz verstanden.","M-A-R-I-A, spelled out letter by letter."),
    L("Survival Classroom Phrases","Write 5 phrases you'd use if you don't understand something in a conversation.","Wie bitte? Können Sie das bitte wiederholen? Ich verstehe nicht.","Wie bitte? Kannst du das nochmal sagen? Ich check's grad nicht.","Excuse me? Could you please repeat that? I don't understand.")
  ]},
  {lessons:[ // Day 4
    L("Personal Pronouns & \"sein\"","Conjugate the verb \"sein\" (to be) for all pronouns, then write 3 sentences using it.","ich bin, du bist, er/sie/es ist, wir sind, ihr seid, sie sind. Ich bin müde.","Ich bin echt müde heute. Bist du auch so kaputt?","I am, you are, he/she/it is, we are, you (pl.) are, they are. I am tired."),
    L("Basic Adjectives with sein","Write 6 sentences describing people or things using sein + an adjective (groß, klein, glücklich, müde, nett...).","Er ist groß. Sie ist sehr nett. Das Wetter ist schlecht.","Er ist echt groß, oder? Und sie ist total nett.","He is tall. She is very nice. The weather is bad.")
  ]},
  {lessons:[ // Day 5
    L("Family Members","List your family tree and label each person in German (Mutter, Vater, Bruder, Schwester...).","Das ist meine Mutter. Sie heißt Anna. Das ist mein Bruder. Er heißt Tom.","Das ist meine Mama, und das da ist mein kleiner Bruder.","This is my mother. Her name is Anna. This is my brother. His name is Tom.")
  ]},
  {lessons:[ // Day 6
    L("Articles: der / die / das","Sort 10 household nouns into der / die / das using a dictionary or app.","der Tisch, die Lampe, das Buch, der Stuhl, die Tür.","Kannst du mir mal das Buch da geben? Genau, das auf'm Tisch.","the table, the lamp, the book, the chair, the door."),
    L("Possessive Articles (mein/dein/sein/ihr)","Rewrite 6 sentences from Day 5 using possessive articles instead of der/die/das (mein Vater, meine Schwester...).","Das ist mein Vater. Das ist meine Schwester. Das ist unser Haus.","Das ist mein Dad, und das da meine Schwester.","This is my father. This is my sister. This is our house.")
  ]},
  {lessons:[ // Day 7
    L("Present Tense — Regular Verbs","Fully conjugate 3 regular verbs: spielen, wohnen, lernen.","ich spiele, du spielst, er spielt, wir spielen, ihr spielt, sie spielen.","Ich lern grad Deutsch, deshalb spiel ich abends immer diese Vokabel-App.","I play, you play, he plays, we play, you (pl.) play, they play."),
    L("Frequency Adverbs","Write 6 sentences about how often you do things, using immer, oft, manchmal, selten, nie.","Ich lerne jeden Tag Deutsch. Ich gehe selten ins Kino.","Ich lern eigentlich jeden Tag n bisschen, aber ins Kino geh ich selten.","I learn German every day. I rarely go to the cinema.")
  ]},
  {lessons:[ // Day 8
    L("Numbers 20–100 & Age","Write your age and the ages of 5 family members in full German words.","Meine Schwester ist einundzwanzig Jahre alt. Mein Vater ist neunundfünfzig Jahre alt.","Meine Schwester ist einundzwanzig, glaub ich — oder ist sie schon zweiundzwanzig?","My sister is twenty-one years old. My father is fifty-nine years old."),
    L("Ordinal Numbers & Dates","Write today's date and 3 important dates using ordinal numbers (der Erste, der Zweite...).","Heute ist der fünfzehnte September. Mein Geburtstag ist der dritte Mai.","Heut ist der Fünfzehnte, glaub ich — und mein Geburtstag ist am dritten Mai.","Today is the fifteenth of September. My birthday is the third of May.")
  ]},
  {lessons:[ // Day 9
    L("Telling Time","Write your daily schedule using 5 clock times in German (\"Es ist ... Uhr\").","Es ist halb neun. Ich frühstücke. Es ist Viertel nach zwölf. Ich esse zu Mittag.","Es ist halb neun, wir müssen los! — Wie spät ist es? — Kurz nach halb.","It's half past eight. I eat breakfast. It's quarter past twelve. I have lunch."),
    L("Asking About Time & Schedules","Write a short dialogue (4 lines) asking someone what time a train, meeting, or movie starts.","Wann beginnt der Film? — Um neunzehn Uhr.","Wann geht der Film los? — Um sieben, glaub ich.","When does the film start? — At seven p.m.")
  ]},
  {lessons:[ // Day 10
    L("Days, Months, Seasons","List the 7 days and 12 months in German, then write which season you like best and why.","Mein Lieblingsmonat ist Juli, im Sommer, weil es warm ist.","Ich mag den Sommer am liebsten, im Juli ist's einfach am schönsten.","My favorite month is July, in summer, because it's warm.")
  ]},
  {lessons:[ // Day 11
    L("Daily Routine (Separable Verbs)","Write 8 sentences describing your typical day using separable verbs (aufstehen, anziehen, fernsehen...).","Ich stehe um sieben Uhr auf. Ich ziehe mich an. Abends sehe ich fern.","Ich steh um sieben auf, zieh mich schnell an, und abends häng ich vorm Fernseher.","I get up at seven o'clock. I get dressed. In the evening I watch TV."),
    L("More Separable Verbs","Write 5 more sentences about your week using einkaufen, anrufen, aufräumen, einschlafen.","Ich kaufe samstags ein. Ich rufe meine Mutter an.","Ich kauf immer samstags ein, und ruf danach meine Mama an.","I go shopping on Saturdays. I call my mother.")
  ]},
  {lessons:[ // Day 12
    L("Food & Drink Vocabulary","Write a shopping list of 10 foods with their articles, plus one sentence about your favorite meal.","der Reis, die Milch, das Brot. Ich esse gern Nudeln mit Tomatensoße.","Ich hab total Bock auf Nudeln mit Tomatensoße heute Abend.","the rice, the milk, the bread. I like eating pasta with tomato sauce."),
    L("Asking for Quantities at the Market","Write a short dialogue buying groceries, asking for specific amounts (ein Kilo, ein Liter, ein Stück).","Ich hätte gern ein Kilo Äpfel und einen Liter Milch.","Ich brauch noch n Kilo Äpfel und n bisschen Milch.","I'd like a kilo of apples and a liter of milk.")
  ]},
  {lessons:[ // Day 13
    L("At the Restaurant","Write a short dialogue (at least 6 lines) ordering food at a restaurant.","Guten Tag! Ich möchte bitte einen Kaffee und ein Stück Kuchen. — Gerne, sonst noch etwas?","Für mich bitte 'nen Kaffee und n Stück Kuchen. — Kommt sofort! — Super, danke.","Hello! I'd like a coffee and a piece of cake, please. — Sure, anything else?")
  ]},
  {lessons:[ // Day 14
    L("Akkusativ Case","Rewrite 8 sentences putting the direct object into the Akkusativ (den / einen / eine / ein).","Ich sehe den Mann. Ich kaufe einen Apfel. Ich habe eine Katze.","Ich hol mir noch schnell nen Apfel, ich hab nämlich voll Hunger.","I see the man. I buy an apple. I have a cat."),
    L("Dativ Case Basics","Write 6 sentences using dative pronouns (mir, dir, ihm, ihr, uns) — e.g. \"Das gefällt mir.\"","Das Buch gehört mir. Er hilft ihr. Das gefällt mir sehr.","Das gefällt mir echt gut, ehrlich.","The book belongs to me. He helps her. I like that a lot.")
  ]},
  {lessons:[ // Day 15
    L("Shopping & Clothes","Describe an outfit you're wearing today using at least 6 clothing words and colors.","Ich trage eine blaue Jacke, ein weißes T-Shirt und schwarze Schuhe.","Ich hab heute meine blaue Jacke an und die schwarzen Schuhe von letzter Woche.","I'm wearing a blue jacket, a white T-shirt, and black shoes."),
    L("Colors, Sizes & Prices","Write a short shopping dialogue asking about the size and price of a piece of clothing.","Haben Sie das in Größe M? Was kostet das?","Habt ihr das noch in M? Und was kostet's?","Do you have that in size M? How much does it cost?")
  ]},
  {lessons:[ // Day 16
    L("Modal Verbs: können, müssen, wollen","Write 6 sentences (two per verb) about things you can, must, and want to do.","Ich muss heute lernen. Ich will Deutsch sprechen. Ich kann gut kochen.","Ich muss heut echt noch lernen, aber ich hab eigentlich keinen Bock.","I have to study today. I want to speak German. I can cook well.")
  ]},
  {lessons:[ // Day 17
    L("The Weather","Describe the weather for each day of this week in German.","Heute ist es sonnig und warm. Morgen regnet es und es ist windig.","Heute ist's richtig schön warm, aber morgen soll's angeblich wieder regnen.","Today it's sunny and warm. Tomorrow it will rain and it's windy."),
    L("Talking About Weather Naturally","Write a short weather small-talk dialogue (4–5 lines) as you'd have with a neighbor.","Schönes Wetter heute, nicht wahr? — Ja, endlich mal Sonne!","Endlich mal schönes Wetter, oder? — Ja, wurde auch Zeit!","Nice weather today, isn't it? — Yes, finally some sun!")
  ]},
  {lessons:[ // Day 18
    L("Directions & Prepositions","Write directions from your home to the nearest supermarket using links, rechts, geradeaus.","Gehen Sie geradeaus, dann links. Der Supermarkt ist neben der Bank.","Einfach geradeaus, dann links, das ist gleich neben der Bank — nicht zu verfehlen.","Go straight ahead, then left. The supermarket is next to the bank."),
    L("Understanding Directions Given to You","Write directions someone might give you, then repeat them back in your own words to check you understood.","Gehen Sie zuerst rechts, dann die zweite Straße links.","Erst rechts, dann die zweite links — hab ich's richtig verstanden?","First go right, then take the second street on the left.")
  ]},
  {lessons:[ // Day 19
    L("Places in the City","List 10 places in a city with their articles and one sentence for each about what you do there.","In der Bibliothek lese ich Bücher. Im Park spiele ich Fußball.","Wir treffen uns im Park, ja? Da spielen wir immer Fußball.","In the library I read books. In the park I play soccer.")
  ]},
  {lessons:[ // Day 20
    L("Past Tense — Perfekt (basics)","Write 6 sentences about yesterday using the Perfekt tense with haben or sein.","Ich habe gestern Deutsch gelernt. Ich bin ins Kino gegangen.","Ich hab gestern noch Deutsch gelernt und bin dann ins Kino gegangen.","I studied German yesterday. I went to the cinema."),
    L("Perfekt: haben vs. sein Verbs","Sort 8 verbs into \"takes haben\" or \"takes sein\" in the Perfekt, then write one sentence with each group.","Ich habe gegessen (haben). Ich bin gefahren (sein).","Ich hab gestern echt viel gegessen, und bin dann früh ins Bett.","I ate (with haben). I traveled/drove (with sein).")
  ]},
  {lessons:[ // Day 21
    L("Hobbies & Free Time","Write a paragraph (5–6 sentences) about your hobbies and how often you do them.","Ich spiele gern Fußball. Ich mache das zweimal pro Woche. Ich lese auch gern.","Ich zock gern und spiel zweimal die Woche Fußball, sonst chill ich meistens.","I like playing soccer. I do that twice a week. I also like reading.")
  ]},
  {lessons:[ // Day 22
    L("Making Plans & Invitations","Write a short dialogue inviting a friend to do something this weekend.","Hast du am Samstag Zeit? — Ja, warum? — Wollen wir ins Kino gehen?","Hast du Samstag Bock auf Kino? — Klar, bin dabei!","Do you have time on Saturday? — Yes, why? — Shall we go to the cinema?"),
    L("On the Phone: Making Plans","Write a short phone-call dialogue (6+ lines) confirming a time and place to meet up.","Hallo, hier ist Anna. Treffen wir uns um drei? — Ja, gerne, am Bahnhof?","Hey, hier Anna! Treffen wir uns um drei? — Klar, am Bahnhof, wie immer?","Hello, this is Anna. Shall we meet at three? — Yes, sure, at the station?")
  ]},
  {lessons:[ // Day 23
    L("The Body & Health","Label 10 body parts, then write 3 sentences about how you feel today (\"Mir tut ... weh\").","der Kopf, der Arm, das Bein. Mir tut der Kopf weh. Ich bin ein bisschen krank.","Mir tut voll der Kopf weh, ich glaub ich werd krank.","the head, the arm, the leg. My head hurts. I'm a little sick."),
    L("Talking About Feelings & Emotions","Write 6 sentences describing how you feel in different situations (froh, traurig, nervös, aufgeregt).","Ich bin heute sehr froh. Ich war gestern ein bisschen nervös.","Ich bin heut mega gut drauf, ehrlich.","I'm very happy today. I was a little nervous yesterday.")
  ]},
  {lessons:[ // Day 24
    L("At the Doctor's","Write a short dialogue at the doctor's office describing your symptoms.","Ich habe Fieber und Halsschmerzen. — Seit wann haben Sie das?","Ich hab seit gestern Fieber und mir tut voll der Hals weh.","I have a fever and a sore throat. — Since when have you had that?")
  ]},
  {lessons:[ // Day 25
    L("Comparisons (Adjectives)","Write 6 comparative sentences comparing things around you.","Berlin ist größer als München. Mein Bruder ist am größten in der Familie.","Berlin ist schon viel größer als München, find ich.","Berlin is bigger than Munich. My brother is the tallest in the family."),
    L("Superlatives","Write 5 superlative sentences about people or places you know (am größten, am besten, am schönsten).","Mein Bruder ist am größten in der Familie. Berlin ist am schönsten im Sommer.","Mein Bruder ist eindeutig der Größte von uns allen.","My brother is the tallest in the family. Berlin is most beautiful in summer.")
  ]},
  {lessons:[ // Day 26
    L("Housing & Furniture","Describe your home or room, listing at least 8 furniture items with their articles.","In meinem Zimmer gibt es ein Bett, einen Schrank und einen Schreibtisch.","Meine Bude ist klein, aber ich hab n Bett, n Schrank und n Schreibtisch — reicht mir.","In my room there is a bed, a wardrobe, and a desk.")
  ]},
  {lessons:[ // Day 27
    L("Public Transport & Travel","Write a dialogue buying a train ticket and asking about departure times.","Wann fährt der nächste Zug nach Berlin? — Um 14 Uhr, Gleis 5.","Wann geht der nächste Zug nach Berlin? — Um zwei, Gleis fünf, beeil dich!","When does the next train to Berlin leave? — At 2 p.m., platform 5."),
    L("Travel Vocabulary & Booking","Write a short dialogue booking a hotel room or asking about a travel connection.","Ich möchte ein Einzelzimmer für zwei Nächte buchen.","Ich brauch n Einzelzimmer für zwei Nächte, geht das?","I'd like to book a single room for two nights.")
  ]},
  {lessons:[ // Day 28
    L("Negation: nicht / kein","Write 8 sentences using nicht and kein correctly.","Ich habe kein Auto. Ich trinke nicht gern Kaffee. Das ist nicht richtig.","Ich hab kein Auto, deshalb nehm ich meistens den Bus. — Echt nicht? Krass.","I don't have a car. I don't like drinking coffee. That's not right."),
    L("Connecting Ideas: weil & dass","Write 5 sentences giving reasons with weil and 5 opinions with dass (verb goes to the end).","Ich lerne Deutsch, weil ich nach Berlin ziehen möchte. Ich glaube, dass Deutsch schwer ist.","Ich lern Deutsch, weil ich unbedingt nach Berlin will.","I'm learning German because I want to move to Berlin. I think that German is hard.")
  ]},
  {lessons:[ // Day 29
    L("Question Words Review","Write one question for every question word (wer, was, wann, wo, warum, wie, wie viel) and answer it.","Wo wohnst du? — Ich wohne in Berlin. Warum lernst du Deutsch? — Weil ich nach Deutschland ziehe.","Wo wohnst du eigentlich? — In Berlin. — Ah cool, wieso lernst du dann Deutsch, kannst du's nicht schon?","Where do you live? — I live in Berlin. Why are you learning German? — Because I'm moving to Germany."),
    L("Giving Commands: the Imperative","Write 5 imperative sentences (informal and formal) you might use at home or work.","Mach das Fenster zu! Setzen Sie sich bitte.","Mach mal das Fenster zu, mir ist kalt.","Close the window! Please sit down (formal).")
  ]},
  {lessons:[ // Day 30
    L("Full A1 Self-Review","Write a 10-sentence self-introduction combining everything: name, family, job/studies, hobbies, daily routine, and one sentence in the past tense.","Ich heiße ... und komme aus ... Ich bin Student und lerne seit 30 Tagen Deutsch. Gestern habe ich viel gelernt.","Ich bin ... und komm aus ... Ich studier gerade und lern jetzt seit 30 Tagen Deutsch. Gestern hab ich echt viel gelernt, war anstrengend!","My name is ... and I come from ... I'm a student and have been learning German for 30 days. Yesterday I studied a lot."),
    L("Write a Short Formal Message","Write a short formal email or postcard (6–8 sentences) introducing yourself and making a simple request — a real Goethe/telc A1 writing-task format.","Sehr geehrte Damen und Herren, mein Name ist ... Ich möchte gern einen Termin vereinbaren. Mit freundlichen Grüßen, ...","Hi, ich bin's — wollte nur kurz fragen, ob wir nen Termin ausmachen können. Danke schon mal!","Dear Sir or Madam, my name is ... I would like to arrange an appointment. Kind regards, ...")
  ]}
];

/* ---- 60-day A2 curriculum (Days 31-90), now fully written.
   Days 31-50: Präteritum, Perfekt review, Genitiv, adjective endings,
   reflexive verbs, subordinate/relative clauses, indirect questions,
   Futur I, Passiv, Konjunktiv II basics, office German (calls/emails/
   invoices/complaints).
   Days 51-90: verb+preposition combos & da-/wo-compounds, deeper
   Wechselpräpositionen and Genitiv prepositions, opinions/preferences/
   advice/personality, German bureaucracy (Bürgeramt, Finanzamt, bank,
   Krankenkasse, Mietvertrag), storytelling & picture description,
   small talk for meeting the in-laws, hypotheticals & indirect speech,
   more office German (meetings, follow-up emails, phone messages,
   presentations), job-ad vocabulary and interview strengths, everyday
   idioms, and a full grammar review ending in a Goethe/telc A2-style
   writing checkpoint — this is the complete on-ramp into B1. ---- */
const GERMAN_DAYS_A2 = [
  {lessons:[ // Day 31
    L("Präteritum: sein, haben & Modal Verbs","Rewrite 8 sentences about your childhood or last year using war, hatte, konnte, musste, wollte.","Ich war letztes Jahr in Berlin. Ich hatte keine Zeit. Ich musste viel arbeiten.","Ich war letztes Jahr in Berlin, hatte aber kaum Zeit — musste die ganze Zeit arbeiten.","I was in Berlin last year. I didn't have time. I had to work a lot."),
    L("When to Use Präteritum vs. Perfekt","Write 4 sentences you'd say out loud (Perfekt) and rewrite the same 4 as you'd write them in a story or email (Präteritum).","Ich habe gestern gearbeitet. → Ich arbeitete gestern viel.","Ich hab gestern echt viel gearbeitet, war stressig.","I worked yesterday. → I worked a lot yesterday.")
  ]},
  {lessons:[ // Day 32
    L("Perfekt Review: Irregular Participles","Write 10 sentences about last week, using 10 different irregular past participles (gegangen, gesehen, genommen, geschrieben...).","Ich bin ins Büro gegangen. Ich habe einen Brief geschrieben. Ich habe das Formular genommen.","Ich bin heut ins Büro gegangen und hab noch schnell nen Brief geschrieben.","I went to the office. I wrote a letter. I took the form.")
  ]},
  {lessons:[ // Day 33
    L("Genitiv Case Basics","Write 6 sentences showing possession with the genitive (des Mannes, der Frau, meines Bruders).","Das Büro des Chefs ist im ersten Stock. Die Tasche meiner Kollegin ist neu.","Das ist glaub ich der Schreibtisch von unserem Chef.","The boss's office is on the first floor. My colleague's bag is new."),
    L("Genitiv vs. \"von\" in Spoken German","Rewrite 5 genitive sentences the way Germans actually say them in speech, using von + Dativ.","Das Auto meines Vaters ist rot. → formal genitive.","Das Auto von meinem Vater ist rot. — so sagt man das eigentlich meistens.","My father's car is red. → formal genitive.")
  ]},
  {lessons:[ // Day 34
    L("Adjective Endings after der/die/das","Write 8 sentences describing things using adjectives after definite articles (der große Tisch, die neue Kollegin).","Der neue Kollege ist sehr freundlich. Ich mag die große Küche im Büro.","Der Neue ist echt nett, hab ich gemerkt.","The new colleague is very friendly. I like the big kitchen in the office."),
    L("Adjective Endings after ein/kein/mein","Rewrite the same 8 ideas using indefinite/possessive articles instead (ein großer Tisch, meine neue Kollegin).","Das ist ein großer Tisch. Meine neue Kollegin heißt Julia.","Wir haben n großen Tisch bekommen fürs neue Büro.","That is a big table. My new colleague is called Julia.")
  ]},
  {lessons:[ // Day 35
    L("Adjective Endings with No Article","Write 5 sentences describing general things with no article at all (kalter Kaffee, frische Luft).","Ich trinke gern starken Kaffee. Frisches Obst ist gesund.","Ich brauch jetzt echt n starken Kaffee.","I like drinking strong coffee. Fresh fruit is healthy.")
  ]},
  {lessons:[ // Day 36
    L("Reflexive Verbs (Akkusativ)","Write 6 sentences about your daily routine using reflexive verbs (sich freuen, sich setzen, sich beeilen, sich erinnern).","Ich freue mich auf das Wochenende. Ich muss mich beeilen.","Ich freu mich schon voll aufs Wochenende, ehrlich.","I'm looking forward to the weekend. I have to hurry."),
    L("Reflexive Verbs (Dativ)","Write 4 sentences using dative reflexive verbs (sich etwas vorstellen, sich die Zähne putzen).","Ich kann mir das gut vorstellen. Ich putze mir jeden Morgen die Zähne.","Kann ich mir gut vorstellen, ehrlich gesagt.","I can well imagine that. I brush my teeth every morning.")
  ]},
  {lessons:[ // Day 37
    L("Subordinate Clauses: obwohl, wenn, als","Write 6 sentences using obwohl (although), wenn (if/whenever), and als (when, single past event).","Obwohl es regnete, sind wir spazieren gegangen. Als ich jung war, wollte ich Lehrerin werden.","Wir sind trotzdem raus, obwohl's geregnet hat.","Although it was raining, we went for a walk. When I was young, I wanted to be a teacher.")
  ]},
  {lessons:[ // Day 38
    L("Relative Clauses (Nominativ & Akkusativ)","Write 6 sentences describing people or things using der/die/das as relative pronouns.","Das ist die Kollegin, die im ersten Stock arbeitet. Der Bericht, den ich schreibe, ist fast fertig.","Das ist die Kollegin, die immer so früh kommt.","That's the colleague who works on the first floor. The report I'm writing is almost finished."),
    L("Relative Clauses (Dativ)","Write 4 sentences using dative relative pronouns (dem, der, denen).","Das ist der Kollege, dem ich geholfen habe. Die Leute, denen ich vertraue, sind wenige.","Das ist der Typ, dem ich neulich geholfen hab.","That's the colleague I helped. The people I trust are few.")
  ]},
  {lessons:[ // Day 39
    L("Indirect Questions","Rewrite 6 direct questions as indirect ones using ob or a question word (Weißt du, ob...? / Ich weiß nicht, wann...).","Weißt du, ob das Büro heute offen ist? Ich weiß nicht, wann die Besprechung anfängt.","Weißt du zufällig, ob das Büro heut offen hat?","Do you know if the office is open today? I don't know when the meeting starts."),
    L("Comparisons Review (A2 depth)","Write 5 sentences comparing two work situations, using je... desto (the more... the more).","Je mehr ich übe, desto besser spreche ich Deutsch.","Je mehr ich übe, umso besser wird's, ganz ehrlich.","The more I practice, the better I speak German.")
  ]},
  {lessons:[ // Day 40
    L("Office & Ausbildung Vocabulary I","Write 10 sentences using office vocabulary: die Rechnung, der Beleg, die Buchhaltung, der Auftrag, die Abteilung.","Ich bearbeite heute die Rechnungen. Die Buchhaltung braucht den Beleg bis Freitag.","Ich muss heut noch die Rechnungen fertig machen, sonst gibt's Stress.","I'm working on the invoices today. Accounting needs the receipt by Friday."),
    L("A2 Checkpoint: Talking About Your Goals","Write a short paragraph (6-8 sentences) explaining why you want to do an Ausbildung in accounting, using Perfekt, Präteritum, and at least one relative clause.","Ich habe schon immer gern mit Zahlen gearbeitet. Letztes Jahr habe ich beschlossen, dass ich eine Ausbildung machen möchte, die zu mir passt.","Ich wollt schon immer irgendwas mit Zahlen machen, deshalb mach ich jetzt die Ausbildung.","I've always liked working with numbers. Last year I decided I wanted to do an apprenticeship that suits me.")
  ]},
  {lessons:[ // Day 41
    L("Futur I: werden + Infinitiv","Write 6 sentences about your plans for next year using werden (e.g. \"Ich werde eine Ausbildung machen\").","Ich werde nächstes Jahr eine Ausbildung in Buchhaltung beginnen. Ich werde jeden Tag Deutsch lernen.","Ich mach nächstes Jahr die Ausbildung, das steht schon fest.","I'll start an apprenticeship in accounting next year. I'll learn German every day."),
    L("Future: werden vs. Present Tense","Rewrite 5 of your Futur I sentences the way Germans usually say them instead — present tense + time word.","Ich werde morgen anrufen. → Ich rufe morgen an.","Ich ruf morgen einfach an, kein Ding.","I'll call tomorrow. → I'm calling tomorrow.")
  ]},
  {lessons:[ // Day 42
    L("Passive Voice: Present Tense","Write 6 sentences describing office processes in the passive (werden + Partizip II) — e.g. \"Die Rechnung wird geprüft.\"","Die Rechnung wird von der Buchhaltung geprüft. Die Formulare werden jeden Montag verschickt.","Die Rechnung wird grad geprüft, dauert noch n bisschen.","The invoice is checked by accounting. The forms are sent out every Monday."),
    L("Passive Voice: Past Tense (wurde)","Write 4 sentences about something that was done, using wurde + Partizip II.","Der Auftrag wurde gestern bearbeitet. Die E-Mail wurde schon beantwortet.","Der Auftrag wurde schon erledigt, keine Sorge.","The order was processed yesterday. The email has already been answered.")
  ]},
  {lessons:[ // Day 43
    L("Konjunktiv II: würde + Infinitiv","Write 6 polite requests or hypothetical sentences using würde (e.g. \"Ich würde gern...\", \"Würden Sie...?\").","Ich würde gern einen Termin vereinbaren. Würden Sie mir bitte helfen?","Würdest du mir kurz helfen? Das wär echt nett.","I would like to make an appointment. Would you please help me?"),
    L("Konjunktiv II: hätte & wäre","Write 4 sentences about how things would be different, using hätte gern or wäre.","Ich hätte gern mehr Zeit. Das wäre eine gute Lösung.","Wär schon cool, wenn ich mehr Zeit hätte, ehrlich.","I would like more time. That would be a good solution.")
  ]},
  {lessons:[ // Day 44
    L("dass-Sätze vs. Infinitiv mit zu","Write 4 pairs of sentences: one with dass, one rephrased with um...zu or ohne...zu.","Ich lerne Deutsch, um die Ausbildung zu bekommen. Ich glaube, dass ich das schaffe.","Ich lern Deutsch, um die Ausbildung zu kriegen, ganz einfach.","I'm learning German to get the apprenticeship. I believe that I can manage it.")
  ]},
  {lessons:[ // Day 45
    L("Doppelkonjunktionen","Write 6 sentences using sowohl...als auch, entweder...oder, and weder...noch.","Ich spreche sowohl Deutsch als auch Englisch. Ich habe weder Zeit noch Geld dafür.","Ich sprech sowohl Deutsch als auch Englisch, geht schon ganz gut.","I speak both German and English. I have neither the time nor the money for that.")
  ]},
  {lessons:[ // Day 46
    L("Wechselpräpositionen Review (in, an, auf)","Write 8 sentences showing the difference between location (Dativ) and movement (Akkusativ) with in, an, auf.","Ich lege den Beleg auf den Tisch. Der Beleg liegt auf dem Tisch.","Ich leg den Beleg einfach auf'n Tisch, findest du dann.","I put the receipt on the table. The receipt is lying on the table.")
  ]},
  {lessons:[ // Day 47
    L("Telefonate im Büro","Write a formal business phone call (8+ lines): answering, stating your name/company, asking how you can help.","Guten Tag, hier ist [Name] von der Firma Müller. Wie kann ich Ihnen helfen?","Hallo, hier [Name] von Müller — wie kann ich helfen?","Hello, this is [Name] from Müller & Co. How can I help you?"),
    L("Formelle E-Mails schreiben","Write a formal business email (6-8 sentences) requesting information or confirming an appointment, with proper Anrede and Grußformel.","Sehr geehrte Frau Schmidt, ich schreibe Ihnen bezüglich... Mit freundlichen Grüßen","Hi Frau Schmidt, kurze Frage wegen...","Dear Mrs. Schmidt, I am writing to you regarding... Kind regards")
  ]},
  {lessons:[ // Day 48
    L("Rechnungen & Zahlen im Detail","Write 6 sentences with invoice details: amounts, due dates, invoice numbers, spelled out in German.","Die Rechnungsnummer ist 4521. Der Betrag beträgt 350 Euro und ist bis zum 15. Mai fällig.","Die Rechnung ist über 350 Euro und muss bis zum 15. bezahlt werden.","The invoice number is 4521. The amount is 350 euros and is due on May 15th.")
  ]},
  {lessons:[ // Day 49
    L("Höflich reklamieren","Write a polite complaint (6+ lines) about a mistake or delay, using Konjunktiv II to stay formal.","Es wäre schön, wenn Sie das so schnell wie möglich korrigieren könnten. Das wäre sehr hilfreich.","Wär echt nett, wenn ihr das schnell fixen könntet.","It would be nice if you could correct that as soon as possible. That would be very helpful.")
  ]},
  {lessons:[ // Day 50
    L("A2 Checkpoint: Bewerbungsgespräch","Write out full answers (2-3 sentences each) to 4 common interview questions: Warum diese Ausbildung? Was sind Ihre Stärken? Warum sollten wir Sie nehmen? Haben Sie Fragen?","Ich möchte diese Ausbildung machen, weil ich gerne mit Zahlen arbeite und sehr organisiert bin. Meine größte Stärke ist meine Sorgfalt.","Ich mach die Ausbildung gern, weil ich echt gut mit Zahlen bin und immer organisiert.","I want to do this apprenticeship because I like working with numbers and I'm very organized. My greatest strength is my thoroughness."),
    L("A2 Grammar Review","Pick 5 grammar points from Days 31-49 that felt hardest and write one fresh example sentence for each, from memory.","Review sentence using your weakest point, written without looking at the answer key.","Same, but how you'd actually say it out loud.")
  ]},
  {lessons:[ // Day 51
    L("Verben mit Präpositionen I (warten auf, denken an, sich freuen auf)","Write 6 sentences using warten auf, denken an, and sich freuen auf with the correct Akkusativ case.","Ich warte auf den Bus. Ich denke oft an meine Familie. Ich freue mich auf das Wochenende.","Ich warte schon ewig auf den Bus, echt nervig.","I'm waiting for the bus. I often think of my family. I'm looking forward to the weekend."),
    L("Verben mit Präpositionen II (sich interessieren für, sich ärgern über)","Write 4 sentences about things you're interested in or annoyed by, using sich interessieren für and sich ärgern über.","Ich interessiere mich für Buchhaltung. Ich ärgere mich über den Stau.","Ich ärgere mich grad total über den Stau, ich komm zu spät.","I'm interested in accounting. The traffic jam annoys me.")
  ]},
  {lessons:[ // Day 52
    L("Verben mit Präpositionen (Dativ): helfen bei, sprechen mit, sich bedanken bei","Write 5 sentences using helfen bei, sprechen mit, and sich bedanken bei with Dativ.","Ich helfe meiner Kollegin bei der Arbeit. Ich spreche mit meinem Chef. Ich bedanke mich bei dir.","Kannst du mir kurz bei was helfen? Ich krieg das grad nicht hin.","I help my colleague with her work. I talk to my boss. I thank you."),
    L("Pronominaladverbien: da-Wörter (darauf, damit, dafür)","Rewrite 5 sentences from Days 51-52, replacing preposition + thing with a da-word (only works for things, not people).","Ich warte auf den Bus. → Ich warte darauf. Ich freue mich auf das Wochenende. → Ich freue mich darauf.","Ich freu mich schon total darauf, ehrlich.","I'm waiting for the bus. → I'm waiting for it. I'm looking forward to the weekend. → I'm looking forward to it.")
  ]},
  {lessons:[ // Day 53
    L("Fragewörter mit Präpositionen: wo-Wörter (worauf, womit, wofür)","Write 5 questions using wo-words (worauf, womit, wofür, worüber, woran) and answer each with a da-word.","Worauf wartest du? — Ich warte darauf, dass der Bus kommt. Woran denkst du? — Ich denke daran, dass ich bald frei habe.","Woran denkst du grad? — Ach, an nichts Besonderes.","What are you waiting for? — I'm waiting for the bus to come. What are you thinking about? — I'm thinking about the fact that I'll have time off soon.")
  ]},
  {lessons:[ // Day 54
    L("Wechselpräpositionen im Büro (über, unter, vor, zwischen)","Write 8 sentences using über, unter, vor, and zwischen, showing both location (Dativ) and movement (Akkusativ).","Der Ordner liegt unter dem Schreibtisch. Ich lege den Ordner unter den Schreibtisch.","Der Ordner liegt irgendwo unter dem Tisch, glaub ich.","The folder is under the desk. I put the folder under the desk.")
  ]},
  {lessons:[ // Day 55
    L("Präpositionen mit Genitiv (wegen, trotz, während, außerhalb)","Write 6 sentences using wegen, trotz, während, and außerhalb — note that wegen and trotz are very often used with Dativ in everyday spoken German too.","Wegen des Staus komme ich zu spät. Trotz des Regens gehen wir spazieren. Während der Pause esse ich meistens etwas.","Ich komm wegen dem Stau n bisschen später, sorry.","Because of the traffic jam, I'll be late. Despite the rain, we're going for a walk. During the break I usually eat something.")
  ]},
  {lessons:[ // Day 56
    L("Meinung äußern (Ich finde, dass... / Meiner Meinung nach...)","Write 5 opinions about topics you care about using Ich finde, dass..., Meiner Meinung nach, and Ich denke, dass...","Ich finde, dass Deutsch eine logische Sprache ist. Meiner Meinung nach ist Übung der beste Weg, eine Sprache zu lernen.","Ich find ehrlich, Übung bringt einfach am meisten.","I think German is a logical language. In my opinion, practice is the best way to learn a language."),
    L("Zustimmen & Widersprechen (Das stimmt / Ich sehe das anders)","Write a short dialogue (6 lines) where two people discuss a topic — one agrees, one disagrees.","Das stimmt, da hast du recht. — Hm, ich sehe das ein bisschen anders.","Stimmt schon, aber ich seh das n bisschen anders, ehrlich.","That's true, you're right about that. — Hmm, I see it a bit differently.")
  ]},
  {lessons:[ // Day 57
    L("Vorlieben ausdrücken (gern, lieber, am liebsten)","Write 6 sentences ranking your preferences using gern, lieber, and am liebsten.","Ich trinke gern Tee, aber ich trinke lieber Kaffee. Am liebsten trinke ich Kaffee mit Milch.","Am liebsten trink ich eigentlich Kaffee, ganz ehrlich.","I like drinking tea, but I prefer coffee. Most of all, I like coffee with milk.")
  ]},
  {lessons:[ // Day 58
    L("Ratschläge geben (An deiner Stelle würde ich... / Du solltest...)","Write 5 pieces of advice for a friend using An deiner Stelle würde ich..., Du solltest..., and Ich würde vorschlagen...","An deiner Stelle würde ich früher schlafen gehen. Du solltest mehr Wasser trinken.","Du solltest echt früher pennen gehen, ehrlich.","If I were you, I'd go to bed earlier. You should drink more water.")
  ]},
  {lessons:[ // Day 59
    L("Persönlichkeit beschreiben (zuverlässig, ehrgeizig, geduldig, chaotisch)","Write 8 sentences describing yourself and 3 people you know, using personality adjectives.","Ich bin sehr zuverlässig und ehrgeizig. Meine Schwester ist chaotisch, aber sehr geduldig.","Ich bin schon ziemlich zuverlässig, aber manchmal echt chaotisch, haha.","I'm very reliable and ambitious. My sister is chaotic, but very patient."),
    L("Stärken für ein Bewerbungsgespräch","Write 4 sentences describing your professional strengths, the way you'd actually say them in a job interview.","Ich bin sehr organisiert und arbeite gern genau. Ich bin außerdem teamfähig.","Ich bin schon ziemlich organisiert und arbeite echt gern im Team.","I'm very organized and like working precisely. I'm also a team player.")
  ]},
  {lessons:[ // Day 60
    L("A2 Checkpoint: Eine Person beschreiben, die ich bewundere","Write a paragraph (8-10 sentences) describing someone you admire — their personality, why you admire them, and one thing you've done together — mixing at least 3 grammar points from Days 51-59.","Meine Schwiegermutter ist eine Frau, die ich sehr bewundere. Sie ist zuverlässig, geduldig und hilft immer, wenn man sie braucht.","Meine Schwiegermutter ist echt beeindruckend, ehrlich — die hilft einfach immer.","My mother-in-law is a woman I really admire. She's reliable, patient, and always helps when needed.")
  ]},
  {lessons:[ // Day 61
    L("Beim Bürgeramt: die Anmeldung","Write a short dialogue (6+ lines) at the Bürgeramt registering your address (sich anmelden).","Guten Tag, ich möchte mich anmelden. — Haben Sie Ihren Mietvertrag und Ihren Ausweis dabei?","Ich muss mich noch anmelden, hab aber noch keinen Termin bekommen.","Hello, I'd like to register. — Do you have your rental agreement and ID with you?"),
    L("Wichtige Dokumente-Vokabular","Write 6 sentences about official documents using der Ausweis, die Meldebescheinigung, der Aufenthaltstitel, die Geburtsurkunde.","Ich brauche meine Meldebescheinigung für die Bank. Mein Aufenthaltstitel läuft nächstes Jahr ab.","Ich brauch noch die Meldebescheinigung, sonst geht bei der Bank nix.","I need my registration certificate for the bank. My residence permit expires next year.")
  ]},
  {lessons:[ // Day 62
    L("Finanzamt & Steuern Grundlagen","Write 6 sentences using die Steuer-ID, die Lohnsteuer, der Steuerberater, and die Steuererklärung.","Meine Steuer-ID steht auf dem Brief vom Finanzamt. Ich mache meine Steuererklärung jedes Jahr im März.","Ich muss dieses Jahr endlich meine Steuererklärung machen, hab's ewig aufgeschoben.","My tax ID is on the letter from the tax office. I file my tax return every March.")
  ]},
  {lessons:[ // Day 63
    L("Bankvokabular (das Konto, die Überweisung, der Kontostand)","Write a short dialogue (6+ lines) at the bank, opening an account or making a transfer.","Ich möchte gern ein Konto eröffnen. — Kein Problem, haben Sie Ihren Ausweis dabei?","Kannst du mir kurz Geld überweisen? Ich schick dir gleich meine IBAN.","I'd like to open an account. — No problem, do you have your ID with you?")
  ]},
  {lessons:[ // Day 64
    L("Krankenversicherung & Arzttermine","Write 5 sentences about health insurance and booking a doctor's appointment, using die Krankenkasse, gesetzlich versichert, der Termin.","Ich bin gesetzlich versichert. Ich brauche einen Termin beim Hausarzt.","Ich muss mir mal endlich nen Termin beim Arzt holen.","I have statutory health insurance. I need an appointment with my family doctor.")
  ]},
  {lessons:[ // Day 65
    L("Mietvertrag & Wohnen","Write 6 sentences about renting using der Mietvertrag, die Kaution, die Nebenkosten, kündigen.","Wir haben einen Mietvertrag für zwei Jahre unterschrieben. Die Kaution beträgt drei Monatsmieten.","Die Nebenkosten sind echt gestiegen dieses Jahr, krass.","We signed a two-year rental agreement. The deposit is three months' rent.")
  ]},
  {lessons:[ // Day 66
    L("A2 Checkpoint: Ein Formular verstehen & ausfüllen","Find (or imagine) a German form — Anmeldeformular, Kontoeröffnung — and write out how you'd fill in each field in full sentences, plus one question you'd ask if something is unclear.","Name: ... Vorname: ... Ich bin mir nicht sicher, was 'Familienstand' bedeutet — heißt das, ob ich verheiratet bin?","Was bedeutet 'Familienstand' nochmal? Ach so, ob ich verheiratet bin, okay.","Name: ... First name: ... I'm not sure what 'marital status' means — does that mean whether I'm married?")
  ]},
  {lessons:[ // Day 67
    L("Eine Geschichte erzählen (zuerst, dann, später, schließlich)","Write a story about your day (10+ sentences) using sequencing words and a mix of Perfekt and Präteritum.","Zuerst bin ich aufgestanden. Dann habe ich gefrühstückt. Später bin ich ins Büro gefahren. Schließlich war ich total müde.","Zuerst war ich noch total müde, aber dann ging's eigentlich ganz gut.","First I got up. Then I had breakfast. Later I drove to the office. Finally, I was totally tired.")
  ]},
  {lessons:[ // Day 68
    L("Ein Bild beschreiben (Goethe-Prüfungsformat)","Pick a real photo and describe it in 8+ sentences: Auf dem Bild sehe ich..., Im Hintergrund..., Ich glaube, dass...","Auf dem Bild sehe ich eine Familie im Park. Im Hintergrund sieht man Bäume. Ich glaube, dass es Sommer ist, weil alle kurze Ärmel tragen.","Auf dem Bild sieht man ne Familie im Park, sieht nach Sommer aus.","In the picture I see a family in the park. In the background you can see trees. I think it's summer because everyone is wearing short sleeves.")
  ]},
  {lessons:[ // Day 69
    L("Small Talk & deutsche Umgangsformen","Write a small-talk dialogue (8+ lines) as you'd have meeting your husband's family for the first time — greetings, compliments, safe topics like Wetter and Anreise.","Schön, Sie endlich kennenzulernen! — Ich freue mich auch sehr. Die Fahrt war übrigens ganz entspannt.","Schön, euch endlich kennenzulernen! — Freu mich auch total, die Fahrt war easy.","Lovely to finally meet you! — I'm very pleased too. The trip was quite relaxing, by the way."),
    L("Komplimente machen & annehmen","Write 4 compliments you might give your husband's family, and 2 polite ways to respond to a compliment given to you.","Das Essen schmeckt wirklich fantastisch! — Das freut mich sehr, danke.","Das schmeckt richtig lecker, ehrlich! — Ah, das freut mich total, danke dir.","The food tastes really fantastic! — That makes me very happy, thank you.")
  ]},
  {lessons:[ // Day 70
    L("Vergleiche im Gespräch (genauso... wie, nicht so... wie)","Write 6 sentences comparing things using genauso... wie and nicht so... wie.","Meine Schwester ist genauso groß wie ich. Der Job ist nicht so stressig wie mein letzter.","Der neue Job ist echt nicht so stressig wie der alte, Gott sei Dank.","My sister is just as tall as me. The job isn't as stressful as my last one.")
  ]},
  {lessons:[ // Day 71
    L("Pläne vs. Vorhersagen (vorhaben, planen, werden)","Write 6 sentences: 3 about concrete plans (vorhaben, planen) and 3 predictions/guesses (werden + wohl).","Ich habe vor, nächstes Jahr die Ausbildung zu beginnen. Es wird wohl bald regnen.","Ich hab eigentlich vor, nächstes Jahr mit der Ausbildung anzufangen.","I'm planning to start the apprenticeship next year. It will probably rain soon.")
  ]},
  {lessons:[ // Day 72
    L("Hoffnungen & Wünsche (Ich hoffe, dass... / Ich wünsche mir...)","Write 5 sentences about your hopes for the Ausbildung and your life in Germany.","Ich hoffe, dass ich bald einen Ausbildungsplatz finde. Ich wünsche mir, dass ich mich hier bald zu Hause fühle.","Ich hoff einfach, dass ich bald nen Platz für die Ausbildung find.","I hope I find an apprenticeship soon. I wish I felt at home here soon.")
  ]},
  {lessons:[ // Day 73
    L("Wenn-Sätze: real vs. hypothetisch","Write 4 realistic wenn-sentences (Präsens) and 4 hypothetical ones (Konjunktiv II).","Wenn ich Zeit habe, lerne ich Deutsch. Wenn ich mehr Zeit hätte, würde ich jeden Tag üben.","Wenn ich mehr Zeit hätte, würd ich echt jeden Tag üben, ehrlich.","If I have time, I learn German. If I had more time, I would practice every day.")
  ]},
  {lessons:[ // Day 74
    L("Indirekte Rede: Grundlagen (Er sagte, dass...)","Rewrite 5 things someone told you as indirect speech using dass, in normal spoken style (not the formal Konjunktiv I you see in news reports).","Mein Chef sagte, dass die Besprechung verschoben wurde.","Mein Chef meinte, die Besprechung wär verschoben — im Gespräch lässt man 'dass' oft ganz weg.","My boss said that the meeting was postponed.")
  ]},
  {lessons:[ // Day 75
    L("A2 Checkpoint: Wenn ich... (hypothetisches Schreiben)","Write a paragraph (8-10 sentences) about what you would do if you got the Ausbildung, using Konjunktiv II throughout.","Wenn ich die Ausbildung bekäme, würde ich mich sehr freuen. Ich würde hart arbeiten und viel lernen.","Wenn ich die Ausbildung krieg, würd ich mich einfach nur riesig freuen, ehrlich.","If I got the apprenticeship, I would be very happy. I would work hard and learn a lot.")
  ]},
  {lessons:[ // Day 76
    L("Büro & Team-Vokabular (die Besprechung, die Frist, die Aufgabe)","Write 8 sentences about a typical workday using die Besprechung, die Frist, die Aufgabe, der Kollege, die Abteilung.","Die Besprechung ist um zehn Uhr. Die Frist für den Bericht ist Freitag.","Die Frist ist Freitag, ich muss mich echt beeilen.","The meeting is at ten o'clock. The deadline for the report is Friday.")
  ]},
  {lessons:[ // Day 77
    L("E-Mails: Antworten & Nachfragen","Write a reply email (6-8 sentences) following up on an earlier message, using Bezug nehmend auf..., Wie besprochen..., and Ich wollte nur kurz nachfragen...","Bezug nehmend auf unser Gespräch schicke ich Ihnen die Unterlagen. Wie besprochen, ist der Termin am Montag.","Wollte nur kurz nachfragen, ob das mit Montag noch passt?","Following up on our conversation, I'm sending you the documents. As discussed, the appointment is on Monday.")
  ]},
  {lessons:[ // Day 78
    L("Telefonate II: Nachrichten weitergeben","Write a phone dialogue (8+ lines) where you take a message for a coworker and offer to pass it along.","Er ist gerade nicht am Platz. Kann ich etwas ausrichten? — Ja, bitte sagen Sie ihm, dass ich zurückrufe.","Er ist grad nicht da, soll ich was ausrichten?","He's not at his desk right now. Can I take a message? — Yes, please tell him I'll call back.")
  ]},
  {lessons:[ // Day 79
    L("Eine kurze Präsentation halten","Write a 1-minute self-presentation (10+ sentences) as you'd give on your first day of Ausbildung, using presentation phrases like Ich möchte mich kurz vorstellen... and Zusammenfassend...","Ich möchte mich kurz vorstellen: Mein Name ist... Ich komme aus... und ich freue mich sehr, hier zu sein.","Ich stell mich kurz vor: Ich bin... und komm aus..., freu mich riesig, hier zu sein.","I'd like to introduce myself briefly: my name is... I'm from... and I'm very happy to be here.")
  ]},
  {lessons:[ // Day 80
    L("A2 Checkpoint: Mock-Vorstellung","Say your Day 79 presentation out loud from memory (to your husband, or recorded), then write down 3 things you'd improve.","Ich hab beim Sprechen zu oft 'äh' gesagt. Ich sollte langsamer sprechen. Ich hab ein Wort vergessen.","Ich hab voll oft 'äh' gesagt, muss ich noch üben.","I said 'um' too often while speaking. I should speak more slowly. I forgot a word.")
  ]},
  {lessons:[ // Day 81
    L("Frühere Gewohnheiten (früher + Präteritum)","Write 6 sentences about things you used to do, using früher + Präteritum.","Früher wohnte ich bei meinen Eltern. Früher hatte ich keine Zeit zum Deutschlernen.","Früher hatt ich echt nie Zeit zum Deutschlernen, ehrlich.","I used to live with my parents. I used to have no time to learn German.")
  ]},
  {lessons:[ // Day 82
    L("Probleme & Lösungen im Büro","Write a dialogue (8+ lines) describing a problem at work and suggesting a solution.","Es gibt ein Problem mit der Rechnung. — Wie können wir das lösen? — Ich rufe den Kunden an und kläre es.","Da gibt's grad n Problem mit der Rechnung — kriegen wir aber hin.","There's a problem with the invoice. — How can we solve that? — I'll call the customer and clear it up.")
  ]},
  {lessons:[ // Day 83
    L("Um Erlaubnis bitten (Darf ich...?)","Write 5 short exchanges asking for and giving/refusing permission, using Darf ich...? and typical responses.","Darf ich früher gehen? — Ja, natürlich, kein Problem. / Nein, das geht heute leider nicht.","Darf ich heut n bisschen früher los? — Klar, passt schon.","May I leave early? — Yes, of course, no problem. / No, unfortunately that's not possible today.")
  ]},
  {lessons:[ // Day 84
    L("Sicherheit & Unsicherheit ausdrücken (bestimmt, wahrscheinlich, vielleicht)","Write 6 sentences expressing different levels of certainty about your Ausbildung plans.","Ich bekomme bestimmt eine Antwort diese Woche. Ich bin mir nicht sicher, ob das klappt.","Ich bin mir grad echt nicht sicher, ob das klappt, ehrlich.","I'll definitely get an answer this week. I'm not sure whether that will work out.")
  ]},
  {lessons:[ // Day 85
    L("Stellenanzeigen verstehen","Find a real German Ausbildung job ad (or imagine one) and write 6 sentences explaining what it requires, using Voraussetzungen, Anforderungen, Bewerbungsfrist.","Die Voraussetzung ist ein Realschulabschluss. Die Bewerbungsfrist endet am 30. November.","Die Bewerbungsfrist ist noch bis Ende November, das schaff ich locker.","The requirement is a secondary school diploma. The application deadline ends on November 30th.")
  ]},
  {lessons:[ // Day 86
    L("Stärken & Schwächen (Meine Stärke ist... / Ich arbeite daran, dass...)","Write 6 sentences about your strengths and weaknesses the way you'd present them in an interview.","Meine Stärke ist meine Genauigkeit. Ich arbeite daran, dass ich mich nicht so schnell stresse.","Meine Stärke ist auf jeden Fall, dass ich sehr genau arbeite.","My strength is my accuracy. I'm working on not stressing so quickly.")
  ]},
  {lessons:[ // Day 87
    L("A2 Checkpoint: Auf eine Stellenanzeige reagieren","Write a paragraph (8+ sentences) reacting to a job ad — what fits you, what you're unsure about, and one question you'd ask in an interview.","Die Anzeige passt gut zu mir, weil ich gern mit Zahlen arbeite. Meine Frage wäre: Wie läuft die Einarbeitung ab?","Die Anzeige passt eigentlich echt gut zu mir, find ich.","The ad suits me well because I like working with numbers. My question would be: what does the onboarding process look like?")
  ]},
  {lessons:[ // Day 88
    L("Alltägliche Redewendungen","Write 6 sentences using common idioms: Ich drück dir die Daumen, Kein Problem, Das ist mir egal, Ich habe die Nase voll, Das klappt schon, Alles klar.","Ich drück dir die Daumen für dein Gespräch! Das klappt schon, keine Sorge.","Ich drück dir die Daumen, das klappt schon!","I'm keeping my fingers crossed for your interview! It'll work out, don't worry.")
  ]},
  {lessons:[ // Day 89
    L("A2 Grammatik-Wiederholung I (Fälle & Zeiten)","Pick 4 grammar points from Days 31-88 involving cases or tenses that still feel shaky, and write one fresh sentence for each, from memory — no looking at the answer key.","Review sentence using your weakest point, written without looking at the answer key.","Same, but how you'd actually say it out loud to your husband."),
    L("A2 Grammatik-Wiederholung II (Präpositionen & Nebensätze)","Pick 4 more grammar points — prepositions, subordinate/relative clauses, adjective endings — and write one fresh sentence for each, from memory.","Review sentence using your weakest point, written without looking at the answer key.","Same, but how you'd actually say it out loud.")
  ]},
  {lessons:[ // Day 90
    L("A2 Abschluss-Checkpoint: Informelle & halbformelle E-Mail","Write two emails (6-8 sentences each) in real Goethe/telc A2 exam format: one informal to a friend about your Ausbildung search, one semi-formal to a company asking about an Ausbildung position.","Liebe Anna, ich wollte dir erzählen, dass ich mich gerade auf einen Ausbildungsplatz bewerbe. / Sehr geehrte Damen und Herren, ich interessiere mich für Ihre Ausbildungsstelle.","Hey Anna, musst wissen, ich bewerb mich grad auf ne Ausbildungsstelle!","Dear Anna, I wanted to tell you that I'm applying for an apprenticeship position. / Dear Sir or Madam, I am interested in your apprenticeship position."),
    L("A2 Abschluss: Über dich selbst sprechen (B1-Vorbereitung)","Speak out loud for 2 minutes (to your husband, or recorded) introducing yourself fully — who you are, your German journey so far, your goals — then write down 3 sentences you struggled with and fix them.","Ich heiße..., ich lerne seit 90 Tagen Deutsch, und mein Ziel ist eine Ausbildung in Buchhaltung.","Ich lern jetzt seit 90 Tagen Deutsch, mein großes Ziel ist die Ausbildung in Buchhaltung.","My name is..., I've been learning German for 90 days, and my goal is an apprenticeship in accounting.")
  ]}
];
GERMAN_DAYS.push(...GERMAN_DAYS_A2);

/* ---- 60-day B1 curriculum (Days 91-150) — "Grammar + Application-Ready".
   Days 91-100: the grammar B1 actually needs (Plusquamperfekt, nachdem/
   bevor/sobald, Passiv mit Modalverben, Funktionsverbgefüge, Nominalisierung,
   Partizipien als Adjektive, Konjunktiv I recognition).
   Days 101-105: structured argument, opinions, statistics, the complete
   formal letter.
   Days 106-135: the real unlock — Lebenslauf, Anschreiben, full mock
   interviews (including diplomatic weaknesses, salary, your own questions),
   Behördendeutsch, networking/Praktikum outreach, workplace feedback and
   difficult conversations, phone interviews, follow-ups, handling an
   Absage and accepting a Zusage.
   Days 136-150: real Goethe/telc B1 exam formats (formal letter, opinion
   piece, planning something together, a 2-minute mini-talk), full review,
   and a final checkpoint where the CV + cover letter are actually ready
   to send. ---- */
const GERMAN_DAYS_B1 = [
  {lessons:[ // Day 91
    L("Plusquamperfekt (Vorvergangenheit)","Write 5 sentences about something that had already happened before another past action, using hatte/war + Partizip II.","Ich hatte schon gegessen, bevor er ankam. Sie war schon weg, als ich anrief.","Ich hatte schon gegessen, bevor er kam, sonst hätt ich gewartet.","I had already eaten before he arrived. She had already left when I called.")
  ]},
  {lessons:[ // Day 92
    L("Nebensätze mit nachdem, bevor, sobald","Write 6 sentences using nachdem (+ Plusquamperfekt), bevor, and sobald.","Nachdem ich gegessen hatte, ging ich ins Bett. Sobald ich Zeit habe, rufe ich dich an.","Sobald ich Zeit hab, meld ich mich, versprochen.","After I had eaten, I went to bed. As soon as I have time, I'll call you.")
  ]},
  {lessons:[ // Day 93
    L("Passiv mit Modalverben (muss gemacht werden)","Write 6 sentences about office tasks that must, can, or should be done, using Modalverb + Partizip II + werden.","Die Rechnung muss heute noch bezahlt werden. Der Bericht kann morgen fertiggestellt werden.","Die Rechnung muss heut noch bezahlt werden, sonst gibt's Ärger.","The invoice still has to be paid today. The report can be finished tomorrow.")
  ]},
  {lessons:[ // Day 94
    L("Funktionsverbgefüge (zur Verfügung stellen, in Kraft treten)","Write 5 sentences using common Funktionsverbgefüge: zur Verfügung stellen, in Anspruch nehmen, in Kraft treten, Rücksicht nehmen.","Die neue Regel tritt am 1. Januar in Kraft. Ich nehme das Angebot gern in Anspruch.","Die neue Regel gilt ab Januar, glaub ich.","The new rule takes effect on January 1st. I'm happy to take advantage of the offer.")
  ]},
  {lessons:[ // Day 95
    L("B1 Checkpoint: Grammatik-Mix","Write a paragraph (8+ sentences) about a workday, using at least one Plusquamperfekt, one nachdem/bevor/sobald-clause, one Passiv-mit-Modalverb sentence, and one Funktionsverbgefüge.","Nachdem ich angekommen war, musste die Post noch bearbeitet werden. Sobald ich fertig war, trat die Mittagspause in Kraft.","Nachdem ich da war, musste ich erstmal die Post checken, dann war eh schon Mittag.","After I had arrived, the mail still had to be processed. As soon as I was done, the lunch break began.")
  ]},
  {lessons:[ // Day 96
    L("Nominalisierung (Verben zu Nomen)","Turn 6 verb phrases into nominalized noun phrases the way formal German does (die Bearbeitung, die Überprüfung).","Wir bearbeiten den Antrag. → Die Bearbeitung des Antrags dauert drei Tage.","Wir kümmern uns um den Antrag, dauert drei Tage.","We are processing the application. → Processing the application takes three days.")
  ]},
  {lessons:[ // Day 97
    L("Partizipien als Adjektive (das lachende Kind, die geschriebene E-Mail)","Write 6 sentences using Partizip I (-end) or Partizip II as an adjective before a noun.","Das lachende Kind spielt im Park. Die geschriebene E-Mail ist schon verschickt.","Die E-Mail, die ich geschrieben hab, ist schon raus.","The laughing child is playing in the park. The written email has already been sent.")
  ]},
  {lessons:[ // Day 98
    L("Erweiterte Partizipialattribute (zum Erkennen, nicht zum Sprechen)","Rewrite 4 relative clauses as extended participle phrases before the noun — this is a reading/formal-writing skill, almost nobody builds these on the fly in speech.","Der Bericht, der gestern geschrieben wurde. → Der gestern geschriebene Bericht.","Der Bericht von gestern ist fertig — so sagt man das eigentlich beim Reden.","The report that was written yesterday. → The report written yesterday.")
  ]},
  {lessons:[ // Day 99
    L("Konjunktiv I: indirekte Rede erkennen (Nachrichten)","Read or imagine 4 news-style sentences using Konjunktiv I and rewrite them as normal spoken dass-clauses — you need to recognize this from the news, not produce it yourself.","Der Sprecher sagte, die Lage sei stabil. → Der Sprecher sagte, dass die Lage stabil ist.","Der meinte einfach, die Lage ist stabil — im Alltag sagt das keiner mit 'sei'.","The spokesperson said the situation was stable. → The spokesperson said that the situation is stable.")
  ]},
  {lessons:[ // Day 100
    L("B1 Checkpoint: Formelle vs. informelle Sprache","Take 5 sentences you'd say casually and rewrite them formally — nominalization, Passiv, or Konjunktiv II for politeness — the way you'd write to your Ausbildung company.","Ich hab noch Fragen. → Ich hätte noch einige Fragen an Sie.","Ich hab noch n paar Fragen, kannst du mir kurz helfen?","I still have questions. → I would have a few questions for you.")
  ]},
  {lessons:[ // Day 101
    L("Vor- und Nachteile diskutieren","Write a pro/con paragraph (8+ sentences) about doing an Ausbildung vs. studying at university, using einerseits...andererseits, Ein Vorteil ist..., Ein Nachteil ist...","Einerseits verdient man bei einer Ausbildung schon Geld. Andererseits dauert ein Studium manchmal kürzer bis zum Abschluss.","Einerseits verdienst du direkt Geld, andererseits dauert's manchmal länger bis zum Aufstieg.","On the one hand, you already earn money with an apprenticeship. On the other hand, a degree sometimes takes less time to complete.")
  ]},
  {lessons:[ // Day 102
    L("Strukturiert argumentieren (Erstens, zweitens, außerdem, zusammenfassend)","Write a short structured opinion (8+ sentences) on a topic of your choice using erstens, zweitens, außerdem, and zusammenfassend.","Erstens ist mir wichtig, dass ich Deutsch gut lerne. Zweitens will ich Kontakte in Norddeutschland aufbauen. Zusammenfassend glaube ich, dass sich die Mühe lohnt.","Also erstens will ich echt gut Deutsch können, und zweitens will ich Leute hier im Norden kennenlernen.","First, it's important to me to learn German well. Second, I want to build connections in northern Germany. In summary, I believe the effort is worth it.")
  ]},
  {lessons:[ // Day 103
    L("Statistiken & Grafiken beschreiben","Describe an imagined chart about Ausbildung numbers in Germany (8+ sentences), using steigen, sinken, sich verdoppeln, ungefähr, ca.","Die Zahl der Ausbildungsplätze ist in den letzten Jahren leicht gestiegen. Ungefähr die Hälfte der Auszubildenden bleibt nach der Ausbildung im Betrieb.","Die Zahlen sind wohl leicht gestiegen, hab ich neulich gelesen.","The number of apprenticeship positions has risen slightly in recent years. About half of apprentices stay at the company after their training.")
  ]},
  {lessons:[ // Day 104
    L("Der formelle Brief: vollständiger Aufbau","Write a complete formal letter to a company (Absender, Datum, Betreff, Anrede, Einleitung, Hauptteil, Schluss, Grußformel) asking about an open Ausbildung position.","Sehr geehrte Damen und Herren, hiermit möchte ich mich nach freien Ausbildungsplätzen für 2027 erkundigen. Mit freundlichen Grüßen","Ich schreib denen mal ne ordentliche formelle Mail wegen der Ausbildungsplätze.","Dear Sir or Madam, I am writing to inquire about available apprenticeship positions for 2027. Kind regards")
  ]},
  {lessons:[ // Day 105
    L("B1 Checkpoint: Leserbrief oder Beschwerdebrief","Write a Leserbrief (letter to the editor) or Beschwerdebrief (complaint letter) of 10+ sentences — a real B1 exam writing task type.","Sehr geehrte Redaktion, ich habe Ihren Artikel über die Ausbildungssituation in Deutschland mit großem Interesse gelesen...","Fand den Artikel echt interessant, aber ich seh das an einer Stelle n bisschen anders.","Dear editors, I read your article about the apprenticeship situation in Germany with great interest...")
  ]},
  {lessons:[ // Day 106
    L("Der Lebenslauf: Aufbau & persönliche Daten","Write the header and Persönliche Daten section of your own tabellarischer Lebenslauf (name, address, contact, date/place of birth if you choose to include it).","Persönliche Daten — Name: ... Anschrift: ... E-Mail: ... Telefon: ...","This section is bullet-style, not full sentences — no 'natural' version needed here, just get the format right.","Personal details — Name: ... Address: ... Email: ... Phone: ...")
  ]},
  {lessons:[ // Day 107
    L("Der Lebenslauf: Bildungsweg","Write your Bildungsweg (education) section in real CV bullet style — no full sentences, just dates, institution, place.","2018–2021: Schule XY, Ort — Abschluss: ...","Bullet format again — dates first, then the institution, tightest version possible.","2018–2021: XY School, [location] — Qualification: ...")
  ]},
  {lessons:[ // Day 108
    L("Der Lebenslauf: Berufserfahrung & Praktika","Write your Berufserfahrung/Praktika section in CV bullet style, including any job, internship, or volunteer work — even short or informal ones count.","2022–2023: [Position], [Firma], [Ort] — Aufgaben: ...","Same bullet format — think in fragments, not sentences, exactly like a real CV.","2022–2023: [Position], [Company], [Location] — Duties: ...")
  ]},
  {lessons:[ // Day 109
    L("Der Lebenslauf: Kenntnisse & Fähigkeiten","Write your Kenntnisse section — language levels (Englisch: C1, Deutsch: B1), EDV/software skills, and soft skills.","Sprachen: Englisch (C1), Deutsch (B1) — EDV-Kenntnisse: MS Office, Excel — Soft Skills: teamfähig, zuverlässig, organisiert","Same bullet style — keep it scannable, this is what an HR person skims first.","Languages: English (C1), German (B1) — IT skills: MS Office, Excel — Soft skills: team player, reliable, organized")
  ]},
  {lessons:[ // Day 110
    L("B1 Checkpoint: Vollständiger Lebenslauf","Assemble your full one-page Lebenslauf draft from Days 106-109 into one clean document, in the correct order (persönliche Daten, Bildungsweg, Berufserfahrung, Kenntnisse).","A complete, real, one-page tabellarischer Lebenslauf in the standard German order.","Read it out loud once, start to finish, and see if it flows and looks professional.")
  ]},
  {lessons:[ // Day 111
    L("Das Anschreiben: Einleitung","Write a strong opening paragraph for a cover letter to an accounting Ausbildung company — where you found the ad and why you're writing.","Mit großem Interesse habe ich Ihre Stellenanzeige für eine Ausbildung zur Kauffrau für Büromanagement gelesen.","Ich hab eure Anzeige gesehen und wollte mich echt gern bei euch bewerben.","I read your job posting for an apprenticeship as an office management clerk with great interest.")
  ]},
  {lessons:[ // Day 112
    L("Das Anschreiben: Warum diese Ausbildung?","Write the paragraph explaining your motivation for this specific Ausbildung.","Schon lange interessiere ich mich für Zahlen und strukturiertes Arbeiten, deshalb ist eine Ausbildung in der Buchhaltung genau das Richtige für mich.","Ich mach das einfach super gern, mit Zahlen arbeiten und alles ordentlich halten.","I've long been interested in numbers and structured work, which is why an apprenticeship in accounting is exactly right for me.")
  ]},
  {lessons:[ // Day 113
    L("Das Anschreiben: Warum dieses Unternehmen?","Research one real detail about a company (product, values, location) and write a paragraph explaining why that company specifically appeals to you.","Besonders spricht mich an, dass Ihr Unternehmen seit vielen Jahren in Norddeutschland verwurzelt ist und großen Wert auf die Ausbildung junger Fachkräfte legt.","Mir gefällt einfach, dass die Firma schon so lange hier im Norden ist.","What particularly appeals to me is that your company has been rooted in northern Germany for many years and places great value on training young professionals.")
  ]},
  {lessons:[ // Day 114
    L("Das Anschreiben: Schluss & Grußformel","Write the closing paragraph requesting an interview, plus the correct formal sign-off.","Über die Einladung zu einem persönlichen Gespräch würde ich mich sehr freuen. Mit freundlichen Grüßen","Würd mich riesig freuen, wenn ihr mich zu nem Gespräch einladet!","I would be very happy to be invited to a personal interview. Kind regards")
  ]},
  {lessons:[ // Day 115
    L("B1 Checkpoint: Vollständiges Anschreiben","Assemble your full cover letter from Days 111-114 into one polished, complete document.","A complete Anschreiben, opening to closing, ready to send with your Lebenslauf.","Read it out loud start to finish — does it sound like you, just the formal version?")
  ]},
  {lessons:[ // Day 116
    L("Vorstellungsgespräch: typische Fragen","Write full answers to 5 more common interview questions: Erzählen Sie von sich. Warum haben Sie sich bei uns beworben? Wo sehen Sie sich in 5 Jahren?","Ich bin 24 Jahre alt, komme ursprünglich aus... und lebe jetzt mit meinem Mann in Norddeutschland. In fünf Jahren sehe ich mich als ausgebildete Fachkraft in Ihrem Unternehmen.","Ich bin 24, komm eigentlich aus..., und leb jetzt mit meinem Mann hier im Norden.","I'm 24 years old, originally from..., and now live with my husband in northern Germany. In five years, I see myself as a trained professional at your company.")
  ]},
  {lessons:[ // Day 117
    L("Über Schwächen sprechen (diplomatisch)","Write 2 diplomatic weakness answers using the Ich arbeite daran, dass... framing — a real weakness, softened professionally.","Manchmal bin ich zu perfektionistisch. Ich arbeite aber daran, Aufgaben auch mal rechtzeitig abzugeben, statt sie zu oft zu überarbeiten.","Ich bin manchmal echt zu perfektionistisch, aber daran arbeit ich schon.","Sometimes I'm too much of a perfectionist. But I'm working on submitting tasks on time instead of over-revising them.")
  ]},
  {lessons:[ // Day 118
    L("Fragen an den Arbeitgeber stellen","Write 5 good questions to ask the interviewer — about training, team structure, or the Ausbildung's daily routine.","Wie sieht die Einarbeitung in den ersten Wochen aus? Gibt es die Möglichkeit, nach der Ausbildung übernommen zu werden?","Wie läuft eigentlich die Einarbeitung so ab bei euch?","What does onboarding look like in the first few weeks? Is there a chance to be kept on after the apprenticeship?")
  ]},
  {lessons:[ // Day 119
    L("Über Gehalt & Ausbildungsvergütung sprechen","Write how you'd politely ask about, or respond to a question about, Ausbildungsvergütung (apprentice pay).","Dürfte ich fragen, wie hoch die Ausbildungsvergütung in Ihrem Unternehmen ist?","Wie viel verdient man eigentlich so während der Ausbildung bei euch?","May I ask how much the apprenticeship pay is at your company?")
  ]},
  {lessons:[ // Day 120
    L("B1 Checkpoint: Vollständiges Vorstellungsgespräch","Do a full mock interview with your husband playing the interviewer, using Days 116-119, then write 3 self-corrections about what you'd improve.","Ich hab bei der Gehaltsfrage kurz gezögert. Ich sollte meine 5-Jahres-Antwort noch etwas kürzen. Ich hab eine gute Frage vergessen zu stellen.","Bei der Gehaltsfrage hab ich echt kurz gestockt, muss ich nochmal üben.","I hesitated briefly at the salary question. I should shorten my 5-year answer a bit. I forgot to ask a good question.")
  ]},
  {lessons:[ // Day 121
    L("Behördendeutsch: offizielle Briefe verstehen","Write out 5 common official-letter phrases and what they actually mean in plain German: hiermit teilen wir Ihnen mit, bitte reichen Sie... ein, die Frist beträgt, unaufgefordert, fristgerecht.","'Bitte reichen Sie die Unterlagen fristgerecht ein' bedeutet: Schicken Sie die Unterlagen rechtzeitig, vor der Frist.","So ne Behördensprache klingt immer kompliziert, meint aber meistens was ganz Einfaches.","'Please submit the documents by the deadline' means: send the documents in time, before the deadline.")
  ]},
  {lessons:[ // Day 122
    L("Auf einen Behördenbrief antworten","Write a formal reply to an official letter requesting an additional document, in the correct register.","Sehr geehrte Damen und Herren, anbei sende ich Ihnen das angeforderte Dokument. Für Rückfragen stehe ich gerne zur Verfügung.","Ich schick denen einfach das Dokument, das die wollten, mit ner ordentlichen kurzen Mail.","Dear Sir or Madam, I am enclosing the requested document. Please don't hesitate to contact me with any questions.")
  ]},
  {lessons:[ // Day 123
    L("Networking & Karrieremessen","Write a short self-introduction (5 sentences) as you'd give at a Karrieremesse/Ausbildungsmesse booth.","Guten Tag, mein Name ist... Ich interessiere mich sehr für eine Ausbildung im kaufmännischen Bereich bei Ihnen. Dürfte ich Ihnen ein paar Fragen stellen?","Hi, ich bin..., ich interessier mich total für ne Ausbildung bei euch — darf ich kurz was fragen?","Hello, my name is... I'm very interested in a commercial apprenticeship with you. May I ask you a few questions?")
  ]},
  {lessons:[ // Day 124
    L("Praktikum anfragen (informelles Bewerbungsgespräch)","Write a short email asking a company for a Praktikum or Probearbeiten day, to get a foot in the door before applying formally.","Sehr geehrte Damen und Herren, ich würde gerne vorab einen Tag bei Ihnen hospitieren, um Ihr Unternehmen besser kennenzulernen.","Wär's vielleicht möglich, vorher mal nen Tag bei euch reinzuschnuppern?","Dear Sir or Madam, I would like to shadow a day at your company beforehand to get to know it better.")
  ]},
  {lessons:[ // Day 125
    L("B1 Checkpoint: E-Mail an eine Ausbildungsmesse-Kontaktperson","Write a follow-up email to someone you met at a career fair, referencing your conversation and asking for next steps.","Sehr geehrte Frau Krüger, es hat mich sehr gefreut, Sie auf der Ausbildungsmesse kennenzulernen. Gerne würde ich mich nun offiziell bei Ihnen bewerben.","Hat mich echt gefreut, Sie da kennenzulernen — ich würd mich jetzt gern offiziell bewerben.","Dear Mrs. Krüger, it was a pleasure meeting you at the careers fair. I would now like to officially apply to you.")
  ]},
  {lessons:[ // Day 126
    L("Feedback geben","Write 4 pieces of constructive feedback using polite structures: Mir ist aufgefallen, dass... / Vielleicht könntest du...","Mir ist aufgefallen, dass der Bericht noch ein paar Fehler hat. Vielleicht könntest du ihn nochmal durchlesen.","Ist dir aufgefallen, dass da n paar Fehler drin sind? Guck nochmal drüber, ja?","I noticed that the report still has a few mistakes. Maybe you could read through it again.")
  ]},
  {lessons:[ // Day 127
    L("Feedback annehmen","Write 3 gracious responses to receiving feedback, using structures like Danke für den Hinweis, das werde ich beachten.","Danke für den Hinweis, das werde ich beim nächsten Mal beachten. Gut, dass Sie das ansprechen.","Ah stimmt, danke, guck ich mir nochmal an.","Thanks for the tip, I'll keep that in mind next time. Good thing you brought that up.")
  ]},
  {lessons:[ // Day 128
    L("Nachfragen stellen, wenn etwas unklar ist","Write 5 polite clarifying questions for a work context, using Könnten Sie das bitte genauer erklären? and similar.","Könnten Sie mir das bitte noch einmal genauer erklären? Habe ich das richtig verstanden, dass...?","Kannst du das nochmal genauer erklären? Hab ich das grad richtig verstanden?","Could you please explain that to me again in more detail? Did I understand correctly that...?")
  ]},
  {lessons:[ // Day 129
    L("Sich für einen Fehler entschuldigen","Write 4 sentences professionally apologizing for a mistake and explaining the fix.","Es tut mir leid, dass mir dieser Fehler unterlaufen ist. Ich habe es bereits korrigiert und werde in Zukunft genauer aufpassen.","Sorry, das war mein Fehler — hab's aber schon korrigiert.","I'm sorry that this mistake happened. I've already corrected it and will pay closer attention in the future.")
  ]},
  {lessons:[ // Day 130
    L("B1 Checkpoint: Ein schwieriges Gespräch führen","Write a full dialogue (10+ lines) handling a workplace misunderstanding start to finish: clarify, apologize/explain, resolve.","Es gab wohl ein Missverständnis bei der Rechnung. — Oh, das tut mir leid, lassen Sie mich das kurz klären.","Da gab's wohl n Missverständnis — sorry, ich kläre das gleich.","There seems to have been a misunderstanding with the invoice. — Oh, I'm sorry, let me clear that up quickly.")
  ]},
  {lessons:[ // Day 131
    L("Ein Telefoninterview führen","Write out a telephone pre-screening interview dialogue (8+ lines) — a very common first step for Ausbildung applications.","Guten Tag, hier spricht... von der Firma... Haben Sie gerade kurz Zeit für ein paar Fragen?","Hi, hier ist... von der Firma, passt's grad kurz für n paar Fragen?","Hello, this is... from... Do you have a few minutes for some questions right now?")
  ]},
  {lessons:[ // Day 132
    L("Nach dem Vorstellungsgespräch nachfragen","Write a polite follow-up email sent about a week after an interview, checking on the status of your application.","Sehr geehrte Frau Bauer, ich wollte mich höflich nach dem aktuellen Stand meiner Bewerbung erkundigen.","Wollt nur kurz fragen, ob's schon Neuigkeiten zu meiner Bewerbung gibt.","Dear Mrs. Bauer, I wanted to politely ask about the current status of my application.")
  ]},
  {lessons:[ // Day 133
    L("Mit einer Absage umgehen","Write a gracious reply to a rejection email, thanking them and asking for feedback, while staying fully professional.","Vielen Dank für Ihre Rückmeldung. Auch wenn ich enttäuscht bin, würde ich mich über ein kurzes Feedback sehr freuen.","Schade, aber danke fürs Feedback — vielleicht klappt's ja beim nächsten Mal.","Thank you for your reply. Even though I'm disappointed, I would really appreciate some brief feedback.")
  ]},
  {lessons:[ // Day 134
    L("Eine Zusage annehmen","Write a reply accepting an Ausbildung offer and confirming your start date.","Vielen Dank für die Zusage! Ich freue mich sehr und bestätige hiermit gerne den Ausbildungsbeginn am 1. September.","Riesigen Dank für die Zusage, ich freu mich total und bin am 1. September dabei!","Thank you very much for the offer! I'm very happy and hereby confirm the start of the apprenticeship on September 1st.")
  ]},
  {lessons:[ // Day 135
    L("B1 Checkpoint: Der ganze Bewerbungsprozess","Write a paragraph (8+ sentences) summarizing your ideal application timeline in German, from finding the ad to accepting an offer.","Zuerst suche ich passende Stellenanzeigen. Dann schreibe ich mein Anschreiben und passe meinen Lebenslauf an. Nach dem Bewerbungsgespräch hoffe ich auf eine Zusage.","Zuerst such ich mir gute Anzeigen raus, dann pass ich Anschreiben und Lebenslauf an, und dann hoff ich einfach aufs Beste.","First I look for suitable job postings. Then I write my cover letter and adjust my resume. After the interview, I hope for a job offer.")
  ]},
  {lessons:[ // Day 136
    L("B1-Prüfung: Formeller Brief (Übung)","Write a complete, timed practice formal letter to a real B1 exam prompt style (e.g. requesting information, making a complaint, or applying somewhere).","A full, exam-format formal letter — Betreff, Anrede, structured body, Grußformel.","Time yourself — 25 minutes is the real exam limit for this task.")
  ]},
  {lessons:[ // Day 137
    L("B1-Prüfung: Meinung schreiben (Forumsbeitrag)","Write a forum-post-style opinion piece (10+ sentences) on a given topic — a real B1 writing task type — stating your opinion and giving 2 reasons.","Ich finde, dass... Ein Grund dafür ist... Ein weiterer Grund ist... Zusammenfassend denke ich, dass...","This one you'd write closer to how you actually think, just a bit more organized.","I think that... One reason for this is... Another reason is... In summary, I think that...")
  ]},
  {lessons:[ // Day 138
    L("B1-Prüfung: Gemeinsam etwas planen (mündlich)","With your husband, plan something together out loud entirely in German — a trip, a party, a weekend — making suggestions and reacting to his. This is the real B1 speaking task 2 format.","Wollen wir vielleicht am Samstag etwas unternehmen? — Gute Idee, was schlägst du vor?","Hast du Bock, am Samstag was zu machen? — Klar, was schwebt dir vor?","Shall we maybe do something on Saturday? — Good idea, what do you suggest?")
  ]},
  {lessons:[ // Day 139
    L("B1-Prüfung: Über ein Thema sprechen (Kurzvortrag)","Give a structured 2-minute mini-talk (Einleitung, Hauptteil, comparing the situation in your home country, Schluss) — the real B1 speaking task 1 format.","Ich möchte heute über das Thema Arbeiten im Ausland sprechen. In meinem Heimatland ist es üblich, dass... In Deutschland dagegen...","This one's meant to sound prepared and structured, not like casual chat — practice it that way.","Today I'd like to talk about working abroad. In my home country, it's common that... In Germany, on the other hand...")
  ]},
  {lessons:[ // Day 140
    L("B1 Checkpoint: Mini-Prüfungssimulation (Schreiben)","Do one timed formal letter and one timed opinion piece back to back, then self-grade against a checklist: Anrede correct? Structure clear? Grußformel right?","Two complete, timed writing pieces, checked against real B1 exam criteria.","Read both out loud afterward — does the formal one actually sound formal?")
  ]},
  {lessons:[ // Day 141
    L("B1-Prüfung: Hör- & Lesestrategien","Practice with a real B1-level German podcast or article and write down 5 new words you picked up, each with your own example sentence.","5 new words, each with an example sentence you wrote yourself — not copied from the source.","Pick words you'd actually use, not just ones that sounded interesting.")
  ]},
  {lessons:[ // Day 142
    L("B1 Grammatik-Wiederholung I","Pick 4 grammar points from Days 91-140 that still feel shaky and write one fresh sentence for each, from memory.","Review sentence using your weakest point, written without looking at the answer key.","Same, but how you'd actually say it out loud to your husband.")
  ]},
  {lessons:[ // Day 143
    L("B1 Grammatik-Wiederholung II","Pick 4 more grammar points from Days 91-140 and write one fresh sentence for each, from memory.","Review sentence using your weakest point, written without looking at the answer key.","Same, but how you'd actually say it out loud.")
  ]},
  {lessons:[ // Day 144
    L("B1 Wortschatz-Wiederholung: Bewerbung & Büro","Review the 10 Bewerbung/Büro words you feel least confident about from Days 106-135, and write one sentence for each.","10 fresh sentences using your weakest application/office vocabulary.","Say each one out loud once you've written it.")
  ]},
  {lessons:[ // Day 145
    L("B1 Checkpoint: Finales Vorstellungsgespräch","Do your final full mock interview with your husband, start to finish — greeting, questions, your questions, goodbye — entirely in German.","A complete, unscripted mock interview, greeting to goodbye.","This is the real dress rehearsal — treat it like the actual thing.")
  ]},
  {lessons:[ // Day 146
    L("Lebenslauf & Anschreiben: letzter Feinschliff","Revise your CV and cover letter drafts from Days 110 and 115 with fresh eyes and fix at least 5 things — wording, formatting, or accuracy.","A polished, near-final Lebenslauf and Anschreiben, ready to send.","Read both out loud one more time, start to finish.")
  ]},
  {lessons:[ // Day 147
    L("B1-Prüfung: Sprechen — letzte Übung","Redo the Day 138 (planning together) and Day 139 (mini-talk) tasks, timed, and self-assess what's improved since Day 91.","Two timed speaking tasks, compared honestly against your first attempts.","Notice what's easier now than it was on Day 138 or 139.")
  ]},
  {lessons:[ // Day 148
    L("B1-Prüfung: Schreiben — letzte Übung","Redo the Day 136 (formal letter) and Day 137 (opinion piece) tasks, timed, and self-assess.","Two timed writing tasks, compared honestly against your first attempts.","Same — notice what's actually easier now.")
  ]},
  {lessons:[ // Day 149
    L("B1 Checkpoint: Selbsteinschätzung","Rate yourself 1-5 on Hören, Lesen, Schreiben, and Sprechen, and write which areas still need review before you apply and before your B2 phase begins.","Hören: 4/5. Lesen: 4/5. Schreiben: 3/5. Sprechen: 4/5. Ich möchte vor allem noch am Schreiben arbeiten.","Sprechen fühlt sich am besten an, ehrlich — Schreiben brauch ich noch n bisschen.","Listening: 4/5. Reading: 4/5. Writing: 3/5. Speaking: 4/5. I especially want to work on writing."),
  ]},
  {lessons:[ // Day 150
    L("B1 Abschluss: Bereit für die Bewerbung","Finalize your CV and cover letter from Days 146, and — for real — prepare to send your first Ausbildung application. Write 3 sentences about how it feels to do this in German.","Ich bin jetzt seit 150 Tagen dabei. Meine Bewerbung ist fertig, und ich bin bereit, sie abzuschicken. Es fühlt sich gut an, das auf Deutsch geschafft zu haben.","Ich bin jetzt seit 150 Tagen dabei, und ehrlich — die Bewerbung ist fertig, ich schick die jetzt ab.","I've been at this for 150 days now. My application is ready, and I'm prepared to send it. It feels good to have achieved that in German.")
  ]}
];
GERMAN_DAYS.push(...GERMAN_DAYS_B1);

/* ---- B2 curriculum, Part 1 (Days 151-177) — "Workplace & Everyday Fluency".
   This is 27 of the 90 B2 days (151-240), i.e. the first ~30% of the B2
   phase. Covers: Konjunktiv I (reported speech), extended participial
   phrases, Nominalstil, advanced connectors (obwohl/trotzdem/während/
   indem/sodass), Zustandspassiv, advanced Funktionsverbgefüge, real family
   conversations (conflict, decisions, parenting opinions), workplace
   communication (feedback, running a meeting, company change, conflict),
   and the first real Goethe/telc B2 exam-format tasks (complaint letter,
   pro-contra essay, graph description, discussion prep). Days 178-240
   (the remaining 70%) are the next step. ---- */
const GERMAN_DAYS_B2_PART1 = [
  {lessons:[ // Day 151
    L("Konjunktiv I: Indirekte Rede berichten","Write 5 sentences reporting what someone else said, using Konjunktiv I (er sei, sie habe, wir könnten).","Meine Kollegin sagte, sie sei mit dem Bericht fast fertig. Mein Chef meinte, wir müssten die Frist einhalten.","Meine Kollegin meinte, sie ist mit dem Bericht fast fertig, ehrlich gesagt eh klar.","My colleague said she was almost finished with the report. My boss said we had to meet the deadline.")
  ]},
  {lessons:[ // Day 152
    L("Konjunktiv I: Indirekte Fragen und Aufforderungen","Write 5 sentences reporting questions or requests someone made, using ob/W-Wort + Konjunktiv I, or sollen for reported requests.","Er fragte, ob ich am Montag Zeit hätte. Sie bat mich, ich solle die Unterlagen mitbringen.","Er hat gefragt, ob ich Montag Zeit hab, glaub ich schon.","He asked whether I had time on Monday. She asked me to bring the documents.")
  ]},
  {lessons:[ // Day 153
    L("Erweiterte Partizipialkonstruktion (das von mir geschriebene Dokument)","Write 5 sentences using an extended participial phrase before a noun, the way formal/written German often does.","Das von mir am Montag geschriebene Dokument liegt auf deinem Schreibtisch. Die von der Familie geplante Feier findet im Garten statt.","Das Dokument, das ich Montag geschrieben hab, liegt bei dir.","The document written by me on Monday is on your desk. The celebration planned by the family will take place in the garden.")
  ]},
  {lessons:[ // Day 154
    L("Nominalstil vs. Verbalstil","Take 5 casual, verb-based sentences and rewrite them in formal Nominalstil, the way an official letter or report would.","Wir prüfen den Antrag sorgfältig. → Die sorgfältige Prüfung des Antrags ist im Gange.","Wir schauen uns den Antrag grad genau an.","We are carefully reviewing the application. → The careful review of the application is underway.")
  ]},
  {lessons:[ // Day 155
    L("B2 Checkpoint: Konjunktiv I + Nominalstil","Write a paragraph (8+ sentences) reporting a work conversation using Konjunktiv I, with at least one nominalized phrase.","Mein Chef sagte, die Prüfung der Unterlagen sei fast abgeschlossen. Er meinte, wir könnten die Ergebnisse nächste Woche besprechen.","Say it out loud too — reported speech sounds stiff if you only ever write it.","My boss said the review of the documents was almost complete. He said we could discuss the results next week.")
  ]},
  {lessons:[ // Day 156
    L("Konnektoren: obwohl, trotzdem, dennoch (Gegensatz)","Write 6 sentences expressing contrast: 3 with obwohl (subordinate clause, verb last) and 3 with trotzdem/dennoch (main clause, verb second).","Obwohl ich müde war, habe ich noch gelernt. Ich war müde, trotzdem habe ich noch gelernt.","War voll müde, hab aber trotzdem noch gelernt.","Although I was tired, I still studied. I was tired; nevertheless, I still studied.")
  ]},
  {lessons:[ // Day 157
    L("Konnektoren: während, indem, sodass","Write 6 sentences: 2 with während (contrast/simultaneity), 2 with indem (means/how), 2 with sodass (result).","Während meine Schwester Ärztin ist, arbeite ich im Büro. Ich lerne Deutsch, indem ich jeden Tag ein Video anschaue. Ich habe viel geübt, sodass ich mich jetzt sicherer fühle.","Ich lern Deutsch halt einfach, indem ich jeden Tag was schau.","While my sister is a doctor, I work in an office. I learn German by watching a video every day. I've practiced a lot, so I feel more confident now.")
  ]},
  {lessons:[ // Day 158
    L("Zustandspassiv vs. Vorgangspassiv (Ergebnis vs. Vorgang)","Write 6 sentences as pairs: one Vorgangspassiv (wird gemacht — the process) and its matching Zustandspassiv (ist gemacht — the result).","Der Bericht wird gerade geschrieben. → Der Bericht ist bereits geschrieben. Die Tür wird geöffnet. → Die Tür ist geöffnet.","Der Bericht ist schon fertig, kannst ihn dir anschauen.","The report is currently being written. → The report has already been written. The door is being opened. → The door is open.")
  ]},
  {lessons:[ // Day 159
    L("Funktionsverbgefüge (fortgeschritten): Rücksprache halten, Stellung nehmen, Wert legen auf","Write 5 sentences using advanced office-German Funktionsverbgefüge: Rücksprache halten, Stellung nehmen zu, Wert legen auf, Anlass geben zu.","Ich möchte kurz Rücksprache mit dir halten. Sie legt großen Wert auf pünktliches Erscheinen.","Ich muss kurz mit dir quatschen wegen der Sache.","I'd like to briefly consult with you. She places great importance on punctuality.")
  ]},
  {lessons:[ // Day 160
    L("B2 Checkpoint: Konnektoren + Passiv + Funktionsverbgefüge","Write a paragraph (10+ sentences) about a typical workday, using at least one obwohl/trotzdem, one Zustandspassiv, and one Funktionsverbgefüge.","Obwohl der Bericht schon geschrieben ist, muss ich noch Rücksprache mit meinem Chef halten. Die Zahlen sind bereits geprüft, trotzdem lege ich Wert auf eine zweite Kontrolle.","Der Bericht ist eh fertig, muss nur noch kurz mit dem Chef quatschen.","Although the report is already written, I still need to consult with my boss. The figures have already been checked, but I still value a second check.")
  ]},
  {lessons:[ // Day 161
    L("Über Familienbeziehungen sprechen (erweiterter Wortschatz)","Write 6 sentences describing the relationships and dynamics in your family, using words like Schwiegereltern, Verwandtschaft, sich nahestehen, sich verstehen mit.","Ich stehe meiner Schwiegermutter sehr nah, obwohl wir aus unterschiedlichen Kulturen kommen. Meine Verwandtschaft trifft sich selten alle zusammen.","Ich versteh mich echt gut mit meiner Schwiegermutter, ehrlich.","I'm very close to my mother-in-law, even though we come from different cultures. My extended family rarely all meets together.")
  ]},
  {lessons:[ // Day 162
    L("Einen Familienstreit ansprechen (Konjunktiv II zur Höflichkeit)","Write a short dialogue (8+ lines) resolving a family disagreement, using Konjunktiv II to soften what you say (ich würde sagen, es wäre besser).","Ich würde sagen, wir sollten in Ruhe darüber reden. — Das wäre mir auch lieber, ich wollte dich nicht verletzen.","Lass uns einfach in Ruhe drüber reden, okay?","I'd say we should talk about it calmly. — I'd prefer that too, I didn't mean to hurt you.")
  ]},
  {lessons:[ // Day 163
    L("Eine schwierige Familienentscheidung besprechen","Write a paragraph (8+ sentences) about a difficult family decision (moving, money, an Ausbildung choice), weighing einerseits/andererseits together.","Meine Familie und ich haben lange überlegt, ob sich der Umzug wegen meiner Ausbildung lohnt. Einerseits wäre es finanziell schwierig, andererseits würde es sich langfristig auszahlen.","Wir haben ewig überlegt, ob sich der Umzug überhaupt lohnt.","My family and I thought for a long time about whether the move was worth it because of my apprenticeship. On one hand it would be financially difficult, on the other hand it would pay off in the long run.")
  ]},
  {lessons:[ // Day 164
    L("Meinungen zur Kindererziehung austauschen","Write 6 sentences giving and countering an opinion about raising children, using meiner Meinung nach, ich bin der Ansicht, dass, im Gegensatz dazu.","Meiner Meinung nach sollten Kinder früh Verantwortung übernehmen. Im Gegensatz dazu findet meine Schwester, dass man Kinder länger schützen sollte.","Ich find, Kinder sollten früh lernen, Verantwortung zu übernehmen, ehrlich.","In my opinion, children should take on responsibility early. In contrast, my sister thinks children should be protected longer.")
  ]},
  {lessons:[ // Day 165
    L("B2 Checkpoint: Familien-Diskussion (mündlich)","With your husband, discuss a family topic out loud for 3 minutes entirely in German, using at least one Konjunktiv-II softener and one opinion phrase, then write 3 sentences you'd improve.","Ich habe zu oft 'ich glaube' gesagt, statt 'meiner Meinung nach'. Ich sollte meine Sätze besser verbinden.","Ich hab voll oft nur 'ich glaub' gesagt, statt richtig 'meiner Meinung nach'.","I said 'I think' too often instead of 'in my opinion'. I should connect my sentences better.")
  ]},
  {lessons:[ // Day 166
    L("Feedback geben und annehmen (formell)","Write 6 sentences: 3 giving constructive feedback formally, 3 responding to feedback gracefully.","Mir ist aufgefallen, dass die Frist knapp verpasst wurde. Könnten wir gemeinsam überlegen, wie wir nächstes Mal früher dran sind? — Danke für den Hinweis, ich werde darauf achten.","Ist mir aufgefallen, die Frist war knapp verpasst — sollten wir mal drüber quatschen.","I noticed that the deadline was narrowly missed. Could we think together about how to be on time next time? — Thanks for the feedback, I'll keep that in mind.")
  ]},
  {lessons:[ // Day 167
    L("Ein Meeting leiten oder moderieren","Write a short script (8+ lines) opening and moderating a meeting: welcoming everyone, stating the agenda, inviting input, and wrapping up.","Ich begrüße alle herzlich und möchte kurz die Tagesordnung vorstellen. Gibt es Anmerkungen, bevor wir beginnen? Zum Abschluss fasse ich die wichtigsten Punkte zusammen.","Okay Leute, dann fangen wir an — hier die Punkte für heute.","I warmly welcome everyone and would like to briefly present the agenda. Are there any comments before we begin? To conclude, I'll summarize the key points.")
  ]},
  {lessons:[ // Day 168
    L("Über Änderungen im Unternehmen sprechen (Passiv + Nominalstil)","Write a paragraph (8+ sentences) describing a company change (new software, reorganization), using Passiv and Nominalstil.","Ab nächstem Monat wird ein neues System eingeführt. Die Einführung soll die Abläufe vereinfachen, auch wenn eine kurze Umstellungsphase erwartet wird.","Ab nächstem Monat kriegen wir n neues System, soll alles einfacher machen.","Starting next month, a new system will be introduced. The introduction is meant to simplify workflows, even though a brief transition period is expected.")
  ]},
  {lessons:[ // Day 169
    L("Konflikte am Arbeitsplatz ansprechen (diplomatisch)","Write a dialogue (10+ lines) addressing a workplace conflict diplomatically, then resolving it.","Mir ist aufgefallen, dass wir in letzter Zeit unterschiedlicher Meinung sind. Können wir das in Ruhe klären? — Ja, gerne, ich wollte das Thema auch schon ansprechen.","Wir sind grad irgendwie nicht einer Meinung, oder? Lass uns kurz reden.","I've noticed that we've had different opinions lately. Can we clear this up calmly? — Yes, gladly, I also wanted to bring this up.")
  ]},
  {lessons:[ // Day 170
    L("B2 Checkpoint: Rollenspiel Meeting","Do a full mock meeting with your husband (one moderates, one gives feedback and raises a small conflict), 5+ minutes, then write 3 self-corrections.","Ich habe zu zögerlich moderiert. Ich sollte klarer sagen, wenn ich das Wort übergebe. Ich habe eine gute Gegenfrage vergessen.","Hab irgendwie zu zaghaft moderiert, muss selbstbewusster rüberkommen.","I moderated too hesitantly. I should say more clearly when I'm handing over the floor. I forgot a good follow-up question.")
  ]},
  {lessons:[ // Day 171
    L("B2-Prüfung: Beschwerdebrief (formell, mit Nominalstil)","Write a complete, timed formal complaint letter (12+ sentences) in real B2 exam format, using Nominalstil and Konjunktiv II for politeness.","Sehr geehrte Damen und Herren, mit diesem Schreiben möchte ich auf ein Problem hinweisen, das seit einigen Wochen besteht. Ich wäre Ihnen dankbar, wenn Sie sich der Angelegenheit annehmen könnten.","This one should sound properly formal and a bit stiff — that's the point at B2.","Dear Sir or Madam, with this letter I would like to point out a problem that has existed for several weeks. I would be grateful if you could look into this matter.")
  ]},
  {lessons:[ // Day 172
    L("B2-Prüfung: Für-und-Gegen-Aufsatz (Meinungsäußerung)","Write a complete, timed pro-contra essay (12+ sentences) on a given topic: introduction, two arguments per side, personal conclusion — the real B2 writing task format.","Einerseits bringt Homeoffice mehr Flexibilität, andererseits fehlt oft der persönliche Austausch mit Kollegen. Zusammenfassend denke ich, dass eine Mischung aus beidem am sinnvollsten wäre.","Practice this one timed — 25 minutes, no looking anything up.","On one hand, working from home brings more flexibility; on the other hand, personal exchange with colleagues is often lacking. In conclusion, I think a mix of both would make the most sense.")
  ]},
  {lessons:[ // Day 173
    L("B2-Prüfung: Eine Grafik/Statistik beschreiben","Find a simple chart or statistic (about work, family, or Germany) and describe it in a structured paragraph (8+ sentences): intro, trends, a possible reason, a short conclusion — a real B2 task.","Die Grafik zeigt, wie sich die Arbeitszeit von Eltern in den letzten zehn Jahren verändert hat. Auffällig ist, dass der Anteil an Teilzeitarbeit deutlich gestiegen ist. Das könnte daran liegen, dass mehr Flexibilität gefragt ist.","This is a fixed format — Einleitung, Beschreibung, Vermutung, Schluss. Practice the structure, not just the vocabulary.","The chart shows how parents' working hours have changed over the last ten years. It's notable that the share of part-time work has clearly increased. This could be because more flexibility is in demand.")
  ]},
  {lessons:[ // Day 174
    L("B2-Prüfung: Podiumsdiskussion vorbereiten (Argumente sammeln)","Pick a debate topic and write 4 arguments for and 4 against, each with one supporting sentence — prep for the real B2 speaking task 2 (Diskussion).","Dafür spricht, dass flexible Arbeitszeiten die Motivation steigern. Dagegen spricht, dass die Erreichbarkeit im Team leiden könnte.","Just brainstorm both sides honestly, even the side you don't personally agree with.","In favor is that flexible working hours increase motivation. Against it is that team availability could suffer.")
  ]},
  {lessons:[ // Day 175
    L("B2 Checkpoint: Timed Pro-Contra-Aufsatz wiederholen","Redo Day 172's pro-contra essay on a new topic, timed (25 minutes), then self-grade: structure clear? Both sides balanced? Conclusion personal?","A complete, timed pro-contra essay, checked against real B2 exam criteria.","Read it out loud after — does it flow, or does it sound like a list?")
  ]},
  {lessons:[ // Day 176
    L("B2 Wortschatz-Wiederholung: Beruf & Familie","Review the 10 Beruf/Familie words or phrases you feel least confident about from Days 151-174, and write one fresh sentence for each.","10 fresh sentences using your weakest work/family vocabulary from this stretch.","Say each one out loud once you've written it.")
  ]},
  {lessons:[ // Day 177
    L("B2 Checkpoint: Selbsteinschätzung (Tage 151-177)","Rate yourself 1-5 on Hören, Lesen, Schreiben, and Sprechen for B2 so far, and write which areas still need review before continuing to Day 178.","Hören: 3/5. Lesen: 4/5. Schreiben: 4/5. Sprechen: 3/5. Ich möchte vor allem noch am freien Sprechen arbeiten.","Sprechen ist noch am schwersten, ehrlich — beim Schreiben fühl ich mich schon sicherer.","Listening: 3/5. Reading: 4/5. Writing: 4/5. Speaking: 3/5. I especially want to work on speaking freely.")
  ]}
];
GERMAN_DAYS.push(...GERMAN_DAYS_B2_PART1);

/* ---- B2 curriculum, Part 2 (Days 178-204) — the second 27 of the 90
   B2 days, i.e. the next ~30% of the B2 phase (30% done in Part 1, this
   brings it to 60%). Covers: Konjunktiv I der Vergangenheit (reported
   past speech), extended relative clauses (with prepositions, genitive
   dessen/deren, was/wo), more idiomatic connectors (je...desto, sofern/
   vorausgesetzt/es sei denn, zumal/angesichts/ungeachtet dessen), more
   family/relationship scenarios (partnership & future plans, in-law
   conflict, parenting/education decisions, caring for aging relatives,
   friendships changing over time), workplace scenarios tied to the
   accounting Ausbildung (Buchhaltung vocabulary, talking about the
   Ausbildung itself, a mock job interview, talking with colleagues
   about tasks/mistakes, exam nerves), and more exam-format practice
   (Hörverstehen strategy, the B2 speaking task 1 short presentation,
   and another timed writing checkpoint). Days 205-240 (the last 40%)
   are the next step. ---- */
const GERMAN_DAYS_B2_PART2 = [
  {lessons:[ // Day 178
    L("Konjunktiv I der Vergangenheit (reguläre Verben)","Write 5 sentences reporting what someone said about the past, using Konjunktiv I der Vergangenheit (er habe gemacht, sie sei gegangen).","Meine Kollegin sagte, sie habe das Projekt letzte Woche abgeschlossen. Er meinte, er sei extra früher gekommen.","Meine Kollegin hat gesagt, sie hat das Projekt letzte Woche fertig gemacht.","My colleague said she had finished the project last week. He said he had come earlier especially.")
  ]},
  {lessons:[ // Day 179
    L("Konjunktiv I der Vergangenheit mit Modalverben","Write 5 sentences reporting past statements that involve a modal verb (er habe gehen können, sie habe bleiben müssen).","Er sagte, er habe gestern nicht kommen können, weil er habe arbeiten müssen. Sie meinte, sie habe früher gehen dürfen.","Er hat gesagt, er konnte gestern nicht kommen, weil er arbeiten musste.","He said he hadn't been able to come yesterday because he had had to work. She said she had been allowed to leave early.")
  ]},
  {lessons:[ // Day 180
    L("B2 Checkpoint: Konjunktiv I der Vergangenheit","Write a paragraph (8+ sentences) reporting what several people told you last week, mixing regular verbs and modal verbs in Konjunktiv I der Vergangenheit.","Meine Schwester erzählte, sie sei letzten Monat umgezogen. Mein Chef meinte, er habe die Zahlen schon prüfen lassen, aber er habe noch Rückfragen gehabt.","Read it back and check: did every reported verb actually shift into the Vergangenheit form, or did some slip back into present Konjunktiv I?","My sister said she had moved last month. My boss said he'd already had the figures checked, but he'd still had questions.")
  ]},
  {lessons:[ // Day 181
    L("Relativsätze mit Präposition (mit dem, für die, auf das)","Write 6 sentences using relative clauses introduced by a preposition + relative pronoun (der Kollege, mit dem ich arbeite; die Frist, auf die wir warten).","Der Kollege, mit dem ich zusammenarbeite, ist sehr zuverlässig. Das Projekt, auf das wir so lange gewartet haben, startet endlich.","Der Kollege, mit dem ich arbeite, ist echt zuverlässig, ehrlich.","The colleague I work with is very reliable. The project we've waited for so long is finally starting.")
  ]},
  {lessons:[ // Day 182
    L("Relativsätze im Genitiv (dessen, deren)","Write 5 sentences using genitive relative pronouns dessen (masc./neut.) and deren (fem./plural) to link two ideas about ownership or belonging.","Das ist der Kunde, dessen Rechnung noch offen ist. Meine Nachbarin, deren Kinder mit meinen spielen, arbeitet auch in der Buchhaltung.","Das ist der Kunde, der noch die Rechnung offen hat, glaub ich.","That's the client whose invoice is still open. My neighbor, whose kids play with mine, also works in accounting.")
  ]},
  {lessons:[ // Day 183
    L("was und wo als Relativpronomen","Write 5 sentences using was (referring to a whole clause, alles, nichts, etwas) or wo (referring to a place or time) as a relative pronoun.","Er kam pünktlich, was mich sehr gefreut hat. Das ist die Stadt, wo ich meine Ausbildung gemacht habe.","Er kam pünktlich, das hat mich echt gefreut, muss ich sagen.","He arrived on time, which pleased me a lot. That's the city where I did my Ausbildung.")
  ]},
  {lessons:[ // Day 184
    L("B2 Checkpoint: Erweiterte Relativsätze","Write a paragraph (8+ sentences) describing your workplace or family, using at least one prepositional relative clause, one dessen/deren, and one was/wo.","Mein Büro, in dem ich seit zwei Jahren arbeite, liegt im Zentrum. Meine Chefin, deren Geduld ich sehr schätze, hat mir viel beigebracht, was mich wirklich motiviert hat.","Read it out loud and check: does each relative pronoun actually match its case, or did you default to der/die/das everywhere?","My office, where I've worked for two years, is in the center. My boss, whose patience I really value, has taught me a lot, which really motivates me.")
  ]},
  {lessons:[ // Day 185
    L("Konnektor: je...desto / je...umso (Proportionalität)","Write 5 sentences using je...desto or je...umso to express that two things increase or decrease together.","Je mehr ich übe, desto sicherer fühle ich mich. Je früher wir anfangen, umso entspannter können wir arbeiten.","Je mehr ich übe, umso besser wird's, ganz einfach.","The more I practice, the more confident I feel. The earlier we start, the more relaxed we can work.")
  ]},
  {lessons:[ // Day 186
    L("Konnektoren: sofern, vorausgesetzt, es sei denn (Bedingung)","Write 6 sentences expressing a condition: 2 with sofern, 2 with vorausgesetzt (dass), 2 with es sei denn.","Ich komme mit, sofern ich rechtzeitig fertig bin. Ich helfe dir gern, vorausgesetzt, du hast morgen Zeit. Wir treffen uns wie geplant, es sei denn, es passiert etwas Unvorhergesehenes.","Ich komm mit, wenn ich rechtzeitig fertig bin, sonst halt nicht.","I'll come along, provided I'm finished in time. I'll gladly help you, assuming you have time tomorrow. We'll meet as planned, unless something unforeseen happens.")
  ]},
  {lessons:[ // Day 187
    L("Konnektoren: zumal, angesichts, ungeachtet dessen","Write 6 sentences: 2 with zumal (giving an extra reason), 2 with angesichts + Genitiv (in view of), 2 with ungeachtet dessen (regardless of that).","Ich war überrascht, zumal er das nie zuvor erwähnt hatte. Angesichts der knappen Frist arbeiten wir heute länger. Es gab viel Kritik; ungeachtet dessen hat sie an ihrer Entscheidung festgehalten.","War überrascht, vor allem weil er das nie erwähnt hat.","I was surprised, especially since he'd never mentioned it before. In view of the tight deadline, we're working longer today. There was a lot of criticism; regardless of that, she stuck to her decision.")
  ]},
  {lessons:[ // Day 188
    L("B2 Checkpoint: Konnektoren-Mix (Tage 156-187)","Write a paragraph (10+ sentences) about a decision at work or home, using at least four different connectors from the ones you've learned so far (obwohl, während, je...desto, sofern, zumal, angesichts, etc.).","Angesichts der aktuellen Lage haben wir uns entschieden umzustellen, zumal die alte Lösung ohnehin veraltet war. Je länger wir gewartet hätten, desto schwieriger wäre die Umstellung geworden.","Circle every connector you used and check: is the verb in the right position for that specific connector?","In view of the current situation, we decided to switch, especially since the old solution was outdated anyway. The longer we'd have waited, the harder the transition would have become.")
  ]},
  {lessons:[ // Day 189
    L("Über die Partnerschaft und gemeinsame Zukunftspläne sprechen","Write a paragraph (8+ sentences) about plans you and your husband share for the future, using Konjunktiv II for wishes and vielleicht/eventuell for open possibilities.","Wir würden gern in ein paar Jahren ein eigenes Haus haben, auch wenn das noch weit weg ist. Eventuell würden wir dafür beide etwas mehr sparen müssen.","Wir wollen halt irgendwann mal n eigenes Haus, mal schauen, wann's klappt.","We'd like to have our own house in a few years, even though that's still far off. We might both need to save a bit more for that.")
  ]},
  {lessons:[ // Day 190
    L("Konflikte mit Schwiegereltern / kulturelle Unterschiede ansprechen","Write a dialogue (10+ lines) diplomatically addressing a disagreement with in-laws that comes from cultural differences, using Konjunktiv II softeners.","Ich würde es schön finden, wenn wir das gemeinsam besprechen könnten, auch wenn wir das in meiner Familie anders machen. — Das verstehe ich, lass uns einen Kompromiss finden.","Bei uns läuft das halt anders, aber lass uns da irgendwie n Mittelweg finden.","I'd find it nice if we could discuss this together, even though we do it differently in my family. — I understand, let's find a compromise.")
  ]},
  {lessons:[ // Day 191
    L("Über Kindererziehung und Bildung entscheiden (fortgeschritten)","Write a paragraph (8+ sentences) weighing a real decision about a child's education or upbringing (school choice, language, discipline), using dessen/deren and at least one advanced connector.","Wir überlegen, welche Schule für unser Kind geeignet wäre, dessen Bedürfnisse sich ja auch noch entwickeln. Angesichts der zweisprachigen Erziehung wäre eine bilinguale Schule sinnvoll.","Überlegen grad, welche Schule am besten passt, ist ja noch nicht so einfach.","We're considering which school would suit our child, whose needs are of course still developing. In view of the bilingual upbringing, a bilingual school would make sense.")
  ]},
  {lessons:[ // Day 192
    L("Ein Gespräch über die Pflege von Angehörigen führen","Write a dialogue (8+ lines) discussing how to support an aging parent or relative, using Funktionsverbgefüge like Verantwortung übernehmen and Rücksicht nehmen.","Wir sollten gemeinsam Verantwortung übernehmen und auf ihre Bedürfnisse Rücksicht nehmen. — Ja, vielleicht sollten wir auch professionelle Hilfe in Betracht ziehen.","Müssen uns halt zusammen drum kümmern, oder? Vielleicht auch mal Hilfe holen.","We should take on responsibility together and be considerate of her needs. — Yes, maybe we should also consider professional help.")
  ]},
  {lessons:[ // Day 193
    L("Über Freundschaften und deren Wandel im Laufe der Zeit sprechen","Write a paragraph (8+ sentences) reflecting on how a friendship has changed over time, using deren/dessen and Konjunktiv I der Vergangenheit for something a friend once said.","Meine beste Freundin, deren Familie ich schon lange kenne, hat sich seit der Geburt ihres Kindes verändert. Sie sagte einmal, sie sei früher viel spontaner gewesen.","Sie hat sich einfach verändert, seit sie ihr Kind hat, das ist halt normal.","My best friend, whose family I've known for a long time, has changed since her child was born. She once said she used to be much more spontaneous.")
  ]},
  {lessons:[ // Day 194
    L("B2 Checkpoint: Familien-/Beziehungsgespräch (mündlich)","With your husband, discuss a real family or relationship topic out loud for 4+ minutes in German, using at least one Konjunktiv-II softener and one advanced connector, then write 3 self-corrections.","Ich habe wieder zu oft 'ich glaube' statt eines Konnektors benutzt. Ich sollte 'angesichts' oder 'zumal' öfter aktiv einbauen.","Hab wieder zu oft nur 'ich glaub' gesagt, statt was Richtiges wie 'angesichts dessen'.","I again used 'I think' too often instead of a connector. I should actively use 'in view of' or 'especially since' more often.")
  ]},
  {lessons:[ // Day 195
    L("B2 Checkpoint: Timed Beziehungs-Aufsatz","Write a complete, timed essay (25 minutes, 12+ sentences) about how relationships change over time, using Konjunktiv II, at least one relative clause, and one advanced connector.","Beziehungen verändern sich zwangsläufig, je länger man sich kennt, zumal sich beide Seiten im Laufe der Zeit weiterentwickeln. Eine Freundschaft, die diese Veränderung übersteht, ist meiner Meinung nach besonders wertvoll.","Time yourself strictly — 25 minutes, then stop, even mid-sentence.","Relationships inevitably change the longer you know each other, especially since both sides develop further over time. A friendship that survives this change is, in my opinion, particularly valuable.")
  ]},
  {lessons:[ // Day 196
    L("Buchhaltungsbegriffe erklären: Soll/Haben, Buchung, Bilanz","Write 6 sentences explaining basic accounting terms in German, as if to a beginner: Soll, Haben, Buchung, Bilanz, Rechnung, Beleg.","Im Soll werden die Ausgaben erfasst, im Haben die Einnahmen. Eine Bilanz zeigt, wie das Unternehmen finanziell dasteht.","Soll ist quasi, wo die Ausgaben landen, Haben, wo die Einnahmen landen, ganz easy.","Expenses are recorded on the debit side, income on the credit side. A balance sheet shows how the company stands financially.")
  ]},
  {lessons:[ // Day 197
    L("Über die eigene Ausbildung sprechen (Berichtsheft, Ausbilder, Prüfung)","Write a paragraph (8+ sentences) describing your accounting Ausbildung so far: what you've learned, your Berichtsheft, your Ausbilder, and the upcoming Prüfung.","In meiner Ausbildung zur Buchhalterin führe ich regelmäßig mein Berichtsheft, in dem ich meine Aufgaben dokumentiere. Mein Ausbilder gibt mir hilfreiches Feedback, das mich auf die Abschlussprüfung vorbereitet.","Führ halt mein Berichtsheft und mein Ausbilder gibt mir gute Tipps für die Prüfung.","In my accounting Ausbildung, I regularly keep my Berichtsheft, in which I document my tasks. My trainer gives me helpful feedback that's preparing me for the final exam.")
  ]},
  {lessons:[ // Day 198
    L("Ein Vorstellungsgespräch für die Ausbildung üben","Write a mock job-interview dialogue (10+ lines) for an accounting Ausbildung position: why this field, your strengths, a question you ask back.","Ich interessiere mich für die Buchhaltung, weil ich gern mit Zahlen und Struktur arbeite. Eine meiner Stärken ist, dass ich sehr sorgfältig arbeite. — Welche Software wird in Ihrem Betrieb hauptsächlich genutzt?","Ich mag halt Zahlen und bin ziemlich ordentlich, deswegen passt das gut.","I'm interested in accounting because I like working with numbers and structure. One of my strengths is that I work very carefully. — Which software is mainly used in your company?")
  ]},
  {lessons:[ // Day 199
    L("Mit Kollegen über Aufgaben und Fehler sprechen (diplomatisch)","Write a dialogue (10+ lines) where you point out a colleague's mistake diplomatically and discuss how to fix it together, using Konjunktiv II and Funktionsverbgefüge.","Mir ist aufgefallen, dass in dieser Buchung ein Fehler unterlaufen ist. Könnten wir gemeinsam Rücksprache halten, wie wir das korrigieren? — Danke, dass du das ansprichst, ich schaue es mir gleich an.","Ist mir aufgefallen, da ist n Fehler drin, sollten wir mal kurz drüber schauen.","I noticed a mistake crept into this entry. Could we consult together on how to correct it? — Thanks for bringing that up, I'll take a look right away.")
  ]},
  {lessons:[ // Day 200
    L("Über Prüfungsvorbereitung und Prüfungsangst sprechen","Write a paragraph (8+ sentences) about how you prepare for exams and manage nervousness, using Konjunktiv I der Vergangenheit to report advice someone once gave you.","Mein Ausbilder sagte einmal, er sei früher auch immer sehr nervös gewesen, bevor er sich einen festen Lernplan angeeignet habe. Seitdem versuche ich, jeden Abend nur eine Stunde gezielt zu wiederholen.","Mein Ausbilder meinte, er war früher auch immer voll nervös, bis er sich n Lernplan gemacht hat.","My trainer once said he used to be very nervous too, before he adopted a fixed study plan. Since then, I try to review just one hour a night, in a targeted way.")
  ]},
  {lessons:[ // Day 201
    L("B2 Checkpoint: Rollenspiel Vorstellungsgespräch (mündlich)","With your husband, act out the Day 198 job-interview dialogue out loud, 5+ minutes, then write 3 things you'd say more confidently next time.","Ich habe zu leise und zu schnell gesprochen. Ich sollte meine Stärken klarer und langsamer formulieren. Mir hat eine gute Abschlussfrage gefehlt.","Hab irgendwie zu leise und zu schnell geredet, muss lauter und ruhiger werden.","I spoke too quietly and too fast. I should state my strengths more clearly and more slowly. I was missing a good closing question.")
  ]},
  {lessons:[ // Day 202
    L("B2-Prüfung: Hörverstehen-Strategie (global, selektiv, detailliert)","Find a short German audio/podcast clip (2-4 min) and practice the real B2 listening strategy: first listen for the gist (global), then for specific facts (selektiv), then for detail — write down what you caught at each stage.","Global: Es geht um Homeoffice und Familie. Selektiv: Genannt werden Vorteile wie Flexibilität und Nachteile wie Isolation. Detail: Eine Person erwähnt konkret drei Tage pro Woche im Homeoffice.","This is a fixed strategy, not vocabulary — the point is training the three passes, not understanding every word the first time.","Global: It's about working from home and family. Selective: Advantages like flexibility and disadvantages like isolation are mentioned. Detail: One person specifically mentions three days a week working from home.")
  ]},
  {lessons:[ // Day 203
    L("B2-Prüfung: Kurzvortrag halten (Sprechen Teil 1)","Prepare and record yourself giving a short, structured 2-minute presentation (Einleitung, 2-3 Punkte, Schluss) on a given topic — the real B2 speaking task 1 format.","Heute möchte ich über die Vorteile und Nachteile von Homeoffice sprechen. Erstens ermöglicht es mehr Flexibilität, zweitens spart man Pendelzeit. Zusammenfassend überwiegen für mich die Vorteile.","Practice this timed too — 1 minute prep, 2 minutes speaking, no notes beyond a few keywords.","Today I'd like to talk about the advantages and disadvantages of working from home. First, it allows more flexibility; second, you save commuting time. In conclusion, for me the advantages outweigh the disadvantages.")
  ]},
  {lessons:[ // Day 204
    L("B2 Checkpoint: Selbsteinschätzung (Tage 178-204)","Rate yourself 1-5 on Hören, Lesen, Schreiben, and Sprechen for this stretch, and write which grammar point (Konjunktiv I Vergangenheit, Relativsätze, or Konnektoren) still needs the most review before Day 205.","Hören: 4/5. Lesen: 4/5. Schreiben: 4/5. Sprechen: 3/5. Ich möchte vor allem die Relativsätze mit Präposition noch festigen.","Sprechen ist immer noch am schwersten, aber die Relativsätze sitzen auch noch nicht ganz.","Listening: 4/5. Reading: 4/5. Writing: 4/5. Speaking: 3/5. I especially want to solidify prepositional relative clauses.")
  ]}
];
GERMAN_DAYS.push(...GERMAN_DAYS_B2_PART2);

/* ---- B2 curriculum, Part 3 (Days 205-240) — the final 40% of the B2
   phase, completing the 240-day core plan. Days 205-210 close out the
   Workplace & Everyday Fluency phase with remaining B2 grammar
   (Plusquamperfekt Passiv, subjektive Modalverben, Partizip I/II as
   adjectives, more Funktionsverbgefüge) and Ausbildung exam-prep talk.
   Days 211-240 are the dedicated Exam Prep & Mock Tests phase: strategy
   and practice for every real B2 exam part (Lesen 1-5, Hören 1-4,
   Schreiben — Brief/Aufsatz/Grafik, Sprechen — Kurzvortrag/Diskussion/
   Bildbeschreibung), a full timed mock exam split across three days,
   error-analysis, and a final self-assessment/graduation checkpoint
   looking ahead to C1. ---- */
const GERMAN_DAYS_B2_PART3 = [
  {lessons:[ // Day 205
    L("Plusquamperfekt Passiv (war gemacht worden)","Write 5 sentences describing something that had already been done before another past event, using Plusquamperfekt Passiv (war/waren + Partizip II + worden).","Das Projekt war bereits abgeschlossen worden, bevor ich in die Firma eintrat. Die Unterlagen waren schon geprüft worden, als der Chef danach fragte.","War schon alles fertig, bevor ich überhaupt angefangen hab.","The project had already been completed before I joined the company. The documents had already been checked when the boss asked about them.")
  ]},
  {lessons:[ // Day 206
    L("Subjektive Modalverben: dürfte, soll angeblich, will","Write 6 sentences expressing probability or hearsay using subjective modal verbs: dürfte (probability), soll (reportedly), will (claims to).","Er dürfte um die 40 Jahre alt sein. Sie soll früher in München gearbeitet haben. Er will das nicht gewusst haben, aber ich glaube es nicht.","Der ist bestimmt so um die 40, würd ich sagen.","He's probably around 40 years old. She reportedly used to work in Munich. He claims he didn't know, but I don't believe it.")
  ]},
  {lessons:[ // Day 207
    L("Partizip I und II als Adjektiv (fortgeschritten)","Write 6 sentences using Partizip I (die wachsende Nachfrage) and Partizip II (das gelöste Problem) as attributive adjectives before a noun.","Die stetig wachsende Nachfrage überrascht viele Experten. Das endlich gelöste Problem hatte uns wochenlang beschäftigt.","Die Nachfrage wächst halt immer weiter, echt überraschend.","The steadily growing demand surprises many experts. The finally solved problem had occupied us for weeks.")
  ]},
  {lessons:[ // Day 208
    L("Funktionsverbgefüge (fortgeschritten II): in Kraft treten, Berücksichtigung finden, zur Verfügung stellen","Write 5 sentences using in Kraft treten, Berücksichtigung finden, and zur Verfügung stellen in a workplace or official context.","Die neue Regelung tritt ab Januar in Kraft. Ihr Vorschlag hat bei der Leitung Berücksichtigung gefunden. Die Firma stellt uns ein neues Notebook zur Verfügung.","Ab Januar gilt die neue Regel, dann müssen wir uns dran halten.","The new regulation takes effect in January. Your proposal was taken into consideration by management. The company is providing us with a new laptop.")
  ]},
  {lessons:[ // Day 209
    L("Über die Abschlussprüfung der Ausbildung sprechen","Write a paragraph (8+ sentences) about preparing for the IHK Abschlussprüfung: what it covers, how you're studying, and what makes you nervous.","Die Abschlussprüfung besteht aus einem schriftlichen und einem mündlichen Teil. Ich wiederhole gerade die Themen Buchführung und Kostenrechnung, aber der mündliche Teil macht mir am meisten Sorgen.","Die Prüfung ist schriftlich und mündlich, und ehrlich, der mündliche Teil macht mir am meisten Angst.","The final exam consists of a written and an oral part. I'm currently reviewing bookkeeping and cost accounting, but the oral part worries me the most.")
  ]},
  {lessons:[ // Day 210
    L("B2 Checkpoint: Selbsteinschätzung (Tage 178-210) — Ende der Workplace-Phase","Rate yourself 1-5 on Hören, Lesen, Schreiben, and Sprechen, and write 2 sentences on how confident you feel that B2 workplace German is now solid before moving into pure exam prep.","Hören: 4/5. Lesen: 4/5. Schreiben: 4/5. Sprechen: 4/5. Ich fühle mich im Berufsalltag inzwischen ziemlich sicher, jetzt geht es nur noch um die Prüfungsform.","Fühl mich im Job-Deutsch echt schon sicher, jetzt nur noch die Prüfung an sich üben.","Listening: 4/5. Reading: 4/5. Writing: 4/5. Speaking: 4/5. I feel fairly confident in everyday workplace German now, it's really just the exam format left to practice.")
  ]},
  {lessons:[ // Day 211
    L("B2-Prüfung: Lesen Teil 1 — Globalverständnis","Read a longer article and write a one-sentence summary of its main idea, without worrying about every detail — practicing the skim-for-gist strategy for Lesen Teil 1.","Der Artikel handelt hauptsächlich davon, wie sich Homeoffice auf die Teamkultur in Unternehmen auswirkt.","Don't read word for word — skim headline, first and last sentence of each paragraph first.","The article is mainly about how working from home affects team culture in companies.")
  ]},
  {lessons:[ // Day 212
    L("B2-Prüfung: Lesen Teil 2 — Detailverständnis (Aussagen zuordnen)","Read a text and write 5 true/false statements about specific details in it, then check them against the text — practicing the statement-matching format of Lesen Teil 2.","Aussage: Die Firma hat die Umstellung ohne Probleme geschafft. → Falsch, laut Text gab es anfangs technische Schwierigkeiten.","This part rewards close reading of single sentences, not overall impressions.","Statement: The company managed the transition without problems. → False, according to the text there were initial technical difficulties.")
  ]},
  {lessons:[ // Day 213
    L("B2-Prüfung: Lesen Teil 3 — Meinungen und Standpunkte erkennen","Read an opinion piece or commentary and write down which position the author takes and 2 phrases that signal it (meiner Ansicht nach, es lässt sich nicht leugnen, dass).","Der Autor vertritt die Ansicht, dass Homeoffice langfristig die Produktivität steigert. Erkennbar ist das an Formulierungen wie 'es lässt sich nicht leugnen, dass...'.","Look for opinion-signal phrases first, then decide which side they're arguing for.","The author holds the view that working from home increases productivity in the long run. This is recognizable from phrasings like 'it cannot be denied that...'.")
  ]},
  {lessons:[ // Day 214
    L("B2-Prüfung: Lesen Teil 4/5 — Lückentext (Grammatik & Wortschatz)","Take a short text with 8 gaps and fill each one choosing between 3 similar words/grammar forms — practicing the cloze-test format that tests grammar and vocabulary precision.","Die Firma hat sich (dazu / darüber / dafür) entschieden, das Projekt zu verschieben. Trotz (des / dem / der) schlechten Wetters fand die Veranstaltung statt.","These trip people up on prepositions and case — go slowly and check each gap grammatically.","The company decided to postpone the project. Despite the bad weather, the event took place.")
  ]},
  {lessons:[ // Day 215
    L("B2 Checkpoint: Mock-Leseverstehen (komplett, zeitlich begrenzt)","Do a full timed mock Leseverstehen (all parts, ~65 minutes if you can find a practice test online, or combine this week's texts), then write 3 sentences on which part felt hardest.","Teil 3 war für mich am schwierigsten, weil die Meinungen manchmal sehr indirekt ausgedrückt wurden.","Time yourself strictly — the real exam punishes lingering on one text.","Part 3 was the hardest for me because the opinions were sometimes expressed very indirectly.")
  ]},
  {lessons:[ // Day 216
    L("B2-Prüfung: Hören Teil 1 — Alltagsgespräche (Globalverständnis)","Listen to a short everyday dialogue (announcement, phone call, conversation) and write the main topic and setting in one sentence each — practicing Hören Teil 1's global-listening strategy.","Thema: eine Terminverschiebung beim Arzt. Setting: ein Telefonat zwischen Patientin und Arztpraxis.","First listen just for who's talking and why — details come on the second pass.","Topic: a rescheduled doctor's appointment. Setting: a phone call between a patient and a doctor's office.")
  ]},
  {lessons:[ // Day 217
    L("B2-Prüfung: Hören Teil 2 — Vortrag oder Interview (Detailverständnis)","Listen to a longer talk or interview (a podcast segment works) and write down 5 specific facts or numbers mentioned — practicing detail-tracking for Hören Teil 2.","Laut dem Interview arbeiten inzwischen über 30 Prozent der Angestellten mindestens teilweise im Homeoffice.","Jot down numbers and names the moment you hear them — they're easy to lose.","According to the interview, more than 30 percent of employees now work at least partly from home.")
  ]},
  {lessons:[ // Day 218
    L("B2-Prüfung: Hören Teil 3 — Diskussion (Meinungen der Sprecher unterscheiden)","Listen to a discussion with 2-3 speakers and write down which position each speaker takes — practicing the speaker-differentiation skill needed for Hören Teil 3.","Sprecher A findet, dass die Regelung sinnvoll ist. Sprecherin B ist eher skeptisch und nennt praktische Bedenken.","Note each speaker's tone of voice too — it often signals agreement or disagreement before the words do.","Speaker A thinks the regulation makes sense. Speaker B is more skeptical and raises practical concerns.")
  ]},
  {lessons:[ // Day 219
    L("B2-Prüfung: Hören Teil 4 — Kurze Texte (selektives Hören)","Listen to several short announcements or messages back to back and write the one key piece of information from each — practicing selective listening under time pressure for Hören Teil 4.","Durchsage 1: Der Zug hat 10 Minuten Verspätung. Durchsage 2: Gleis 3 wird zu Gleis 5 geändert.","You usually only hear these once in the real exam — resist the urge to relisten while practicing.","Announcement 1: The train is 10 minutes late. Announcement 2: The platform is changing from 3 to 5.")
  ]},
  {lessons:[ // Day 220
    L("B2 Checkpoint: Mock-Hörverstehen (komplett, zeitlich begrenzt)","Do a full timed mock Hörverstehen (all 4 parts back to back), then write 3 sentences on which listening strategy (global, detail, or selective) still needs the most work.","Bei Teil 3 verliere ich manchmal den Überblick, wer was gesagt hat — das möchte ich noch üben.","No pausing, no rewinding — that's the whole point of a mock test.","In part 3 I sometimes lose track of who said what — I want to practice that more.")
  ]},
  {lessons:[ // Day 221
    L("B2-Prüfung: Formeller Brief — vollständige Wiederholung","Write a complete, timed formal letter (Beschwerde, Anfrage, or Bewerbung — your choice) covering all required parts: Anrede, Einleitung, Hauptteil, Schluss, Grußformel.","Sehr geehrte Frau Müller, hiermit möchte ich mich nach dem aktuellen Stand meiner Anfrage vom letzten Monat erkundigen. Für eine kurze Rückmeldung wäre ich sehr dankbar.","Check afterward: did you use Sie consistently and at least one Konjunktiv-II politeness form?","Dear Ms. Müller, with this letter I would like to inquire about the current status of my request from last month. I would be very grateful for a brief reply.")
  ]},
  {lessons:[ // Day 222
    L("B2-Prüfung: Meinungsaufsatz — mit allen Konnektoren","Write a complete, timed pro-contra essay (12+ sentences), deliberately using at least 4 different connector types from this course (obwohl, sodass, je...desto, zumal).","Je mehr Unternehmen auf Homeoffice setzen, desto wichtiger wird digitale Kommunikation — zumal viele Teams inzwischen über mehrere Standorte verteilt sind.","This is your chance to show off variety, not just correctness — mix short and long sentences.","The more companies rely on working from home, the more important digital communication becomes — especially since many teams are now spread across several locations.")
  ]},
  {lessons:[ // Day 223
    L("B2-Prüfung: Grafikbeschreibung — vollständige Wiederholung","Find a new chart or statistic and write a complete, timed description (8+ sentences) following the fixed structure: Einleitung, Beschreibung der Hauptdaten, Vermutung zu den Gründen, Schluss/Ausblick.","Die Grafik zeigt die Entwicklung der Studierendenzahlen in Deutschland zwischen 2015 und 2025. Besonders auffällig ist der Anstieg internationaler Studierender.","Stick to the fixed skeleton every time — examiners reward the structure as much as the content.","The chart shows the development of student numbers in Germany between 2015 and 2025. The rise in international students is especially notable.")
  ]},
  {lessons:[ // Day 224
    L("B2 Checkpoint: Timed Schreiben-Mock (Brief + Aufsatz in einer Sitzung)","Do a full timed writing mock: one letter and one essay, back to back within the real exam's time limit, then self-grade both against the B2 criteria (structure, connectors, register).","A complete timed double-task writing mock, self-graded on structure, connectors, and register.","Switching register between a formal letter and an opinion essay in one sitting is its own skill — notice how it feels.")
  ]},
  {lessons:[ // Day 225
    L("B2-Prüfung: Kurzvortrag wiederholen — mit Rückfragen","Redo the short presentation format from Day 203 on a new topic, then have your husband ask you 2 follow-up questions in German that you answer on the spot — practicing the real exam's Q&A add-on.","Zum Abschluss möchte ich betonen, dass beide Optionen ihre Vorteile haben. — Und was würden Sie persönlich wählen? — Ich persönlich würde mich für die flexiblere Option entscheiden.","The follow-up question is where examiners really test spontaneous speech — don't over-rehearse the answer.","In conclusion, I'd like to emphasize that both options have their advantages. — And what would you personally choose? — Personally, I would choose the more flexible option.")
  ]},
  {lessons:[ // Day 226
    L("B2-Prüfung: Diskussion führen (Sprechen Teil 2)","With your husband, hold a 4-minute discussion in German on a given topic, practicing agreement/disagreement phrases (da stimme ich dir zu, das sehe ich anders, das kommt darauf an) — the real B2 speaking task 2 format.","Das sehe ich etwas anders — ich glaube, dass gerade für junge Familien Flexibilität wichtiger ist als ein hohes Gehalt.","Aim to actually react to what your partner says, not just deliver prepared points.","I see that a bit differently — I think that for young families in particular, flexibility is more important than a high salary.")
  ]},
  {lessons:[ // Day 227
    L("Sprechen: Ein Bild oder Foto beschreiben (Bildbeschreibung)","Pick a photo and describe it out loud for 1-2 minutes, then write 6 sentences using spatial prepositions and descriptive vocabulary (im Vordergrund, im Hintergrund, es scheint, dass).","Im Vordergrund des Bildes sieht man eine Familie am Frühstückstisch. Im Hintergrund erkennt man eine große Fensterfront. Es scheint, dass die Szene an einem Wochenende spielt.","This skill also helps with Grafikbeschreibung — describing what you see before interpreting it.","In the foreground of the picture you can see a family at the breakfast table. In the background you can make out a large window front. It seems the scene takes place on a weekend.")
  ]},
  {lessons:[ // Day 228
    L("B2 Checkpoint: Mock-Sprechen (komplett, zeitlich begrenzt)","Do a full timed mock Sprechen exam with your husband: Kurzvortrag with Rückfragen, then a 4-minute Diskussion, then write 3 self-corrections.","Ich habe in der Diskussion zu wenig widersprochen — ich sollte auch mal klar anderer Meinung sein.","Record it on your phone if you can — hearing yourself back is more useful than it feels in the moment.","I didn't disagree enough during the discussion — I should also be more willing to clearly hold a different opinion.")
  ]},
  {lessons:[ // Day 229
    L("B2 Wortschatz: Idiome und Redewendungen","Learn 6 common B2-level idioms (die Kirche im Dorf lassen, ins Wasser fallen, den Nagel auf den Kopf treffen, unter die Arme greifen, aus allen Wolken fallen, Schwein haben) and write one sentence with each.","Lass uns die Kirche im Dorf lassen, das Problem ist wirklich nicht so groß. Der Ausflug ist leider ins Wasser gefallen.","Don't translate these literally to your husband — guess the meaning from context first, then check.","Let's not blow this out of proportion, the problem really isn't that big. Unfortunately, the trip fell through.")
  ]},
  {lessons:[ // Day 230
    L("Grammatik-Wiederholung: Konjunktiv II der Vergangenheit (hypothetisch)","Write 6 sentences about hypothetical past scenarios using Konjunktiv II Vergangenheit (hätte gemacht, wäre gegangen) — what you would have done differently.","Wenn ich das gewusst hätte, wäre ich früher losgefahren. Hätte ich mehr Zeit gehabt, hätte ich das Projekt gründlicher vorbereitet.","Ich wär früher losgefahren, wenn ich's gewusst hätte, ehrlich.","If I had known that, I would have left earlier. If I'd had more time, I would have prepared the project more thoroughly.")
  ]},
  {lessons:[ // Day 231
    L("Grammatik-Wiederholung: Alle Konnektoren im Überblick","Write 6 sentences, each using a different connector type from across the whole B2 phase (concessive, causal, conditional, result, comparative) to check you can still call on all of them.","Obwohl das Wetter schlecht war, sind wir gewandert. Je länger ich hier lebe, desto besser verstehe ich die Kultur. Sofern nichts dazwischenkommt, treffen wir uns am Freitag.","Try this without looking anything up first, then check which connector type felt shakiest.","Although the weather was bad, we went hiking. The longer I live here, the better I understand the culture. Provided nothing comes up, we'll meet on Friday.")
  ]},
  {lessons:[ // Day 232
    L("Über kulturelle Unterschiede sprechen (Leben in Deutschland)","Write a paragraph (8+ sentences) reflecting on cultural differences you've noticed living in Germany, and how your perspective has changed over time.","Am Anfang fand ich die Direktheit der Deutschen ungewohnt, aber inzwischen schätze ich sie sehr. Es gibt vieles, das ich anders mache als früher.","Am Anfang fand ich das mit der direkten Art schon komisch, ehrlich, aber jetzt mag ich's.","At first I found the directness of Germans unfamiliar, but now I really appreciate it. There's a lot I do differently than I used to.")
  ]},
  {lessons:[ // Day 233
    L("Über die eigene Sprachlernreise sprechen","Write a paragraph (8+ sentences) reflecting on your German-learning journey so far: what motivated you, what was hardest, and what you're proud of.","Als ich angefangen habe, konnte ich kaum einen ganzen Satz bilden, und jetzt kann ich über komplexe Themen diskutieren. Am schwierigsten fiel mir am Anfang die Grammatik, aber mit der Zeit wurde es leichter.","Am Anfang konnt ich kaum n ganzen Satz raus bringen, ehrlich, und jetzt red ich einfach drauf los.","When I started, I could barely form a whole sentence, and now I can discuss complex topics. Grammar was hardest for me at the start, but it got easier over time.")
  ]},
  {lessons:[ // Day 234
    L("Small Talk und Networking auf Deutsch","Write a short dialogue (10+ lines) making professional small talk at a networking event: introducing yourself, asking about someone's work, and exchanging contact details.","Darf ich mich kurz vorstellen? Ich arbeite gerade als Auszubildende im Bereich Buchhaltung. Und Sie, womit beschäftigen Sie sich beruflich? — Hätten Sie vielleicht eine Visitenkarte für mich?","Darf ich mich kurz vorstellen? Ich mach grad ne Ausbildung in der Buchhaltung.","May I introduce myself? I'm currently training as an apprentice in accounting. And you, what's your line of work? — Would you happen to have a business card for me?")
  ]},
  {lessons:[ // Day 235
    L("Volle Mock-Prüfung, Teil 1: Lesen + Hören (zeitlich begrenzt)","Do the reading and listening sections of a full B2 mock exam back to back, under real time limits, then write your estimated score for each.","Lesen: ca. 80% richtig geschätzt. Hören: ca. 75% richtig geschätzt.","Simulate real conditions as closely as you can — no phone, no pausing, one sitting.","Reading: roughly 80% correct estimated. Listening: roughly 75% correct estimated.")
  ]},
  {lessons:[ // Day 236
    L("Volle Mock-Prüfung, Teil 2: Schreiben (zeitlich begrenzt)","Do the writing section of a full B2 mock exam (letter + essay or letter + Grafikbeschreibung) under real time limits, then self-grade using the B2 criteria you've practiced.","A complete timed writing mock exam, self-graded on task fulfillment, structure, connectors, and register.","Resist editing as you go — writing under real time pressure means moving forward, not perfecting each sentence.")
  ]},
  {lessons:[ // Day 237
    L("Volle Mock-Prüfung, Teil 3: Sprechen (zeitlich begrenzt)","With your husband, do the speaking section of a full B2 mock exam (Kurzvortrag + Rückfragen + Diskussion) under real time limits, then write 3 sentences of self-feedback.","Der Kurzvortrag lief gut, aber bei der Diskussion habe ich manchmal nach Wörtern gesucht.","The short presentation went well, but during the discussion I sometimes searched for words.")
  ]},
  {lessons:[ // Day 238
    L("Fehleranalyse: Die Mock-Prüfung auswerten","Go back through all three mock-exam days (235-237) and list your 8 most common mistakes, grouped by type (Grammatik, Wortschatz, Struktur), with a correction for each.","Fehler: 'trotz des schlechte Wetter' → Korrektur: 'trotz des schlechten Wetters' (Genitiv-Endung vergessen).","Grouping by type shows you patterns a single mistake never would — that's the real value of this exercise.","Mistake: 'despite the bad weather' with the wrong ending → Correction: with the correct genitive ending (I forgot the genitive ending).")
  ]},
  {lessons:[ // Day 239
    L("Letzte gezielte Wiederholung: schwächster Bereich","Based on Day 238's error analysis, pick your single weakest category and spend today entirely on it: write 8 new sentences deliberately targeting that exact weakness.","8 new sentences, all deliberately targeting whichever error category showed up most in your Day 238 analysis.","One category, eight sentences, no exceptions — depth beats variety today.")
  ]},
  {lessons:[ // Day 240
    L("B2 Checkpoint: Abschluss-Selbsteinschätzung & Ausblick auf C1","Rate yourself 1-5 on Hören, Lesen, Schreiben, and Sprechen for the whole B2 phase, write 3 sentences on your biggest overall improvement since Day 151, and 2 sentences on what you'd want to focus on first in C1.","Hören: 4/5. Lesen: 5/5. Schreiben: 4/5. Sprechen: 4/5. Der größte Fortschritt seit Tag 151 ist, dass ich jetzt frei und ohne viel Nachdenken über komplexe Themen sprechen kann. Für C1 möchte ich vor allem an einem noch differenzierteren Wortschatz arbeiten.","Hab seit Tag 151 echt riesige Fortschritte gemacht, vor allem beim freien Reden — für C1 will ich jetzt an nuanciertem Wortschatz feilen.","Listening: 4/5. Reading: 5/5. Writing: 4/5. Speaking: 4/5. My biggest progress since Day 151 is that I can now speak about complex topics freely and without much hesitation. For C1 I especially want to work on more nuanced vocabulary.")
  ]}
];
GERMAN_DAYS.push(...GERMAN_DAYS_B2_PART3);

/* ---- Full plan: A1 -> A2 -> B1 -> B2, an 8-month timeline (240 days)
   aimed at genuine working/comfortable fluency, not just an exam pass —
   B1 lands around month 5 so applications can go out while B2 work
   continues underneath. A1 through B2 (Days 1-240) are now fully
   written with real daily lessons; CONTENT_END_DAY marks how far that
   reaches. Days 241+ (Buffer & Review) still just track your daily
   writing/immersion/speaking so nothing goes unlogged if you need
   extra time before moving on. ---- */
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
const CONTENT_END_DAY = 240; // A1 through B2 fully written (Days 1-240) — the entire 8-month core plan now has real daily lessons; Days 241+ are buffer/review weeks (see PHASES) and still just track logging until written
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
  "Practice answering \"Warum möchten Sie diese Ausbildung machen?\" out loud to your husband, in German.",
  "Tell your husband one thing you're waiting for and one thing you're looking forward to, using warten auf and sich freuen auf.",
  "Ask your husband for help with something in German, using helfen bei.",
  "Ask your husband a question using a wo-word (e.g. \"Woran denkst du?\") and answer using a da-word.",
  "Tell your husband where something in your home is, using über, unter, vor, or zwischen correctly.",
  "Tell your husband something you're doing despite something else, using trotz.",
  "Give your husband your honest opinion about something small, using \"Ich finde, dass...\".",
  "Tell your husband your favorite thing to eat or drink, ranked with gern, lieber, am liebsten.",
  "Give your husband one piece of advice in German, using \"An deiner Stelle würde ich...\".",
  "Describe your own personality to your husband using at least 3 adjectives.",
  "Describe someone you admire to your husband, in German, in at least 5 sentences.",
  "Tell your husband what you still need to do at the Bürgeramt, in German.",
  "Tell your husband one thing about taxes or the Finanzamt you learned today.",
  "Ask your husband to explain a banking word you're unsure about — in German.",
  "Tell your husband whether you have a doctor's appointment coming up, in German.",
  "Tell your husband one thing about your rental contract or Nebenkosten, in German.",
  "Fill out a real or pretend German form out loud with your husband, asking him about anything unclear.",
  "Tell your husband a short story about your day using zuerst, dann, später, schließlich.",
  "Describe a photo from your phone to your husband in German, in detail.",
  "Practice your \"meeting the family\" small talk out loud with your husband.",
  "Compare yourself to your husband using genauso... wie or nicht so... wie.",
  "Tell your husband one real plan and one prediction, in German.",
  "Tell your husband one hope you have for your life in Germany.",
  "Tell your husband what you'd do if you had an extra free day, using Konjunktiv II.",
  "Tell your husband something someone told you today, using indirect speech with dass.",
  "Tell your husband what you'd do if you got accepted into the Ausbildung, using Konjunktiv II.",
  "Tell your husband about a made-up deadline or meeting at work, using die Frist and die Besprechung.",
  "Practice reading a follow-up email out loud to your husband.",
  "Pretend to take a phone message for your husband and repeat it back to him in German.",
  "Give your husband your 1-minute self-presentation out loud, in German.",
  "Give your self-presentation again, and ask your husband what was hardest to understand.",
  "Tell your husband something you used to do differently, using früher.",
  "Describe a small problem and its solution to your husband, in German.",
  "Ask your husband for permission to do something, in German — Darf ich...?",
  "Tell your husband something you're sure of and something you're unsure of, in German.",
  "Read a real German job ad out loud to your husband and explain what it means.",
  "Tell your husband one strength and one thing you're working on, in German.",
  "Tell your husband why a specific job or Ausbildung would fit you, in German.",
  "Use one German idiom correctly in conversation with your husband today.",
  "Pick your weakest grammar point from the last two months and explain it to your husband, in German.",
  "Introduce yourself fully to your husband's family — out loud, in German — as if today were the real day.",
  "Tell your husband something you had already done before something else happened today, using Plusquamperfekt.",
  "Tell your husband what you'll do as soon as you have time, using sobald.",
  "Tell your husband one thing that needs to get done today, using a Passiv + Modalverb sentence.",
  "Tell your husband when a rule or plan takes effect, using \"in Kraft treten\".",
  "Tell your husband a short story about your day mixing today's four grammar points.",
  "Nominalize one casual sentence out loud for your husband, the formal way.",
  "Describe something to your husband using a participle as an adjective (e.g. \"die geschriebene E-Mail\").",
  "Point out an extended participle phrase in a German text or sign to your husband, if you spot one.",
  "Retell your husband a piece of news, turning Konjunktiv I into a normal dass-sentence.",
  "Rewrite one casual sentence formally for your husband, the way you'd write to a company.",
  "Tell your husband one advantage and one disadvantage of doing an Ausbildung, in German.",
  "Give your husband a structured 3-point opinion on something, using erstens/zweitens/drittens.",
  "Describe a made-up statistic to your husband, using steigen/sinken/sich verdoppeln.",
  "Read your practice formal letter out loud to your husband.",
  "Read your Leserbrief or Beschwerdebrief out loud to your husband and ask for feedback.",
  "Read the personal-details header of your Lebenslauf out loud to your husband.",
  "Tell your husband your Bildungsweg (school history) in German.",
  "Tell your husband about your work experience so far, in German.",
  "Tell your husband your language levels and one soft skill, in German.",
  "Read your full draft Lebenslauf out loud to your husband and ask what's unclear.",
  "Read your Anschreiben opening paragraph out loud to your husband.",
  "Tell your husband, out loud, why you want this Ausbildung.",
  "Tell your husband why a specific company appeals to you, in German.",
  "Read your Anschreiben closing paragraph out loud to your husband.",
  "Read your full Anschreiben out loud to your husband, start to finish.",
  "Answer one interview question out loud for your husband.",
  "Tell your husband a weakness of yours, framed diplomatically, in German.",
  "Ask your husband, in German, one of the interview questions you'd ask an employer.",
  "Practice asking about Ausbildungsvergütung out loud with your husband.",
  "Do a full mock interview with your husband as the interviewer, in German.",
  "Read a made-up official letter phrase out loud to your husband and explain what it means.",
  "Read your reply to an official letter out loud to your husband.",
  "Give your husband your \"career fair\" self-introduction out loud.",
  "Read your Praktikum request email out loud to your husband.",
  "Read your career-fair follow-up email out loud to your husband.",
  "Give your husband one piece of constructive feedback, politely, in German.",
  "Practice receiving feedback gracefully with your husband, in German.",
  "Ask your husband a clarifying question in German about something he said.",
  "Apologize to your husband in German for a made-up small mistake.",
  "Act out your workplace-misunderstanding dialogue with your husband.",
  "Do a pretend phone interview with your husband, in German.",
  "Read your interview follow-up email out loud to your husband.",
  "Read your graceful rejection-reply out loud to your husband.",
  "Read your offer-acceptance reply out loud to your husband.",
  "Tell your husband your ideal application timeline, in German.",
  "Read your practice formal letter out loud to your husband, timed.",
  "Read your opinion forum post out loud to your husband.",
  "Plan something together with your husband out loud, entirely in German.",
  "Give your husband your 2-minute mini-talk, out loud, in German.",
  "Time yourself writing today's practice pieces and show your husband the results.",
  "Tell your husband 3 new words you learned today from real German listening or reading.",
  "Explain your weakest grammar point from this phase to your husband.",
  "Explain one more weak grammar point to your husband.",
  "Quiz your husband (or yourself) on 5 Bewerbung/Büro words.",
  "Do your final full mock interview with your husband, start to finish.",
  "Read your polished CV and cover letter out loud to your husband one more time.",
  "Give your husband your timed mini-talk one more time.",
  "Read your timed formal letter and opinion piece out loud to your husband.",
  "Tell your husband, in German, which skill — Hören, Lesen, Schreiben, or Sprechen — you feel weakest in.",
  "Tell your husband, in German, that you're ready to apply — and mean it."
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
    <span class="slang-eyebrow">How Germans Actually Say It <span class="day-of">· Day ${germanCurrentDay}</span></span>
    <h3 class="slang-phrase">${forvoWords(item.natural)}</h3>
    <p class="slang-exam">Exam-correct: <strong>${forvoWords(item.exam)}</strong></p>
    <p class="slang-meaning">${esc(item.meaning)}</p>
    <p class="slang-note">${esc(item.note)}</p>
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

// ---- Step 4 icons: reused across the Day header / Real-Life Challenge /
// Lesson header components below. Kept as plain SVG strings so both
// renderDailyCard() branches can share them without extra DOM work. ----
const G_TARGET_SVG = `<svg viewBox="0 0 24 24" width="13" height="13"><circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M17 7l3-3m0 0h-2.4M20 4v2.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const G_CHAT_SVG = `<svg viewBox="0 0 24 24" width="15" height="15"><path d="M4 5.5C4 4.7 4.7 4 5.5 4h13c.8 0 1.5.7 1.5 1.5v10c0 .8-.7 1.5-1.5 1.5H9l-4 3.5V17H5.5A1.5 1.5 0 014 15.5v-10z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>`;
const G_BOOK_SVG = `<svg viewBox="0 0 24 24" width="14" height="14"><path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5A1.5 1.5 0 014 18.5v-13z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H13v16h5.5A1.5 1.5 0 0020 18.5v-13z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>`;

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
      <div class="g-day-head">
        <span class="g-day-badge">${esc(phase.label)} · Day ${day}/${TOTAL_CORE_DAYS}</span>
        <h2 class="g-day-num">Day ${day}</h2>
        <p class="g-day-tagline">${esc(phase.months)} — full lessons for this phase are coming in a future update. Keep the daily habit going below in the meantime.</p>
      </div>

      <div class="g-challenge">
        <div class="g-challenge-head">
          <span class="g-challenge-icon">${G_TARGET_SVG}</span>
          <span class="g-challenge-title">Speaking Challenge</span>
        </div>
        <div class="g-challenge-box">
          ${G_CHAT_SVG}
          <p>${esc(challenge)}</p>
        </div>
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
    <div class="g-lesson lesson-block">
      <div class="g-lesson-head">
        <span class="g-lesson-icon">${G_BOOK_SVG}</span>
        <h3>${multi?`Lesson ${i+1} of ${dayContent.lessons.length} — `:""}${esc(lesson.topic)}</h3>
      </div>
      <div class="g-learn">
        <div class="g-learn-label"><span class="dot"></span>Learn This First <span class="g-tap-hint">tap any word to hear it</span></div>
        <div class="g-phrase-pair">
          <div class="g-phrase-box g-phrase-exam"><span class="g-phrase-tag">Goethe Exam-Correct</span>${forvoWords(lesson.example)}</div>
          <div class="g-phrase-box g-phrase-natural"><span class="g-phrase-tag">How Germans Actually Say It</span>${forvoWords(lesson.natural)}</div>
          ${lesson.en?`<div class="g-phrase-en">${esc(lesson.en)}</div>`:""}
        </div>
      </div>
      <div class="daily-block">
        <div class="daily-block-label"><span class="dot"></span>Homework</div>
        <div class="homework-prompt">${esc(lesson.homework)}</div>
        <textarea class="lesson-answer" data-lesson="${i}" placeholder="Write your answer here...">${esc(lrec.answer)}</textarea>
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
    <div class="g-day-head">
      <span class="g-day-badge">${esc(phase.label)} · Day ${day}/${TOTAL_CORE_DAYS}</span>
      <h2 class="g-day-num">Day ${day}</h2>
      <p class="g-day-topic">${esc(topicsLabel)}</p>
      <p class="g-day-tagline">Small steps today, closer to B1 tomorrow.</p>
    </div>

    <div class="g-challenge">
      <div class="g-challenge-head">
        <span class="g-challenge-icon">${G_TARGET_SVG}</span>
        <span class="g-challenge-title">Real-Life Challenge</span>
      </div>
      <div class="g-challenge-box">
        ${G_CHAT_SVG}
        <p>${esc(challenge)}</p>
      </div>
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
