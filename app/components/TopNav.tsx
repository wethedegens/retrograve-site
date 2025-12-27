"use client";

import FixedBar, { type NavLink } from "./Header";

export type TopNavProject = "miners" | "magapixel" | "retrograve";

export default function TopNav({ project }: { project: TopNavProject }) {
  // shared external links (adjust if you want different per project)
  const communityHref = "https://discord.gg/mSNHRFdCkS";
  const collectHref = "https://magiceden.io";
  const followHref = "https://x.com/RETROGRAVE_NFT";

  // IMPORTANT: Miners should ONLY go to /enchanted-miners (never /my-miners)
  if (project === "miners") {
    const links: NavLink[] = [
      { type: "link", label: "Home", href: "/", active: "exact" },
      {
        type: "link",
        label: "My Miners",
        href: "/enchanted-miners",
        active: "starts",
      },
      { type: "a", label: "Community", href: communityHref },
      { type: "a", label: "Collect Now", href: collectHref },
      { type: "a", label: "Follow on X", href: followHref },
    ];

    return <FixedBar links={links} />;
  }

  if (project === "magapixel") {
    const links: NavLink[] = [
      { type: "link", label: "Home", href: "/", active: "exact" },
      {
        type: "link",
        label: "My MAGApixels",
        href: "/magapixel-nfts",
        active: "starts",
      },
      { type: "a", label: "Community", href: communityHref },
      { type: "a", label: "Collect Now", href: collectHref },
      { type: "a", label: "Follow on X", href: followHref },
    ];

    return <FixedBar links={links} />;
  }

  // retrograve default
  const links: NavLink[] = [
    { type: "link", label: "Home", href: "/", active: "exact" },
    { type: "link", label: "My RetroGraves", href: "/retrograve", active: "starts" },
    { type: "a", label: "Community", href: communityHref },
    { type: "a", label: "Collect Now", href: collectHref },
    { type: "a", label: "Follow on X", href: followHref },
  ];

  return <FixedBar links={links} />;
}
