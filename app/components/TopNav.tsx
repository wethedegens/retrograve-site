// app/components/TopNav.tsx
"use client";

import FixedBar from "./Header";

type TopNavProject = "retrograve" | "magapixel" | "miners";

type NavLink =
  | {
      type: "link";
      label: string;
      href: string;
      active?: "starts" | "exact";
    }
  | {
      type: "a";
      label: string;
      href: string;
      target?: string;
      rel?: string;
    };

export default function TopNav({ project }: { project: TopNavProject }) {
  const baseLinks: NavLink[] = [
    { type: "link", label: "HOME", href: "/", active: "exact" },
  ];

  // ✅ MINERS NAV
  if (project === "miners") {
    const links: NavLink[] = [
      ...baseLinks,
      // ✅ point to the LANDING page (not the grid)
      { type: "link", label: "MY MINERS", href: "/my-miners", active: "starts" },
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
