"use client";

import FixedBar from "./Header";
import type { TopNavProject } from "./TopNavWrapper";

type NavLink =
  | { type: "link"; label: string; href: string; active?: "exact" | "starts" }
  | { type: "a"; label: string; href: string };

export default function TopNav({ project }: { project: TopNavProject }) {
  // Links that should always exist no matter what project you're in
  const baseLinks: NavLink[] = [{ type: "link", label: "HOME", href: "/", active: "exact" }];

  // ✅ MINERS NAV (always points to /enchanted-miners)
  if (project === "miners") {
    const links: NavLink[] = [
      ...baseLinks,
      { type: "link", label: "MY MINERS", href: "/enchanted-miners", active: "exact" },
      { type: "a", label: "COMMUNITY", href: "https://discord.gg/mSNHRFdCkS" },
      { type: "a", label: "COLLECT NOW", href: "https://magiceden.io" },
      { type: "a", label: "FOLLOW ON X", href: "https://x.com/RETROGRAVE_NFT" },
    ];

    // ✅ IMPORTANT: Don't pass barColor/textColor (Header's FixedBar doesn't accept them)
    return <FixedBar links={links as any} />;
  }

  // ✅ MAGAPIXEL NAV
  if (project === "magapixel") {
    const links: NavLink[] = [
      ...baseLinks,
      { type: "link", label: "MY MAGAPIXELS", href: "/magapixel-nfts", active: "starts" },
      { type: "a", label: "COMMUNITY", href: "https://discord.gg/mSNHRFdCkS" },
      { type: "a", label: "COLLECT NOW", href: "https://magiceden.io" },
      { type: "a", label: "FOLLOW ON X", href: "https://x.com/RETROGRAVE_NFT" },
    ];

    return <FixedBar links={links as any} />;
  }

  // ✅ RETROGRAVE DEFAULT NAV
  const links: NavLink[] = [
    ...baseLinks,
    { type: "link", label: "MY RETROGRAVES", href: "/retrograve", active: "starts" },
    { type: "a", label: "COMMUNITY", href: "https://discord.gg/mSNHRFdCkS" },
    { type: "a", label: "COLLECT NOW", href: "https://magiceden.io" },
    { type: "a", label: "FOLLOW ON X", href: "https://x.com/RETROGRAVE_NFT" },
  ];

  return <FixedBar links={links as any} />;
}
