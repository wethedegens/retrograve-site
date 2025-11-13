// app/metadata.ts
import type { Metadata } from "next";

const site = "https://retrograve.tv"; // ← your prod domain
const title = "RetroGrave Lockscreen Locker";
const description =
  "Turn your NFTs into crisp, perfectly-sized phone wallpapers. Share-ready exports, trait-aware previews, and more.";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: title,
    template: "%s • RetroGrave",
  },
  description,
  openGraph: {
    title,
    description,
    url: site,
    siteName: "RetroGrave",
    images: ["/og/retrograve-og.png"], // put a 1200x630 image in /public/og/
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@retrograve", // your handle
    creator: "@retrograve",
    title,
    description,
    images: ["/og/retrograve-og.png"],
  },
  alternates: {
    canonical: site,
  },
};
export default metadata;
