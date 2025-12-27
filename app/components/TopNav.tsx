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
  const baseLinks: NavLink[] = [{ type: "link", label: "HOME", href: "/", active: "exact" }];

  if (project === "miners") {
    const links: NavLink[] = [
      ...baseLinks,
      // ✅ miners grid page
      { type: "link", label: "MY MINERS", href: "/enchanted-miners-nfts", active: "starts" },
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
