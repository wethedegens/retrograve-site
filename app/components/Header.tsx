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
};

export function FixedBar({ links }: FixedBarProps) {
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

        // ✅ closer to your original bar
        backgroundColor: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",

        // ✅ REMOVE the “black line”
        borderBottom: "none",
        boxShadow: "none",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          height: "100%",
          padding: "0 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Center links */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {links.map((l) => {
            const active = isActive(l);

            const commonStyle: React.CSSProperties = {
              fontSize: 14,
              fontWeight: 700,

              // ✅ less “spaced out” than before
              letterSpacing: "0.06em",
              textTransform: "uppercase",

              textDecoration: "none",
              color: "#ffffff",
              opacity: active ? 1 : 0.88,

              paddingBottom: 4,
              borderBottom: active ? "2px solid #ffffff" : "2px solid transparent",
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

        {/* Wallet button pinned right */}
        <div style={{ position: "absolute", right: 18 }}>
          <WalletMultiButton />
        </div>
      </div>
    </nav>
  );
}

export default function Header(props: FixedBarProps) {
  return <FixedBar {...props} />;
}
