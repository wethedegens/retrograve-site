import FixedBar, { type NavLink } from "./Header";
import type { TopNavProject } from "./TopNavWrapper";

export default function TopNav({ project }: { project: TopNavProject }) {
  const baseLinks: NavLink[] = [{ type: "link", label: "HOME", href: "/", active: "exact" }];

  // ===== MINERS NAV =====
  if (project === "miners") {
    const links: NavLink[] = [
      ...baseLinks,
      { type: "link", label: "MY MINERS", href: "/enchanted-miners", active: "starts" },
      { type: "a", label: "COMMUNITY", href: "https://discord.gg/mSNHRFdCkS" },
      { type: "a", label: "COLLECT NOW", href: "https://magiceden.io" },
      { type: "a", label: "FOLLOW ON X", href: "https://x.com/RETROGRAVE_NFT" },
    ];

    return <FixedBar barColor="#0b0b0f" textColor="#ffffff" links={links} />;
  }

  // ===== MAGAPIXEL NAV =====
  if (project === "magapixel") {
    const links: NavLink[] = [
      ...baseLinks,
      { type: "link", label: "MY MAGAPIXELS", href: "/magapixel-nfts", active: "starts" },
      { type: "a", label: "COMMUNITY", href: "https://discord.gg/mSNHRFdCkS" },
      { type: "a", label: "COLLECT NOW", href: "https://magiceden.io" },
      { type: "a", label: "FOLLOW ON X", href: "https://x.com/RETROGRAVE_NFT" },
    ];

    return <FixedBar barColor="#0b0b0f" textColor="#ffffff" links={links} />;
  }

  // ===== RETROGRAVE NAV (DEFAULT) =====
  const links: NavLink[] = [
    ...baseLinks,
    { type: "link", label: "MY RETROGRAVES", href: "/retrograve", active: "starts" },
    { type: "a", label: "COMMUNITY", href: "https://discord.gg/mSNHRFdCkS" },
    { type: "a", label: "COLLECT NOW", href: "https://magiceden.io" },
    { type: "a", label: "FOLLOW ON X", href: "https://x.com/RETROGRAVE_NFT" },
  ];

  return <FixedBar barColor="#0b0b0f" textColor="#ffffff" links={links} />;
}
