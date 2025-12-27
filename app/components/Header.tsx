"use client";

import React from "react";
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

        // ✅ important for "dead link" feeling if something overlaps:
        pointerEvents: "auto",

        display: "flex",
        alignItems: "center",
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
          height: "100%",

          // ✅ 3-column grid so LINKS are truly centered, wallet stays right
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* LEFT SPACER (keeps center truly centered) */}
        <div />

        {/* CENTER LINKS */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            flexWrap: "wrap",

            // ✅ ensure clicks always register
            pointerEvents: "auto",
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
              cursor: "pointer",
              userSelect: "none",
              whiteSpace: "nowrap",
            };

            if (isInternal) {
              return (
                <Link key={`${l.label}-${l.href}`} href={l.href} style={commonStyle}>
                  {l.label}
                </Link>
              );
            }

            return (
              <a
                key={`${l.label}-${l.href}`}
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
            justifySelf: "end",
            display: "flex",
            alignItems: "center",
            gap: 10,

            // ✅ force visible
            opacity: 1,
            visibility: "visible",
            filter: "none",

            // ✅ ensure wallet is clickable
            pointerEvents: "auto",
          }}
        >
          {showWallet ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <WalletMultiButton />
            </div>
          ) : null}
        </div>
      </div>

      {/* ✅ Hard overrides so wallet can’t get “hidden/blurred” by other CSS */}
      <style jsx>{`
        :global(.wallet-adapter-button),
        :global(.wallet-adapter-button-trigger),
        :global(.wallet-adapter-dropdown),
        :global(.wallet-adapter-dropdown-list),
        :global(.wallet-adapter-dropdown-list-item) {
          opacity: 1 !important;
          visibility: visible !important;
          filter: none !important;
          pointer-events: auto !important;
        }

        /* Mobile: allow wrapping but keep centered feel */
        @media (max-width: 720px) {
          nav[aria-label="Top navigation"] > div {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          nav[aria-label="Top navigation"] > div > div:first-child {
            display: none;
          }

          nav[aria-label="Top navigation"] > div > div:nth-child(2) {
            justify-content: center;
          }

          nav[aria-label="Top navigation"] > div > div:last-child {
            justify-self: center;
          }
        }
      `}</style>
    </nav>
  );
}
