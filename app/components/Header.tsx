// app/components/Header.tsx
"use client";

import React from "react";
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
  /** optional: if you ever want to hide wallet on a specific page */
  showWallet?: boolean;
};

function isActive(pathname: string, l: NavLink) {
  if (!l.active) return false;
  const p = (pathname || "").toLowerCase();
  const h = (l.href || "").toLowerCase();

  if (l.active === "exact") return p === h;
  if (l.active === "starts") return p.startsWith(h);
  return false;
}

export default function Header({ links, showWallet = true }: FixedBarProps) {
  const pathname = usePathname();

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
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* LEFT SPACER */}
        <div />

        {/* CENTER LINKS */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            flexWrap: "wrap",
            pointerEvents: "auto",
          }}
        >
          {links.map((l) => {
            const internal = l.type === "link";
            const active = isActive(pathname || "", l);

            const commonStyle: React.CSSProperties = {
              color: "rgba(255,255,255,0.92)", // ✅ ALL WHITE
              textDecoration: active ? "underline" : "none",
              textUnderlineOffset: "6px",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 800,
              padding: "10px 10px",
              borderRadius: 999,
              lineHeight: 1,
              cursor: "pointer",
              userSelect: "none",
              whiteSpace: "nowrap",
              opacity: 0.95,
            };

            if (internal) {
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

        {/* RIGHT: WALLET + LOGO */}
        <div
          style={{
            justifySelf: "end",
            display: "flex",
            alignItems: "center",
            gap: 10,
            opacity: 1,
            visibility: "visible",
            filter: "none",
            pointerEvents: "auto",
          }}
        >
          {showWallet ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <WalletMultiButton />
            </div>
          ) : null}

          <Link
            href="/"
            aria-label="LockScreened home"
            style={{
              width: 42,
              height: 42,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.16)",
              boxShadow: "0 10px 22px rgba(0,0,0,0.35)",
            }}
          >
            <img
              src="/lockscreened-logo.png"
              alt="LockScreened logo"
              draggable={false}
              style={{
                width: 30,
                height: 30,
                objectFit: "contain",
                display: "block",
                opacity: 1,
                filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.45))",
              }}
            />
          </Link>
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
