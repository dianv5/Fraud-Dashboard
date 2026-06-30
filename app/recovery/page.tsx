"use client";

import { Header } from "@/components/Header";
import { KPICard } from "@/components/KPICard";
import { useLanguage } from "@/utils/translations";

export default function RecoveryPage() {
  const { t } = useLanguage();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-background-secondary)" }}>
      <Header />

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
        <div
          style={{
            padding: "40px 20px",
            backgroundColor: "var(--color-background-primary)",
            border: "1px solid var(--color-border-tertiary)",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <i
            className="ti ti-building-bank"
            style={{
              fontSize: "48px",
              color: "var(--color-chart-blue)",
              marginBottom: "16px",
              display: "block",
            }}
          />
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 600,
              marginBottom: "8px",
              color: "var(--color-text-primary)",
            }}
          >
            {t.page_recovery}
          </h1>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "16px" }}>
            Recovery performance data will be displayed here
          </p>
          <p style={{ color: "var(--color-text-tertiary)", fontSize: "13px" }}>
            Connect your recovery data source in the settings to get started
          </p>
        </div>
      </main>
    </div>
  );
}
