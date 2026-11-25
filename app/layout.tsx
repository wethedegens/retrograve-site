// app/layout.tsx
import "./globals.css";
import "./studio/studio-theme.css";
import type { Metadata } from "next";
import Providers from "./providers";
import WalletGate from "./components/WalletGate";
import RedirectOnConnect from "./components/RedirectOnConnect";
import TopNavWrapper from "./components/TopNavWrapper";
import StyledJsxRegistry from "./registry";

const siteTitle = "LockScreened";
const siteDescription = "Turn NFTs you own into custom wallpapers for your phone, tablet, or desktop.";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    type: "website",
    siteName: siteTitle,
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
  },
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
        <StyledJsxRegistry>
        <Providers>
          {/* ✅ NAV lives OUTSIDE WalletGate so it always renders */}
          <TopNavWrapper />

          <WalletGate>
            <RedirectOnConnect />
            {children}
          </WalletGate>
        </Providers>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
