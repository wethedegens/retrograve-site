// app/my-miners/page.tsx
"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";

const ENCHANTED_MINERS_BG_IMAGE = "/enchanted-miners-bg.png";

export default function MyMinersLandingPage() {
  const { connected } = useWallet();

  return (
    <main
      className="miners-landing"
      style={{
        minHeight: "100vh",
        padding: "18px 0 80px",
        paddingTop: 64,

        backgroundImage: `url(${ENCHANTED_MINERS_BG_IMAGE})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 18px" }}>
        <div
          style={{
            minHeight: "calc(100vh - 64px - 98px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "40px 0",
          }}
        >
          <div
            style={{
              maxWidth: 560,
              padding: "22px 18px",
              borderRadius: 18,
              background: "rgba(10, 10, 14, 0.55)",
              border: "1px solid rgba(255,255,255,0.14)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
            }}
          >
            <h1
              style={{
                margin: "0 0 10px",
                fontSize: 28,
                letterSpacing: "0.04em",
              }}
            >
              ENCHANTED MINERS
            </h1>

            <p style={{ margin: "0 0 14px", opacity: 0.9, lineHeight: 1.6 }}>
              Connect your wallet to view your Miners, then tap one to open it
              in the locker and export wallpapers.
            </p>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <WalletMultiButton />
            </div>

            <div style={{ height: 14 }} />

            {/* ✅ This is the "enter" button you were missing */}
            <Link
              href="/enchanted-miners"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 999,
                textDecoration: "none",
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#fff",
                background: connected
                  ? "rgba(140, 255, 205, 0.22)"
                  : "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow: "0 12px 26px rgba(0,0,0,0.30)",
              }}
            >
              {connected ? "View My Miners" : "View My Miners (connect first)"}
            </Link>

            <p style={{ margin: "12px 0 0", opacity: 0.65, fontSize: 12 }}>
              Your wallet is only used to read your NFTs — nothing can be moved
              or signed without your approval.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
