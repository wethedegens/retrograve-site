// app/projectsConfig.ts

export type LockerProject = {
  slug: string;          // URL/key name for the project
  name: string;          // Display name
  tagline: string;       // Short description
  primaryColor: string;  // Card / phone gradient base
  accentColor?: string;  // Optional gradient accent
  href: string;          // Where the phone tile should link
  status: "live" | "coming-soon";
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
  },
  {
    slug: "retrograve",
    name: "RetroGrave",
    tagline: "Legendary lock screens for RetroGraves.",
    primaryColor: "#a46bff",
    accentColor: "#6c4bff",
    href: "https://retrograve.xyz",
    status: "live",
  },
  {
    slug: "meowga",
    name: "MEOWGA",
    tagline: "Meme-fueled feline patriot chaos.",
    primaryColor: "#ff8ac9",
    accentColor: "#ffe066",
    href: "#", // placeholder, disabled because coming soon
    status: "coming-soon",
  },
  {
    slug: "enchanted-miners",
    name: "Enchanted Miners",
    tagline: "Fantasy mining rigs under construction.",
    primaryColor: "#00ffc8",
    accentColor: "#00a8ff",
    href: "#", // placeholder, disabled because coming soon
    status: "coming-soon",
  },
  {
    slug: "client-1",
    name: "Client Project #1",
    tagline: "Custom lockscreen engine for partner NFTs.",
    primaryColor: "#00c6ff",
    accentColor: "#0072ff",
    href: "/client-1-locker",
    status: "coming-soon",
  },
];
