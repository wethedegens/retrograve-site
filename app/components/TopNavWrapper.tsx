// app/components/TopNavWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import TopNav from "./TopNav";

/**
 * Renders the RetroGrave header (TopNav) on most pages
 * but hides it on pages where the fixed bar + spacer causes layout issues.
 */
export default function TopNavWrapper() {
  const pathname = usePathname();

  // Hide nav on LockScreened hub homepage
  if (pathname === "/") return null;

  // Hide nav on locker / composer flows (these pages already have their own UI/back links)
  if (pathname.startsWith("/locker")) return null;
  if (pathname.startsWith("/enchanted-miners")) return null;

  // Optional: also hide on these if they are “tool pages”
  // if (pathname.startsWith("/magapixel-nfts")) return null;
  // if (pathname.startsWith("/my-miners")) return null;

  return <TopNav />;
}
