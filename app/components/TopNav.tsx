"use client";

import FixedBar from "./Header";

type TopNavProject = "retrograve" | "magapixel" | "miners";

type NavLink =
  | {
      type: "link"; // internal (Next route)
      label: string;
      href: string; // MUST start with "/"
      active?: "starts" | "exact";
    }
  | {
      type: "a"; // external
      label: string;
      href: string;
      target?: string;
      rel?: string;
    };

export default function TopNav({ project }: { project: TopNavProject }) {
  // Shared/external links
  const baseLinks: NavLink[] = [
    { type: "link", label: "HOME", href: "/", active: "exact" },
  ];

  // ✅ MINERS NAV
  if (project === "miners") {
    const links: NavLink[] = [
      ...baseLinks,
      // IMPORTANT: leading "/" so it always works from any page
      { type: "link", label: "MY MINERS", href: "/enchanted-miners", active: "starts" },
      {
        type: "a",
        label: "COMMUNITY",
        href: "https://discord.gg/mSNHRFdCkS",
        target: "_blank",
        rel: "noreferrer",
      },
      {
        type: "a",
        label: "COLLECT NOW",
        href: "https://magiceden.io",
        target: "_blank",
        rel: "noreferrer",
      },
      {
        type: "a",
        label: "FOLLOW ON X",
        href: "https://x.com/RETROGRAVE_NFT",
        target: "_blank",
        rel: "noreferrer",
      },
    ];

    return <FixedBar links={links as any} />;
  }

  // ✅ MAGAPIXEL NAV
  if (project === "magapixel") {
    const links: NavLink[] = [
      ...baseLinks,
      // IMPORTANT: leading "/" so it always works
      { type: "link", label: "MY MAGAPIXELS", href: "/magapixel-nfts", active: "starts" },
      {
        type: "a",
        label: "COMMUNITY",
        href: "https://discord.gg/mSNHRFdCkS",
        target: "_blank",
        rel: "noreferrer",
      },
      {
        type: "a",
        label: "COLLECT NOW",
        href: "https://magiceden.io",
        target: "_blank",
        rel: "noreferrer",
      },
      {
        type: "a",
        label: "FOLLOW ON X",
        href: "https://x.com/RETROGRAVE_NFT",
        target: "_blank",
        rel: "noreferrer",
      },
    ];

    return <FixedBar links={links as any} />;
  }

  // ✅ RETROGRAVE DEFAULT NAV
  const links: NavLink[] = [
    ...baseLinks,
    { type: "link", label: "MY RETROGRAVES", href: "/retrograve", active: "starts" },
    {
      type: "a",
      label: "COMMUNITY",
      href: "https://discord.gg/mSNHRFdCkS",
      target: "_blank",
      rel: "noreferrer",
    },
    {
      type: "a",
      label: "COLLECT NOW",
      href: "https://magiceden.io",
      target: "_blank",
      rel: "noreferrer",
    },
    {
      type: "a",
      label: "FOLLOW ON X",
      href: "https://x.com/RETROGRAVE_NFT",
      target: "_blank",
      rel: "noreferrer",
    },
  ];

  return <FixedBar links={links as any} />;
}
