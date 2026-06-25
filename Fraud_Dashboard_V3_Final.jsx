import { useState, useMemo, useEffect, useCallback } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Area, LineChart, Line, Legend } from "recharts";

// ============================================================
// ✅ GOOGLE SHEETS CONFIGURATION
// ------------------------------------------------------------
// HOW TO CONNECT YOUR REAL DATA:
// 1. Open your Google Sheet
// 2. File → Share → Publish to web
// 3. For each sheet, select "CSV" format and copy the URL
// 4. Paste each URL below, replacing the placeholder strings
// 5. Make sure your sheet column names match the field names
//    listed in the comments next to each URL
// ============================================================
const SHEET_URLS = {
  // Required columns: Case_ID, Date (DD-Mon-YYYY), Fraud_Type, Pelaku,
  // Fraud_Value_IDR, Recovery_Value_IDR, Partial_Payment_IDR, Status,
  // Province, City, HUB, Project, Invoice_No, Invoiced_Status (Yes/No),
  // Somasi_Level, Fraud_Reason, Investigator_Name, Data_Completeness_Score
  fraudCases: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSsChnRjXsjDlEJRuE9SwZI3iH5F3vh2MBrYEd5V5FNrhpMbMhjzy39p7GyjkYlTmeAGzr1_yy32ZrE/pub?gid=1074283744&single=true&output=csv",

  // Required columns: Recovery_Date, Case_ID, Collector_Names,
  // Channel_Salary_Deduction_IDR, Channel_Joint_Liability_IDR,
  // Channel_Deposit_Deduction_IDR, Channel_Field_Recovery_IDR,
  // Channel_Platform_Fee_IDR, Total_Recovery_IDR, Payment_Type (Full/Partial)
  recoveryData: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSsChnRjXsjDlEJRuE9SwZI3iH5F3vh2MBrYEd5V5FNrhpMbMhjzy39p7GyjkYlTmeAGzr1_yy32ZrE/pub?gid=1801994962&single=true&output=csv",

  // Required columns: Project, Month (Jan 2025), Campaign_Type
  // (Regular/Moderate/Big), Expected_Fraud_Rate_%, Notes
  campaignCalendar: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSsChnRjXsjDlEJRuE9SwZI3iH5F3vh2MBrYEd5V5FNrhpMbMhjzy39p7GyjkYlTmeAGzr1_yy32ZrE/pub?gid=1918000757&single=true&output=csv",
};

// ============================================================
// 🌐 BILINGUAL TRANSLATIONS
// ============================================================
const T = {
  id: {
    appTitle: "Dashboard Deteksi Fraud",
    appSubtitle: "3 Halaman: Performa, Recovery & Investigasi",
    page_fraud: "Performa Fraud",
    page_recovery: "Performa Recovery",
    page_investigation: "Investigasi Fraud",
    filter: "Filter",
    reset: "Reset",
    project: "Project",
    fraudType: "Jenis Fraud",
    pelaku: "Pelaku",
    caseStatus: "Status Kasus",
    location: "Lokasi",
    allProvince: "— Semua Provinsi",
    allCity: "— Semua Kota",
    allHub: "— Semua HUB",
    fraudValue: "Nilai Fraud",
    min: "Min",
    max: "Maks",
    kpiTotal: "Total Kasus",
    kpiFrom: "dari",
    kpiTotalLabel: "total",
    kpiFraudValue: "Nilai Fraud",
    kpiRecovery: "Nilai Recovery",
    kpiOutstanding: "Outstanding Fraud",
    kpiOutstandingSub: "Belum terrecovery",
    kpiRatio: "Recovery Ratio",
    kpiRatioSub: "Fraud terrecovery",
    sectionSummary: "Ringkasan Fraud Keseluruhan",
    sectionTrend: "Tren Fraud & Recovery",
    sectionFraudByType: "Fraud by Jenis (%)",
    sectionHeatmap: "Heatmap Fraud per HUB (Nilai Nominal)",
    sectionAlert: "Sistem Alert & Rekomendasi",
    alertSubtitle: "Alert dibangkitkan otomatis berdasarkan analisis frekuensi, outstanding, dominasi pelaku, dan jenis fraud yang mendominasi.",
    alertLevelCritical: "Kritis",
    alertLevelWarning: "Waspada",
    alertLevelWatch: "Pantau",
    alertRecommend: "Rekomendasi Tindakan Operasional",
    alertSomasi: "Eskalasi Somasi & Legal",
    alertSomasiTrigger: "Trigger otomatis berdasarkan status tindakan terakhir yang tercatat pada kasus di lokasi ini.",
    alertNone: "Tidak ada alert aktif",
    alertNoneSub: "Semua indikator dalam batas normal",
    period_daily: "Harian",
    period_weekly: "Mingguan",
    period_monthly: "Bulanan",
    period_yearly: "Tahunan",
    hubCol: "HUB",
    totalCol: "Total",
    // Recovery page
    recSummary: "Ringkasan Recovery",
    recTotal: "Total Recovery",
    recFull: "Full Payment",
    recPartial: "Partial Payment",
    recCases: "kasus",
    recByChannel: "Recovery by Channel",
    recTopCollectors: "Top 5 Tim Collector",
    recMonthly: "Bulanan",
    recYearly: "Tahunan",
    recRank: "Rank",
    recCollectorName: "Nama Collector",
    recValue: "Nilai Recovery",
    recCampaign: "Kalender Campaign",
    // Investigation page
    invRootCause: "Root Cause Analysis",
    invInvestigator: "Performa Investigator",
    invCompleteness: "Status Kelengkapan Data",
    invAvgComplete: "Rata-rata Kelengkapan",
    invIncomplete: "Kasus Tidak Lengkap (<80%)",
    invTopCases: "Top 10 Kasus Fraud (Detail Investigasi)",
    invAllStatus: "Semua Status",
    invColId: "ID",
    invColType: "Jenis",
    invColValue: "Nilai",
    invColCause: "Root Cause",
    invColInv: "Investigator",
    invColStatus: "Status",
    invColComplete: "Lengkap %",
    // Table
    tableSearch: "Cari ID / invoice / jenis / pelaku / project...",
    tableAllInvoice: "Semua Status Invoice",
    tableDeducted: "Deducted",
    tableNotDeducted: "Belum Ditagih",
    tableCases: "kasus",
    tableColId: "ID Kasus",
    tableColProject: "Project",
    tableColInvoice: "No. Invoice",
    tableColDate: "Tanggal",
    tableColType: "Jenis Fraud",
    tableColPelaku: "Pelaku",
    tableColHub: "HUB",
    tableColValue: "Nilai Fraud",
    tableColRecovery: "Recovery",
    tableColStatus: "Status",
    tableNoData: "Tidak ada data yang cocok",
    tablePage: "Halaman",
    tableOf: "dari",
    tablePrev: "‹ Sebelumnya",
    tableNext: "Berikutnya ›",
    // Data source
    dataLive: "Data Live",
    dataDummy: "Data Demo",
    dataLoading: "Memuat data...",
    dataError: "Gagal memuat data dari Google Sheets. Menampilkan data demo.",
    dataLastUpdated: "Terakhir diperbarui",
  },
  en: {
    appTitle: "Fraud Detection Dashboard",
    appSubtitle: "3 Pages: Performance, Recovery & Investigation",
    page_fraud: "Fraud Performance",
    page_recovery: "Recovery Performance",
    page_investigation: "Fraud Investigation",
    filter: "Filter",
    reset: "Reset",
    project: "Project",
    fraudType: "Fraud Type",
    pelaku: "Perpetrator",
    caseStatus: "Case Status",
    location: "Location",
    allProvince: "— All Provinces",
    allCity: "— All Cities",
    allHub: "— All HUBs",
    fraudValue: "Fraud Value",
    min: "Min",
    max: "Max",
    kpiTotal: "Total Cases",
    kpiFrom: "of",
    kpiTotalLabel: "total",
    kpiFraudValue: "Fraud Value",
    kpiRecovery: "Recovery Value",
    kpiOutstanding: "Outstanding Fraud",
    kpiOutstandingSub: "Not yet recovered",
    kpiRatio: "Recovery Ratio",
    kpiRatioSub: "Fraud recovered",
    sectionSummary: "Overall Fraud Summary",
    sectionTrend: "Fraud & Recovery Trend",
    sectionFraudByType: "Fraud by Type (%)",
    sectionHeatmap: "Fraud Heatmap per HUB (Nominal Value)",
    sectionAlert: "Alert System & Prevention Recommendations",
    alertSubtitle: "Alerts are automatically generated based on frequency analysis, outstanding amounts, perpetrator dominance, and dominant fraud types.",
    alertLevelCritical: "Critical",
    alertLevelWarning: "Warning",
    alertLevelWatch: "Watch",
    alertRecommend: "Operational Action Recommendations",
    alertSomasi: "Legal Escalation & Notice",
    alertSomasiTrigger: "Auto-triggered based on the last recorded action status for cases at this location.",
    alertNone: "No active alerts",
    alertNoneSub: "All indicators within normal range",
    period_daily: "Daily",
    period_weekly: "Weekly",
    period_monthly: "Monthly",
    period_yearly: "Yearly",
    hubCol: "HUB",
    totalCol: "Total",
    // Recovery page
    recSummary: "Recovery Summary",
    recTotal: "Total Recovery",
    recFull: "Full Payment",
    recPartial: "Partial Payment",
    recCases: "cases",
    recByChannel: "Recovery by Channel",
    recTopCollectors: "Top 5 Collector Teams",
    recMonthly: "Monthly",
    recYearly: "Yearly",
    recRank: "Rank",
    recCollectorName: "Collector Name",
    recValue: "Recovery Value",
    recCampaign: "Campaign Calendar",
    // Investigation page
    invRootCause: "Root Cause Analysis",
    invInvestigator: "Investigator Performance",
    invCompleteness: "Data Completeness Status",
    invAvgComplete: "Average Completeness",
    invIncomplete: "Incomplete Cases (<80%)",
    invTopCases: "Top 10 Fraud Cases (Investigation Detail)",
    invAllStatus: "All Status",
    invColId: "ID",
    invColType: "Type",
    invColValue: "Value",
    invColCause: "Root Cause",
    invColInv: "Investigator",
    invColStatus: "Status",
    invColComplete: "Complete %",
    // Table
    tableSearch: "Search ID / invoice / type / perpetrator / project...",
    tableAllInvoice: "All Invoice Status",
    tableDeducted: "Deducted",
    tableNotDeducted: "Not Invoiced",
    tableCases: "cases",
    tableColId: "Case ID",
    tableColProject: "Project",
    tableColInvoice: "Invoice No.",
    tableColDate: "Date",
    tableColType: "Fraud Type",
    tableColPelaku: "Perpetrator",
    tableColHub: "HUB",
    tableColValue: "Fraud Value",
    tableColRecovery: "Recovery",
    tableColStatus: "Status",
    tableNoData: "No matching data found",
    tablePage: "Page",
    tableOf: "of",
    tablePrev: "‹ Prev",
    tableNext: "Next ›",
    // Data source
    dataLive: "Live Data",
    dataDummy: "Demo Data",
    dataLoading: "Loading data...",
    dataError: "Failed to load data from Google Sheets. Showing demo data.",
    dataLastUpdated: "Last updated",
  }
};

