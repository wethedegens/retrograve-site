// app/components/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export type NavLink = {
  type: "link" | "a";
  label: string;
  href: string;
  active?: "starts" | "exact";
};

export type FixedBarProps = {
  links: NavLink[];
  barColor?: string;
  textColor?: string;
};

export function FixedBar({
  links,
  barColor = "#0b0b0f",
  textColor = "#ffffff",
}: FixedBarProps) {
  const pathname = usePathname();

  function isActive(l: NavLink) {
    if (l.type !== "link") return false;
    if (l.active === "exact") return pathname === l.href;
    if (l.active === "starts") return pathname.startsWith(l.href);
    return pathname === l.href;
  }

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
        backgroundColor: barColor,
        color: textColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        padding: "0 14px",
      }}
    >
      <div
        style={{
          width: "min(1200px, 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {links.map((l) => {
            const active = isActive(l);

            const commonStyle: React.CSSProperties = {
              fontSize: 13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              textDecoration: "none",
              color: textColor,
              opacity: active ? 1 : 0.9,
              borderBottom: active ? `2px solid ${textColor}` : "2px solid transparent",
              paddingBottom: 6,
              whiteSpace: "nowrap",
            };

            if (l.type === "a") {
              return (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  style={commonStyle}
                >
                  {l.label}
                </a>
              );
            }

            return (
              <Link key={l.label} href={l.href} style={commonStyle}>
                {l.label}
              </Link>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <WalletMultiButton />
        </div>
      </div>
    </nav>
  );
}

// Default export kept (so anything importing Header still works)
export default function Header(props: FixedBarProps) {
  return <FixedBar {...props} />;
}
