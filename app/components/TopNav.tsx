"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type ActiveMode = "exact" | "starts";
type NavItem =
  | { type: "link"; label: string; href: string; active?: ActiveMode }
  | { type: "a"; label: string; href: string };

function safeLower(s: string | null | undefined) {
  return (s || "").trim().toLowerCase();
}

export default function TopNav() {
  const path = usePathname() || "";
  const sp = useSearchParams();

  // -----
  // Robust "project" (but nav will NOT depend on it)
  // -----
  const projectFromLockerPath = useMemo(() => {
    if (!path.startsWith("/locker/")) return "";
    const parts = path.split("/").filter(Boolean); // ["locker", "magapixel"]
    return safeLower(parts[1] || "");
  }, [path]);

  const [project, setProject] = useState<string>("");

  useEffect(() => {
    const fromSp = safeLower(sp.get("project"));

    let fromWindow = "";
    try {
      const u = new URL(window.location.href);
      fromWindow = safeLower(u.searchParams.get("project"));
    } catch {}

    setProject(fromSp || fromWindow || projectFromLockerPath || "");
  }, [sp, projectFromLockerPath]);

  // -----
  // Active helpers
  // -----
  const isActiveExact = (href: string) => path === href;
  const isActiveStarts = (href: string) => path === href || path.startsWith(href + "/");

  const pickActive = (href: string, mode?: ActiveMode) => {
    if (!mode) return false;
    return mode === "exact" ? isActiveExact(href) : isActiveStarts(href);
  };

  // -----
  // Determine "variant" (ONLY for colors + external links)
  // -----
  const variant = useMemo<"magapixel" | "miners" | "retrograve" | "default">(() => {
    // Prefer explicit project when available
    if (project === "magapixel") return "magapixel";
    if (project === "miners" || project === "enchanted" || project === "enchanted-miners")
      return "miners";
    if (project === "retrograve") return "retrograve";

    // Fallback to pathname
    if (path.startsWith("/my-miners") || path.startsWith("/enchanted-miners")) return "miners";
    if (path.startsWith("/magapixel-nfts") || path.startsWith("/locker/magapixel") || path.startsWith("/retrogs"))
      return "magapixel";
    if (path.startsWith("/retrograve")) return "retrograve";

    // If we're on /locker with no reliable project, keep it neutral
    return "default";
  }, [path, project]);

  const theme = useMemo(() => {
    if (variant === "miners") return { barColor: "#1f3d2b", textColor: "#ffffff" };
    if (variant === "magapixel") return { barColor: "#af232a", textColor: "#ffffff" };
    if (variant === "retrograve") return { barColor: "#0b0b0f", textColor: "#ffffff" };
    return { barColor: "#0b0b0f", textColor: "#ffffff" };
  }, [variant]);

  // -----
  // Always-visible INTERNAL links (this is the new approach)
  // -----
  const INTERNAL: NavItem[] = [
    { type: "link", label: "HOME", href: "/", active: "exact" },
    { type: "link", label: "MY MAGAPIXELS", href: "/magapixel-nfts", active: "exact" },
    { type: "link", label: "MY MINERS", href: "/my-miners", active: "exact" },
    { type: "link", label: "MY RETROGRAVES", href: "/retrograve", active: "starts" },
  ];

  // -----
  // Optional EXTERNAL links (only when we know the project)
  // -----
  const EXTERNAL: NavItem[] = useMemo(() => {
    if (variant === "miners") {
      return [
        { type: "a", label: "COMMUNITY", href: "https://discord.gg/C5MfNP7hek" },
        { type: "a", label: "COLLECT NOW", href: "https://magiceden.us/marketplace/enchanted_miner" },
        { type: "a", label: "FOLLOW ON X", href: "https://x.com/enchanted_nfts" },
      ];
    }
    if (variant === "magapixel") {
      return [
        { type: "a", label: "COMMUNITY", href: "https://discord.gg/ZVGtHUpHfb" },
        { type: "a", label: "COLLECT NOW", href: "https://magiceden.us/marketplace/magapixel" },
        { type: "a", label: "FOLLOW ON X", href: "https://x.com/MAGApixel_NFT" },
      ];
    }
    if (variant === "retrograve") {
      return [
        { type: "a", label: "COMMUNITY", href: "https://discord.gg/mSNHRFdCkS" },
        { type: "a", label: "COLLECT NOW", href: "https://magiceden.io" },
        { type: "a", label: "FOLLOW ON X", href: "https://x.com/RETROGRAVE_NFT" },
      ];
    }
    return [];
  }, [variant]);

  const links: NavItem[] = [...INTERNAL, ...EXTERNAL];

  const baseLinkStyle = {
    fontSize: "16px",
    color: theme.textColor,
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

  const styleFor = (item: NavItem) => {
    if (item.type !== "link") return baseLinkStyle;
    const mode = item.active;
    const active = mode ? pickActive(item.href, mode) : false;
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
        backgroundColor: theme.barColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "22px",
        padding: "0 14px",
        zIndex: 9999,

        // ✅ kills the “black line”
        borderBottom: "none",

        // Optional: looks nicer over busy backgrounds
        backdropFilter: "blur(6px)",

        // Helps when links overflow on smaller screens
        overflowX: "auto",
      }}
    >
      {links.map((l) => {
        if (l.type === "link") {
          return (
            <Link key={l.label} href={l.href} style={styleFor(l)}>
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
            style={styleFor(l)}
          >
            {l.label}
          </a>
        );
      })}
    </nav>
  );
}
