"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import TopNav from "./TopNav";

/**
 * TopNavWrapper
 * - Chooses which nav to show based on the current route
 * - Special case: /locker is shared, so we read ?project=magapixel|miners
 */

export type TopNavProject = "retrograve" | "magapixel" | "miners";

export default function TopNavWrapper() {
  const pathname = usePathname() || "/";
  const sp = useSearchParams();

  const project = useMemo<TopNavProject>(() => {
    // ✅ Special: /locker is shared — use query param
    if (pathname.startsWith("/locker")) {
      const qp = (sp.get("project") || "").toLowerCase();
      if (qp === "miners") return "miners";
      if (qp === "magapixel") return "magapixel";
      // fallback
      return "retrograve";
    }

    // ✅ Route-based detection
    if (
      pathname.startsWith("/locker/magapixel") ||
      pathname.startsWith("/magapixel-nfts") ||
      pathname.startsWith("/retrogs")
    ) {
      return "magapixel";
    }

    if (
      pathname.startsWith("/enchanted-miners") ||
      pathname.startsWith("/my-miners")
    ) {
      return "miners";
    }

    return "retrograve";
  }, [pathname, sp]);

  return <TopNav project={project} />;
}
