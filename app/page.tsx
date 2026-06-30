"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { KPICard } from "@/components/KPICard";
import { TrendChart, FraudByTypeChart, HeatmapChart } from "@/components/Charts";
import { AlertsSection } from "@/components/Alerts";
import { CasesTable } from "@/components/Table";
import { FraudCase } from "@/utils/types";
import { fmt } from "@/utils/formatters";
import { useLanguage } from "@/utils/translations";
import {
  calcTrendData,
  calcFraudByType,
  calcHeatmapByHub,
  generateAlerts,
  calcKPIMetrics,
} from "@/utils/data-processors";
import { genCases } from "@/utils/data-generator";
import { fetchFraudCases } from "@/utils/sheets-fetcher";
import { SHEET_URLS } from "@/utils/types";

export default function FraudPerformancePage() {
  const { t } = useLanguage();
  const [cases, setCases] = useState<FraudCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiveData, setIsLiveData] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Try to fetch from Google Sheets
        const data = await fetchFraudCases(SHEET_URLS.fraudCases);
        setCases(data);
        setIsLiveData(true);
      } catch (error) {
        // Fallback to demo data
        console.log("Using demo data fallback");
        const demoData = genCases(300);
        setCases(demoData);
        setIsLiveData(false);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const kpis = useMemo(() => calcKPIMetrics(cases), [cases]);
  const trendData = useMemo(
    () => calcTrendData(cases, [], "monthly"),
    [cases]
  );
  const fraudByType = useMemo(() => calcFraudByType(cases), [cases]);
  const heatmap = useMemo(() => calcHeatmapByHub(cases), [cases]);
  const alerts = useMemo(() => generateAlerts(cases), [cases]);

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>{t.dataLoading}</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-background-secondary)" }}>
      <Header />

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
        {/* Data Source Badge */}
        <div
          style={{
            marginBottom: "20px",
            padding: "8px 12px",
            backgroundColor: isLiveData ? "#EFF6FF" : "#FFFBEB",
            border: isLiveData
              ? "1px solid #BFDBFE"
              : "1px solid #FDE68A",
            borderRadius: "4px",
            fontSize: "12px",
            color: isLiveData ? "#0EA5E9" : "#F59E0B",
            display: "inline-block",
          }}
        >
          <i
            className={`ti ${isLiveData ? "ti-cloud" : "ti-database"}`}
            style={{ marginRight: "4px" }}
          />
          {isLiveData ? t.dataLive : t.dataDummy}
        </div>

        {/* KPI Cards */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          <KPICard
            label={t.kpiTotal}
            value={kpis.totalCases}
            unit={t.kpiTotalLabel}
            icon="ti-stack-3"
            color="var(--color-chart-purple)"
          />
          <KPICard
            label={t.kpiFraudValue}
            value={kpis.totalFraudValue}
            icon="ti-alert-circle"
            color="var(--color-chart-red)"
          />
          <KPICard
            label={t.kpiRecovery}
            value={kpis.totalRecoveredValue}
            icon="ti-check-circle"
            color="var(--color-chart-green)"
          />
          <KPICard
            label={t.kpiOutstanding}
            value={kpis.outstandingValue}
            unit={t.kpiOutstandingSub}
            icon="ti-alert-octagon"
            color="var(--color-chart-orange)"
          />
          <KPICard
            label={t.kpiRatio}
            value={kpis.recoveryRatio}
            unit={t.kpiRatioSub}
            icon="ti-percentage"
            color="var(--color-chart-blue)"
            isPercentage={true}
          />
        </div>

        {/* Charts Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              padding: "20px",
              backgroundColor: "var(--color-background-primary)",
              border: "1px solid var(--color-border-tertiary)",
              borderRadius: "8px",
            }}
          >
            <TrendChart data={trendData} />
          </div>

          <div
            style={{
              padding: "20px",
              backgroundColor: "var(--color-background-primary)",
              border: "1px solid var(--color-border-tertiary)",
              borderRadius: "8px",
            }}
          >
            <FraudByTypeChart data={fraudByType} />
          </div>
        </div>

        {/* Heatmap */}
        <div
          style={{
            padding: "20px",
            backgroundColor: "var(--color-background-primary)",
            border: "1px solid var(--color-border-tertiary)",
            borderRadius: "8px",
            marginBottom: "24px",
          }}
        >
          <HeatmapChart data={heatmap} />
        </div>

        {/* Alerts */}
        <AlertsSection alerts={alerts} />

        {/* Cases Table */}
        <div>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 600,
              marginBottom: "16px",
              color: "var(--color-text-primary)",
            }}
          >
            {t.sectionSummary}
          </h2>
          <CasesTable cases={cases} />
        </div>
      </main>
    </div>
  );
}
