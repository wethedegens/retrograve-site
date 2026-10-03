// app/lib/lockscreened/brand.ts
// Shared visual language for NEW LockScreened / Creator Studio surfaces.
// Legacy flagship projects intentionally keep their existing bespoke styling.

export const LOCKSCREENED_BRAND = {
  background: "#07060d",
  panel: "rgba(10, 8, 20, .72)",
  panelSoft: "rgba(255, 255, 255, .025)",
  border: "rgba(255, 255, 255, .10)",
  text: "#ffffff",
  textMuted: "rgba(255, 255, 255, .58)",
  pink: "#ff3fb4",
  pinkSoft: "#ff8dce",
  purple: "#8f6bff",
  success: "#a9ffd2",
  warning: "#ffd99d",
  backgroundImage: "/lockscreened-main-bg-2.png",
  wordmark: "/lockscreened-wordmark-1.png",
  logo: "/lockscreened-logo.png",
} as const;

export const LOCKSCREENED_GLASS = {
  borderRadius: 22,
  border: "1px solid rgba(255,255,255,.10)",
  background: "rgba(10,8,20,.72)",
  boxShadow: "0 24px 70px rgba(0,0,0,.30)",
} as const;
