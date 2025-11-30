// app/projectsConfig.ts

export type LockerProject = {
  slug: string;          // URL segment we can use later, e.g. "magapixel"
  name: string;          // Display name
  tagline: string;       // Short subtitle under the name
  primaryColor: string;  // Card gradient base
  accentColor?: string;  // Optional extra color for gradient
  lockerPath: string;    // Where the "Open locker" button goes
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
    tagline: "Legendary lock screens for RetroGraves (launching after mint).",
    primaryColor: "#a46bff",
    accentColor: "#6c4bff",
    lockerPath: "/retrograve-locker",
    status: "coming-soon",
  },
  // Example slot for your first client – we’ll wire their route later
  {
    slug: "client-1",
    name: "Client Project #1",
    tagline: "Custom lockscreen engine for partner NFTs.",
    primaryColor: "#00c6ff",
    accentColor: "#0072ff",
    lockerPath: "/client-1-locker",
    status: "coming-soon",
  },
];
