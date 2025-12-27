"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export type NavLink = {
  type: "link" | "a";
  label: string;
  href: string;
  active?: "starts" | "exact";
};

export type FixedBarProps = {
  links: NavLink[];
  /** optional: if you ever want to hide wallet on a specific page */
  showWallet?: boolean;
};

export default function FixedBar({ links, showWallet = true }: FixedBarProps) {
  return (
    <nav
      aria-label="Top navigation"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: 64,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "0 14px",
        backgroundColor: "rgba(11, 11, 15, 0.85)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        {/* LEFT LINKS */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            flexWrap: "wrap",
          }}
        >
          {links.map((l) => {
            const isInternal = l.type === "link";
            const commonStyle: React.CSSProperties = {
              color: "rgba(255,255,255,0.88)",
              textDecoration: "none",
              fontSize: 12,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "10px 10px",
              borderRadius: 999,
              lineHeight: 1,
            };

            if (isInternal) {
              return (
                <Link key={l.href} href={l.href} style={commonStyle}>
                  {l.label}
                </Link>
              );
            }

            return (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                style={commonStyle}
              >
                {l.label}
              </a>
            );
          })}
        </div>

        {/* RIGHT WALLET */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 10,
            // ✅ explicitly NOT hidden / blurred
            opacity: 1,
            visibility: "visible",
            filter: "none",
          }}
        >
          {showWallet ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <WalletMultiButton />
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
