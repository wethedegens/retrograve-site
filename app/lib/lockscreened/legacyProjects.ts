export type LockerProject = {
  name: string;
  status: "live" | "coming";
  label: string;
  lockerPath: string;
  glow: string;
  preview?: string;
};

export const LEGACY_PROJECTS: LockerProject[] = [
  {
    name: "RetroGrave Locker",
    status: "live",
    label: "Live",
    lockerPath: "/retrograve",
    glow: "retrograve",
    preview: "/lockscreened-previews/retrograve.png",
  },
  {
    name: "Gainz",
    status: "live",
    label: "Live",
    lockerPath: "/gainz",
    glow: "gainz",
    preview: "/lockscreened-previews/gainz.png",
  },
  {
    name: "MidEvils",
    status: "live",
    label: "Live",
    lockerPath: "/midevils",
    glow: "midevils",
    preview: "/lockscreened-previews/midevils.png",
  },
  {
    name: "Enchanted Miners",
    status: "live",
    label: "Live",
    lockerPath: "/enchanted-miners",
    glow: "miners",
    preview: "/lockscreened-previews/miners.png",
  },

  // ✅ NEW — Doge Miners (Inscription loader)
  {
    name: "Doge Miners",
    status: "live",
    label: "Live",
    lockerPath: "/doge-miners",
    glow: "dogeminers",
    preview: "/lockscreened-previews/doge-miners.png",
  },

  {
    name: "ZeroMonkeBiz",
    status: "live",
    label: "Live",
    lockerPath: "/zeromonkebiz",
    glow: "zeromonkebiz",
    preview: "/lockscreened-previews/zeromonkebiz-1.png",
  },

  // ✅ SagaMonkes (LIVE)
  {
    name: "SagaMonkes",
    status: "live",
    label: "Live",
    lockerPath: "/saga-monkes",
    glow: "sagamonkes",
    preview: "/lockscreened-previews/saga-monkes.png",
  },

  {
    name: "MAGApixel Locker",
    status: "live",
    label: "Live",
    lockerPath: "/locker/magapixel",
    glow: "magapixel",
    preview: "/lockscreened-previews/magapixel.png",
  },
  {
    name: "MEOWGA",
    status: "live",
    label: "Live",
    lockerPath: "/meowga",
    glow: "meowga",
    preview: "/lockscreened-previews/meowga.png",
  },
];

