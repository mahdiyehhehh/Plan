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
  if(!state.german.currentDay) state.german.currentDay = 1;
  germanCurrentDay = state.german.currentDay;
}
let germanCurrentDay = 1;
let germanOpenTest = null;

function getDayRecord(day){
  if(!state.german.days[day]) state.german.days[day] = {answer:"", notes:"", done:false};
  return state.german.days[day];
}
function getTestRecord(id){
  if(!state.german.tests[id]) state.german.tests[id] = {done:false, dateTaken:"", review:"", userAnswers:{}, submitted:false, score:null};
  const r = state.german.tests[id];
  if(!r.userAnswers) r.userAnswers = {};
  return r;
}

/* ---- 30-day A1 curriculum: topic, homework task, worked example ---- */
const GERMAN_DAYS = [
  {topic:"Greetings & Introductions", homework:"Write 5 sentences introducing yourself: your name, nationality, age, city, and a language you speak.", example:"Ich heiße Lisa. Ich bin 22 Jahre alt. Ich komme aus Italien und ich spreche Italienisch und ein bisschen Deutsch.", natural:"Ich bin Lisa, 22. Komm' aus Italien und spreche Italienisch und n bisschen Deutsch. Und du, wie heißt du?"},
  {topic:"Numbers 0–20", homework:"Write the numbers 0–20 in German, then write out 5 simple addition sums in words.", example:"eins, zwei, drei ... zehn. Drei plus vier ist sieben.", natural:"Drei und vier macht sieben. — Warte, wie viel war das nochmal?"},
  {topic:"The Alphabet & Spelling", homework:"Spell your first and last name out loud using the German alphabet, then write it letter by letter.", example:"M-A-R-I-A = Em – A – Er – I – A.", natural:"Buchstabier das nochmal, ich hab's nicht ganz verstanden."},
  {topic:"Personal Pronouns & \"sein\"", homework:"Conjugate the verb \"sein\" (to be) for all pronouns, then write 3 sentences using it.", example:"ich bin, du bist, er/sie/es ist, wir sind, ihr seid, sie sind. Ich bin müde.", natural:"Ich bin echt müde heute. Bist du auch so kaputt?"},
  {topic:"Family Members", homework:"List your family tree and label each person in German (Mutter, Vater, Bruder, Schwester...).", example:"Das ist meine Mutter. Sie heißt Anna. Das ist mein Bruder. Er heißt Tom.", natural:"Das ist meine Mama, und das da ist mein kleiner Bruder."},
  {topic:"Articles: der / die / das", homework:"Sort 10 household nouns into der / die / das using a dictionary or app.", example:"der Tisch, die Lampe, das Buch, der Stuhl, die Tür.", natural:"Kannst du mir mal das Buch da geben? Genau, das auf'm Tisch."},
  {topic:"Present Tense — Regular Verbs", homework:"Fully conjugate 3 regular verbs: spielen, wohnen, lernen.", example:"ich spiele, du spielst, er spielt, wir spielen, ihr spielt, sie spielen.", natural:"Ich lern grad Deutsch, deshalb spiel ich abends immer diese Vokabel-App."},
  {topic:"Numbers 20–100 & Age", homework:"Write your age and the ages of 5 family members in full German words.", example:"Meine Schwester ist einundzwanzig Jahre alt. Mein Vater ist neunundfünfzig Jahre alt.", natural:"Meine Schwester ist einundzwanzig, glaub ich — oder ist sie schon zweiundzwanzig?"},
  {topic:"Telling Time", homework:"Write your daily schedule using 5 clock times in German (\"Es ist ... Uhr\").", example:"Es ist halb neun. Ich frühstücke. Es ist Viertel nach zwölf. Ich esse zu Mittag.", natural:"Es ist halb neun, wir müssen los! — Wie spät ist es? — Kurz nach halb."},
  {topic:"Days, Months, Seasons", homework:"List the 7 days and 12 months in German, then write which season you like best and why.", example:"Mein Lieblingsmonat ist Juli, im Sommer, weil es warm ist.", natural:"Ich mag den Sommer am liebsten, im Juli ist's einfach am schönsten."},
  {topic:"Daily Routine (Separable Verbs)", homework:"Write 8 sentences describing your typical day using separable verbs (aufstehen, anziehen, fernsehen...).", example:"Ich stehe um sieben Uhr auf. Ich ziehe mich an. Abends sehe ich fern.", natural:"Ich steh um sieben auf, zieh mich schnell an, und abends häng ich vorm Fernseher."},
  {topic:"Food & Drink Vocabulary", homework:"Write a shopping list of 10 foods with their articles, plus one sentence about your favorite meal.", example:"der Reis, die Milch, das Brot. Ich esse gern Nudeln mit Tomatensoße.", natural:"Ich hab total Bock auf Nudeln mit Tomatensoße heute Abend."},
  {topic:"At the Restaurant", homework:"Write a short dialogue (at least 6 lines) ordering food at a restaurant.", example:"Guten Tag! Ich möchte bitte einen Kaffee und ein Stück Kuchen. — Gerne, sonst noch etwas?", natural:"Für mich bitte 'nen Kaffee und n Stück Kuchen. — Kommt sofort! — Super, danke."},
  {topic:"Akkusativ Case", homework:"Rewrite 8 sentences putting the direct object into the Akkusativ (den / einen / eine / ein).", example:"Ich sehe den Mann. Ich kaufe einen Apfel. Ich habe eine Katze.", natural:"Ich hol mir noch schnell nen Apfel, ich hab nämlich voll Hunger."},
  {topic:"Shopping & Clothes", homework:"Describe an outfit you're wearing today using at least 6 clothing words and colors.", example:"Ich trage eine blaue Jacke, ein weißes T-Shirt und schwarze Schuhe.", natural:"Ich hab heute meine blaue Jacke an und die schwarzen Schuhe von letzter Woche."},
  {topic:"Modal Verbs: können, müssen, wollen", homework:"Write 6 sentences (two per verb) about things you can, must, and want to do.", example:"Ich muss heute lernen. Ich will Deutsch sprechen. Ich kann gut kochen.", natural:"Ich muss heut echt noch lernen, aber ich hab eigentlich keinen Bock."},
  {topic:"The Weather", homework:"Describe the weather for each day of this week in German.", example:"Heute ist es sonnig und warm. Morgen regnet es und es ist windig.", natural:"Heute ist's richtig schön warm, aber morgen soll's angeblich wieder regnen."},
  {topic:"Directions & Prepositions", homework:"Write directions from your home to the nearest supermarket using links, rechts, geradeaus.", example:"Gehen Sie geradeaus, dann links. Der Supermarkt ist neben der Bank.", natural:"Einfach geradeaus, dann links, das ist gleich neben der Bank — nicht zu verfehlen."},
  {topic:"Places in the City", homework:"List 10 places in a city with their articles and one sentence for each about what you do there.", example:"In der Bibliothek lese ich Bücher. Im Park spiele ich Fußball.", natural:"Wir treffen uns im Park, ja? Da spielen wir immer Fußball."},
  {topic:"Past Tense — Perfekt (basics)", homework:"Write 6 sentences about yesterday using the Perfekt tense with haben or sein.", example:"Ich habe gestern Deutsch gelernt. Ich bin ins Kino gegangen.", natural:"Ich hab gestern noch Deutsch gelernt und bin dann ins Kino gegangen."},
  {topic:"Hobbies & Free Time", homework:"Write a paragraph (5–6 sentences) about your hobbies and how often you do them.", example:"Ich spiele gern Fußball. Ich mache das zweimal pro Woche. Ich lese auch gern.", natural:"Ich zock gern und spiel zweimal die Woche Fußball, sonst chill ich meistens."},
  {topic:"Making Plans & Invitations", homework:"Write a short dialogue inviting a friend to do something this weekend.", example:"Hast du am Samstag Zeit? — Ja, warum? — Wollen wir ins Kino gehen?", natural:"Hast du Samstag Bock auf Kino? — Klar, bin dabei!"},
  {topic:"The Body & Health", homework:"Label 10 body parts, then write 3 sentences about how you feel today (\"Mir tut ... weh\").", example:"der Kopf, der Arm, das Bein. Mir tut der Kopf weh. Ich bin ein bisschen krank.", natural:"Mir tut voll der Kopf weh, ich glaub ich werd krank."},
  {topic:"At the Doctor's", homework:"Write a short dialogue at the doctor's office describing your symptoms.", example:"Ich habe Fieber und Halsschmerzen. — Seit wann haben Sie das?", natural:"Ich hab seit gestern Fieber und mir tut voll der Hals weh."},
  {topic:"Comparisons (Adjectives)", homework:"Write 6 comparative sentences comparing things around you.", example:"Berlin ist größer als München. Mein Bruder ist am größten in der Familie.", natural:"Berlin ist schon viel größer als München, find ich."},
  {topic:"Housing & Furniture", homework:"Describe your home or room, listing at least 8 furniture items with their articles.", example:"In meinem Zimmer gibt es ein Bett, einen Schrank und einen Schreibtisch.", natural:"Meine Bude ist klein, aber ich hab n Bett, n Schrank und n Schreibtisch — reicht mir."},
  {topic:"Public Transport & Travel", homework:"Write a dialogue buying a train ticket and asking about departure times.", example:"Wann fährt der nächste Zug nach Berlin? — Um 14 Uhr, Gleis 5.", natural:"Wann geht der nächste Zug nach Berlin? — Um zwei, Gleis fünf, beeil dich!"},
  {topic:"Negation: nicht / kein", homework:"Write 8 sentences using nicht and kein correctly.", example:"Ich habe kein Auto. Ich trinke nicht gern Kaffee. Das ist nicht richtig.", natural:"Ich hab kein Auto, deshalb nehm ich meistens den Bus. — Echt nicht? Krass."},
  {topic:"Question Words Review", homework:"Write one question for every question word (wer, was, wann, wo, warum, wie, wie viel) and answer it.", example:"Wo wohnst du? — Ich wohne in Berlin. Warum lernst du Deutsch? — Weil ich nach Deutschland ziehe.", natural:"Wo wohnst du eigentlich? — In Berlin. — Ah cool, wieso lernst du dann Deutsch, kannst du's nicht schon?"},
  {topic:"Full A1 Self-Review", homework:"Write a 10-sentence self-introduction combining everything: name, family, job/studies, hobbies, daily routine, and one sentence in the past tense.", example:"Ich heiße ... und komme aus ... Ich bin Student und lerne seit 30 Tagen Deutsch. Gestern habe ich viel gelernt.", natural:"Ich bin ... und komm aus ... Ich studier gerade und lern jetzt seit 30 Tagen Deutsch. Gestern hab ich echt viel gelernt, war anstrengend!"}
];

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
  "Introduce yourself fully to your husband in German — as if it's the first time you're meeting."
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
  let doneCount = 0;
  for(let d=1; d<=30; d++){
    if(state.german.days[d] && state.german.days[d].done) doneCount++;
  }
  return doneCount >= 30;
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
  const doneCount = Object.values(state.german.days).filter(d=>d.done).length;
  const label = document.getElementById("germanRingLabel");
  const fg = document.getElementById("germanRingFg");
  if(!label || !fg) return;
  label.textContent = `${doneCount}/30`;
  const circumference = 2*Math.PI*26;
  fg.style.strokeDasharray = `${circumference}`;
  fg.style.strokeDashoffset = `${circumference * (1 - doneCount/30)}`;
}

