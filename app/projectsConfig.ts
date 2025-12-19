// app/projectsConfig.ts

export type LockerProject = {
  slug: string;          // URL-ish identifier
  name: string;          // Display name
  tagline: string;       // Short description
  primaryColor: string;  // Card / frame gradient base
  accentColor?: string;  // Optional 2nd gradient color
  lockerPath: string;    // Where the phone/card tries to go when LIVE
  status: "live" | "coming-soon";
};

export const PROJECTS: LockerProject[] = [
  {
    slug: "magapixel",
    name: "MAGApixel Locker",
    tagline: "Phone-native lock screens for MAGApixel NFTs.",
    primaryColor: "#f04b83",
    accentColor: "#ffb347",
    lockerPath: "/locker",
    status: "live",
  },
  {
    slug: "retrograve",
    name: "RetroGrave Locker",
    tagline: "Legendary lock screens for RetroGraves.",
    primaryColor: "#a46bff",
    accentColor: "#6c4bff",
    lockerPath: "https://retrograve.xyz/retrograve",
    status: "live",
  },
  {
    slug: "meowga",
    name: "MEOWGA",
    tagline: "Phone-native lock screens for MEOWGA NFTs (coming soon).",
    primaryColor: "#39d8ff",
    accentColor: "#00ffc3",
    lockerPath: "/meowga",
    status: "coming-soon",
  },
  {
    slug: "enchanted-miners",
    name: "Enchanted Miners",
    tagline: "Enchanted Miners lockscreen engine.",
    primaryColor: "#25f2d0",
    accentColor: "#00a3ff",
    lockerPath: "/enchanted-miners",
    status: "live",
  },

  // ✅ REPLACED Client Project #1 with GAINZ (LIVE + clickable)
  {
    slug: "gainz",
    name: "GAINZ",
    tagline: "Custom lockscreen engine for GAINZ NFTs.",
    primaryColor: "#8cff3a",
    accentColor: "#00c6ff",
    lockerPath: "/GAINZ", // <-- points to app/GAINZ/page.tsx
    status: "live",
  },
];
