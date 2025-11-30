// app/projectsConfig.ts

export type LockerProject = {
  slug: string;          // URL segment / identifier
  name: string;          // Card title
  tagline: string;       // Short subtitle under the name
  primaryColor: string;  // Card gradient base
  accentColor?: string;  // Optional extra color for gradient
  href: string;          // Where the main button should link
  status: "live" | "coming-soon";
  cta: string;           // Button label for live projects
};

export const PROJECTS: LockerProject[] = [
  {
    slug: "magapixel",
    name: "MAGApixel Locker",
    tagline: "Phone-native lock screens for MAGApixel NFTs.",
    primaryColor: "#f04b83",
    accentColor: "#ffb347",
    href: "/locker",
    status: "live",
    cta: "Open locker →",
  },
  {
    slug: "retrograve",
    name: "RetroGrave",
    tagline: "Legendary lock screens for RetroGraves (learn more before mint).",
    primaryColor: "#a46bff",
    accentColor: "#6c4bff",
    href: "/retrograve",
    status: "live",
    cta: "Visit RetroGrave site →",
  },
  {
    slug: "client-1",
    name: "Client Project #1",
    tagline: "Custom lockscreen engine for partner NFTs.",
    primaryColor: "#00c6ff",
    accentColor: "#0072ff",
    href: "/client-1-locker",
    status: "coming-soon",
    cta: "Locker in development",
  },
];
