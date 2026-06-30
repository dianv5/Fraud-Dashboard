// Format number as compact currency (e.g., 1.2B IDR)
export const fmt = (n: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

// Format number as full currency (e.g., 1,234,567 IDR)
export const fmtFull = (n: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

// Format number with thousand separators
export const fmtNum = (n: number): string =>
  new Intl.NumberFormat("id-ID").format(n);

// Month abbreviations and full names
export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export const MONTHS_FULL = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

// Random number helper
export const rand = (a: number, b: number): number =>
  Math.floor(Math.random() * (b - a + 1)) + a;

// Format date as "DD Bulan YYYY"
export function fmtDateDDMonYYYY(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

// Get Monday of the week for a given date
export function getMonday(d: Date): Date {
  const dt = new Date(d);
  const day = dt.getDay();
  dt.setDate(dt.getDate() + (day === 0 ? -6 : 1 - day));
  return dt;
}

// Current date/time string
export function nowStr(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
