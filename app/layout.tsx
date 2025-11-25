// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Providers from "./providers";
import TopNav from "./components/TopNav";
import WalletGate from "./components/WalletGate";
import RedirectOnConnect from "./components/RedirectOnConnect";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://retrograve.xyz"); // make sure this matches your domain

export const metadata: Metadata = {
  metadataBase: new URL(SITE),

  title: "RetroGrave Lockscreen Locker",
  description:
    "Choose your MAGApixel NFT and export perfect lockscreen sizes.",

  openGraph: {
    url: SITE,
    siteName: "RetroGrave",
    title: "RetroGrave Lockscreen Locker",
    description:
      "Choose your MAGApixel NFT and export perfect lockscreen sizes.",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@retrograve",
    creator: "@retrograve",
    title: "RetroGrave Lockscreen Locker",
    description:
      "Choose your MAGApixel NFT and export perfect lockscreen sizes.",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },

  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="page-pad-bottom">
        <Providers>
          <TopNav />
          <WalletGate />
          <RedirectOnConnect />
          {children}
        </Providers>
      </body>
    </html>
  );
}
