import {
  FraudCase,
  RecoveryData,
  CampaignCalendar,
  FRAUD_TYPES,
  PELAKU,
  STATUS_LIST,
  SOMASI_LEVELS,
  PROJECTS,
  CITIES,
  HUBS,
  RECOVERY_CHANNELS,
  COLLECTORS,
} from "./types";
import { rand, MONTHS_FULL } from "./formatters";

const PROVINCES = Object.keys(CITIES);

// Generate dummy fraud cases
export function genCases(n: number = 300): FraudCase[] {
  const cases: FraudCase[] = [];
  const start = new Date("2025-01-01");

  for (let i = 0; i < n; i++) {
    const d = new Date(start.getTime() + Math.random() * 365 * 24 * 3600 * 1000);
    const prov = PROVINCES[Math.floor(Math.random() * PROVINCES.length)];
    const city =
      CITIES[prov][Math.floor(Math.random() * CITIES[prov].length)];
    const hubList = HUBS[city] || [`HUB ${city}`];
    const hub = hubList[Math.floor(Math.random() * hubList.length)];
    const fraud_val = Math.round((Math.random() * 499 + 1) * 100000);
    const status = STATUS_LIST[Math.floor(Math.random() * STATUS_LIST.length)];
    const partial_paid =
      status === "Open (Partial Payment)"
        ? Math.round(fraud_val * (0.1 + Math.random() * 0.4))
        : 0;
    const recovered =
      status.startsWith("Closed")
        ? status === "Closed Solved"
          ? Math.round(fraud_val * (0.5 + Math.random() * 0.5))
          : Math.round(fraud_val * Math.random() * 0.3)
        : status === "Investigating"
        ? Math.round(fraud_val * Math.random() * 0.2)
        : 0;

    cases.push({
      id: `FRD-${String(i + 1).padStart(4, "0")}`,
      date: d,
      fraud_type:
        FRAUD_TYPES[Math.floor(Math.random() * FRAUD_TYPES.length)],
      pelaku: PELAKU[Math.floor(Math.random() * PELAKU.length)],
      status,
      fraud_val,
      recovered,
      partial_paid,
      province: prov,
      city,
      hub,
      invoice_no:
        Math.random() > 0.35
          ? `INV-${d.getFullYear()}-${String(rand(1000, 99999)).padStart(5, "0")}`
          : null,
      invoiced: Math.random() > 0.4,
      project: PROJECTS[Math.floor(Math.random() * PROJECTS.length)],
      somasi_level:
        SOMASI_LEVELS[Math.floor(Math.random() * SOMASI_LEVELS.length)],
      completeness: rand(60, 100),
      reason: [
        "Disregard SOP",
        "Insider Collusion",
        "Sistem Error",
        "Communication Gap",
        "Lack of Verification",
      ][Math.floor(Math.random() * 5)],
      investigator:
        COLLECTORS[Math.floor(Math.random() * COLLECTORS.length)],
    });
  }

  return cases;
}

// Generate dummy recovery data
export function genRecoveryData(n: number = 150): RecoveryData[] {
  const data: RecoveryData[] = [];
  const start = new Date("2025-01-01");

  for (let i = 0; i < n; i++) {
    const d = new Date(
      start.getTime() + Math.random() * 90 * 24 * 3600 * 1000
    );
    const channels: Record<string, number> = {};
    let total = 0;

    RECOVERY_CHANNELS.forEach((ch) => {
      if (Math.random() > 0.6) {
        const v = rand(1000000, 20000000);
        channels[ch] = v;
        total += v;
      }
    });

    data.push({
      date: d,
      case_id: `FRD-${String(i + 1).padStart(4, "0")}`,
      collector: COLLECTORS[Math.floor(Math.random() * COLLECTORS.length)],
      channels,
      total,
      payment_type: Math.random() > 0.6 ? "Full" : "Partial",
    });
  }

  return data;
}

// Generate campaign calendar
export function genCampaignCalendar(): CampaignCalendar {
  const cal: CampaignCalendar = {};

  PROJECTS.forEach((p) => {
    cal[p] = {};
    ["01-2025", "02-2025", "03-2025", "04-2025", "05-2025", "06-2025"].forEach(
      (m) => {
        cal[p][m] = {
          type: ["Regular", "Moderate", "Big"][rand(0, 2)] as
            | "Regular"
            | "Moderate"
            | "Big",
          rate: ((rand(20, 120) / 10).toFixed(1)),
        };
      }
    );
  });

  return cal;
}
