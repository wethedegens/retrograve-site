"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type ActiveMode = "exact" | "starts";
type NavItem =
  | { type: "link"; label: string; href: string; active?: ActiveMode }
  | { type: "a"; label: string; href: string };

type NavVariant = {
  id: string;
  barColor: string;
  textColor: string;
  links: NavItem[];
  match: (args: { path: string; project: string }) => boolean;
};

export default function TopNav() {
  const path = usePathname() || "";
  const sp = useSearchParams();

  // -------------------------
  // 1) NORMALIZE PROJECT ID
  // -------------------------
  const projectFromQuery = (sp.get("project") || "").trim().toLowerCase();

  // supports: /locker/magapixel, /locker/miners, /locker/retrograve (if you ever do)
  const projectFromLockerPath = (() => {
    if (!path.startsWith("/locker/")) return "";
    const parts = path.split("/").filter(Boolean); // ["locker", "magapixel"]
    return (parts[1] || "").trim().toLowerCase();
  })();

  // final normalized "project" string we use everywhere
  const project = projectFromQuery || projectFromLockerPath;

  const isActiveExact = (href: string) => path === href;
  const isActiveStarts = (href: string) => path === href || path.startsWith(href + "/");

  const FixedBar = ({
    barColor,
    textColor,
    links,
  }: {
    barColor: string;
    textColor: string;
    links: NavItem[];
  }) => {
    const baseLinkStyle = {
      fontSize: "16px",
      color: textColor,
      textDecoration: "none" as const,
      opacity: 0.9,
      letterSpacing: "0.06em",
      whiteSpace: "nowrap" as const,
    };

    const activeLinkStyle = {
      ...baseLinkStyle,
      textDecoration: "underline" as const,
      textDecorationThickness: "2px",
      textUnderlineOffset: "4px",
      opacity: 1,
    };

    const pickStyle = (href: string, mode?: ActiveMode) => {
      if (!mode) return baseLinkStyle;
      const active = mode === "exact" ? isActiveExact(href) : isActiveStarts(href);
      return active ? activeLinkStyle : baseLinkStyle;
    };

    return (
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "64px",
          backgroundColor: barColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "28px",
          padding: "0 18px",
          zIndex: 50,
          borderBottom: "1px solid rgba(255,255,255,0.10)",
          backdropFilter: "blur(6px)",
        }}
      >
        {links.map((l) => {
          if (l.type === "link") {
            return (
              <Link key={l.label} href={l.href} style={pickStyle(l.href, l.active)}>
                {l.label}
              </Link>
            );
          }

          return (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              style={baseLinkStyle}
            >
              {l.label}
            </a>
          );
        })}
      </nav>
    );
  };

  // -------------------------
  // 2) NAV VARIANTS (ADD NEW PROJECTS HERE)
  // -------------------------
  const NAVS: NavVariant[] = [
    {
      id: "miners",
      barColor: "#1f3d2b",
      textColor: "#ffffff",
      links: [
        { type: "link", label: "HOME", href: "/", active: "exact" },
        { type: "link", label: "MY MINERS", href: "/my-miners", active: "exact" },
        { type: "a", label: "COMMUNITY", href: "https://discord.gg/C5MfNP7hek" },
        {
          type: "a",
          label: "COLLECT NOW",
          href: "https://magiceden.us/marketplace/enchanted_miner",
        },
        { type: "a", label: "FOLLOW ON X", href: "https://x.com/enchanted_nfts" },
      ],
      match: ({ path, project }) => {
        const p = project;
        const isMinersProject = p === "miners" || p === "enchanted" || p === "enchanted-miners";
        return (
          isMinersProject ||
          path.startsWith("/enchanted-miners") ||
          path.startsWith("/my-miners")
        );
      },
    },

    {
      id: "magapixel",
      barColor: "#af232a",
      textColor: "#ffffff",
      links: [
        { type: "link", label: "HOME", href: "/", active: "exact" },
        { type: "link", label: "MY MAGAPIXELS", href: "/magapixel-nfts", active: "exact" },
        { type: "a", label: "COMMUNITY", href: "https://discord.gg/ZVGtHUpHfb" },
        { type: "a", label: "COLLECT NOW", href: "https://magiceden.us/marketplace/magapixel" },
        { type: "a", label: "FOLLOW ON X", href: "https://x.com/MAGApixel_NFT" },
      ],
      match: ({ path, project }) => {
        return (
          project === "magapixel" ||
          path.startsWith("/locker/magapixel") ||
          path.startsWith("/magapixel-nfts") ||
          path.startsWith("/retrogs")
        );
      },
    },

    {
      id: "retrograve",
      barColor: "#0b0b0f",
      textColor: "#ffffff",
      links: [
        { type: "link", label: "HOME", href: "/", active: "exact" },
        { type: "link", label: "MY RETROGRAVES", href: "/retrograve", active: "starts" },
        { type: "a", label: "COMMUNITY", href: "https://discord.gg/mSNHRFdCkS" },
        { type: "a", label: "COLLECT NOW", href: "https://magiceden.io" },
        { type: "a", label: "FOLLOW ON X", href: "https://x.com/RETROGRAVE_NFT" },
      ],
      match: ({ path, project }) => {
        return project === "retrograve" || path.startsWith("/retrograve");
      },
    },
  ];

  // -------------------------
  // 3) PICK THE FIRST MATCH
  // -------------------------
  const found = NAVS.find((n) => n.match({ path, project }));

  if (found) {
    return <FixedBar barColor={found.barColor} textColor={found.textColor} links={found.links} />;
  }

  // Default fallback
  return (
    <FixedBar
      barColor="#0b0b0f"
      textColor="#ffffff"
      links={[{ type: "link", label: "HOME", href: "/", active: "exact" }]}
    />
  );
}
