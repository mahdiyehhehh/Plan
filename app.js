/* ===================== 7 Day Plan — app.js ===================== */

const STORAGE_KEY = "sevenDayPlan.v1";
const DAY_KEYS = ["mon","tue","wed","thu","fri","sat","sun"];
const DAY_LABELS = {mon:"Monday",tue:"Tuesday",wed:"Wednesday",thu:"Thursday",fri:"Friday",sat:"Saturday",sun:"Sunday"};
const GERMAN_GOAL = 64;

/* ---------- icons (stroke/fill = currentColor) ---------- */
const ICONS = {
  german:  `<svg viewBox="0 0 24 24" width="14" height="14"><path d="M4 4h13l3 4-3 4H4V4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 12v8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  classes: `<svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 3L1 8l11 5 9-4.1V16h2V8L12 3z" fill="currentColor"/><path d="M5 10.5V16c0 1.7 3.1 4 7 4s7-2.3 7-4v-5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  money:   `<svg viewBox="0 0 24 24" width="14" height="14"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v10M9.5 9.3c0-1.3 1.1-2 2.5-2s2.5.8 2.5 2-1 1.7-2.5 2-2.5.7-2.5 2 1.1 2 2.5 2 2.5-.7 2.5-2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  job:     `<svg viewBox="0 0 24 24" width="14" height="14"><rect x="3" y="8" width="18" height="12" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 13h18" stroke="currentColor" stroke-width="1.8"/></svg>`,
  project: `<svg viewBox="0 0 24 24" width="14" height="14"><rect x="3" y="4" width="18" height="12" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M1 20h22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  cert:    `<svg viewBox="0 0 24 24" width="14" height="14"><path d="M4 20V6a1 1 0 011-1h9l5 5v10a1 1 0 01-1 1H5a1 1 0 01-1-1z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M7 12h8M7 15.5h8M7 8.5h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`
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
    id:"german", label:"German Learning", icon:ICONS.german, accent:true,
    labelExtra:(week)=>{
      const total = DAY_KEYS.reduce((s,dk)=>s+num(week.days[dk].germanVideos),0);
      return `
        <div class="label-field">
          <label>Current level</label>
          <input type="text" data-weekfield="germanLevel" value="${esc(week.germanLevel)}" placeholder="e.g. A1">
        </div>
        <span class="sub">Videos watched: <strong>${total} / ${GERMAN_GOAL}</strong></span>`;
    },
    cell:(d)=>`
      <div class="cell-field">
        <div class="cell-inline">
          <input type="number" min="0" data-field="germanVideos" value="${esc(d.germanVideos)}" placeholder="0">
          <span class="suffix">/ ${GERMAN_GOAL} videos</span>
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
    id:"money", label:"Amount of Money Saved", icon:ICONS.money, iconClass:"gold",
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
        <label>Project name</label>
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
      return `<span class="sub">YouTube videos watched: <strong>${total}</strong></span>`;
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

/* ---------- render: week view ---------- */
function renderWeekView(){
  const mondayISO = toISO(currentMonday);
  const week = getWeek(mondayISO);
  const sunday = addDays(currentMonday,6);
  document.getElementById("weekRange").textContent = `${fmtShort(currentMonday)} – ${fmtLong(sunday)}`;

  const favBtn = document.getElementById("favWeek");
  favBtn.setAttribute("aria-pressed", week.favorite ? "true" : "false");
  favBtn.onclick = ()=>{ week.favorite = !week.favorite; saveData(); renderWeekView(); };

  const tbody = document.getElementById("trackerBody");
  tbody.innerHTML = "";
  CATEGORIES.forEach(cat=>{
    const tr = document.createElement("tr");
    const extra = cat.labelExtra ? cat.labelExtra(week) : "";
    tr.innerHTML = `<td class="row-label">
        <div class="row-label-inner">
          <span class="row-icon${cat.iconClass?" "+cat.iconClass:""}">${cat.icon}</span>
          <span class="row-label-title">${cat.label}</span>
        </div>
        ${extra}
      </td>` +
      DAY_KEYS.map(dk=>`<td data-day="${dk}" data-day-label="${DAY_LABELS[dk]}" data-cat="${cat.id}">${cat.cell(week.days[dk])}</td>`).join("");
    tbody.appendChild(tr);
  });

  // bind per-day inputs
  tbody.querySelectorAll("[data-field]").forEach(el=>{
    const handler = ()=>{
      const td = el.closest("td");
      const dk = td.dataset.day;
      const field = el.dataset.field;
      const val = el.type==="checkbox" ? el.checked : el.value;
      week.days[dk][field] = val;
      saveData();
      if(field==="germanVideos" || field==="certVideos") renderWeekView();
    };
    el.addEventListener(el.tagName==="TEXTAREA"||el.type==="text"||el.type==="number" ? "input" : "change", handler);
  });

  // bind week-level fields (row label column)
  tbody.querySelectorAll("[data-weekfield]").forEach(el=>{
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
}

/* ---------- navigation ---------- */
document.getElementById("prevWeek").onclick = ()=>{ currentMonday = addDays(currentMonday,-7); renderWeekView(); };
document.getElementById("nextWeek").onclick = ()=>{ currentMonday = addDays(currentMonday,7); renderWeekView(); };
document.getElementById("jumpToday").onclick = ()=>{ currentMonday = mondayOf(new Date()); renderWeekView(); };

document.getElementById("prevMonth").onclick = ()=>{ currentMonthCursor.setMonth(currentMonthCursor.getMonth()-1); renderMonthView(); };
document.getElementById("nextMonth").onclick = ()=>{ currentMonthCursor.setMonth(currentMonthCursor.getMonth()+1); renderMonthView(); };

document.getElementById("prevYear").onclick = ()=>{ currentYearCursor -= 1; renderYearView(); };
document.getElementById("nextYear").onclick = ()=>{ currentYearCursor += 1; renderYearView(); };

/* ---------- view switching ---------- */
const views = {week:document.getElementById("weekView"), month:document.getElementById("monthView"), year:document.getElementById("yearView")};
document.getElementById("viewSwitch").addEventListener("click",(e)=>{
  const btn = e.target.closest("button[data-view]");
  if(!btn) return;
  document.querySelectorAll("#viewSwitch button").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  Object.entries(views).forEach(([k,el])=>el.classList.toggle("hidden", k!==btn.dataset.view));
  if(btn.dataset.view==="week") renderWeekView();
  if(btn.dataset.view==="month") renderMonthView();
  if(btn.dataset.view==="year") renderYearView();
});

/* ---------- export / import ---------- */
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
document.getElementById("yearNow").textContent = new Date().getFullYear();
renderWeekView();
