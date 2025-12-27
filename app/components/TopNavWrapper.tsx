"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import TopNav from "./TopNav";

export type TopNavProject = "miners" | "magapixel" | "retrograve";

export default function TopNavWrapper() {
  const pathname = usePathname() || "/";
  const sp = useSearchParams();
  const qp = (sp?.get("project") || "").toLowerCase();

  const project = useMemo<TopNavProject>(() => {
    // ✅ Explicit miners routes
    if (pathname.startsWith("/enchanted-miners")) return "miners";

    // ✅ Query-param routes (locker composer)
    if (pathname.startsWith("/locker") && qp === "miners") return "miners";
    if (pathname.startsWith("/locker") && qp === "magapixel") return "magapixel";

    // ✅ Magapixel routes
    if (pathname.startsWith("/locker/magapixel")) return "magapixel";
    if (pathname.startsWith("/magapixel-nfts")) return "magapixel";

    // ✅ Retrograve routes
    if (pathname.startsWith("/retrograve") || pathname.startsWith("/retrogs")) return "retrograve";

    // ✅ Locker fallback (your current behavior)
    if (pathname.startsWith("/locker")) return "magapixel";

    // ✅ Site default
    return "retrograve";
  }, [pathname, qp]);

  return <TopNav project={project} />;
}
