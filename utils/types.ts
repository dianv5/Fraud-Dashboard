export interface FraudCase {
  id: string;
  date: Date;
  fraud_type: string;
  pelaku: string;
  fraud_val: number;
  recovered: number;
  partial_paid: number;
  status: string;
  province: string;
  city: string;
  hub: string;
  project: string;
  invoice_no: string | null;
  invoiced: boolean;
  somasi_level: string;
  completeness: number;
  reason: string;
  investigator: string;
}

export interface RecoveryData {
  date: Date;
  case_id: string;
  collector: string;
  channels: Record<string, number>;
  total: number;
  payment_type: "Full" | "Partial";
}

export interface CampaignCalendarEntry {
  type: "Regular" | "Moderate" | "Big";
  rate: string;
}

export interface CampaignCalendar {
  [project: string]: {
    [month: string]: CampaignCalendarEntry;
  };
}

// Constants
export const COLORS = [
  "#7C3AED",
  "#0EA5E9",
  "#F59E0B",
  "#EF4444",
  "#10B981",
  "#EC4899",
  "#8B5CF6",
  "#06B6D4",
  "#F97316",
  "#14B8A6",
];

export const FRAUD_TYPES = [
  "Pending COD",
  "Lost & Damage",
  "Fake Order & Delivery",
  "Swap Parcel",
  "Pencurian Paket",
];

export const PELAKU = [
  "Kurir (Rider)",
  "Kurir (Driver)",
  "Operator",
  "Admin Tracer",
  "Korlap",
  "Helper",
];

export const STATUS_LIST = [
  "Open",
  "Open (Partial Payment)",
  "Investigating",
  "Closed Solved",
  "Closed Unsolved",
];

export const SOMASI_LEVELS = [
  "Belum Ada Tindakan",
  "Surat Peringatan 1",
  "Surat Peringatan 2",
  "Surat Somasi 1",
  "Surat Somasi 2",
  "Surat Somasi 3",
  "Proses Litigasi",
];

export const PROVINCES = [
  "Jawa Tengah",
  "Jawa Barat",
  "Jawa Timur",
  "DKI Jakarta",
  "Banten",
  "Sumatera Utara",
];

export const PROJECTS = [
  "Shopee Express",
  "GoTo Logistics",
  "SF Express",
  "Kapal Api",
  "Indopaket",
  "Lion Parcel",
  "J&T Express",
  "Anteraja",
];

export const RECOVERY_CHANNELS = [
  "Salary Deduction",
  "Joint Liability",
  "Deposit Deduction",
  "Field Recovery",
  "Platform Fee",
];

export const COLLECTORS = [
  "Tim A - Recovery",
  "Tim B - Recovery",
  "Tim C - Recovery",
  "Tim D - Recovery",
  "Tim E - Recovery",
];

export const PROJECT_COLORS = [
  "#7C3AED",
  "#0EA5E9",
  "#F59E0B",
  "#EF4444",
  "#10B981",
  "#EC4899",
  "#8B5CF6",
  "#F97316",
];

export const CHANNEL_COLORS: Record<string, string> = {
  "Salary Deduction": "#7C3AED",
  "Joint Liability": "#0EA5E9",
  "Deposit Deduction": "#F59E0B",
  "Field Recovery": "#10B981",
  "Platform Fee": "#EC4899",
};

export const CITIES: Record<string, string[]> = {
  "Jawa Tengah": ["Semarang", "Solo", "Kudus", "Demak"],
  "Jawa Barat": ["Bandung", "Bekasi", "Depok", "Bogor"],
  "Jawa Timur": ["Surabaya", "Malang", "Sidoarjo", "Gresik"],
  "DKI Jakarta": [
    "Jakarta Pusat",
    "Jakarta Selatan",
    "Jakarta Utara",
    "Jakarta Barat",
  ],
  Banten: ["Tangerang", "Serang", "Cilegon"],
  "Sumatera Utara": ["Medan", "Deliserdang", "Binjai"],
};

export const HUBS: Record<string, string[]> = {
  Semarang: ["HUB Semarang Pusat", "HUB Semarang Timur"],
  Solo: ["HUB Solo"],
  Kudus: ["HUB Kudus"],
  Demak: ["HUB Demak"],
  Bandung: ["HUB Bandung Utara", "HUB Bandung Selatan"],
  Bekasi: ["HUB Bekasi"],
  Depok: ["HUB Depok"],
  Bogor: ["HUB Bogor"],
  Surabaya: ["HUB Surabaya Rungkut", "HUB Surabaya Barat"],
  Malang: ["HUB Malang"],
  Sidoarjo: ["HUB Sidoarjo"],
  Gresik: ["HUB Gresik"],
  "Jakarta Pusat": ["HUB Jakpus"],
  "Jakarta Selatan": ["HUB Jaksel"],
  "Jakarta Utara": ["HUB Jakut"],
  "Jakarta Barat": ["HUB Jakbar"],
  Tangerang: ["HUB Tangerang"],
  Serang: ["HUB Serang"],
  Cilegon: ["HUB Cilegon"],
  Medan: ["HUB Medan"],
  Deliserdang: ["HUB Deliserdang"],
  Binjai: ["HUB Binjai"],
};

export const statusColor: Record<string, string> = {
  Open: "#EF4444",
  "Open (Partial Payment)": "#F97316",
  Investigating: "#F59E0B",
  "Closed Solved": "#10B981",
  "Closed Unsolved": "#6B7280",
};

export const levelCfg: Record<
  string,
  { color: string; bg: string; border: string; icon: string }
> = {
  critical: {
    color: "#EF4444",
    bg: "#FEF2F2",
    border: "#FECACA",
    icon: "ti-alert-octagon",
  },
  warning: {
    color: "#F59E0B",
    bg: "#FFFBEB",
    border: "#FDE68A",
    icon: "ti-alert-triangle",
  },
  watch: {
    color: "#0EA5E9",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    icon: "ti-eye",
  },
};

// Google Sheets URLs
export const SHEET_URLS = {
  fraudCases:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSsChnRjXsjDlEJRuE9SwZI3iH5F3vh2MBrYEd5V5FNrhpMbMhjzy39p7GyjkYlTmeAGzr1_yy32ZrE/pub?gid=1074283744&single=true&output=csv",
  recoveryData:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSsChnRjXsjDlEJRuE9SwZI3iH5F3vh2MBrYEd5V5FNrhpMbMhjzy39p7GyjkYlTmeAGzr1_yy32ZrE/pub?gid=1801994962&single=true&output=csv",
  campaignCalendar:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSsChnRjXsjDlEJRuE9SwZI3iH5F3vh2MBrYEd5V5FNrhpMbMhjzy39p7GyjkYlTmeAGzr1_yy32ZrE/pub?gid=1918000757&single=true&output=csv",
};
