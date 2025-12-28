// app/projectsConfig.ts

export type LockerProject = {
  slug: string; // URL-ish identifier
  name: string; // Display name
  tagline: string; // Short description
  primaryColor: string; // Card / frame gradient base
  accentColor?: string; // Optional 2nd gradient color
  lockerPath: string; // Where the phone/card tries to go when LIVE
  status: "live" | "coming-soon";
};

export const PROJECTS: LockerProject[] = [
  {
    slug: "magapixel",
    name: "MAGApixel Locker",
    tagline: "Phone-native lock screens for MAGApixel NFTs.",
    primaryColor: "#f04b83",
    accentColor: "#ffb347",
    lockerPath: "/locker", // existing MAGApixel locker route
    status: "live",
  },
  {
    slug: "retrograve",
    name: "RetroGrave Locker",
    tagline: "Legendary lock screens for RetroGraves.",
    primaryColor: "#a46bff",
    accentColor: "#6c4bff",
    // external link straight to your RetroGrave locker page
    lockerPath: "https://retrograve.xyz/retrograve",
    status: "live",
  },
  {
    slug: "meowga",
    name: "MEOWGA",
    tagline: "Phone-native lock screens for MEOWGA NFTs (coming soon).",
    primaryColor: "#39d8ff",
    accentColor: "#00ffc3",
    lockerPath: "/meowga", // placeholder; only used once status = "live"
    status: "coming-soon",
  },
  {
    slug: "enchanted-miners",
    name: "Enchanted Miners",
    tagline: "Enchanted Miners lockscreen engine (coming soon).",
    primaryColor: "#25f2d0",
    accentColor: "#00a3ff",
    lockerPath: "/enchanted-miners", // placeholder
    status: "coming-soon",
  },

  // ✅ NEW: GAINZ (replacing the old Client #1 placeholder)
  {
    slug: "gainz",
    name: "GAINZ",
    tagline: "Phone-native lock screens for GAINZ NFTs.",
    primaryColor: "#111111",
    accentColor: "#444444",
    lockerPath: "/gainz",
    status: "live",
  },
];
