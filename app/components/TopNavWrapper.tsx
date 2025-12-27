// app/components/TopNavWrapper.tsx
"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import TopNav from "./TopNav";

export type TopNavProject = "miners" | "magapixel" | "retrograve";

export default function TopNavWrapper() {
  const pathname = usePathname();
  const sp = useSearchParams();

  const project = useMemo<TopNavProject>(() => {
    // ✅ Miners routes
    if (pathname.startsWith("/enchanted-miners") || pathname.startsWith("/my-miners")) {
      return "miners";
    }

    // ✅ MAGApixel routes
    if (
      pathname.startsWith("/locker/magapixel") ||
      pathname.startsWith("/magapixel-nfts") ||
      sp.get("project") === "magapixel"
    ) {
      return "magapixel";
    }

    // ✅ RetroGrave routes
    if (pathname.startsWith("/retrograve") || pathname.startsWith("/retrogs")) {
      return "retrograve";
    }

    // ✅ locker fallback (your prior behavior)
    if (pathname.startsWith("/locker")) return "magapixel";

    return "retrograve";
  }, [pathname, sp]);

  return <TopNav project={project} />;
}
