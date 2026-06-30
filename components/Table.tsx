"use client";

import { useState, useMemo } from "react";
import { FraudCase } from "@/utils/types";
import { fmt, fmtDateDDMonYYYY } from "@/utils/formatters";
import { useLanguage } from "@/utils/translations";

interface TableProps {
  cases: FraudCase[];
  itemsPerPage?: number;
}

export function CasesTable({ cases, itemsPerPage = 10 }: TableProps) {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCases = useMemo(() => {
    if (!searchTerm) return cases;
    const term = searchTerm.toLowerCase();
    return cases.filter(
      (c) =>
        c.id.toLowerCase().includes(term) ||
        c.fraud_type.toLowerCase().includes(term) ||
        c.pelaku.toLowerCase().includes(term) ||
        c.project.toLowerCase().includes(term) ||
        (c.invoice_no && c.invoice_no.toLowerCase().includes(term))
    );
  }, [cases, searchTerm]);

  const totalPages = Math.ceil(filteredCases.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedCases = filteredCases.slice(
    startIdx,
    startIdx + itemsPerPage
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Open: "#EF4444",
      "Open (Partial Payment)": "#F97316",
      Investigating: "#F59E0B",
      "Closed Solved": "#10B981",
      "Closed Unsolved": "#6B7280",
    };
    return colors[status] || "#999999";
  };

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
      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          placeholder={t.tableSearch}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1px solid var(--color-border-tertiary)",
            borderRadius: "6px",
            fontSize: "13px",
            fontFamily: "inherit",
          }}
        />
      </div>

      <div
        style={{
          overflowX: "auto",
          marginBottom: "16px",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid var(--color-border-tertiary)" }}>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                {t.tableColId}
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                {t.tableColDate}
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                {t.tableColType}
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                {t.tableColPelaku}
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "right",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                {t.tableColValue}
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "right",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                {t.tableColRecovery}
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                {t.tableColStatus}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedCases.length > 0 ? (
              paginatedCases.map((c) => (
                <tr
                  key={c.id}
                  style={{
                    borderBottom: "1px solid var(--color-border-secondary)",
                  }}
                >
                  <td
                    style={{
                      padding: "12px",
                      color: "var(--color-text-primary)",
                      fontWeight: 500,
                    }}
                  >
                    {c.id}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {fmtDateDDMonYYYY(c.date)}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {c.fraud_type}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {c.pelaku}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      color: "var(--color-chart-red)",
                      fontWeight: 500,
                    }}
                  >
                    {fmt(c.fraud_val)}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      color: "var(--color-chart-green)",
                      fontWeight: 500,
                    }}
                  >
                    {fmt(c.recovered)}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      color: getStatusColor(c.status),
                      fontWeight: 500,
                    }}
                  >
                    {c.status}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: "24px",
                    textAlign: "center",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {t.tableNoData}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              padding: "6px 12px",
              backgroundColor:
                currentPage === 1
                  ? "var(--color-background-secondary)"
                  : "var(--color-chart-purple)",
              color:
                currentPage === 1
                  ? "var(--color-text-tertiary)"
                  : "white",
              border: "none",
              borderRadius: "4px",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              fontSize: "12px",
            }}
          >
            {t.tablePrev}
          </button>

          <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
            {t.tablePage} {currentPage} {t.tableOf} {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: "6px 12px",
              backgroundColor:
                currentPage === totalPages
                  ? "var(--color-background-secondary)"
                  : "var(--color-chart-purple)",
              color:
                currentPage === totalPages
                  ? "var(--color-text-tertiary)"
                  : "white",
              border: "none",
              borderRadius: "4px",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              fontSize: "12px",
            }}
          >
            {t.tableNext}
          </button>
        </div>
      )}

      <div
        style={{
          marginTop: "12px",
          fontSize: "12px",
          color: "var(--color-text-secondary)",
          textAlign: "center",
        }}
      >
        {filteredCases.length} {t.tableCases}
      </div>
    </div>
  );
}
