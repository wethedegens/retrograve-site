// app/lib/lockscreened/flagshipProjects.ts
//
// Canonical registry for the CURRENT LockScreened flagship projects.
// This does not replace the existing project pages yet. It gives the Creator
// Studio / future database migration one authoritative source of project facts
// without changing today's visual experience.

import type { FlagshipProjectDefinition } from "./types";

export const FLAGSHIP_PROJECTS: FlagshipProjectDefinition[] = [
  {
    slug: "magapixel",
    name: "MAGApixel",
    flagship: true,
    legacyAssetsLocked: true,
    source: {
      kind: "solana_collection",
      legacyEnvFallback: true,
    },
    render: {
      mode: "layered_traits",
      pixelated: true,
      traitProfile: {
        enabled: true,
        assetRoot: "/magapixel",
        candidateExtensions: [".png", ".webp"],
        layerOrder: [
          { traitType: "Skin", assetFolder: "skin", order: 10 },
          { traitType: "Face", assetFolder: "face", order: 20 },
          { traitType: "Body", assetFolder: "body", order: 30 },
          { traitType: "Head", assetFolder: "head", order: 40 },
          { traitType: "Glasses", assetFolder: "glasses", order: 50 },
          { traitType: "Hand", assetFolder: "hand", order: 60 },
        ],
      },
    },
    routes: {
      landing: "/locker/magapixel",
      ownerGrid: "/magapixel-nfts",
      lockerProjectKey: "magapixel",
    },
    links: {
      marketplace: "https://magiceden.io/marketplace/magapixel",
      discord: "https://discord.gg/ZVGtHUpHfb",
      x: "https://x.com/MAGApixel_NFT",
    },
  },
  {
    slug: "retrograve",
    name: "RetroGrave",
    flagship: true,
    legacyAssetsLocked: true,
    source: { kind: "demo" },
    render: {
      mode: "layered_traits",
      pixelated: true,
    },
    routes: {
      landing: "/retrograve",
      ownerGrid: "/retrograves-nfts",
      lockerProjectKey: "retrograve",
    },
    links: {
      marketplace: "https://magiceden.io",
      discord: "https://discord.gg/rRG2YDbHYA",
      x: "https://x.com/RETROGRAVE_NFT",
    },
  },
  {
    slug: "enchanted-miners",
    name: "Enchanted Miners",
    flagship: true,
    legacyAssetsLocked: true,
    source: {
      kind: "solana_collection",
      collectionIds: ["GzhXjRxLXWkzW6vDVyHgbYmqW75xrfh4WvgVKQ8XA1su"],
    },
    render: { mode: "curated_composite", pixelated: true },
    routes: {
      landing: "/enchanted-miners",
      ownerGrid: "/enchanted-miners-nfts",
      lockerProjectKey: "miners",
    },
    links: {
      marketplace: "https://magiceden.us/marketplace/enchanted_miner",
      discord: "https://discord.gg/9Py5japbSe",
      x: "https://x.com/enchanted_nfts",
    },
  },
  {
    slug: "doge-miners",
    name: "Doge Miners",
    flagship: true,
    legacyAssetsLocked: true,
    source: {
      kind: "doge_inscription",
      contentUrlTemplate: "https://cdn.doggy.market/content/{inscriptionId}",
    },
    render: { mode: "remote_image", pixelated: true },
    routes: {
      landing: "/doge-miners",
      ownerGrid: "/doge-miners-nfts",
      lockerProjectKey: "dogeminers",
    },
    links: {
      marketplace: "https://doggy.market/nfts/emod",
      discord: "https://discord.gg/M6pbQPkZfV",
      x: "https://www.twitter.com/enchanted_nfts",
    },
  },
  {
    slug: "gainz",
    name: "GAINZ",
    flagship: true,
    legacyAssetsLocked: true,
    source: {
      kind: "solana_collection",
      collectionIds: ["6a5FuaxdKmhjm5GnTXPcJnqCqFftvho2E5Wo7N7diXtx"],
      creatorAddresses: [
        "6BJuVsENAMUEvR9ftviSVb5JokS12pF3FF2EnExdc2UD",
        "BZeN8afPfZNt33FiLmyVvzYm9xhzHtgXjaEJzZ2A8tru",
        "AKgkp823sYaFWBtDm559LX3J4QJ9rtpV4Y5po8BEvoQ5",
        "wj5uDGjLajNjBPFzey4v1SSLjhFCGiLDp8W5REncm46",
      ],
    },
    render: { mode: "curated_composite", pixelated: true },
    routes: {
      landing: "/gainz",
      ownerGrid: "/gainz-nft",
      lockerProjectKey: "gainz",
    },
    links: {
      marketplace: "https://magiceden.us/marketplace/gainz_",
      discord: "https://discord.gg/NeeU7zcQ",
      x: "https://x.com/GotmLabz",
    },
  },
  {
    slug: "midevils",
    name: "MidEvils",
    flagship: true,
    legacyAssetsLocked: true,
    source: {
      kind: "solana_collection",
      collectionIds: ["5nJocYN5a8fCNzi11fz28h8Eo3xLcTnGgp2qubq3jMKz"],
    },
    render: { mode: "curated_composite", pixelated: true },
    routes: {
      landing: "/midevils",
      ownerGrid: "/midevils-nfts",
      lockerProjectKey: "midevils",
    },
    links: {
      marketplace: "https://magiceden.us/marketplace/midevils",
      discord: "https://discord.gg/StDJJYTYRSd",
      x: "https://x.com/MidEvilsNFT",
    },
  },
  {
    slug: "meowga",
    name: "MEOWGA",
    flagship: true,
    legacyAssetsLocked: true,
    source: {
      kind: "solana_collection",
      collectionIds: ["GryRACtbbwn5aLXjGmimR2KLFNtb3vrcbM5dgDnaJp2g"],
    },
    render: { mode: "curated_composite", pixelated: true },
    routes: {
      landing: "/meowga",
      ownerGrid: "/meowga-nfts",
      lockerProjectKey: "meowga",
    },
    links: {
      marketplace: "https://magiceden.us/marketplace/meowga",
      discord: "https://discord.gg/ZVGtHUpHfb",
      x: "https://x.com/MAGApixel_NFT",
    },
  },
  {
    slug: "zeromonkebiz",
    name: "ZeroMonkeBiz",
    flagship: true,
    legacyAssetsLocked: true,
    source: {
      kind: "solana_collection",
      collectionIds: ["EwMMBSEiZVxbDnroRB7vPiCaF2GjGEmALWyUPProrVXY"],
    },
    render: { mode: "curated_composite", pixelated: true },
    routes: {
      landing: "/zeromonkebiz",
      ownerGrid: "/zeromonkebiz-nfts",
      lockerProjectKey: "zeromonkebiz",
    },
    links: {
      marketplace: "https://t.co/GHLBvIWXrR",
      discord: "https://www.discord.gg/zeromonkebiz",
      x: "https://x.com/zeromonkebiz",
    },
  },
  {
    slug: "sagamonkes",
    name: "SagaMonkes",
    flagship: true,
    legacyAssetsLocked: true,
    source: {
      kind: "solana_collection",
      collectionIds: ["HCwFN2CpdwPbfRUFerVUWaYhtV7J587X9cEuZ3Cn8Hst"],
      creatorAddresses: [
        "8McVhmNjsYSkwQ34QXJb2ADgLWERcHcpqxSzRZUCRZfQ",
        "niFtyPVUnA4dd3gaoajiwmX1keTsTi4k626szinHE5Z",
        "4rgwWRhLsmUhRJNifP4BD73QJksbYhLdpHZVgksTiPLb",
        "6gXSWgv7x4Qn77DakyLYYDJtoohZWJACzAVch8HTHsnm",
      ],
    },
    render: { mode: "curated_composite", pixelated: true },
    routes: {
      landing: "/saga-monkes",
      ownerGrid: "/saga-monkes-nfts",
      lockerProjectKey: "sagamonkes",
    },
    links: {
      marketplace: "https://magiceden.us/marketplace/sagamonkes",
      discord: "https://www.discord.gg/tPPAukA9Af",
      x: "https://www.twitter.com/sagamonkes",
    },
  },
];

export function getFlagshipProjectBySlug(slug?: string | null) {
  const key = String(slug || "").trim().toLowerCase();
  return FLAGSHIP_PROJECTS.find((project) => project.slug === key);
}

export function getFlagshipProjectByLockerKey(key?: string | null) {
  const normalized = String(key || "").trim().toLowerCase();
  return FLAGSHIP_PROJECTS.find(
    (project) => project.routes.lockerProjectKey === normalized
  );
}
