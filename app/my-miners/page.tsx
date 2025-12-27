// app/components/TopNav.tsx
"use client";

import FixedBar from "./TopNavWrapper"; // if your FixedBar is actually in another file, keep your original import
// ^ If this line is wrong in your project, keep whatever import you already had for FixedBar.

type NavLink =
  | { type: "link"; label: string; href: string; active?: "exact" | "starts" }
  | { type: "a"; label: string; href: string };

export default function TopNav() {
  // ✅ Always keep internal links correct
  const links: NavLink[] = [
    { type: "link", label: "HOME", href: "/", active: "exact" },
    { type: "link", label: "MY MINERS", href: "/enchanted-miners", active: "starts" },
    { type: "a", label: "COMMUNITY", href: "https://discord.gg/mSNHRFdCkS" },
    { type: "link", label: "COLLECT NOW", href: "/collect", active: "starts" },
    { type: "a", label: "FOLLOW ON X", href: "https://x.com/RETROGRAVE_NFT" },
  ];

  return <FixedBar barColor="#0b0b0f" textColor="#ffffff" links={links} />;
}
