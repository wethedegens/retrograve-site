// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Providers from "./providers";
import WalletGate from "./components/WalletGate";
import RedirectOnConnect from "./components/RedirectOnConnect";
import TopNavWrapper from "./components/TopNavWrapper";

export const metadata: Metadata = {
  title: "LockScreened / RetroGrave",
  description:
    "LockScreened hub for phone-native NFT lock screens, plus RetroGrave legendary lock screens.",
};

// ✅ keep build stable for wallet-driven pages
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="app-body">
        {/* ✅ IMPOSSIBLE-TO-MISS BUILD STAMP (TEMP) */}
        <div
          style={{
            position: "fixed",
            top: 8,
            left: 8,
            zIndex: 20000,
            background: "rgba(255,0,255,0.9)",
            color: "#000",
            padding: "8px 12px",
            borderRadius: 10,
            fontFamily: "monospace",
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: "0.08em",
            boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
            pointerEvents: "none",
          }}
        >
          BUILD STAMP: LAYOUT-12/26-A
        </div>

        <Providers>
          <WalletGate>
            <RedirectOnConnect />
            <TopNavWrapper />
            {children}
          </WalletGate>
        </Providers>
      </body>
    </html>
  );
}
