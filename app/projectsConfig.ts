// app/projectsConfig.ts

export type LockerProject = {
  slug: string;          // URL segment we can use later, e.g. "magapixel"
  name: string;          // Display name
  tagline: string;       // Short subtitle under the name
  primaryColor: string;  // Card gradient base
  accentColor?: string;  // Optional extra color for gradient
  lockerPath: string;    // Where the main button goes
  status: "live" | "coming-soon";
  ctaLabel?: string;     // Optional custom button label for live projects
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
    ctaLabel: "Open locker →",
  },
  {
    slug: "retrograve",
    name: "RetroGrave",
    tagline: "Legendary lock screens for RetroGraves (learn more before mint).",
    primaryColor: "#a46bff",
    accentColor: "#6c4bff",
    // This points to your RetroGrave site inside this app
    lockerPath: "/retrograve",
    status: "live",
    ctaLabel: "Visit RetroGrave site →",
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
