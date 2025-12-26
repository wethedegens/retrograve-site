"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const path = usePathname();

  // Read query string safely WITHOUT useSearchParams (avoids prerender/build issues)
  const [lockerProject, setLockerProject] = useState<string>("");

  useEffect(() => {
    const read = () => {
      const p =
        typeof window !== "undefined"
          ? (new URLSearchParams(window.location.search).get("project") || "").toLowerCase()
          : "";
      setLockerProject(p);
    };

    read();

    // Also update if user navigates via back/forward
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);

  // Treat BOTH /enchanted-miners/* and /my-miners as Enchanted Miners pages
  const isMiners =
    path.startsWith("/enchanted-miners") ||
    path.startsWith("/my-miners") ||
    (path === "/locker" && lockerProject === "miners");

  // MAGApixel pages
  const isMagapixel =
    path.startsWith("/locker/magapixel") ||
    path.startsWith("/magapixel-nfts") ||
    path.startsWith("/retrogs") ||
    (path === "/locker" && lockerProject === "magapixel");

  // RetroGrave pages
  const isRetrograve = path.startsWith("/retrograve") || path.startsWith("/retrogs");

  const isActiveExact = (href: string) => path === href;
  const isActiveStarts = (href: string) => path === href || path.startsWith(href + "/");

  // Shared fixed-bar styles (Miners format)
  const FixedBar = useMemo(() => {
    return function FixedBarInner({
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
    }) {
      const baseLinkStyle = {
        fontSize: "16px",
        color: textColor,
        textDecoration: "none" as const,
        opacity: 0.9,
        letterSpacing: "0.06em",
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
        <>
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

          {/* Spacer — MATCH nav color so no black strip shows through */}
          <div style={{ height: 40, backgroundColor: barColor }} />

        </>
      );
    };
  }, [path]);

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
