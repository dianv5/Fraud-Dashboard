"use client";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { TrendData, FraudByTypeData, HeatmapData } from "@/utils/data-processors";
import { COLORS, PROJECTS, PROJECT_COLORS, CHANNEL_COLORS } from "@/utils/types";
import { fmt } from "@/utils/formatters";
import { useLanguage } from "@/utils/translations";

interface ChartsProps {
  trendData?: TrendData[];
  fraudByType?: FraudByTypeData[];
  heatmapData?: HeatmapData[];
  recoveryByChannel?: Record<string, number>;
  topCollectors?: Array<{ name: string; value: number }>;
}

export function TrendChart({ data }: { data?: TrendData[] }) {
  const { t } = useLanguage();

  if (!data || data.length === 0) return <div>{t.dataLoading}</div>;

  return (
    <div
      style={{
        width: "100%",
        height: 300,
        marginBottom: "24px",
      }}
    >
      <h3
        style={{
          fontSize: "14px",
          fontWeight: 600,
          marginBottom: "12px",
          color: "var(--color-text-primary)",
        }}
      >
        {t.sectionTrend}
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border-tertiary)"
          />
          <XAxis
            dataKey="period"
            stroke="var(--color-text-tertiary)"
            style={{ fontSize: "12px" }}
          />
          <YAxis stroke="var(--color-text-tertiary)" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-background-primary)",
              border: "1px solid var(--color-border-tertiary)",
              borderRadius: "4px",
            }}
            formatter={(value: number) => fmt(value)}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="fraud"
            stroke="var(--color-chart-red)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="recovery"
            stroke="var(--color-chart-green)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FraudByTypeChart({ data }: { data?: FraudByTypeData[] }) {
  const { t } = useLanguage();

  if (!data || data.length === 0) return <div>{t.dataLoading}</div>;

  return (
    <div
      style={{
        width: "100%",
        height: 300,
        marginBottom: "24px",
      }}
    >
      <h3
        style={{
          fontSize: "14px",
          fontWeight: 600,
          marginBottom: "12px",
          color: "var(--color-text-primary)",
        }}
      >
        {t.sectionFraudByType}
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((_, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value}%`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HeatmapChart({ data }: { data?: HeatmapData[] }) {
  const { t } = useLanguage();

  if (!data || data.length === 0) return <div>{t.dataLoading}</div>;

  return (
    <div
      style={{
        width: "100%",
        height: 300,
        marginBottom: "24px",
      }}
    >
      <h3
        style={{
          fontSize: "14px",
          fontWeight: 600,
          marginBottom: "12px",
          color: "var(--color-text-primary)",
        }}
      >
        {t.sectionHeatmap}
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 50 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border-tertiary)"
          />
          <XAxis
            dataKey="hub"
            angle={-45}
            textAnchor="end"
            height={80}
            stroke="var(--color-text-tertiary)"
            style={{ fontSize: "12px" }}
          />
          <YAxis stroke="var(--color-text-tertiary)" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-background-primary)",
              border: "1px solid var(--color-border-tertiary)",
              borderRadius: "4px",
            }}
            formatter={(value: number) => fmt(value)}
          />
          <Bar dataKey="total" fill="var(--color-chart-purple)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RecoveryByChannelChart({
  data,
}: {
  data?: Record<string, number>;
}) {
  const { t } = useLanguage();

  if (!data || Object.keys(data).length === 0) return <div>{t.dataLoading}</div>;

  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div
      style={{
        width: "100%",
        height: 300,
        marginBottom: "24px",
      }}
    >
      <h3
        style={{
          fontSize: "14px",
          fontWeight: 600,
          marginBottom: "12px",
          color: "var(--color-text-primary)",
        }}
      >
        {t.recByChannel}
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border-tertiary)"
          />
          <XAxis dataKey="name" stroke="var(--color-text-tertiary)" style={{ fontSize: "12px" }} />
          <YAxis stroke="var(--color-text-tertiary)" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-background-primary)",
              border: "1px solid var(--color-border-tertiary)",
              borderRadius: "4px",
            }}
            formatter={(value: number) => fmt(value)}
          />
          <Bar
            dataKey="value"
            fill="var(--color-chart-blue)"
            shape={<CustomBar />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Custom bar with gradient
function CustomBar(props: any) {
  const { fill, x, y, width, height } = props;
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      opacity={0.8}
    />
  );
}
