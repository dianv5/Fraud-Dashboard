"use client";

import { fmt, fmtNum } from "@/utils/formatters";
import { useLanguage } from "@/utils/translations";

interface KPICardProps {
  label: string;
  value: number;
  unit?: string;
  icon?: string;
  color?: string;
  isPercentage?: boolean;
}

export function KPICard({
  label,
  value,
  unit,
  icon,
  color = "#7C3AED",
  isPercentage = false,
}: KPICardProps) {
  const { t } = useLanguage();

  return (
    <div
      style={{
        flex: 1,
        minWidth: "200px",
        padding: "16px",
        backgroundColor: "var(--color-background-primary)",
        border: "1px solid var(--color-border-tertiary)",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: 500,
            color: "var(--color-text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {label}
        </span>
        {icon && (
          <i
            className={`ti ${icon}`}
            style={{ fontSize: "16px", color, opacity: 0.8 }}
          />
        )}
      </div>
      <div
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          color: "var(--color-text-primary)",
          marginBottom: "4px",
        }}
      >
        {isPercentage
          ? `${(value * 100).toFixed(1)}%`
          : value > 100
          ? fmt(value)
          : fmtNum(Math.round(value))}
        {unit && (
          <span
            style={{
              fontSize: "14px",
              color: "var(--color-text-secondary)",
              marginLeft: "4px",
              fontWeight: "normal",
            }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
