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

  return (
    <>
      {/* ✅ DEBUG PILL — TEMP (remove after confirmed) */}
      <div
        style={{
          position: "fixed",
          top: 66,
          left: 12,
          zIndex: 10000,
          background: "rgba(0,0,0,0.75)",
          color: "#fff",
          padding: "6px 10px",
          borderRadius: 999,
          fontSize: 12,
          letterSpacing: "0.06em",
          pointerEvents: "none",
        }}
      >
        DEBUG WRAPPER: {pathname}
      </div>

      <TopNav />
    </>
  );
}
