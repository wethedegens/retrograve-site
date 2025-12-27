// app/components/TopNavWrapper.tsx
"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import TopNav from "./TopNav";

/**
 * TopNavWrapper
 * - Detects which "project context" we are in based on:
 *   1) locker query param ?project=
 *   2) pathname prefixes
 * - Then tells <TopNav /> which internal link to show.
 */
export default function TopNavWrapper() {
  const pathname = usePathname() || "";
  const sp = useSearchParams();

  const project = useMemo<"miners" | "magapixel" | "retrograve">(() => {
    // 1) URL query override (locker pages)
    const q = (sp?.get("project") || "").toLowerCase();
    if (q === "miners" || q === "enchanted-miners") return "miners";
    if (q === "magapixel" || q === "maga" || q === "magapixels")
      return "magapixel";
    if (q === "retrograve" || q === "retrogs") return "retrograve";

    // 2) Pathname detection (non-locker pages)
    // Miners routes
    if (
      pathname.startsWith("/enchanted-miners") ||
      pathname.startsWith("/my-miners")
    ) {
      return "miners";
    }

    // MAGApixel routes
    if (
      pathname.startsWith("/locker/magapixel") ||
      pathname.startsWith("/magapixel-nfts")
    ) {
      return "magapixel";
    }

    // RetroGrave routes
    if (pathname.startsWith("/retrogs") || pathname.startsWith("/retrograve")) {
      return "retrograve";
    }

    // 3) Locker base route fallback:
    // If you're on /locker with no ?project=, default to magapixel (your current behavior).
    if (pathname.startsWith("/locker")) return "magapixel";

    // 4) Default site identity
    return "retrograve";
  }, [pathname, sp]);

  return <TopNav project={project} />;
}