function renderSlangCard(){
  const card = document.getElementById("slangCard");
  if(!card) return;
  const item = SLANG_OF_DAY[(germanCurrentDay-1) % SLANG_OF_DAY.length];
  card.innerHTML = `
    <span class="slang-card-eyebrow">How Germans Actually Say It <span class="day-of">· Day ${germanCurrentDay}</span></span>
    <div class="slang-card-pair">
      <div class="slang-card-phrase"><h4>${esc(item.natural)}</h4></div>
      <span class="slang-card-exam">Exam-correct: <strong>${esc(item.exam)}</strong></span>
    </div>
    <p class="slang-card-meaning">${esc(item.meaning)}</p>
    <p class="slang-card-note">${esc(item.note)}</p>
  `;
}

function renderDayPicker(){
  const wrap = document.getElementById("dayPicker");
  let html = "";
  for(let d=1; d<=30; d++){
    const rec = state.german.days[d];
    const done = rec && rec.done;
    html += `<button class="day-pill ${d===germanCurrentDay?"active":""} ${done?"done":""}" data-day="${d}">${d}</button>`;
  }
  wrap.innerHTML = html;
  wrap.querySelectorAll(".day-pill").forEach(btn=>{
    btn.onclick = ()=>{
      germanCurrentDay = parseInt(btn.dataset.day,10);
      state.german.currentDay = germanCurrentDay;
      saveData();
      renderDayPicker();
      renderDailyCard();
      renderSlangCard();
    };
  });
}