// ============================================================
// CONSTANTS
// ============================================================
const COLORS = ["#7C3AED","#0EA5E9","#F59E0B","#EF4444","#10B981","#EC4899","#8B5CF6","#06B6D4","#F97316","#14B8A6"];
const FRAUD_TYPES = ["Pending COD","Lost & Damage","Fake Order & Delivery","Swap Parcel","Pencurian Paket"];
const PELAKU = ["Kurir (Rider)","Kurir (Driver)","Operator","Admin Tracer","Korlap","Helper"];
const STATUS_LIST = ["Open","Open (Partial Payment)","Investigating","Closed Solved","Closed Unsolved"];
const SOMASI_LEVELS = ["Belum Ada Tindakan","Surat Peringatan 1","Surat Peringatan 2","Surat Somasi 1","Surat Somasi 2","Surat Somasi 3","Proses Litigasi"];
const PROVINCES = ["Jawa Tengah","Jawa Barat","Jawa Timur","DKI Jakarta","Banten","Sumatera Utara"];
const PROJECTS = ["Shopee Express","GoTo Logistics","SF Express","Kapal Api","Indopaket","Lion Parcel","J&T Express","Anteraja"];
const RECOVERY_CHANNELS = ["Salary Deduction","Joint Liability","Deposit Deduction","Field Recovery","Platform Fee"];
const COLLECTORS = ["Tim A - Recovery","Tim B - Recovery","Tim C - Recovery","Tim D - Recovery","Tim E - Recovery"];
const PROJECT_COLORS = ["#7C3AED","#0EA5E9","#F59E0B","#EF4444","#10B981","#EC4899","#8B5CF6","#F97316"];
const CHANNEL_COLORS = { "Salary Deduction":"#7C3AED","Joint Liability":"#0EA5E9","Deposit Deduction":"#F59E0B","Field Recovery":"#10B981","Platform Fee":"#EC4899" };

const CITIES = {
  "Jawa Tengah":["Semarang","Solo","Kudus","Demak"],
  "Jawa Barat":["Bandung","Bekasi","Depok","Bogor"],
  "Jawa Timur":["Surabaya","Malang","Sidoarjo","Gresik"],
  "DKI Jakarta":["Jakarta Pusat","Jakarta Selatan","Jakarta Utara","Jakarta Barat"],
  "Banten":["Tangerang","Serang","Cilegon"],
  "Sumatera Utara":["Medan","Deliserdang","Binjai"],
};
const HUBS = {
  "Semarang":["HUB Semarang Pusat","HUB Semarang Timur"],"Solo":["HUB Solo"],"Kudus":["HUB Kudus"],"Demak":["HUB Demak"],
  "Bandung":["HUB Bandung Utara","HUB Bandung Selatan"],"Bekasi":["HUB Bekasi"],"Depok":["HUB Depok"],"Bogor":["HUB Bogor"],
  "Surabaya":["HUB Surabaya Rungkut","HUB Surabaya Barat"],"Malang":["HUB Malang"],"Sidoarjo":["HUB Sidoarjo"],"Gresik":["HUB Gresik"],
  "Jakarta Pusat":["HUB Jakpus"],"Jakarta Selatan":["HUB Jaksel"],"Jakarta Utara":["HUB Jakut"],"Jakarta Barat":["HUB Jakbar"],
  "Tangerang":["HUB Tangerang"],"Serang":["HUB Serang"],"Cilegon":["HUB Cilegon"],
  "Medan":["HUB Medan"],"Deliserdang":["HUB Deliserdang"],"Binjai":["HUB Binjai"],
};

const statusColor = {"Open":"#EF4444","Open (Partial Payment)":"#F97316","Investigating":"#F59E0B","Closed Solved":"#10B981","Closed Unsolved":"#6B7280"};
const levelCfg = {
  critical:{color:"#EF4444",bg:"#FEF2F2",border:"#FECACA",icon:"ti-alert-octagon"},
  warning:{color:"#F59E0B",bg:"#FFFBEB",border:"#FDE68A",icon:"ti-alert-triangle"},
  watch:{color:"#0EA5E9",bg:"#EFF6FF",border:"#BFDBFE",icon:"ti-eye"},
};

// ============================================================
// FORMATTERS
// ============================================================
const fmt = n => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",notation:"compact",maximumFractionDigits:1}).format(n);
const fmtFull = n => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);
const fmtNum = n => new Intl.NumberFormat("id-ID").format(n);
const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const MONTHS_FULL = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const rand = (a,b) => Math.floor(Math.random()*(b-a+1))+a;

