"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import TopNav from "./TopNav";

export type TopNavProject =
  | "retrograve"
  | "magapixel"
  | "miners"
  | "gainz"
  | "midevils"
  | "meowga";

function inferProjectFromRoute(
  pathname: string,
  searchParams: URLSearchParams
): TopNavProject {
  const p = (pathname || "").toLowerCase();

  // Core hub pages default to RetroGrave mode (safe default)
  if (p === "/" || p.startsWith("/community") || p.startsWith("/my-retrograves"))
    return "retrograve";

  // Explicit locker subroutes
  if (p.startsWith("/locker/magapixel")) return "magapixel";
  if (p.startsWith("/locker/retrograve")) return "retrograve";

  // Magapixel routes
  if (p.startsWith("/magapixel-nfts")) return "magapixel";
  if (p.startsWith("/retrogs")) return "magapixel"; // legacy

  // Retrograve routes
  if (p.startsWith("/retrograve")) return "retrograve";

  // Miners routes
  if (p.startsWith("/enchanted-miners")) return "miners";
  if (p.startsWith("/enchanted-miners-nfts")) return "miners";

  // MidEvils routes
  if (p.startsWith("/midevils")) return "midevils";
  if (p.startsWith("/midevils-nfts")) return "midevils";

  // Gainz routes
  if (p.startsWith("/gainz")) return "gainz";

  // ✅ MEOWGA routes (NEW)
  if (p.startsWith("/meowga")) return "meowga";
  if (p.startsWith("/meowga-nfts")) return "meowga";

  // Generic locker route: uses ?project=
  if (p.startsWith("/locker")) {
    const qp = (searchParams.get("project") || "").toLowerCase();
    if (qp === "miners") return "miners";
    if (qp === "magapixel") return "magapixel";
    if (qp === "retrograve") return "retrograve";
    if (qp === "gainz") return "gainz";
    if (qp === "midevils") return "midevils";
    if (qp === "meowga") return "meowga";
    return "magapixel";
  }

  return "retrograve";
}

export default function TopNavWrapper() {
  const pathname = usePathname();
  const sp = useSearchParams();

  const project = useMemo<TopNavProject>(() => {
    const params = new URLSearchParams(sp?.toString() || "");
    return inferProjectFromRoute(pathname || "", params);
  }, [pathname, sp]);

  return <TopNav project={project} />;
}
