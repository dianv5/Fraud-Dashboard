import {
  FraudCase,
  RecoveryData,
  CampaignCalendar,
  FRAUD_TYPES,
  PELAKU,
  STATUS_LIST,
  SOMASI_LEVELS,
  PROJECTS,
  RECOVERY_CHANNELS,
  COLLECTORS,
} from "./types";

// CSV Parser - converts Google Sheets CSV URL to array of objects
async function fetchCSV(url: string): Promise<Record<string, string>[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const lines = text.trim().split("\n");
    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().replace(/^"|"$/g, ""));
    return lines.slice(1).map((line) => {
      const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = vals[i] || "";
      });
      return obj;
    });
  } catch (error) {
    console.error("Error fetching CSV:", error);
    throw error;
  }
}

// Parse CSV row → fraud case object
export function parseFraudCase(row: Record<string, string>, idx: number): FraudCase {
  const parseDate = (str: string): Date => {
    const months: Record<string, number> = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
      Mei: 4,
      Agu: 7,
      Okt: 9,
      Des: 11,
    };
    const parts = str.replace(/-/g, " ").split(" ");
    if (parts.length >= 3) {
      const day = parseInt(parts[0]);
      const mon = months[parts[1]] ?? 0;
      const year = parseInt(parts[2]);
      return new Date(year, mon, day);
    }
    return new Date(str);
  };

  return {
    id: row["Case_ID"] || `FRD-${String(idx + 1).padStart(4, "0")}`,
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
export function parseRecoveryRow(
  row: Record<string, string>,
  idx: number
): RecoveryData {
  const parseDate = (str: string): Date =>
    new Date(str.replace(/-/g, " ")) || new Date();
  const channels: Record<string, number> = {};
  let total = 0;

  RECOVERY_CHANNELS.forEach((ch) => {
    const key = `Channel_${ch.replace(/ /g, "_")}_IDR`;
    const val = parseFloat(row[key]) || 0;
    if (val > 0) {
      channels[ch] = val;
      total += val;
    }
  });

  if (total === 0) total = parseFloat(row["Total_Recovery_IDR"]) || 0;

  return {
    date: parseDate(row["Recovery_Date"] || "01-Jan-2025"),
    case_id: row["Case_ID"] || "",
    collector: row["Collector_Names"] || COLLECTORS[0],
    channels,
    total,
    payment_type: (row["Payment_Type"] as "Full" | "Partial") || "Full",
  };
}

// Fetch fraud cases from Google Sheets
export async function fetchFraudCases(url: string): Promise<FraudCase[]> {
  try {
    const rows = await fetchCSV(url);
    return rows.map((row, idx) => parseFraudCase(row, idx));
  } catch (error) {
    console.error("Error fetching fraud cases:", error);
    throw error;
  }
}

// Fetch recovery data from Google Sheets
export async function fetchRecoveryData(url: string): Promise<RecoveryData[]> {
  try {
    const rows = await fetchCSV(url);
    return rows.map((row, idx) => parseRecoveryRow(row, idx));
  } catch (error) {
    console.error("Error fetching recovery data:", error);
    throw error;
  }
}

// Fetch and parse campaign calendar
export async function fetchCampaignCalendar(url: string): Promise<CampaignCalendar> {
  try {
    const rows = await fetchCSV(url);
    const calendar: CampaignCalendar = {};

    rows.forEach((row) => {
      const project = row["Project"];
      const month = row["Month"];
      if (project && month) {
        if (!calendar[project]) calendar[project] = {};
        calendar[project][month] = {
          type: (row["Campaign_Type"] as "Regular" | "Moderate" | "Big") || "Regular",
          rate: row["Expected_Fraud_Rate_%"] || "0",
        };
      }
    });

    return calendar;
  } catch (error) {
    console.error("Error fetching campaign calendar:", error);
    throw error;
  }
}
