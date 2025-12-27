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
        <Providers>
          {/* ✅ NAV lives OUTSIDE WalletGate so it always renders */}
          <TopNavWrapper />

          <WalletGate>
            <RedirectOnConnect />
            {children}
          </WalletGate>
        </Providers>
      </body>
    </html>
  );
}
