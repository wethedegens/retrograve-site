"use client";

// TopNav.tsx is now a lightweight alias for Header.tsx
// This ensures older imports still work while transitioning your site structure.

import Header from "./Header";

export default Header;

// app/components/TopNav.tsx (snippet)
const nav = [
  { href: "/", label: "HOME" },
  // { href: "/magapixel", label: "MAGAPIXEL" }, // hidden
  { href: "/community", label: "COMMUNITY" },
  { href: "/leaderboard", label: "LEADERBOARD" },
  { href: "/collect", label: "COLLECT NOW" },
  { href: "https://x.com/retrograve", label: "FOLLOW ON X", external: true },
];
