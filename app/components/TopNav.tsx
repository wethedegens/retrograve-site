// app/components/TopNav.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

type NavLink =
  | { type: "link"; label: string; href: string; active?: "exact" | "starts" }
  | { type: "a"; label: string; href: string };

type FixedBarProps = {
  barColor?: string;
  textColor?: string;
  links: NavLink[];
};

function FixedBar({
  barColor = "#0b0b0f",
  textColor = "#ffffff",
  links,
}: FixedBarProps) {
  const pathname = usePathname();

  const isActive = (href: string, mode?: "exact" | "starts") => {
    if (!href.startsWith("/")) return false;
    if (mode === "exact") return pathname === href;
    if (mode === "starts") return pathname.startsWith(href);
    return false;
  };

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: 64,
          backgroundColor: barColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          zIndex: 50,
          padding: "0 16px",
          boxSizing: "border-box",
        }}
      >
        {links.map((l) => {
          const key = `${l.type}:${l.label}:${l.href}`;

          const commonStyle: React.CSSProperties = {
            fontFamily: '"VT323", monospace',
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontSize: 20,
            color: textColor,
            textDecoration: "none",
            opacity: 0.92,
            textShadow:
              "0 0 10px rgba(183, 122, 255, 0.8), 0 0 20px rgba(183, 122, 255, 0.5)",
            transition: "transform 0.18s ease, opacity 0.18s ease",
            transform: "translateZ(0)",
            whiteSpace: "nowrap",
          };

          if (l.type === "a") {
            return (
              <a
                key={key}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                style={commonStyle}
              >
                {l.label}
              </a>
            );
          }

          const active = isActive(l.href, l.active);
          return (
            <Link
              key={key}
              href={l.href}
              style={{
                ...commonStyle,
                opacity: active ? 1 : commonStyle.opacity,
                transform: active ? "scale(1.06)" : commonStyle.transform,
              }}
            >
              {l.label}
            </Link>
          );
        })}

        {/* wallet button stays right-ish on wide screens */}
        <div
          style={{
            position: "absolute",
            right: 14,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <WalletMultiButton />
        </div>
      </nav>

      {/* spacer under fixed nav — MUST match page background to avoid black band */}
      <div
        style={{
          height: 64,
          backgroundColor: "var(--page-bg)",
          backgroundImage: "var(--page-bg-image)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center top",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
        }}
      />
    </>
  );
}

export default function TopNav() {
  const pathname = usePathname();
  const sp = useSearchParams();

  // Detect project from BOTH path + query param
  const project = useMemo(() => {
    const qp = (sp?.get("project") || "").toLowerCase();

    // locker routes (your screenshot uses /locker?...&project=magapixel)
    if (pathname.startsWith("/locker")) {
      if (qp) return qp; // magapixel, miners, retrograve, etc.
      return "retrograve";
    }

    // explicit project routes
    if (pathname.startsWith("/enchanted-miners") || pathname.startsWith("/my-miners"))
      return "miners";

    if (pathname.startsWith("/retrograve") || pathname.startsWith("/retrogs"))
      return "retrograve";

    // default
    return "retrograve";
  }, [pathname, sp]);

  // Ensure the BODY background vars match the page/project
  useEffect(() => {
    const root = document.documentElement;

    // Only set defaults if you want project-level control here.
    // If some pages already set these vars, this keeps the nav spacer consistent anyway.
    if (project === "magapixel") {
      root.style.setProperty("--page-bg", "#0078e9");
      root.style.setProperty("--page-bg-image", 'url("/bg-ovaloface-blue.png")');
    } else if (project === "miners") {
      root.style.setProperty("--page-bg", "#0b0b0f");
      root.style.setProperty("--page-bg-image", 'url("/bg-miners.png")');
      // If you don't have bg-miners.png, comment the line above and it’ll just use --page-bg.
    } else {
      root.style.setProperty("--page-bg", "#111827");
      root.style.setProperty("--page-bg-image", 'url("/bg-retrograve.png")');
    }
  }, [project]);

  // FULL nav links (so you don't get stuck with HOME-only ever again)
  const links: NavLink[] = [
    { type: "link", label: "HOME", href: "/", active: "exact" },
    { type: "link", label: "MY RETROGRAVES", href: "/retrogs", active: "starts" },
    { type: "a", label: "COMMUNITY", href: "https://discord.gg/mSNHRFdCkS" },
    { type: "link", label: "COLLECT NOW", href: "/collect", active: "starts" },
    { type: "a", label: "FOLLOW ON X", href: "https://x.com/RETROGRAVE_NFT" },
  ];

  return <FixedBar barColor="#0b0b0f" textColor="#ffffff" links={links} />;
}
