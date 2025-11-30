// app/components/TopNavWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import TopNav from "./TopNav";

/**
 * Renders the existing TopNav on all pages EXCEPT the LockScreened homepage (/).
 */
export default function TopNavWrapper() {
  const pathname = usePathname();

  // Hide nav on LockScreened hub homepage
  if (pathname === "/") {
    return null;
  }

  return <TopNav />;
}
