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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <WalletGate>
            <RedirectOnConnect />
            {/* Header is now controlled by TopNavWrapper */}
            <TopNavWrapper />
            {children}
          </WalletGate>
        </Providers>
      </body>
    </html>
  );
}
