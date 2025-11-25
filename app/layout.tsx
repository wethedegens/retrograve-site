export const metadata: Metadata = {
  // Base URL for relative OG and Twitter images
  metadataBase: new URL(SITE),

  title: "RetroGrave Lockscreen Locker",
  description:
    "Choose your MAGApixel NFT and export perfect lockscreen sizes.",

  // ✅ Add favicon + Apple icons for Safari, search, iOS home-screen
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
    ],
    shortcut: "/favicon.ico",
  },

  openGraph: {
    url: SITE,
    siteName: "RetroGrave",
    title: "RetroGrave Lockscreen Locker",
    description:
      "Choose your MAGApixel NFT and export perfect lockscreen sizes.",
    images: ["/og-default.jpg"],
  },

  twitter: {
    card: "summary_large_image",
    site: "@retrograve",
    creator: "@retrograve",
    title: "RetroGrave Lockscreen Locker",
    description:
      "Choose your MAGApixel NFT and export perfect lockscreen sizes.",
    images: ["/og-default.jpg"],
  },

  robots: { index: true, follow: true },
};
