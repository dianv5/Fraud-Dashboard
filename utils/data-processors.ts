import { FraudCase, RecoveryData } from "./types";
import { getMonday, fmtDateDDMonYYYY, MONTHS, MONTHS_FULL } from "./formatters";

export type Period = "daily" | "weekly" | "monthly" | "yearly";

export interface TrendData {
  period: string;
  fraud: number;
  recovery: number;
  ratio: number;
}

export interface FraudByTypeData {
  name: string;
  value: number;
}

export interface HeatmapData {
  hub: string;
  total: number;
}

export interface AlertData {
  level: "critical" | "warning" | "watch";
  title: string;
  message: string;
}

// Group cases by period (daily, weekly, monthly, yearly)
export function groupByPeriod(
  cases: FraudCase[],
  period: Period
): Record<string, FraudCase[]> {
  const map: Record<string, FraudCase[]> = {};

  cases.forEach((c) => {
    let key: string;

    if (period === "daily") {
      key = fmtDateDDMonYYYY(c.date);
    } else if (period === "weekly") {
      const mon = getMonday(c.date);
      key = fmtDateDDMonYYYY(mon);
    } else if (period === "monthly") {
      key = `${MONTHS[c.date.getMonth()]} ${c.date.getFullYear()}`;
    } else {
      key = `${c.date.getFullYear()}`;
    }

    if (!map[key]) map[key] = [];
    map[key].push(c);
  });

  return map;
}

// Calculate trend data
export function calcTrendData(
  cases: FraudCase[],
  recoveryData: RecoveryData[],
  period: Period
): TrendData[] {
  const grouped = groupByPeriod(cases, period);
  const result: TrendData[] = [];

  Object.entries(grouped).forEach(([key, groupCases]) => {
    const totalFraud = groupCases.reduce((s, c) => s + c.fraud_val, 0);
    const totalRecovered = groupCases.reduce((s, c) => s + c.recovered, 0);
    const ratio =
      totalFraud > 0 ? Math.round((totalRecovered / totalFraud) * 100) : 0;

    result.push({
      period: key,
      fraud: totalFraud,
      recovery: totalRecovered,
      ratio,
    });
  });

  return result;
}

// Calculate fraud by type
export function calcFraudByType(cases: FraudCase[]): FraudByTypeData[] {
  const map: Record<string, number> = {};

  cases.forEach((c) => {
    if (!map[c.fraud_type]) map[c.fraud_type] = 0;
    map[c.fraud_type] += c.fraud_val;
  });

  const total = Object.values(map).reduce((s, v) => s + v, 0);

  return Object.entries(map)
    .map(([name, value]) => ({
      name,
      value: Math.round((value / total) * 100),
    }))
    .sort((a, b) => b.value - a.value);
}

// Calculate heatmap data by HUB
export function calcHeatmapByHub(cases: FraudCase[]): HeatmapData[] {
  const map: Record<string, number> = {};

  cases.forEach((c) => {
    if (!map[c.hub]) map[c.hub] = 0;
    map[c.hub] += c.fraud_val;
  });

  return Object.entries(map)
    .map(([hub, total]) => ({ hub, total }))
    .sort((a, b) => b.total - a.total);
}

// Generate alerts based on fraud analysis
export function generateAlerts(cases: FraudCase[]): AlertData[] {
  const alerts: AlertData[] = [];

  if (cases.length === 0) return alerts;

  // Alert 1: High fraud volume
  const totalFraud = cases.reduce((s, c) => s + c.fraud_val, 0);
  const avgFraud = totalFraud / cases.length;
  if (avgFraud > 1000000) {
    alerts.push({
      level: "critical",
      title: "High Fraud Volume Detected",
      message: `Average fraud value exceeds expected threshold: ${(avgFraud / 1000000).toFixed(1)}M IDR`,
    });
  }

  // Alert 2: Low recovery ratio
  const totalRecovered = cases.reduce((s, c) => s + c.recovered, 0);
  const recoveryRatio = totalFraud > 0 ? totalRecovered / totalFraud : 0;
  if (recoveryRatio < 0.3) {
    alerts.push({
      level: "warning",
      title: "Low Recovery Ratio",
      message: `Only ${(recoveryRatio * 100).toFixed(0)}% of fraud cases have been recovered`,
    });
  }

  // Alert 3: High open cases
  const openCases = cases.filter(
    (c) => c.status === "Open" || c.status === "Open (Partial Payment)"
  ).length;
  if (openCases / cases.length > 0.5) {
    alerts.push({
      level: "warning",
      title: "High Number of Open Cases",
      message: `${openCases} cases (${((openCases / cases.length) * 100).toFixed(0)}%) are still open`,
    });
  }

  // Alert 4: Watch for potential fraud patterns
  const pelakuMap: Record<string, number> = {};
  cases.forEach((c) => {
    if (!pelakuMap[c.pelaku]) pelakuMap[c.pelaku] = 0;
    pelakuMap[c.pelaku]++;
  });

  const topPelaku = Object.entries(pelakuMap).sort((a, b) => b[1] - a[1])[0];
  if (topPelaku && topPelaku[1] / cases.length > 0.15) {
    alerts.push({
      level: "watch",
      title: "High Fraud by Single Perpetrator",
      message: `${topPelaku[0]} involved in ${((topPelaku[1] / cases.length) * 100).toFixed(0)}% of cases`,
    });
  }

  return alerts;
}

// Calculate KPI metrics
export interface KPIMetrics {
  totalCases: number;
  totalFraudValue: number;
  totalRecoveredValue: number;
  outstandingValue: number;
  recoveryRatio: number;
}

export function calcKPIMetrics(cases: FraudCase[]): KPIMetrics {
  const totalFraudValue = cases.reduce((s, c) => s + c.fraud_val, 0);
  const totalRecoveredValue = cases.reduce((s, c) => s + c.recovered, 0);
  const outstandingValue = totalFraudValue - totalRecoveredValue;
  const recoveryRatio =
    totalFraudValue > 0 ? totalRecoveredValue / totalFraudValue : 0;

  return {
    totalCases: cases.length,
    totalFraudValue,
    totalRecoveredValue,
    outstandingValue,
    recoveryRatio,
  };
}

// Filter cases based on criteria
export interface FilterCriteria {
  project?: string;
  fraudType?: string;
  status?: string;
  location?: string;
  dateRange?: [Date, Date];
  fraudValueRange?: [number, number];
}

export function filterCases(
  cases: FraudCase[],
  criteria: FilterCriteria
): FraudCase[] {
  return cases.filter((c) => {
    if (criteria.project && c.project !== criteria.project) return false;
    if (criteria.fraudType && c.fraud_type !== criteria.fraudType) return false;
    if (criteria.status && c.status !== criteria.status) return false;
    if (criteria.location && c.hub !== criteria.location) return false;
    if (criteria.dateRange) {
      if (
        c.date < criteria.dateRange[0] ||
        c.date > criteria.dateRange[1]
      ) {
        return false;
      }
    }
    if (criteria.fraudValueRange) {
      if (
        c.fraud_val < criteria.fraudValueRange[0] ||
        c.fraud_val > criteria.fraudValueRange[1]
      ) {
        return false;
      }
    }
    return true;
  });
}
