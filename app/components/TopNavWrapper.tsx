"use client";

import { usePathname, useSearchParams } from "next/navigation";
import TopNav from "./TopNav";

/**
 * Show TopNav everywhere EXCEPT the true homepage (/ with no query params).
 * This prevents the nav from disappearing on /locker routes.
 */
export default function TopNavWrapper() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isHome = pathname === "/";
  const hasQuery = searchParams.toString().length > 0;

  // ❌ Hide nav ONLY on the real homepage
  if (isHome && !hasQuery) {
    return null;
  }

  // ✅ Show nav everywhere else (locker, miners, magapixel, etc)
  return <TopNav />;
}
