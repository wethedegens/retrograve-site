"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import TopNav from "./TopNav";

export type TopNavProject = "retrograve" | "magapixel" | "miners";

export default function TopNavWrapper() {
  const pathname = usePathname() || "/";
  const sp = useSearchParams();

  const project = useMemo<TopNavProject>(() => {
    const qp = (sp?.get("project") || "").toLowerCase();

    // ✅ If URL explicitly says project=mines/miners, trust it.
    if (qp === "miners" || qp === "mines") return "miners";
    if (qp === "magapixel" || qp === "maga") return "magapixel";
    if (qp === "retrograve" || qp === "retro") return "retrograve";

    // ✅ Miners routes
    if (
      pathname.startsWith("/enchanted-miners") ||
      pathname.startsWith("/my-miners")
    ) {
      return "miners";
    }

    // ✅ Magapixel routes
    if (
      pathname.startsWith("/locker/magapixel") ||
      pathname.startsWith("/magapixel-nfts") ||
      pathname.startsWith("/magapixel")
    ) {
      return "magapixel";
    }

    // ✅ RetroGrave routes
    if (pathname.startsWith("/retrograve") || pathname.startsWith("/retrogs")) {
      return "retrograve";
    }

    // ✅ Special case: base /locker page with query mint/uri (your composer route)
    // If it starts with /locker and no project param, keep your current behavior:
    // default to magapixel.
    if (pathname.startsWith("/locker")) return "magapixel";

    // Default site identity
    return "retrograve";
  }, [pathname, sp]);

  return <TopNav project={project} />;
}
