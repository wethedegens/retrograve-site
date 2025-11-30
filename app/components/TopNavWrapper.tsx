// app/components/TopNavWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import TopNav from "./TopNav";

/**
 * Renders the RetroGrave header (TopNav) on every page
 * EXCEPT the LockScreened hub homepage (/).
 */
export default function TopNavWrapper() {
  const pathname = usePathname();

  // Hide nav ONLY on the LockScreened homepage
  if (pathname === "/") {
    return null;
  }

  return <TopNav />;
}