function renderDailyCard(){
  const card = document.getElementById("dailyCard");
  const content = GERMAN_DAYS[germanCurrentDay-1];
  const rec = getDayRecord(germanCurrentDay);
  const challenge = DAILY_CHALLENGES[germanCurrentDay-1];
  const a1Done = isA1FullyComplete();
  const postA1Html = a1Done ? `
    <div class="daily-block">
      <div class="daily-block-label"><span class="dot"></span>After A1: Practice &amp; Speak <span class="bonus-tag">Unlocked</span></div>
      <div class="postA1-box"><strong>+</strong> ${esc(POST_A1_VLOG_TASK)}</div>
      <div class="postA1-box"><strong>+</strong> ${esc(getPostA1Speaking(germanCurrentDay, content.topic))}</div>
    </div>` : "";
  card.innerHTML = `
    <div class="daily-card-head">
      <h2>Day ${germanCurrentDay}: ${esc(content.topic)}</h2>
      <span class="day-topic-tag">A1 · Day ${germanCurrentDay}/30</span>
    </div>
    <div class="daily-card-sub">Small step today, closer to B1 tomorrow.</div>

    <div class="daily-block">
      <div class="daily-block-label"><span class="dot"></span>Homework</div>
      <div class="homework-prompt">${esc(content.homework)}</div>
      <textarea id="dailyAnswer" placeholder="Write your answer here...">${esc(rec.answer)}</textarea>
    </div>

    <div class="daily-block">
      <div class="daily-block-label"><span class="dot"></span>Real-Life Challenge</div>
      <div class="challenge-box">${esc(challenge)}</div>
    </div>
    ${postA1Html}
    <div class="daily-block">
      <div class="daily-block-label"><span class="dot"></span>Example: Exam vs. Everyday</div>
      <div class="example-pair">
        <div class="example-box exam-box"><span class="example-tag">Goethe Exam-Correct</span>${esc(content.example)}</div>
        <div class="example-box natural-box"><span class="example-tag">How Germans Actually Say It</span>${esc(content.natural)}</div>
      </div>
    </div>

    <div class="daily-block">
      <div class="daily-block-label"><span class="dot"></span>Your Notes</div>
      <textarea id="dailyNotes" class="notes-area" placeholder="New words, grammar points, things to review..."></textarea>
    </div>

    <div class="daily-done-row">
      <label><input type="checkbox" id="dailyDone" ${rec.done?"checked":""}> Mark Day ${germanCurrentDay} Complete</label>
    </div>
  `;
  card.querySelector("#dailyNotes").value = rec.notes;
  card.querySelector("#dailyAnswer").oninput = (e)=>{ rec.answer = e.target.value; saveData(); };
  card.querySelector("#dailyNotes").oninput = (e)=>{ rec.notes = e.target.value; saveData(); };
  card.querySelector("#dailyDone").onchange = (e)=>{
    rec.done = e.target.checked;
    saveData();
    renderDayPicker();
    renderGermanProgressRing();
    renderDailyCard();
  };
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

function renderGermanView(){
  ensureGerman();
  renderGermanProgressRing();
  renderSlangCard();
  renderDayPicker();
  renderDailyCard();
  renderTestsList();
}

document.getElementById("germanSubnav").addEventListener("click",(e)=>{
  const btn = e.target.closest("button[data-sub]");
  if(!btn) return;
  document.querySelectorAll("#germanSubnav button").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("germanDaily").classList.toggle("hidden", btn.dataset.sub!=="daily");
  document.getElementById("germanTests").classList.toggle("hidden", btn.dataset.sub!=="tests");
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

/* ---------- export as image (beautiful print) ---------- */
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
    const canvas = await html2canvas(target, {scale:2, backgroundColor:"#ffffff", useCORS:true});
    if(prevTransform!==undefined) target.style.transform = prevTransform;
    const link = document.createElement("a");
    link.download = `7-day-plan-${toISO(new Date())}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }catch(err){
    console.error("Image export failed:", err);
    alert("Sorry, the image export failed. Please try again.");
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

/* ---------- init ---------- */
renderWeekView();
