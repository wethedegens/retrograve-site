"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export type NavLink = {
  type: "link" | "a";
  label: string;
  href: string;

  // active behavior for internal routes
  active?: "starts" | "exact";
};

type FixedBarProps = {
  links: NavLink[];
};

function isActive(pathname: string, href: string, mode: NavLink["active"]) {
  if (!mode) return false;
  if (mode === "exact") return pathname === href;
  return pathname.startsWith(href);
}

/**
 * FixedBar
 * - Single source of truth for TopNav styling
 * - DO NOT pass barColor/textColor props (we keep styling here)
 */
export default function FixedBar({ links }: FixedBarProps) {
  const pathname = usePathname();

  const rendered = useMemo(() => {
    return links.map((l) => {
      const active =
        l.type === "link" ? isActive(pathname, l.href, l.active) : false;

      const baseStyle: React.CSSProperties = {
        color: "rgba(255,255,255,0.82)",
        textDecoration: "none",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        padding: "8px 10px",
        borderRadius: 10,
        transition: "all 120ms ease",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      };

      const activeStyle: React.CSSProperties = active
        ? {
            color: "#fff",
            background: "rgba(255,255,255,0.08)",
          }
        : {};

      if (l.type === "a") {
        return (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noreferrer"
            style={{ ...baseStyle, ...activeStyle }}
          >
            {l.label}
          </a>
        );
      }

      return (
        <Link
          key={l.label}
          href={l.href}
          style={{ ...baseStyle, ...activeStyle }}
        >
          {l.label}
        </Link>
      );
    });
  }, [links, pathname]);

  return (
    <nav
      aria-label="Top navigation"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: 64,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        padding: "0 14px",
        background: "rgba(11,11,15,0.65)",
        backdropFilter: "blur(12px)",

        // IMPORTANT: removes that black divider line
        borderBottom: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 1200,
        }}
      >
        {rendered}
      </div>
    </nav>
  );
}
