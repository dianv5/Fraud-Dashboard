"use client";

import Link from "next/link";
import { useLanguage, Language } from "@/utils/translations";
import { usePathname } from "next/navigation";

export function Header() {
  const { t, lang, setLang } = useLanguage();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header
      style={{
        backgroundColor: "var(--color-background-primary)",
        borderBottom: "1px solid var(--color-border-tertiary)",
        padding: "16px 20px",
        marginBottom: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left: Logo and Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "var(--color-chart-purple)",
            }}
          >
            <i className="ti ti-shield-alert" style={{ marginRight: "8px" }} />
            Fraud Dashboard
          </div>
        </div>

        {/* Center: Navigation */}
        <nav
          style={{
            display: "flex",
            gap: "24px",
            alignItems: "center",
          }}
        >
          <Link
            href="/"
            style={{
              textDecoration: "none",
              color: isActive("/")
                ? "var(--color-chart-purple)"
                : "var(--color-text-secondary)",
              fontSize: "13px",
              fontWeight: isActive("/") ? 600 : 500,
              borderBottom: isActive("/")
                ? "2px solid var(--color-chart-purple)"
                : "none",
              paddingBottom: "4px",
              transition: "all 0.2s ease",
            }}
          >
            {t.page_fraud}
          </Link>
          <Link
            href="/recovery"
            style={{
              textDecoration: "none",
              color: isActive("/recovery")
                ? "var(--color-chart-purple)"
                : "var(--color-text-secondary)",
              fontSize: "13px",
              fontWeight: isActive("/recovery") ? 600 : 500,
              borderBottom: isActive("/recovery")
                ? "2px solid var(--color-chart-purple)"
                : "none",
              paddingBottom: "4px",
              transition: "all 0.2s ease",
            }}
          >
            {t.page_recovery}
          </Link>
          <Link
            href="/investigation"
            style={{
              textDecoration: "none",
              color: isActive("/investigation")
                ? "var(--color-chart-purple)"
                : "var(--color-text-secondary)",
              fontSize: "13px",
              fontWeight: isActive("/investigation") ? 600 : 500,
              borderBottom: isActive("/investigation")
                ? "2px solid var(--color-chart-purple)"
                : "none",
              paddingBottom: "4px",
              transition: "all 0.2s ease",
            }}
          >
            {t.page_investigation}
          </Link>
        </nav>

        {/* Right: Language Toggle */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {(["id", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l as Language)}
              style={{
                padding: "6px 12px",
                backgroundColor:
                  lang === l
                    ? "var(--color-chart-purple)"
                    : "var(--color-background-secondary)",
                color:
                  lang === l
                    ? "white"
                    : "var(--color-text-secondary)",
                border: "1px solid var(--color-border-tertiary)",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