function fmtDateDDMonYYYY(d) {
  return `${String(d.getDate()).padStart(2,"0")} ${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
}
function getMonday(d) {
  const dt = new Date(d); const day = dt.getDay();
  dt.setDate(dt.getDate() + (day===0?-6:1-day));
  return dt;
}
function nowStr() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,"0")} ${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

// ============================================================
// CSV PARSER — converts Google Sheets CSV URL to array of objects
// ============================================================
async function fetchCSV(url) {
  const res = await fetch(url);
  const text = await res.text();
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g,""));
  return lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g,""));
    const obj = {};
    headers.forEach((h,i) => { obj[h] = vals[i] || ""; });
    return obj;
  });
}

// Parse CSV row → fraud case object
function parseFraudCase(row, idx) {
  const parseDate = str => {
    const months = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11,
      Mei:4,Agu:7,Okt:9,Des:11};
    const parts = str.replace(/-/g," ").split(" ");
    if (parts.length >= 3) {
      const day = parseInt(parts[0]);
      const mon = months[parts[1]] ?? 0;
      const year = parseInt(parts[2]);
      return new Date(year, mon, day);
    }
    return new Date(str);
  };
  return {
    id: row["Case_ID"] || `FRD-${String(idx+1).padStart(4,"0")}`,
    date: parseDate(row["Date"] || "01-Jan-2025"),
    fraud_type: row["Fraud_Type"] || FRAUD_TYPES[0],
    pelaku: row["Pelaku"] || PELAKU[0],
    fraud_val: parseFloat(row["Fraud_Value_IDR"]) || 0,
    recovered: parseFloat(row["Recovery_Value_IDR"]) || 0,
    partial_paid: parseFloat(row["Partial_Payment_IDR"]) || 0,
    status: row["Status"] || STATUS_LIST[0],
    province: row["Province"] || "",
    city: row["City"] || "",
    hub: row["HUB"] || "",
    project: row["Project"] || PROJECTS[0],
    invoice_no: row["Invoice_No"] || null,
    invoiced: row["Invoiced_Status"] === "Yes",
    somasi_level: row["Somasi_Level"] || SOMASI_LEVELS[0],
    completeness: parseFloat(row["Data_Completeness_Score"]) || 80,
    reason: row["Fraud_Reason"] || "",
    investigator: row["Investigator_Name"] || "",
  };
}

// Parse CSV row → recovery data object
function parseRecoveryRow(row, idx) {
  const parseDate = str => new Date(str.replace(/-/g," ")) || new Date();
  const channels = {};
  let total = 0;
  RECOVERY_CHANNELS.forEach(ch => {
    const key = `Channel_${ch.replace(/ /g,"_")}_IDR`;
    const val = parseFloat(row[key]) || 0;
    if (val > 0) { channels[ch] = val; total += val; }
  });
  if (total === 0) total = parseFloat(row["Total_Recovery_IDR"]) || 0;
  return {
    date: parseDate(row["Recovery_Date"] || "01-Jan-2025"),
    case_id: row["Case_ID"] || "",
    collector: row["Collector_Names"] || COLLECTORS[0],
    channels,
    total,
    payment_type: row["Payment_Type"] || "Full",
  };
}

// ============================================================
// DUMMY DATA GENERATORS (fallback when no Google Sheets URL)
// ============================================================
function genCases(n=300) {
  const cases=[]; const start=new Date("2025-01-01");
  for(let i=0;i<n;i++){
    const d=new Date(start.getTime()+Math.random()*365*24*3600*1000);
    const prov=PROVINCES[Math.floor(Math.random()*PROVINCES.length)];
    const city=CITIES[prov][Math.floor(Math.random()*CITIES[prov].length)];
    const hubList=HUBS[city]||[`HUB ${city}`];
    const hub=hubList[Math.floor(Math.random()*hubList.length)];
    const fraud_val=Math.round((Math.random()*499+1)*100000);
    const status=STATUS_LIST[Math.floor(Math.random()*STATUS_LIST.length)];
    const partial_paid=status==="Open (Partial Payment)"?Math.round(fraud_val*(0.1+Math.random()*0.4)):0;
    const recovered=status.startsWith("Closed")?(status==="Closed Solved"?Math.round(fraud_val*(0.5+Math.random()*0.5)):Math.round(fraud_val*Math.random()*0.3)):(status==="Investigating"?Math.round(fraud_val*Math.random()*0.2):0);
    cases.push({
      id:`FRD-${String(i+1).padStart(4,"0")}`, date:d,
      fraud_type:FRAUD_TYPES[Math.floor(Math.random()*FRAUD_TYPES.length)],
      pelaku:PELAKU[Math.floor(Math.random()*PELAKU.length)],
      status, fraud_val, recovered, partial_paid,
      province:prov, city, hub,
      invoice_no:Math.random()>0.35?`INV-${d.getFullYear()}-${String(rand(1000,99999)).padStart(5,"0")}`:null,
      invoiced:Math.random()>0.4,
      project:PROJECTS[Math.floor(Math.random()*PROJECTS.length)],
      somasi_level:SOMASI_LEVELS[Math.floor(Math.random()*SOMASI_LEVELS.length)],
      completeness:rand(60,100),
      reason:["Disregard SOP","Insider Collusion","Sistem Error","Communication Gap","Lack of Verification"][Math.floor(Math.random()*5)],
      investigator:COLLECTORS[Math.floor(Math.random()*COLLECTORS.length)],
    });
  }
  return cases;
}
function genRecoveryData(n=150) {
  const data=[]; const start=new Date("2025-01-01");
  for(let i=0;i<n;i++){
    const d=new Date(start.getTime()+Math.random()*90*24*3600*1000);
    const channels={}; let total=0;
    RECOVERY_CHANNELS.forEach(ch=>{ if(Math.random()>0.6){const v=rand(1000000,20000000);channels[ch]=v;total+=v;} });
    data.push({ date:d, case_id:`FRD-${String(i+1).padStart(4,"0")}`, collector:COLLECTORS[Math.floor(Math.random()*COLLECTORS.length)], channels, total, payment_type:Math.random()>0.6?"Full":"Partial" });
  }
  return data;
}
function genCampaignCalendar() {
  const cal={};
  PROJECTS.forEach(p=>{ cal[p]={};
    ["01-2025","02-2025","03-2025","04-2025","05-2025","06-2025"].forEach(m=>{
      cal[p][m]={type:["Regular","Moderate","Big"][rand(0,2)],rate:(rand(20,120)/10).toFixed(1)};
    });
  });
  return cal;
}

// ============================================================
// DATA PROCESSING HELPERS
// ============================================================
function groupByPeriod(cases, period) {
  const map={};
  cases.forEach(c=>{
    let key,sortKey;
    if(period==="daily"){key=fmtDateDDMonYYYY(c.date);sortKey=c.date.toISOString().slice(0,10);}
    else if(period==="weekly"){const mon=getMonday(c.date);key=fmtDateDDMonYYYY(mon);sortKey=mon.toISOString().slice(0,10);}
    else if(period==="monthly"){key=MONTHS[c.date.getMonth()]+" "+c.date.getFullYear();sortKey=`${c.date.getFullYear()}-${String(c.date.getMonth()+1).padStart(2,"0")}`;}
    else{key=c.date.getFullYear()+"";sortKey=key;}
    if(!map[sortKey])map[sortKey]={label:key,sortKey,cases:0,fraud_val:0,recovered:0};
    map[sortKey].cases++;map[sortKey].fraud_val+=c.fraud_val;map[sortKey].recovered+=c.recovered;
  });
  return Object.values(map).sort((a,b)=>a.sortKey>b.sortKey?1:-1).slice(-12);
}

function getFraudTypePercentageData(cases, period) {
  const map={};
  cases.forEach(c=>{
    let key,sortKey;
    if(period==="daily"){key=fmtDateDDMonYYYY(c.date);sortKey=c.date.toISOString().slice(0,10);}
    else if(period==="weekly"){const mon=getMonday(c.date);key=fmtDateDDMonYYYY(mon);sortKey=mon.toISOString().slice(0,10);}
    else if(period==="monthly"){key=MONTHS[c.date.getMonth()]+" "+c.date.getFullYear();sortKey=`${c.date.getFullYear()}-${String(c.date.getMonth()+1).padStart(2,"0")}`;}
    else{key=c.date.getFullYear()+"";sortKey=key;}
    if(!map[sortKey]){map[sortKey]={label:key,sortKey,total:0};FRAUD_TYPES.forEach(ft=>map[sortKey][ft]=0);}
    map[sortKey].total+=c.fraud_val; map[sortKey][c.fraud_type]+=c.fraud_val;
  });
  return Object.values(map).sort((a,b)=>a.sortKey>b.sortKey?1:-1).slice(-12).map(item=>{
    const result={date:item.label};
    FRAUD_TYPES.forEach(ft=>{ result[ft]=item.total>0?parseFloat((item[ft]/item.total*100).toFixed(1)):0; });
    return result;
  });
}

function getRecoveryByChannelData(recovery, period) {
  const map={};
  recovery.forEach(r=>{
    let key,sortKey;
    if(period==="daily"){key=fmtDateDDMonYYYY(r.date);sortKey=r.date.toISOString().slice(0,10);}
    else if(period==="weekly"){const mon=getMonday(r.date);key=fmtDateDDMonYYYY(mon);sortKey=mon.toISOString().slice(0,10);}
    else if(period==="monthly"){key=MONTHS[r.date.getMonth()]+" "+r.date.getFullYear();sortKey=`${r.date.getFullYear()}-${String(r.date.getMonth()+1).padStart(2,"0")}`;}
    else{key=r.date.getFullYear()+"";sortKey=key;}
    if(!map[sortKey]){map[sortKey]={label:key,sortKey};RECOVERY_CHANNELS.forEach(ch=>map[sortKey][ch]=0);}
    Object.entries(r.channels).forEach(([ch,val])=>{ map[sortKey][ch]=(map[sortKey][ch]||0)+val; });
  });
  return Object.values(map).sort((a,b)=>a.sortKey>b.sortKey?1:-1).slice(-12);
}

function getNextSomasiAction(level) {
  const idx=SOMASI_LEVELS.indexOf(level);
  if(idx<1) return "Kirim Surat Peringatan Pertama (SP-1)";
  if(idx===1) return "Kirim Surat Peringatan Kedua (SP-2)";
  if(idx===2) return "Kirim Surat Somasi Pertama (SS-1) via Notaris/Kuasa Hukum";
  if(idx===3) return "Kirim Surat Somasi Kedua (SS-2) — tenggat 14 hari";
  if(idx===4) return "Kirim Surat Somasi Ketiga (SS-3) — Peringatan Final";
  if(idx===5) return "Eskalasi ke Proses Litigasi — Koordinasi Tim Legal & Pengacara";
  return "Sudah dalam proses litigasi — monitor perkembangan sidang";
}

function computeAlerts(cases) {
  const alerts=[]; const locStats={};
  cases.forEach(c=>{
    [[c.province,"Provinsi"],[c.city,"Kota"],[c.hub,"HUB"]].forEach(([loc,type])=>{
      if(!locStats[loc])locStats[loc]={name:loc,type,cases:0,val:0,outstanding:0,pelakuMap:{},somasiMap:{},fraudTypeMap:{}};
      locStats[loc].cases++; locStats[loc].val+=c.fraud_val;
      const out=c.fraud_val-c.recovered-c.partial_paid; if(out>0)locStats[loc].outstanding+=out;
      locStats[loc].pelakuMap[c.pelaku]=(locStats[loc].pelakuMap[c.pelaku]||0)+1;
      locStats[loc].somasiMap[c.somasi_level]=(locStats[loc].somasiMap[c.somasi_level]||0)+1;
      locStats[loc].fraudTypeMap[c.fraud_type]=(locStats[loc].fraudTypeMap[c.fraud_type]||0)+1;
    });
  });

  Object.values(locStats).filter(x=>x.type==="HUB").sort((a,b)=>b.outstanding-a.outstanding).slice(0,3).forEach(loc=>{
    if(loc.outstanding>5000000){
      const topSomasi=Object.entries(loc.somasiMap).sort((a,b)=>b[1]-a[1])[0];
      const topFT=Object.entries(loc.fraudTypeMap).sort((a,b)=>b[1]-a[1])[0];
      alerts.push({
        level:"critical",loc:loc.name,type:loc.type,
        title:`Outstanding fraud tinggi di ${loc.name}`,
        desc:`Total fraud belum terrecovery sebesar ${fmtFull(loc.outstanding)}.\n\n📊 Jenis fraud dominan: ${topFT?topFT[0]:"—"} (${topFT?topFT[1]+" kasus":"—"}).\nStatus somasi terakhir: ${topSomasi?topSomasi[0]:"Belum Ada Tindakan"}.`,
        actions:["Kirim tim audit & collection ke lokasi ini","Freeze pencairan komisi pelaku terduga","Investigasi manifest & CCTV gudang","Koordinasi legal untuk surat teguran formal"],
        somasi:getNextSomasiAction(topSomasi?topSomasi[0]:"Belum Ada Tindakan"),
      });
    }
  });

  Object.values(locStats).filter(x=>x.type==="HUB"&&x.cases>=5).forEach(loc=>{
    const dom=Object.entries(loc.pelakuMap).sort((a,b)=>b[1]-a[1])[0];
    const topFT=Object.entries(loc.fraudTypeMap).sort((a,b)=>b[1]-a[1])[0];
    if(dom&&dom[1]/loc.cases>0.5){
      alerts.push({
        level:"warning",loc:loc.name,type:loc.type,
        title:`Pelaku dominan: ${dom[0]} di ${loc.name}`,
        desc:`${dom[0]} bertanggung jawab atas ${Math.round(dom[1]/loc.cases*100)}% kasus.\n\n📊 Jenis fraud terbanyak: ${topFT?topFT[0]:"—"} (${topFT?Math.round(topFT[1]/loc.cases*100)+"% kasus":"—"}).`,
        actions:[`Terapkan KYC prioritas untuk ${dom[0]} baru`,"Background check ulang pelaku aktif","Pasang CCTV di titik aktivitas","Sosialisasikan whistleblowing channel"],
        somasi:getNextSomasiAction("Belum Ada Tindakan"),
      });
    }
  });

  const hubCases={};
  cases.forEach(c=>{hubCases[c.hub]=(hubCases[c.hub]||0)+1;});
  Object.entries(hubCases).sort((a,b)=>b[1]-a[1]).slice(0,2).forEach(([hub,cnt])=>{
    if(cnt>=12&&!alerts.find(a=>a.loc===hub&&a.level==="critical")){
      const topFT=locStats[hub]?Object.entries(locStats[hub].fraudTypeMap).sort((a,b)=>b[1]-a[1])[0]:null;
      alerts.push({
        level:"watch",loc:hub,type:"HUB",
        title:`Frekuensi kasus tinggi di ${hub}`,
        desc:`${cnt} kasus tercatat. Volume melebihi rata-rata HUB lainnya.\n\n📊 Fraud type dominan: ${topFT?topFT[0]:"—"} (${topFT?topFT[1]+" kasus":"—"}).`,
        actions:["Perkuat supervisi shift sore & malam","Review zona kerja kurir","Aktifkan monitoring GPS real-time","Briefing integritas mingguan"],
        somasi:getNextSomasiAction("Surat Peringatan 1"),
      });
    }
  });
  return alerts.slice(0,10);
}

// ============================================================
// SHARED COMPONENTS
// ============================================================
function KPICard({label,value,sub,color="#7C3AED",icon}) {
  return (
    <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"14px 16px",borderTop:`3px solid ${color}`}}>
      <div style={{fontSize:11,color:"var(--color-text-secondary)",marginBottom:4,display:"flex",alignItems:"center",gap:4}}>
        {icon&&<i className={`ti ${icon}`} style={{fontSize:13}} aria-hidden="true"/>}{label}
      </div>
      <div style={{fontSize:20,fontWeight:500,color:"var(--color-text-primary)"}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:"var(--color-text-secondary)",marginTop:2}}>{sub}</div>}
    </div>
  );
}
function Tag({children,color="purple"}) {
  const cs={purple:"#7C3AED",blue:"#0EA5E9",amber:"#F59E0B",red:"#EF4444",green:"#10B981",gray:"#6B7280",pink:"#EC4899",orange:"#F97316"};
  const c=cs[color]||cs.purple;
  return <span style={{background:c+"22",color:c,border:`1px solid ${c}44`,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:500,whiteSpace:"nowrap"}}>{children}</span>;
}
const CustomTooltip = ({active,payload,label}) => {
  if(!active||!payload?.length) return null;
  return (
    <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-secondary)",borderRadius:8,padding:"8px 12px",fontSize:12}}>
      <div style={{fontWeight:500,marginBottom:4}}>{label}</div>
      {payload.map((p,i)=><div key={i} style={{color:p.color}}>{p.name}: {typeof p.value==="number"&&p.value>1000?fmt(p.value):typeof p.value==="number"?(p.value.toFixed(1)+"%"):fmtNum(p.value)}</div>)}
    </div>
  );
};

// ============================================================
// PAGE 1: FRAUD PERFORMANCE
// ============================================================
function PageFraudPerformance({filtered, allCases, alerts, t}) {
  const [period, setPeriod] = useState("monthly");
  const [typeMetric, setTypeMetric] = useState("cases");
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [invoiceFilter, setInvoiceFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const totalFraud=filtered.reduce((s,c)=>s+c.fraud_val,0);
  const totalRecovered=filtered.reduce((s,c)=>s+c.recovered,0);
  const totalPartial=filtered.reduce((s,c)=>s+c.partial_paid,0);
  const outstanding=totalFraud-totalRecovered-totalPartial;
  const recoveryRatio=totalFraud>0?(totalRecovered/totalFraud*100).toFixed(1):0;
  const invoicedCount=filtered.filter(c=>c.invoiced).length;
  const notInvoicedCount=filtered.filter(c=>!c.invoiced).length;
  const invoicedVal=filtered.filter(c=>c.invoiced).reduce((s,c)=>s+c.fraud_val,0);
  const notInvoicedVal=filtered.filter(c=>!c.invoiced).reduce((s,c)=>s+c.fraud_val,0);
  const invoicedPct=filtered.length>0?(invoicedCount/filtered.length*100).toFixed(1):0;

  const trendData=groupByPeriod(filtered,period);
  const fraudTypePctData=getFraudTypePercentageData(filtered,period);
  const byType=FRAUD_TYPES.map(t=>({name:t,kasus:filtered.filter(c=>c.fraud_type===t).length,nilai:filtered.filter(c=>c.fraud_type===t).reduce((s,c)=>s+c.fraud_val,0)}));
  const byPelaku=PELAKU.map(p=>({name:p,kasus:filtered.filter(c=>c.pelaku===p).length,nilai:filtered.filter(c=>c.pelaku===p).reduce((s,c)=>s+c.fraud_val,0)})).filter(x=>x.kasus>0);
  const byStatus=STATUS_LIST.map(s=>({name:s,value:filtered.filter(c=>c.status===s).length})).filter(x=>x.value>0);
  const byProv=PROVINCES.map(p=>({name:p,kasus:filtered.filter(c=>c.province===p).length,nilai:filtered.filter(c=>c.province===p).reduce((s,c)=>s+c.fraud_val,0)}));

  const byProject=PROJECTS.map((proj,i)=>{
    const pc=filtered.filter(c=>c.project===proj);
    const pVal=pc.reduce((s,c)=>s+c.fraud_val,0); const pRec=pc.reduce((s,c)=>s+c.recovered,0);
    const pPart=pc.reduce((s,c)=>s+c.partial_paid,0); const pInv=pc.filter(c=>c.invoiced).length;
    const pInvVal=pc.filter(c=>c.invoiced).reduce((s,c)=>s+c.fraud_val,0);
    return {name:proj,color:PROJECT_COLORS[i%PROJECT_COLORS.length],kasus:pc.length,nilai:pVal,recovery:pRec,outstanding:pVal-pRec-pPart,ratio:pVal>0?+(pRec/pVal*100).toFixed(1):0,invoiced:pInv,notInvoiced:pc.length-pInv,invoicedVal:pInvVal,notInvoicedVal:pVal-pInvVal,invoicedPct:pc.length>0?(pInv/pc.length*100).toFixed(1):0};
  }).filter(x=>x.kasus>0);

  const heatmapData=useMemo(()=>{
    const hubMap={};
    filtered.forEach(c=>{
      if(!hubMap[c.hub])hubMap[c.hub]={};
      if(!hubMap[c.hub][c.fraud_type])hubMap[c.hub][c.fraud_type]=0;
      hubMap[c.hub][c.fraud_type]+=c.fraud_val;
    });
    return hubMap;
  },[filtered]);

  const invoicePieData=[
    {name:"Ditagih",value:invoicedCount,val:invoicedVal,pct:invoicedPct},
    {name:"Belum",value:notInvoicedCount,val:notInvoicedVal,pct:(100-parseFloat(invoicedPct)).toFixed(1)},
  ];

  const tableFiltered=useMemo(()=>{
    let d=filtered;
    if(invoiceFilter==="deducted")d=d.filter(c=>c.invoiced);
    if(invoiceFilter==="not_deducted")d=d.filter(c=>!c.invoiced);
    if(search)d=d.filter(c=>c.id.toLowerCase().includes(search.toLowerCase())||c.fraud_type.toLowerCase().includes(search.toLowerCase())||c.pelaku.toLowerCase().includes(search.toLowerCase())||(c.invoice_no||"").toLowerCase().includes(search.toLowerCase())||c.project.toLowerCase().includes(search.toLowerCase()));
    return d;
  },[filtered,invoiceFilter,search]);

  const paged=tableFiltered.slice((page-1)*PER_PAGE,page*PER_PAGE);
  const totalPages=Math.ceil(tableFiltered.length/PER_PAGE);
  const periodOpts={daily:t.period_daily,weekly:t.period_weekly,monthly:t.period_monthly,yearly:t.period_yearly};

  return (
    <div>
      {/* KPI */}
      <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"12px 16px",marginBottom:12}}>
        <div style={{fontWeight:500,fontSize:12,marginBottom:10,color:"var(--color-text-primary)",display:"flex",alignItems:"center",gap:5}}>
          <i className="ti ti-chart-infographic" style={{color:"#7C3AED"}} aria-hidden="true"/>{t.sectionSummary}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:8}}>
          <KPICard label={t.kpiTotal} value={fmtNum(filtered.length)} sub={`${t.kpiFrom} ${fmtNum(allCases.length)} ${t.kpiTotalLabel}`} color="#7C3AED" icon="ti-alert-triangle"/>
          <KPICard label={t.kpiFraudValue} value={fmt(totalFraud)} sub={fmtFull(totalFraud)} color="#F59E0B" icon="ti-currency-dollar"/>
          <KPICard label={t.kpiRecovery} value={fmt(totalRecovered)} sub={fmtFull(totalRecovered)} color="#10B981" icon="ti-arrow-back-up"/>
          <KPICard label={t.kpiOutstanding} value={fmt(outstanding)} sub={t.kpiOutstandingSub} color="#EF4444" icon="ti-clock-exclamation"/>
          <KPICard label={t.kpiRatio} value={`${recoveryRatio}%`} sub={t.kpiRatioSub} color="#0EA5E9" icon="ti-chart-pie"/>
        </div>
      </div>

      {/* Per-Project */}
      <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"12px 16px",marginBottom:12}}>
        <div style={{fontWeight:500,fontSize:12,marginBottom:10,color:"var(--color-text-primary)",display:"flex",alignItems:"center",gap:5}}>
          <i className="ti ti-building-factory-2" style={{color:"#0EA5E9"}} aria-hidden="true"/>Kontribusi Fraud per Project
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead>
              <tr style={{background:"var(--color-background-secondary)"}}>
                {[t.tableColProject,"Kasus","Nilai Fraud","Recovery","Outstanding","Ratio"].map(h=>(
                  <th key={h} style={{padding:"6px 8px",textAlign:h===t.tableColProject?"left":"right",fontWeight:500,fontSize:10,color:"var(--color-text-secondary)",borderBottom:"0.5px solid var(--color-border-tertiary)",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {byProject.sort((a,b)=>b.nilai-a.nilai).map(p=>(
                <tr key={p.name} style={{borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                  <td style={{padding:"6px 8px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{width:8,height:8,borderRadius:2,background:p.color,flexShrink:0}}/>
                      <span style={{fontWeight:500,color:"var(--color-text-primary)",fontSize:11}}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{padding:"6px 8px",textAlign:"right",fontSize:10,color:"var(--color-text-primary)"}}>{fmtNum(p.kasus)}</td>
                  <td style={{padding:"6px 8px",textAlign:"right",fontSize:10,color:"#F59E0B",fontWeight:500}}>{fmt(p.nilai)}</td>
                  <td style={{padding:"6px 8px",textAlign:"right",fontSize:10,color:"#10B981"}}>{fmt(p.recovery)}</td>
                  <td style={{padding:"6px 8px",textAlign:"right",fontSize:10,color:"#EF4444"}}>{fmt(p.outstanding)}</td>
                  <td style={{padding:"6px 8px",textAlign:"right"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:5}}>
                      <div style={{width:50,height:5,borderRadius:3,background:"var(--color-background-secondary)",overflow:"hidden"}}>
                        <div style={{width:`${Math.min(p.ratio,100)}%`,height:"100%",background:"#10B981",borderRadius:3}}/>
                      </div>
                      <span style={{fontSize:10,color:"#10B981",fontWeight:500,minWidth:32}}>{p.ratio}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Status */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"12px 16px"}}>
          <div style={{fontWeight:500,fontSize:12,marginBottom:10,color:"var(--color-text-primary)",display:"flex",alignItems:"center",gap:5}}>
            <i className="ti ti-receipt-2" style={{color:"#EC4899"}} aria-hidden="true"/>Status Invoice
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{height:120,width:120,flexShrink:0}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={invoicePieData} dataKey="value" cx="50%" cy="50%" innerRadius={32} outerRadius={52} paddingAngle={3}>
                    <Cell fill="#EC4899"/><Cell fill="#6B7280"/>
                  </Pie>
                  <Tooltip formatter={(v,n,p)=>[`${fmtNum(v)} kasus (${p.payload.pct}%)`,n]}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{flex:1,fontSize:11}}>
              <div style={{marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}><span style={{width:8,height:8,borderRadius:2,background:"#EC4899"}}/><span style={{color:"var(--color-text-secondary)"}}>{t.tableDeducted}</span></div>
                <div style={{fontWeight:500,color:"var(--color-text-primary)"}}>{fmtNum(invoicedCount)} kasus — {invoicedPct}%</div>
                <div style={{fontSize:10,color:"#EC4899"}}>{fmt(invoicedVal)}</div>
              </div>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}><span style={{width:8,height:8,borderRadius:2,background:"#6B7280"}}/><span style={{color:"var(--color-text-secondary)"}}>{t.tableNotDeducted}</span></div>
                <div style={{fontWeight:500,color:"var(--color-text-primary)"}}>{fmtNum(notInvoicedCount)} kasus — {(100-parseFloat(invoicedPct)).toFixed(1)}%</div>
                <div style={{fontSize:10,color:"#6B7280"}}>{fmt(notInvoicedVal)}</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"12px 16px"}}>
          <div style={{fontWeight:500,fontSize:12,marginBottom:8,color:"var(--color-text-primary)",display:"flex",alignItems:"center",gap:5}}>
            <i className="ti ti-building-factory-2" style={{color:"#EC4899"}} aria-hidden="true"/>Invoice per Project
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:5,overflowY:"auto",maxHeight:130}}>
            {byProject.sort((a,b)=>b.nilai-a.nilai).map(p=>(
              <div key={p.name} style={{fontSize:10,display:"flex",alignItems:"center",gap:6}}>
                <span style={{width:7,height:7,borderRadius:2,background:p.color,flexShrink:0}}/>
                <span style={{color:"var(--color-text-secondary)",minWidth:90,fontSize:10}}>{p.name}</span>
                <div style={{flex:1,display:"flex",gap:2}}>
                  <div style={{flex:p.invoicedPct,height:6,background:"#EC4899",borderRadius:"3px 0 0 3px",minWidth:1}}/>
                  <div style={{flex:100-p.invoicedPct,height:6,background:"#E5E7EB",borderRadius:"0 3px 3px 0",minWidth:1}}/>
                </div>
                <span style={{color:"#EC4899",fontWeight:500,minWidth:32,textAlign:"right"}}>{p.invoiced}/{p.kasus}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend */}
      <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"14px",marginBottom:12}}>
        <div style={{fontWeight:500,fontSize:13,marginBottom:10,color:"var(--color-text-primary)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span><i className="ti ti-trending-up" style={{color:"#7C3AED",marginRight:6}} aria-hidden="true"/>{t.sectionTrend} — {periodOpts[period]}</span>
          <select value={period} onChange={e=>setPeriod(e.target.value)} style={{fontSize:11,padding:"4px 8px"}}>
            {Object.entries(periodOpts).map(([k,v])=><option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div style={{height:200}}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)"/>
              <XAxis dataKey="label" tick={{fontSize:9,fill:"#888"}} tickLine={false} angle={-20} textAnchor="end" height={40}/>
              <YAxis yAxisId="left" tickFormatter={v=>fmt(v)} tick={{fontSize:9,fill:"#888"}} tickLine={false} axisLine={false}/>
              <YAxis yAxisId="right" orientation="right" tick={{fontSize:9,fill:"#888"}} tickLine={false} axisLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Area yAxisId="left" type="monotone" dataKey="fraud_val" name="Nilai Fraud" fill="#7C3AED22" stroke="#7C3AED" strokeWidth={2}/>
              <Area yAxisId="left" type="monotone" dataKey="recovered" name="Nilai Recovery" fill="#10B98122" stroke="#10B981" strokeWidth={2}/>
              <Bar yAxisId="right" dataKey="cases" name="Jumlah Kasus" fill="#0EA5E9" opacity={0.65} radius={[3,3,0,0]}/>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fraud by Type (%) Line Chart */}
      <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"14px",marginBottom:12}}>
        <div style={{fontWeight:500,fontSize:12,marginBottom:10,color:"var(--color-text-primary)",display:"flex",alignItems:"center",gap:5}}>
          <i className="ti ti-chart-line" style={{color:"#F59E0B"}} aria-hidden="true"/>{t.sectionFraudByType} — {periodOpts[period]}
        </div>
        <div style={{height:220}}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={fraudTypePctData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)"/>
              <XAxis dataKey="date" tick={{fontSize:9,fill:"#888"}} tickLine={false} angle={-20} textAnchor="end" height={40}/>
              <YAxis label={{value:"%",angle:-90,position:"insideLeft"}} tick={{fontSize:9,fill:"#888"}} tickLine={false} axisLine={false}/>
              <Tooltip content={<CustomTooltip/>}/><Legend/>
              {FRAUD_TYPES.map((ft,i)=>(<Line key={ft} type="monotone" dataKey={ft} stroke={COLORS[i%COLORS.length]} strokeWidth={2} dot={false}/>))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"14px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div style={{fontWeight:500,fontSize:12,color:"var(--color-text-primary)",display:"flex",alignItems:"center",gap:5}}>
              <i className="ti ti-chart-bar" style={{color:"#F59E0B"}} aria-hidden="true"/>Kasus per Jenis Fraud
            </div>
            <div style={{display:"flex",gap:4}}>
              <button onClick={()=>setTypeMetric("cases")} style={{fontSize:10,padding:"2px 8px",borderRadius:5,border:"0.5px solid var(--color-border-tertiary)",background:typeMetric==="cases"?"#7C3AED":"transparent",color:typeMetric==="cases"?"#fff":"var(--color-text-secondary)",cursor:"pointer"}}>Kasus</button>
              <button onClick={()=>setTypeMetric("value")} style={{fontSize:10,padding:"2px 8px",borderRadius:5,border:"0.5px solid var(--color-border-tertiary)",background:typeMetric==="value"?"#7C3AED":"transparent",color:typeMetric==="value"?"#fff":"var(--color-text-secondary)",cursor:"pointer"}}>Nilai</button>
            </div>
          </div>
          <div style={{height:195}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" horizontal={false}/>
                <XAxis type="number" tickFormatter={v=>typeMetric==="value"?fmt(v):v} tick={{fontSize:9,fill:"#888"}} tickLine={false} axisLine={false}/>
                <YAxis type="category" dataKey="name" tick={{fontSize:9,fill:"#888"}} tickLine={false} width={105}/>
                <Tooltip formatter={(v,n)=>typeMetric==="value"?[fmtFull(v),"Nilai Fraud"]:[fmtNum(v),"Jumlah Kasus"]}/>
                <Bar dataKey={typeMetric==="cases"?"kasus":"nilai"} radius={[0,4,4,0]}>
                  {byType.map((e,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"14px"}}>
          <div style={{fontWeight:500,fontSize:12,marginBottom:10,color:"var(--color-text-primary)",display:"flex",alignItems:"center",gap:5}}>
            <i className="ti ti-users" style={{color:"#EC4899"}} aria-hidden="true"/>Distribusi Fraud per Pelaku
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{height:150,width:140,flexShrink:0}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byPelaku} dataKey="kasus" cx="50%" cy="50%" innerRadius={35} outerRadius={62} paddingAngle={2}>
                    {byPelaku.map((e,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip formatter={(v,n,p)=>[`${fmtNum(v)} kasus — ${fmt(p.payload.nilai)}`,p.payload.name]}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{fontSize:10,display:"flex",flexDirection:"column",gap:5,flex:1,minWidth:0}}>
              {byPelaku.map((e,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:4}}>
                  <span style={{width:7,height:7,borderRadius:2,background:COLORS[i%COLORS.length],flexShrink:0}}/>
                  <span style={{color:"var(--color-text-secondary)",fontSize:10,flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.name}</span>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontWeight:500,color:"var(--color-text-primary)",fontSize:10}}>{e.kasus} kasus</div>
                    <div style={{color:"#F59E0B",fontSize:9}}>{fmt(e.nilai)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Province + Status */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"14px"}}>
          <div style={{fontWeight:500,fontSize:12,marginBottom:10,color:"var(--color-text-primary)",display:"flex",alignItems:"center",gap:5}}>
            <i className="ti ti-map-pin" style={{color:"#0EA5E9"}} aria-hidden="true"/>Fraud per Provinsi
          </div>
          <div style={{height:185}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byProv}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)"/>
                <XAxis dataKey="name" tick={{fontSize:8,fill:"#888"}} tickLine={false}/>
                <YAxis tick={{fontSize:9,fill:"#888"}} tickLine={false} axisLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="kasus" name="Jumlah Kasus" radius={[3,3,0,0]}>
                  {byProv.map((e,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"14px"}}>
          <div style={{fontWeight:500,fontSize:12,marginBottom:10,color:"var(--color-text-primary)",display:"flex",alignItems:"center",gap:5}}>
            <i className="ti ti-chart-donut" style={{color:"#A855F7"}} aria-hidden="true"/>Status Kasus
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{height:150,flex:1}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byStatus} dataKey="value" cx="50%" cy="50%" innerRadius={32} outerRadius={60} paddingAngle={3}>
                    {byStatus.map((e,i)=><Cell key={i} fill={statusColor[e.name]||COLORS[i]}/>)}
                  </Pie>
                  <Tooltip formatter={(v,n)=>[fmtNum(v)+" kasus",n]}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{fontSize:10,display:"flex",flexDirection:"column",gap:5}}>
              {byStatus.map((e,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:4}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:statusColor[e.name],flexShrink:0}}/>
                  <span style={{fontSize:10,color:"var(--color-text-secondary)"}}>{e.name}</span>
                  <span style={{fontWeight:500,color:"var(--color-text-primary)",marginLeft:6}}>{e.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Nominal Value */}
      <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"14px",marginBottom:12,overflowX:"auto"}}>
        <div style={{fontWeight:500,fontSize:12,marginBottom:10,color:"var(--color-text-primary)",display:"flex",alignItems:"center",gap:5}}>
          <i className="ti ti-building-warehouse" style={{color:"#F59E0B"}} aria-hidden="true"/>{t.sectionHeatmap}
        </div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
          <thead>
            <tr style={{background:"var(--color-background-secondary)"}}>
              <th style={{padding:"5px 8px",textAlign:"left",fontWeight:500,color:"var(--color-text-secondary)",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>{t.hubCol}</th>
              {FRAUD_TYPES.map(ft=><th key={ft} style={{padding:"5px 6px",textAlign:"center",fontWeight:500,color:"var(--color-text-secondary)",borderBottom:"0.5px solid var(--color-border-tertiary)",fontSize:9}}>{ft}</th>)}
              <th style={{padding:"5px 8px",textAlign:"center",fontWeight:500,color:"var(--color-text-secondary)",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>{t.totalCol}</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(heatmapData).map(([hub,types])=>{
              const mx=Math.max(...FRAUD_TYPES.map(t=>types[t]||0));
              const hubTotal=Object.values(types).reduce((s,v)=>s+v,0);
              return (
                <tr key={hub} style={{borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                  <td style={{padding:"5px 8px",fontWeight:500,color:"var(--color-text-primary)",fontSize:10}}>{hub}</td>
                  {FRAUD_TYPES.map(ft=>{
                    const val=types[ft]||0; const intensity=mx>0?val/mx:0;
                    return (
                      <td key={ft} style={{padding:"5px 6px",textAlign:"center",background:intensity>0?`rgba(124,58,237,${Math.max(0.07,intensity*0.55)})`:"transparent"}}>
                        {val>0?<div style={{fontWeight:intensity>0.4?500:400,color:intensity>0.5?"#7C3AED":"var(--color-text-secondary)"}}>{fmt(val)}</div>:"—"}
                      </td>
                    );
                  })}
                  <td style={{padding:"5px 8px",textAlign:"center",fontWeight:500,color:"#F59E0B"}}>{fmt(hubTotal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Alert System */}
      <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"14px",marginBottom:12}}>
        <div style={{fontWeight:500,fontSize:13,marginBottom:8,color:"var(--color-text-primary)",display:"flex",alignItems:"center",gap:6}}>
          <i className="ti ti-shield-exclamation" style={{color:"#EF4444",fontSize:18}} aria-hidden="true"/>{t.sectionAlert}
        </div>
        <div style={{fontSize:12,color:"var(--color-text-secondary)",marginBottom:12}}>{t.alertSubtitle}</div>
        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
          {["critical","warning","watch"].map(lv=>{
            const cnt=alerts.filter(a=>a.level===lv).length; const cfg=levelCfg[lv];
            const lbl=lv==="critical"?t.alertLevelCritical:lv==="warning"?t.alertLevelWarning:t.alertLevelWatch;
            return cnt>0&&(
              <div key={lv} style={{display:"flex",alignItems:"center",gap:6,background:cfg.bg,border:`1px solid ${cfg.border}`,borderRadius:8,padding:"6px 12px"}}>
                <i className={`ti ${cfg.icon}`} style={{color:cfg.color,fontSize:16}} aria-hidden="true"/>
                <span style={{fontWeight:500,fontSize:12,color:cfg.color}}>{cnt} {lbl}</span>
              </div>
            );
          })}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {alerts.map((alert,idx)=>{
            const cfg=levelCfg[alert.level]; const open=expandedAlert===idx;
            const lbl=alert.level==="critical"?t.alertLevelCritical:alert.level==="warning"?t.alertLevelWarning:t.alertLevelWatch;
            return (
              <div key={idx} style={{background:"var(--color-background-primary)",border:`1px solid ${cfg.border}`,borderRadius:12,overflow:"hidden"}}>
                <button onClick={()=>setExpandedAlert(open?null:idx)} style={{width:"100%",background:"transparent",border:"none",cursor:"pointer",padding:"12px 14px",textAlign:"left",display:"flex",alignItems:"flex-start",gap:10}}>
                  <div style={{width:32,height:32,borderRadius:8,background:cfg.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <i className={`ti ${cfg.icon}`} style={{color:cfg.color,fontSize:18}} aria-hidden="true"/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                      <span style={{fontSize:10,fontWeight:500,padding:"2px 7px",borderRadius:20,background:cfg.bg,color:cfg.color,border:`1px solid ${cfg.border}`}}>{lbl}</span>
                      <span style={{fontSize:10,color:"var(--color-text-secondary)",background:"var(--color-background-secondary)",borderRadius:20,padding:"2px 7px"}}>{alert.type}: {alert.loc}</span>
                    </div>
                    <div style={{fontWeight:500,fontSize:13,color:"var(--color-text-primary)"}}>{alert.title}</div>
                    <div style={{fontSize:11,color:"var(--color-text-secondary)",marginTop:2,whiteSpace:"pre-line"}}>{alert.desc}</div>
                  </div>
                  <i className={`ti ${open?"ti-chevron-up":"ti-chevron-down"}`} style={{color:"var(--color-text-secondary)",fontSize:14,marginTop:4,flexShrink:0}} aria-hidden="true"/>
                </button>
                {open&&(
                  <div style={{borderTop:`1px solid ${cfg.border}`,padding:"12px 14px 14px",background:cfg.bg+"88"}}>
                    <div style={{fontWeight:500,fontSize:11,color:cfg.color,marginBottom:8,display:"flex",alignItems:"center",gap:5}}>
                      <i className="ti ti-bulb" style={{fontSize:14}} aria-hidden="true"/>{t.alertRecommend}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:10}}>
                      {alert.actions.map((act,ai)=>(
                        <div key={ai} style={{display:"flex",alignItems:"flex-start",gap:8,background:"var(--color-background-primary)",borderRadius:8,padding:"8px 10px",border:"0.5px solid var(--color-border-tertiary)"}}>
                          <span style={{width:18,height:18,borderRadius:"50%",background:cfg.color,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0}}>{ai+1}</span>
                          <span style={{fontSize:12,color:"var(--color-text-primary)",lineHeight:1.5}}>{act}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{fontWeight:500,fontSize:11,color:"#A16207",marginBottom:6,display:"flex",alignItems:"center",gap:5}}>
                      <i className="ti ti-gavel" style={{fontSize:14}} aria-hidden="true"/>{t.alertSomasi}
                    </div>
                    <div style={{display:"flex",alignItems:"flex-start",gap:8,background:"#FFFBEB",borderRadius:8,padding:"10px 12px",border:"1px solid #FDE68A"}}>
                      <i className="ti ti-file-certificate" style={{color:"#D97706",fontSize:18,flexShrink:0,marginTop:1}} aria-hidden="true"/>
                      <div>
                        <div style={{fontSize:12,color:"#92400E",fontWeight:500,lineHeight:1.5}}>{alert.somasi}</div>
                        <div style={{fontSize:10,color:"#A16207",marginTop:3}}>{t.alertSomasiTrigger}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {alerts.length===0&&(
            <div style={{textAlign:"center",padding:"40px 20px",color:"var(--color-text-secondary)"}}>
              <i className="ti ti-shield-check" style={{fontSize:40,color:"#10B981",display:"block",marginBottom:8}} aria-hidden="true"/>
              <div style={{fontWeight:500}}>{t.alertNone}</div>
              <div style={{fontSize:12,marginTop:4}}>{t.alertNoneSub}</div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Table */}
      <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
          <div style={{fontWeight:500,fontSize:12,color:"var(--color-text-primary)",display:"flex",alignItems:"center",gap:5}}>
            <i className="ti ti-list-details" style={{color:"#0EA5E9"}} aria-hidden="true"/>Detail {t.kpiTotal}
          </div>
          <span style={{fontSize:10,color:"var(--color-text-secondary)",background:"var(--color-background-secondary)",borderRadius:20,padding:"2px 7px"}}>{fmtNum(tableFiltered.length)} {t.tableCases}</span>
          <div style={{marginLeft:"auto",display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
            <select value={invoiceFilter} onChange={e=>{setInvoiceFilter(e.target.value);setPage(1);}} style={{fontSize:11,padding:"4px 8px",borderRadius:6}}>
              <option value="all">{t.tableAllInvoice}</option>
              <option value="deducted">{t.tableDeducted}</option>
              <option value="not_deducted">{t.tableNotDeducted}</option>
            </select>
            <input placeholder={t.tableSearch} value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{width:260,fontSize:11}}/>
          </div>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead>
              <tr style={{background:"var(--color-background-secondary)"}}>
                {[t.tableColId,t.tableColProject,t.tableColInvoice,t.tableColDate,t.tableColType,t.tableColPelaku,t.tableColHub,t.tableColValue,t.tableColRecovery,t.tableColStatus].map(h=>(
                  <th key={h} style={{padding:"7px 8px",textAlign:"left",fontWeight:500,fontSize:10,color:"var(--color-text-secondary)",borderBottom:"0.5px solid var(--color-border-tertiary)",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map(c=>(
                <tr key={c.id} style={{borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                  <td style={{padding:"6px 8px",fontWeight:500,color:"#7C3AED",whiteSpace:"nowrap",fontSize:10}}>{c.id}</td>
                  <td style={{padding:"6px 8px",whiteSpace:"nowrap"}}>
                    <span style={{fontSize:9,padding:"2px 5px",borderRadius:4,background:PROJECT_COLORS[PROJECTS.indexOf(c.project)%PROJECT_COLORS.length]+"22",color:PROJECT_COLORS[PROJECTS.indexOf(c.project)%PROJECT_COLORS.length],fontWeight:500}}>{c.project}</span>
                  </td>
                  <td style={{padding:"6px 8px",fontSize:10,whiteSpace:"nowrap"}}>
                    {c.invoice_no?<span style={{color:c.invoiced?"#EC4899":"var(--color-text-secondary)"}}>{c.invoice_no}{c.invoiced&&<span style={{marginLeft:4,fontSize:9,background:"#EC489922",color:"#EC4899",borderRadius:4,padding:"1px 4px"}}>Deducted</span>}</span>:<span style={{color:"var(--color-text-secondary)",fontSize:9}}>—</span>}
                  </td>
                  <td style={{padding:"6px 8px",whiteSpace:"nowrap",color:"var(--color-text-secondary)",fontSize:10}}>{c.date.toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"2-digit"})}</td>
                  <td style={{padding:"6px 8px",whiteSpace:"nowrap"}}><Tag color={["purple","blue","amber","red","green"][FRAUD_TYPES.indexOf(c.fraud_type)%5]}>{c.fraud_type}</Tag></td>
                  <td style={{padding:"6px 8px",color:"var(--color-text-secondary)",whiteSpace:"nowrap",fontSize:10}}>{c.pelaku}</td>
                  <td style={{padding:"6px 8px",color:"var(--color-text-secondary)",whiteSpace:"nowrap",fontSize:10}}>{c.hub}</td>
                  <td style={{padding:"6px 8px",fontWeight:500,color:"#F59E0B",whiteSpace:"nowrap",fontSize:10}}>{fmt(c.fraud_val)}</td>
                  <td style={{padding:"6px 8px",color:"#10B981",whiteSpace:"nowrap",fontSize:10}}>{c.recovered>0?fmt(c.recovered):"—"}</td>
                  <td style={{padding:"6px 8px",whiteSpace:"nowrap"}}>
                    <span style={{fontSize:9,padding:"2px 6px",borderRadius:20,background:(statusColor[c.status]||"#888")+"22",color:statusColor[c.status]||"#888",fontWeight:500}}>{c.status}</span>
                  </td>
                </tr>
              ))}
              {paged.length===0&&<tr><td colSpan={10} style={{padding:"20px",textAlign:"center",color:"var(--color-text-secondary)"}}>{t.tableNoData}</td></tr>}
            </tbody>
          </table>
        </div>
        {totalPages>1&&(
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10,fontSize:11}}>
            <span style={{color:"var(--color-text-secondary)"}}>{t.tablePage} {page} {t.tableOf} {totalPages} ({fmtNum(tableFiltered.length)} {t.tableCases})</span>
            <div style={{display:"flex",gap:4}}>
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{padding:"3px 10px",cursor:page>1?"pointer":"default",opacity:page===1?0.4:1,fontSize:11}}>{t.tablePrev}</button>
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{padding:"3px 10px",cursor:page<totalPages?"pointer":"default",opacity:page===totalPages?0.4:1,fontSize:11}}>{t.tableNext}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// PAGE 2: RECOVERY PERFORMANCE
// ============================================================
function PageRecoveryPerformance({recoveryData, campaignCalendar, t}) {
  const [period, setPeriod] = useState("monthly");
  const [collectorView, setCollectorView] = useState("monthly");
  const periodOpts={daily:t.period_daily,weekly:t.period_weekly,monthly:t.period_monthly,yearly:t.period_yearly};

  const recoveryByChannelData=getRecoveryByChannelData(recoveryData,period);
  const totalRecovery=recoveryData.reduce((s,r)=>s+r.total,0);
  const fullPayment=recoveryData.filter(r=>r.payment_type==="Full").reduce((s,r)=>s+r.total,0);
  const partialPayment=recoveryData.filter(r=>r.payment_type==="Partial").reduce((s,r)=>s+r.total,0);
  const fullCases=recoveryData.filter(r=>r.payment_type==="Full").length;
  const partialCases=recoveryData.filter(r=>r.payment_type==="Partial").length;

  const collectorStats={};
  recoveryData.forEach(r=>{
    if(!collectorStats[r.collector])collectorStats[r.collector]={monthly:{},total:0};
    collectorStats[r.collector].total+=r.total;
    const month=`${r.date.getFullYear()}-${String(r.date.getMonth()+1).padStart(2,"0")}`;
    collectorStats[r.collector].monthly[month]=(collectorStats[r.collector].monthly[month]||0)+r.total;
  });

  const topCollectors=useMemo(()=>{
    if(collectorView==="monthly"){
      const curr=new Date(); const mk=`${curr.getFullYear()}-${String(curr.getMonth()+1).padStart(2,"0")}`;
      const m={}; Object.entries(collectorStats).forEach(([n,d])=>{m[n]=d.monthly[mk]||0;});
      return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,5);
    }
    return Object.entries(collectorStats).map(([n,d])=>[n,d.total]).sort((a,b)=>b[1]-a[1]).slice(0,5);
  },[collectorView, recoveryData]);

  return (
    <div>
      <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"12px 16px",marginBottom:12}}>
        <div style={{fontWeight:500,fontSize:12,marginBottom:10,color:"var(--color-text-primary)",display:"flex",alignItems:"center",gap:5}}>
          <i className="ti ti-arrow-back-up" style={{color:"#10B981"}} aria-hidden="true"/>{t.recSummary}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:8}}>
          <KPICard label={t.recTotal} value={fmt(totalRecovery)} color="#10B981" icon="ti-arrow-back-up"/>
          <KPICard label={t.recFull} value={fmt(fullPayment)} sub={`${fullCases} ${t.recCases}`} color="#0EA5E9" icon="ti-check-circle"/>
          <KPICard label={t.recPartial} value={fmt(partialPayment)} sub={`${partialCases} ${t.recCases}`} color="#F59E0B" icon="ti-progress-check"/>
        </div>
      </div>

      <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"14px",marginBottom:12}}>
        <div style={{fontWeight:500,fontSize:12,marginBottom:10,color:"var(--color-text-primary)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span><i className="ti ti-trending-up" style={{color:"#10B981",marginRight:6}} aria-hidden="true"/>{t.recByChannel} — {periodOpts[period]}</span>
          <select value={period} onChange={e=>setPeriod(e.target.value)} style={{fontSize:11,padding:"4px 8px"}}>
            {Object.entries(periodOpts).map(([k,v])=><option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div style={{height:220}}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={recoveryByChannelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)"/>
              <XAxis dataKey="label" tick={{fontSize:9,fill:"#888"}} tickLine={false} angle={-20} textAnchor="end" height={40}/>
              <YAxis tickFormatter={v=>fmt(v)} tick={{fontSize:9,fill:"#888"}} tickLine={false} axisLine={false}/>
              <Tooltip content={<CustomTooltip/>}/><Legend/>
              {RECOVERY_CHANNELS.map(ch=>(<Line key={ch} type="monotone" dataKey={ch} stroke={CHANNEL_COLORS[ch]} strokeWidth={2} dot={false}/>))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"14px",marginBottom:12}}>
        <div style={{fontWeight:500,fontSize:12,marginBottom:10,color:"var(--color-text-primary)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span><i className="ti ti-users" style={{marginRight:5,color:"#EC4899"}} aria-hidden="true"/>{t.recTopCollectors}</span>
          <div style={{display:"flex",gap:4}}>
            <button onClick={()=>setCollectorView("monthly")} style={{fontSize:10,padding:"3px 10px",borderRadius:5,border:"none",background:collectorView==="monthly"?"#7C3AED":"var(--color-background-secondary)",color:collectorView==="monthly"?"#fff":"var(--color-text-secondary)",cursor:"pointer"}}>{t.recMonthly}</button>
            <button onClick={()=>setCollectorView("yearly")} style={{fontSize:10,padding:"3px 10px",borderRadius:5,border:"none",background:collectorView==="yearly"?"#7C3AED":"var(--color-background-secondary)",color:collectorView==="yearly"?"#fff":"var(--color-text-secondary)",cursor:"pointer"}}>{t.recYearly}</button>
          </div>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
          <thead>
            <tr style={{background:"var(--color-background-secondary)"}}>
              {[t.recRank,t.recCollectorName,t.recValue].map(h=>(
                <th key={h} style={{padding:"8px",textAlign:h===t.recValue?"right":"left",fontWeight:500,color:"var(--color-text-secondary)"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topCollectors.map(([name,val],idx)=>(
              <tr key={idx} style={{borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                <td style={{padding:"8px",fontWeight:500,color:"#7C3AED"}}>{idx+1}</td>
                <td style={{padding:"8px",color:"var(--color-text-secondary)"}}>{name}</td>
                <td style={{padding:"8px",textAlign:"right",fontWeight:500,color:"#10B981"}}>{fmt(val)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"14px"}}>
        <div style={{fontWeight:500,fontSize:12,marginBottom:10,color:"var(--color-text-primary)",display:"flex",alignItems:"center",gap:5}}>
          <i className="ti ti-calendar" style={{color:"#F59E0B"}} aria-hidden="true"/>{t.recCampaign}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:10}}>
          {PROJECTS.map(proj=>(
            <div key={proj} style={{border:"0.5px solid var(--color-border-tertiary)",borderRadius:8,padding:10}}>
              <div style={{fontWeight:500,marginBottom:8,color:"var(--color-text-primary)",fontSize:11}}>{proj}</div>
              {Object.entries(campaignCalendar[proj]||{}).map(([m,data])=>(
                <div key={m} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:9,borderBottom:"0.5px solid var(--color-border-tertiary)",color:"var(--color-text-secondary)"}}>
                  <span>{m}</span>
                  <span style={{fontWeight:500,color:data.type==="Big"?"#EF4444":data.type==="Moderate"?"#F59E0B":"#10B981"}}>{data.type} ({data.rate}%)</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE 3: FRAUD INVESTIGATION
// ============================================================
function PageFraudInvestigation({filtered, t}) {
  const [statusFilter, setStatusFilter] = useState("all");

  const rootCauseStats=useMemo(()=>{
    const stats={};
    filtered.forEach(c=>{if(!stats[c.reason])stats[c.reason]=0; stats[c.reason]++;});
    return Object.entries(stats).map(([r,c])=>({name:r,value:c})).sort((a,b)=>b.value-a.value);
  },[filtered]);

  const investigatorStats=useMemo(()=>{
    const stats={};
    filtered.forEach(c=>{if(!stats[c.investigator])stats[c.investigator]=0; stats[c.investigator]++;});
    return Object.entries(stats).map(([r,c])=>({name:r,value:c})).sort((a,b)=>b.value-a.value);
  },[filtered]);

  const topCases=useMemo(()=>{
    let cases=filtered;
    if(statusFilter!=="all")cases=cases.filter(c=>c.status===statusFilter);
    return cases.sort((a,b)=>b.fraud_val-a.fraud_val).slice(0,10);
  },[filtered,statusFilter]);

  const avgComp=Math.round(filtered.reduce((s,c)=>s+c.completeness,0)/Math.max(filtered.length,1));
  const incompleteCount=filtered.filter(c=>c.completeness<80).length;

  return (
    <div>
      <div style={{marginBottom:12,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"14px"}}>
          <div style={{fontWeight:500,fontSize:12,marginBottom:10,color:"var(--color-text-primary)",display:"flex",alignItems:"center",gap:5}}>
            <i className="ti ti-alert-triangle" style={{color:"#EF4444"}} aria-hidden="true"/>{t.invRootCause}
          </div>
          <div style={{height:180,marginBottom:8}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rootCauseStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" horizontal={false}/>
                <XAxis type="number" tick={{fontSize:9,fill:"#888"}} tickLine={false} axisLine={false}/>
                <YAxis type="category" dataKey="name" tick={{fontSize:8,fill:"#888"}} tickLine={false} width={120}/>
                <Tooltip/>
                <Bar dataKey="value" name="Kasus" radius={[0,4,4,0]}>
                  {rootCauseStats.map((e,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"14px"}}>
          <div style={{fontWeight:500,fontSize:12,marginBottom:10,color:"var(--color-text-primary)",display:"flex",alignItems:"center",gap:5}}>
            <i className="ti ti-users" style={{color:"#0EA5E9"}} aria-hidden="true"/>{t.invInvestigator}
          </div>
          <div style={{height:180}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={investigatorStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" horizontal={false}/>
                <XAxis type="number" tick={{fontSize:9,fill:"#888"}} tickLine={false} axisLine={false}/>
                <YAxis type="category" dataKey="name" tick={{fontSize:8,fill:"#888"}} tickLine={false} width={120}/>
                <Tooltip/>
                <Bar dataKey="value" name="Kasus" radius={[0,4,4,0]}>
                  {investigatorStats.map((e,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"14px",marginBottom:12}}>
        <div style={{fontWeight:500,fontSize:12,marginBottom:10,color:"var(--color-text-primary)",display:"flex",alignItems:"center",gap:5}}>
          <i className="ti ti-progress-check" style={{color:"#10B981"}} aria-hidden="true"/>{t.invCompleteness}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div style={{padding:16,background:"#10B98122",borderRadius:10,textAlign:"center"}}>
            <div style={{fontSize:32,fontWeight:600,color:"#10B981"}}>{avgComp}%</div>
            <div style={{fontSize:10,color:"var(--color-text-secondary)",marginTop:4}}>{t.invAvgComplete}</div>
          </div>
          <div style={{padding:16,background:"#EF44441A",borderRadius:10,textAlign:"center"}}>
            <div style={{fontSize:32,fontWeight:600,color:"#EF4444"}}>{incompleteCount}</div>
            <div style={{fontSize:10,color:"var(--color-text-secondary)",marginTop:4}}>{t.invIncomplete}</div>
          </div>
        </div>
      </div>

      <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"14px"}}>
        <div style={{fontWeight:500,fontSize:12,marginBottom:10,color:"var(--color-text-primary)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span><i className="ti ti-list-details" style={{marginRight:5,color:"#0EA5E9"}} aria-hidden="true"/>{t.invTopCases}</span>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{fontSize:10,padding:"3px 8px"}}>
            <option value="all">{t.invAllStatus}</option>
            {STATUS_LIST.map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
            <thead>
              <tr style={{background:"var(--color-background-secondary)"}}>
                {[t.invColId,t.invColType,t.invColValue,t.invColCause,t.invColInv,t.invColStatus,t.invColComplete].map(h=>(
                  <th key={h} style={{padding:"6px",textAlign:h===t.invColValue||h===t.invColComplete?"right":"left",fontWeight:500,color:"var(--color-text-secondary)"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topCases.map((c,i)=>(
                <tr key={i} style={{borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                  <td style={{padding:"6px",fontWeight:500,color:"#7C3AED"}}>{c.id}</td>
                  <td style={{padding:"6px",color:"var(--color-text-secondary)",fontSize:9}}>{c.fraud_type}</td>
                  <td style={{padding:"6px",textAlign:"right",fontWeight:500,color:"#F59E0B"}}>{fmt(c.fraud_val)}</td>
                  <td style={{padding:"6px",color:"var(--color-text-secondary)",fontSize:9}}>{c.reason}</td>
                  <td style={{padding:"6px",color:"var(--color-text-secondary)",fontSize:9}}>{c.investigator}</td>
                  <td style={{padding:"6px"}}>
                    <span style={{background:`${statusColor[c.status]||"#888"}22`,color:statusColor[c.status]||"#888",padding:"2px 4px",borderRadius:3,fontSize:9}}>{c.status}</span>
                  </td>
                  <td style={{padding:"6px",textAlign:"right",fontWeight:500,color:c.completeness>=80?"#10B981":"#EF4444"}}>{c.completeness}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [lang, setLang] = useState("id");
  const [activePage, setActivePage] = useState("fraud");
  const [sideOpen, setSideOpen] = useState(true);
  const [filterFraud, setFilterFraud] = useState([]);
  const [filterPelaku, setFilterPelaku] = useState([]);
  const [filterStatus, setFilterStatus] = useState([]);
  const [filterProject, setFilterProject] = useState([]);
  const [filterProv, setFilterProv] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterHub, setFilterHub] = useState("");
  const [minVal, setMinVal] = useState(0);
  const [maxVal, setMaxVal] = useState(500000000);

  // Data state
  const [allCases, setAllCases] = useState([]);
  const [recoveryData, setRecoveryData] = useState([]);
  const [campaignCalendar, setCampaignCalendar] = useState({});
  const [dataSource, setDataSource] = useState("loading"); // "loading" | "live" | "dummy"
  const [lastUpdated, setLastUpdated] = useState("");
  const [loadError, setLoadError] = useState("");

  const t = T[lang];
  const toggle = (arr,setArr,v) => setArr(arr.includes(v)?arr.filter(x=>x!==v):[...arr,v]);

  // ── LOAD DATA on mount ──────────────────────────────────────
  const loadData = useCallback(async () => {
    setDataSource("loading");
    setLoadError("");
    const isConfigured = url => url && !url.startsWith("PASTE_");

    try {
      let cases, recovery, calendar;

      if (isConfigured(SHEET_URLS.fraudCases)) {
        // ── LIVE DATA: fetch from Google Sheets ──
        const [fraudRows, recoveryRows, calRows] = await Promise.all([
          fetchCSV(SHEET_URLS.fraudCases),
          isConfigured(SHEET_URLS.recoveryData) ? fetchCSV(SHEET_URLS.recoveryData) : Promise.resolve([]),
          isConfigured(SHEET_URLS.campaignCalendar) ? fetchCSV(SHEET_URLS.campaignCalendar) : Promise.resolve([]),
        ]);

        cases = fraudRows.map((row, i) => parseFraudCase(row, i));
        recovery = recoveryRows.map((row, i) => parseRecoveryRow(row, i));

        // Build campaign calendar from rows
        calendar = {};
        PROJECTS.forEach(p => { calendar[p] = {}; });
        calRows.forEach(row => {
          const proj = row["Project"]; const month = row["Month"];
          if (proj && month) {
            if (!calendar[proj]) calendar[proj] = {};
            calendar[proj][month] = { type: row["Campaign_Type"] || "Regular", rate: row["Expected_Fraud_Rate_%"] || "0" };
          }
        });
        // Fill missing months with dummy
        PROJECTS.forEach(p => {
          ["01-2025","02-2025","03-2025","04-2025","05-2025","06-2025"].forEach(m => {
            if (!calendar[p][m]) calendar[p][m] = { type:"Regular", rate:"3.0" };
          });
        });

        setDataSource("live");
      } else {
        // ── DUMMY DATA (URL not configured yet) ──
        cases = genCases(300);
        recovery = genRecoveryData(150);
        calendar = genCampaignCalendar();
        setDataSource("dummy");
      }

      setAllCases(cases);
      setRecoveryData(recovery);
      setCampaignCalendar(calendar);
      setLastUpdated(nowStr());
    } catch (err) {
      console.error("Sheet fetch error:", err);
      setLoadError(t.dataError);
      setAllCases(genCases(300));
      setRecoveryData(genRecoveryData(150));
      setCampaignCalendar(genCampaignCalendar());
      setDataSource("dummy");
      setLastUpdated(nowStr());
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const alerts = useMemo(() => computeAlerts(allCases), [allCases]);

  const filtered = useMemo(() => allCases.filter(c => {
    if(filterFraud.length&&!filterFraud.includes(c.fraud_type)) return false;
    if(filterPelaku.length&&!filterPelaku.includes(c.pelaku)) return false;
    if(filterStatus.length&&!filterStatus.includes(c.status)) return false;
    if(filterProject.length&&!filterProject.includes(c.project)) return false;
    if(filterProv&&c.province!==filterProv) return false;
    if(filterCity&&c.city!==filterCity) return false;
    if(filterHub&&c.hub!==filterHub) return false;
    if(c.fraud_val<minVal||c.fraud_val>maxVal) return false;
    return true;
  }), [allCases,filterFraud,filterPelaku,filterStatus,filterProject,filterProv,filterCity,filterHub,minVal,maxVal]);

  const CheckGroup = ({label,items,selected,onToggle,colors=false,itemColors=null}) => (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:10,fontWeight:500,color:"var(--color-text-secondary)",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>{label}</div>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        {items.map((it,idx)=>(
          <label key={it} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:11,color:selected.includes(it)?"var(--color-text-primary)":"var(--color-text-secondary)"}}>
            <input type="checkbox" checked={selected.includes(it)} onChange={()=>onToggle(it)} style={{accentColor:colors?statusColor[it]:itemColors?itemColors[idx]:"#7C3AED",width:12,height:12}}/>
            {colors&&<span style={{width:7,height:7,borderRadius:"50%",background:statusColor[it],display:"inline-block",flexShrink:0}}/>}
            {itemColors&&<span style={{width:7,height:7,borderRadius:2,background:itemColors[idx],display:"inline-block",flexShrink:0}}/>}
            {it}
          </label>
        ))}
      </div>
    </div>
  );

  const pages = [
    {id:"fraud",  label:t.page_fraud,        icon:"ti-alert-triangle"},
    {id:"recovery",label:t.page_recovery,    icon:"ti-arrow-back-up"},
    {id:"investigation",label:t.page_investigation,icon:"ti-search"},
  ];

  if (dataSource === "loading") {
    return (
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"var(--color-background-tertiary)",flexDirection:"column",gap:12}}>
        <i className="ti ti-loader-2" style={{fontSize:36,color:"#7C3AED",animation:"spin 1s linear infinite"}} aria-hidden="true"/>
        <div style={{fontSize:14,color:"var(--color-text-secondary)"}}>{t.dataLoading}</div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{fontFamily:"var(--font-sans)",background:"var(--color-background-tertiary)",minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#4F46E5,#7C3AED,#A855F7)",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",color:"#fff",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setSideOpen(!sideOpen)} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:6,color:"#fff",padding:"4px 8px",cursor:"pointer"}}>
            <i className="ti ti-menu-2" style={{fontSize:18}} aria-hidden="true"/>
          </button>
          <i className="ti ti-truck-delivery" style={{fontSize:22}} aria-hidden="true"/>
          <div>
            <div style={{fontWeight:500,fontSize:15}}>{t.appTitle}</div>
            <div style={{fontSize:11,opacity:0.8}}>{t.appSubtitle}</div>
          </div>
        </div>

        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          {/* Page tabs */}
          <div style={{display:"flex",gap:4,background:"rgba(255,255,255,0.15)",borderRadius:8,padding:4}}>
            {pages.map(pg=>(
              <button key={pg.id} onClick={()=>setActivePage(pg.id)} style={{padding:"4px 12px",borderRadius:6,fontSize:11,fontWeight:500,cursor:"pointer",border:"none",background:activePage===pg.id?"#fff":"transparent",color:activePage===pg.id?"#7C3AED":"#fff",display:"flex",alignItems:"center",gap:3}}>
                <i className={`ti ${pg.icon}`} style={{fontSize:12}} aria-hidden="true"/>{pg.label}
              </button>
            ))}
          </div>

          {/* Language toggle */}
          <div style={{display:"flex",gap:2,background:"rgba(255,255,255,0.15)",borderRadius:8,padding:3}}>
            {["id","en"].map(l=>(
              <button key={l} onClick={()=>setLang(l)} style={{padding:"4px 10px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",border:"none",background:lang===l?"#fff":"transparent",color:lang===l?"#7C3AED":"#fff"}}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Data source badge + refresh */}
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{display:"flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.15)",borderRadius:20,padding:"4px 10px",fontSize:10}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:dataSource==="live"?"#10B981":"#F59E0B",flexShrink:0}}/>
              <span>{dataSource==="live"?t.dataLive:t.dataDummy}</span>
            </div>
            <button onClick={loadData} title="Refresh data" style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:6,color:"#fff",padding:"4px 8px",cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",gap:4}}>
              <i className="ti ti-refresh" style={{fontSize:14}} aria-hidden="true"/>
            </button>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {loadError && (
        <div style={{background:"#FFFBEB",borderBottom:"1px solid #FDE68A",padding:"8px 20px",fontSize:12,color:"#92400E",display:"flex",alignItems:"center",gap:6}}>
          <i className="ti ti-alert-triangle" style={{color:"#F59E0B"}} aria-hidden="true"/>
          {loadError}
        </div>
      )}

      {/* Last updated bar */}
      {lastUpdated && (
        <div style={{background:"var(--color-background-primary)",borderBottom:"0.5px solid var(--color-border-tertiary)",padding:"4px 20px",fontSize:10,color:"var(--color-text-secondary)",display:"flex",justifyContent:"flex-end",alignItems:"center",gap:4}}>
          <i className="ti ti-clock" style={{fontSize:11}} aria-hidden="true"/>
          {t.dataLastUpdated}: {lastUpdated}
        </div>
      )}

      <div style={{display:"flex",flex:1}}>
        {/* Sidebar — only on Fraud page */}
        {sideOpen && activePage==="fraud" && (
          <div style={{width:215,background:"var(--color-background-primary)",borderRight:"0.5px solid var(--color-border-tertiary)",padding:"14px",overflowY:"auto",flexShrink:0,fontSize:12}}>
            <div style={{fontWeight:500,fontSize:12,marginBottom:14,color:"var(--color-text-primary)",display:"flex",alignItems:"center",gap:6}}>
              <i className="ti ti-filter" style={{fontSize:14,color:"#7C3AED"}} aria-hidden="true"/>{t.filter}
              <button onClick={()=>{setFilterFraud([]);setFilterPelaku([]);setFilterStatus([]);setFilterProject([]);setFilterProv("");setFilterCity("");setFilterHub("");setMinVal(0);setMaxVal(500000000);}} style={{marginLeft:"auto",fontSize:10,color:"#7C3AED",background:"none",border:"none",cursor:"pointer",padding:0}}>{t.reset}</button>
            </div>
            <CheckGroup label={t.project} items={PROJECTS} selected={filterProject} onToggle={v=>toggle(filterProject,setFilterProject,v)} itemColors={PROJECT_COLORS}/>
            <CheckGroup label={t.fraudType} items={FRAUD_TYPES} selected={filterFraud} onToggle={v=>toggle(filterFraud,setFilterFraud,v)}/>
            <CheckGroup label={t.pelaku} items={PELAKU} selected={filterPelaku} onToggle={v=>toggle(filterPelaku,setFilterPelaku,v)}/>
            <CheckGroup label={t.caseStatus} items={STATUS_LIST} selected={filterStatus} onToggle={v=>toggle(filterStatus,setFilterStatus,v)} colors/>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,fontWeight:500,color:"var(--color-text-secondary)",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>{t.location}</div>
              <select value={filterProv} onChange={e=>{setFilterProv(e.target.value);setFilterCity("");setFilterHub("");}} style={{width:"100%",marginBottom:6,fontSize:11}}>
                <option value="">{t.allProvince}</option>
                {PROVINCES.map(p=><option key={p}>{p}</option>)}
              </select>
              {filterProv&&<select value={filterCity} onChange={e=>{setFilterCity(e.target.value);setFilterHub("");}} style={{width:"100%",marginBottom:6,fontSize:11}}>
                <option value="">{t.allCity}</option>
                {(CITIES[filterProv]||[]).map(c=><option key={c}>{c}</option>)}
              </select>}
              {filterCity&&<select value={filterHub} onChange={e=>setFilterHub(e.target.value)} style={{width:"100%",fontSize:11}}>
                <option value="">{t.allHub}</option>
                {(HUBS[filterCity]||[`HUB ${filterCity}`]).map(h=><option key={h}>{h}</option>)}
              </select>}
            </div>
            <div>
              <div style={{fontSize:10,fontWeight:500,color:"var(--color-text-secondary)",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>{t.fraudValue}</div>
              <div style={{fontSize:10,color:"var(--color-text-secondary)",marginBottom:3}}>{t.min}: {fmt(minVal)}</div>
              <input type="range" min={0} max={500000000} step={1000000} value={minVal} onChange={e=>setMinVal(+e.target.value)} style={{width:"100%",marginBottom:6}}/>
              <div style={{fontSize:10,color:"var(--color-text-secondary)",marginBottom:3}}>{t.max}: {fmt(maxVal)}</div>
              <input type="range" min={0} max={500000000} step={1000000} value={maxVal} onChange={e=>setMaxVal(+e.target.value)} style={{width:"100%"}}/>
            </div>
          </div>
        )}

        {/* Main content */}
        <div style={{flex:1,padding:"14px",overflowY:"auto",minWidth:0}}>
          {activePage==="fraud" && <PageFraudPerformance filtered={filtered} allCases={allCases} alerts={alerts} t={t}/>}
          {activePage==="recovery" && <PageRecoveryPerformance recoveryData={recoveryData} campaignCalendar={campaignCalendar} t={t}/>}
          {activePage==="investigation" && <PageFraudInvestigation filtered={filtered} t={t}/>}
        </div>
      </div>
    </div>
  );
}
