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

/**
 * ✅ CRITICAL: Prevent Next/Vercel from trying to prerender wallet-driven pages.
 * This stops build-time "prerender-error" crashes for routes like:
 * /magapixel-nfts, /my-miners, /locker, /enchanted-miners, etc.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* ✅ stable class so pages can override body background reliably */}
      <body className="app-body">
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
