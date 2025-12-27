"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function TopNav() {
  const path = usePathname();
  const sp = useSearchParams();

  // ✅ Fallback: read query params from window after mount
  const [projectFromWindow, setProjectFromWindow] = useState("");

  useEffect(() => {
    try {
      const qs = new URLSearchParams(window.location.search);
      setProjectFromWindow((qs.get("project") || "").toLowerCase());
    } catch {
      setProjectFromWindow("");
    }
    // rerun when search params change
  }, [sp]);

  const project = useMemo(() => {
    const p1 = (sp.get("project") || "").toLowerCase();
    const p2 = (projectFromWindow || "").toLowerCase();
    return p1 || p2;
  }, [sp, projectFromWindow]);

  // Treat BOTH /enchanted-miners/* and /my-miners as Enchanted Miners pages
  // Also support /locker?project=miners
  const isMiners =
    path.startsWith("/enchanted-miners") ||
    path.startsWith("/my-miners") ||
    (path.startsWith("/locker") && project === "miners");

  // MAGApixel pages
  // Also support /locker?project=magapixel
  const isMagapixel =
    path.startsWith("/locker/magapixel") ||
    path.startsWith("/magapixel-nfts") ||
    (path.startsWith("/locker") && project === "magapixel");

  // RetroGrave pages
  const isRetrograve = path.startsWith("/retrograve") || path.startsWith("/retrogs");

  const isActiveExact = (href: string) => path === href;
  const isActiveStarts = (href: string) => path === href || path.startsWith(href + "/");

  // Shared fixed-bar styles
  const FixedBar = ({
    barColor,
    textColor,
    links,
  }: {
    barColor: string;
    textColor: string;
    links: Array<
      | { type: "link"; label: string; href: string; active?: "exact" | "starts" }
      | { type: "a"; label: string; href: string }
    >;
  }) => {
    const baseLinkStyle = {
      fontSize: "16px",
      color: textColor,
      textDecoration: "none" as const,
      opacity: 0.9,
      letterSpacing: "0.06em",
      fontFamily: "VT323, monospace",
    };

    const activeLinkStyle = {
      ...baseLinkStyle,
      textDecoration: "underline" as const,
      textDecorationThickness: "2px",
      textUnderlineOffset: "4px",
      opacity: 1,
    };

    const pickStyle = (href: string, mode?: "exact" | "starts") => {
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
          gap: "32px",
          zIndex: 50,
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

  /* =========================================================
     1) ENCHANTED MINERS NAV
     ========================================================= */
  if (isMiners) {
    return (
      <FixedBar
        barColor="#1f3d2b"
        textColor="#ffffff"
        links={[
          { type: "link", label: "HOME", href: "/", active: "exact" },
          { type: "link", label: "MY MINERS", href: "/my-miners", active: "exact" },
          { type: "a", label: "COMMUNITY", href: "https://discord.gg/C5MfNP7hek" },
          {
            type: "a",
            label: "COLLECT NOW",
            href: "https://magiceden.us/marketplace/enchanted_miner",
          },
          { type: "a", label: "FOLLOW ON X", href: "https://x.com/enchanted_nfts" },
        ]}
      />
    );
  }

  /* =========================================================
     2) MAGAPIXEL NAV
     ========================================================= */
  if (isMagapixel) {
    return (
      <FixedBar
        barColor="#af232a"
        textColor="#ffffff"
        links={[
          { type: "link", label: "HOME", href: "/", active: "exact" },
          { type: "link", label: "MY MAGAPIXELS", href: "/magapixel-nfts", active: "exact" },
          { type: "a", label: "COMMUNITY", href: "https://discord.gg/ZVGtHUpHfb" },
          { type: "a", label: "COLLECT NOW", href: "https://magiceden.us/marketplace/magapixel" },
          { type: "a", label: "FOLLOW ON X", href: "https://x.com/MAGApixel_NFT" },
        ]}
      />
    );
  }

  /* =========================================================
     3) RETROGRAVE NAV
     ========================================================= */
  if (isRetrograve) {
    return (
      <FixedBar
        barColor="#0b0b0f"
        textColor="#ffffff"
        links={[
          { type: "link", label: "HOME", href: "/", active: "exact" },
          { type: "link", label: "MY RETROGRAVES", href: "/retrograve", active: "starts" },
          { type: "a", label: "COMMUNITY", href: "https://discord.gg/mSNHRFdCkS" },
          { type: "a", label: "COLLECT NOW", href: "https://magiceden.io" },
          { type: "a", label: "FOLLOW ON X", href: "https://x.com/RETROGRAVE_NFT" },
        ]}
      />
    );
  }

  /* =========================================================
     4) DEFAULT
     ========================================================= */
  return (
    <FixedBar
      barColor="#0b0b0f"
      textColor="#ffffff"
      links={[{ type: "link", label: "HOME", href: "/", active: "exact" }]}
    />
  );
}
