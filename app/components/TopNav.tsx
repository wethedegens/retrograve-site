// app/components/TopNav.tsx
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

  const projectFromLockerPath = useMemo(() => {
    if (!path.startsWith("/locker/")) return "";
    const parts = path.split("/").filter(Boolean);
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

  const isActiveExact = (href: string) => path === href;
  const isActiveStarts = (href: string) => path === href || path.startsWith(href + "/");

  const INTERNAL: NavItem[] = [
    { type: "link", label: "HOME", href: "/", active: "exact" },
    { type: "link", label: "MY MAGAPIXELS", href: "/magapixel-nfts", active: "exact" },
    { type: "link", label: "MY MINERS", href: "/my-miners", active: "exact" },
    { type: "link", label: "MY RETROGRAVES", href: "/retrograve", active: "starts" },
  ];

  const baseLinkStyle = {
    fontSize: "16px",
    color: "#ffffff",
    textDecoration: "none" as const,
    opacity: 0.95,
    letterSpacing: "0.08em",
    whiteSpace: "nowrap" as const,
    fontFamily: "VT323, monospace",
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
    const active = mode
      ? mode === "exact"
        ? isActiveExact(item.href)
        : isActiveStarts(item.href)
      : false;
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

          // ✅ IMPOSSIBLE TO MISS (TEMP)
          background: "linear-gradient(90deg, #00ff9d, #00a3ff, #b400ff)",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "22px",
          padding: "0 14px",
          zIndex: 9999,
          borderBottom: "none",
        }}
      >
        {INTERNAL.map((l) => (
          <Link key={l.label} href={l.href} style={styleFor(l)}>
            {l.label}
          </Link>
        ))}
      </nav>

      {/* ✅ DEBUG LINE — TEMP */}
      <div
        style={{
          position: "fixed",
          top: 64,
          left: 0,
          width: "100%",
          zIndex: 9999,
          fontSize: 12,
          fontFamily: "VT323, monospace",
          letterSpacing: "0.08em",
          color: "#fff",
          background: "rgba(0,0,0,0.55)",
          padding: "4px 10px",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        DEBUG NAV • path: {path} • project: {project || "(none)"}
      </div>
    </>
  );
}
