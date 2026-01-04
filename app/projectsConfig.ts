// app/projectsConfig.ts

export type LockerProject = {
  slug: string; // URL-ish identifier
  name: string; // Display name
  tagline: string; // Short description
  primaryColor: string; // Card / frame gradient base
  accentColor?: string; // Optional 2nd gradient color
  lockerPath: string; // Where the phone/card goes when LIVE
  status: "live" | "coming-soon";

  // ✅ Optional mint/collection id (safe add)
  collectionId?: string;
};

export const PROJECTS: LockerProject[] = [
  {
    slug: "magapixel",
    name: "MAGApixel Locker",
    tagline: "Phone-native lock screens for MAGApixel NFTs.",
    primaryColor: "#f04b83",
    accentColor: "#ffb347",
    lockerPath: "/locker/magapixel",
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

  // ✅ ZeroMonkeBiz (LIVE)
  {
    slug: "zeromonkebiz",
    name: "ZeroMonkeBiz",
    tagline: "Phone-native lock screens for ZeroMonkeBiz NFTs.",
    primaryColor: "#ffffff",
    accentColor: "#111111",
    lockerPath: "/zeromonkebiz",
    status: "live",
    collectionId: "EwMMBSEiZVxbDnroRB7vPiCaF2GjGEmALWyUPProrVXY",
  },

  // ✅ MEOWGA (as you currently have it)
  {
    slug: "meowga",
    name: "MEOWGA",
    tagline: "Phone-native lock screens for MEOWGA NFTs (coming soon).",
    primaryColor: "#39d8ff",
    accentColor: "#00ffc3",
    lockerPath: "/meowga",
    status: "coming-soon",
  },

  // ✅ NEW: SagaMonkes (LIVE)
  {
    slug: "sagamonkes",
    name: "SagaMonkes",
    tagline: "Phone-native lock screens for SagaMonkes NFTs.",
    primaryColor: "#0b0b0f",
    accentColor: "#22ff88",
    lockerPath: "/saga-monkes",
    status: "live",
    collectionId: "HCwFN2CpdwPbfRUFerVUWaYhtV7J587X9cEuZ3Cn8Hst",
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

  // ✅ MidEvils
  {
    slug: "midevils",
    name: "MidEvils",
    tagline: "Phone-native lock screens for MidEvils NFTs.",
    primaryColor: "#ff2e63",
    accentColor: "#8a2be2",
    lockerPath: "/midevils",
    status: "live",
  },

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
