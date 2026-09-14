/* ===================== 7 Day Plan — app.js ===================== */

const STORAGE_KEY = "sevenDayPlan.v1";
const DAY_KEYS = ["mon","tue","wed","thu","fri","sat","sun"];
const DAY_LABELS = {mon:"Monday",tue:"Tuesday",wed:"Wednesday",thu:"Thursday",fri:"Friday",sat:"Saturday",sun:"Sunday"};
const GERMAN_GOAL = 64;

const emptyDay = () => ({
  germanVideos:"", germanNotes:"",
  classesDone:false, classesNotes:"",
  money:"", moneyNotes:"",
  jobHours:"", jobNotes:"",
  projectName:"", projectStatus:"", projectUsers:"", projectNotes:"",
  certVideos:"", certNotes:""
});

const emptyWeek = () => ({
  days:{mon:emptyDay(),tue:emptyDay(),wed:emptyDay(),thu:emptyDay(),fri:emptyDay(),sat:emptyDay(),sun:emptyDay()},
  priorities:["","",""],
  notes:"",
  reflectGood:"",
  reflectBetter:""
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
  return state.weeks[mondayISO];
}

/* ---------- category definitions ---------- */
const CATEGORIES = [
  {
    id:"german", label:"German Learning", sub:`Goal: ${GERMAN_GOAL} videos`, accent:true,
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
    id:"classes", label:"University Classes", sub:"",
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
    id:"money", label:"Money Saved", sub:"",
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
    id:"job", label:"Job", sub:"Hours worked",
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
    id:"project", label:"Project", sub:"",
    cell:(d)=>`
      <div class="cell-field">
        <input type="text" data-field="projectName" value="${esc(d.projectName)}" placeholder="Project name">
        <input type="text" data-field="projectStatus" value="${esc(d.projectStatus)}" placeholder="Status">
        <input type="text" data-field="projectUsers" value="${esc(d.projectUsers)}" placeholder="Users">
        <textarea data-field="projectNotes" placeholder="Notes">${esc(d.projectNotes)}</textarea>
      </div>`
  },
  {
    id:"cert", label:"Accounting Certificate", sub:"YouTube videos watched",
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

function esc(v){
  if(v===undefined||v===null) return "";
  return String(v).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
}

/* ---------- render: week view ---------- */
function renderWeekView(){
  const mondayISO = toISO(currentMonday);
  const week = getWeek(mondayISO);
  const sunday = addDays(currentMonday,6);
  document.getElementById("weekRange").textContent = `${fmtShort(currentMonday)} – ${fmtLong(sunday)}`;

  const tbody = document.getElementById("trackerBody");
  tbody.innerHTML = "";
  CATEGORIES.forEach(cat=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `<td class="row-label"><div class="row-label-inner">${cat.accent?'<span class="dot"></span>':''}${cat.label}</div>${cat.sub?`<span class="sub">${cat.sub}</span>`:""}</td>` +
      DAY_KEYS.map(dk=>`<td data-day="${dk}" data-cat="${cat.id}">${cat.cell(week.days[dk])}</td>`).join("");
    tbody.appendChild(tr);
  });

  // bind inputs
  tbody.querySelectorAll("[data-field]").forEach(el=>{
    const handler = ()=>{
      const td = el.closest("td");
      const dk = td.dataset.day;
      const field = el.dataset.field;
      const val = el.type==="checkbox" ? el.checked : el.value;
      week.days[dk][field] = val;
      saveData();
    };
    el.addEventListener(el.tagName==="TEXTAREA"||el.type==="text"||el.type==="number" ? "input" : "change", handler);
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
function num(v){ const n = parseFloat(v); return isNaN(n) ? 0 : n; }

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
  // returns [{mondayISO, week}] for every stored week whose 7-day span intersects [startDate,endDate]
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
      <td>${fmtShort(r.monday)} – ${fmtShort(sunday)}</td>
      <td>${a.germanVideos}</td>
      <td>${a.classes} / 7</td>
      <td>$${a.money.toFixed(2)}</td>
      <td>${a.jobHours}</td>
      <td>${a.certVideos}</td>
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
      <td>${monthName}</td>
      <td>${totals.germanVideos}</td>
      <td>${totals.classes}</td>
      <td>$${totals.money.toFixed(2)}</td>
      <td>${totals.jobHours}</td>
      <td>${totals.certVideos}</td>
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
renderWeekView();
