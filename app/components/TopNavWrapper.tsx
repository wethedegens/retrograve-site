"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import TopNav, { type TopNavProject } from "./TopNav";

export default function TopNavWrapper() {
  const pathname = usePathname();
  const sp = useSearchParams();

  const project = useMemo<TopNavProject>(() => {
    // MAGAPIXEL routes
    if (
      pathname.startsWith("/locker/magapixel") ||
      pathname.startsWith("/magapixel-nfts")
    ) {
      return "magapixel";
    }

    // ENCHANTED MINERS routes (and legacy /my-miners)
    if (pathname.startsWith("/enchanted-miners") || pathname.startsWith("/my-miners")) {
      return "miners";
    }

    // RetroGrave routes
    if (pathname.startsWith("/retrogs") || pathname.startsWith("/retrograve")) {
      return "retrograve";
    }

    // Locker base fallback (your existing behavior)
    if (pathname.startsWith("/locker")) return "magapixel";

    // Default identity
    return "retrograve";
  }, [pathname, sp]);

  return <TopNav project={project} />;
}
