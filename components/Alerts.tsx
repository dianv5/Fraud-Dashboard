"use client";

import { AlertData, levelCfg } from "@/utils/types";
import { useLanguage } from "@/utils/translations";

interface AlertsProps {
  alerts: AlertData[];
}

export function AlertsSection({ alerts }: AlertsProps) {
  const { t } = useLanguage();

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "var(--color-background-primary)",
        border: "1px solid var(--color-border-tertiary)",
        borderRadius: "8px",
        marginBottom: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <i
          className="ti ti-alert-triangle"
          style={{
            fontSize: "20px",
            color: "var(--color-chart-amber)",
            marginRight: "12px",
          }}
        />
        <h2
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            margin: 0,
          }}
        >
          {t.sectionAlert}
        </h2>
      </div>

      <p
        style={{
          fontSize: "13px",
          color: "var(--color-text-secondary)",
          marginBottom: "16px",
          margin: 0,
        }}
      >
        {t.alertSubtitle}
      </p>

      {alerts.length === 0 ? (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#EFF6FF",
            border: "1px solid #BFDBFE",
            borderRadius: "6px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: 500, color: "#0EA5E9" }}>
            {t.alertNone}
          </div>
          <div style={{ fontSize: "12px", color: "#0EA5E9", opacity: 0.8 }}>
            {t.alertNoneSub}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {alerts.map((alert, idx) => {
            const cfg = levelCfg[alert.level] || levelCfg.watch;
            return (
              <div
                key={idx}
                style={{
                  padding: "12px",
                  backgroundColor: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  borderRadius: "6px",
                  display: "flex",
                  gap: "12px",
                }}
              >
                <i
                  className={`ti ${cfg.icon}`}
                  style={{
                    fontSize: "16px",
                    color: cfg.color,
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: cfg.color,
                      marginBottom: "4px",
                    }}
                  >
                    {alert.title}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: cfg.color,
                      opacity: 0.9,
                    }}
                  >
                    {alert.message}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
