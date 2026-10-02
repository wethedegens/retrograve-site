// app/lib/lockscreened/legacyBackgroundVariants.ts
//
// Adapter between today's hand-authored /public folders and the new
// device-aware background-package model. This exists specifically so the
// current flagship art can be preserved while Creator Studio is built around it.

import type { DeviceVariant } from "./types";

export type DeviceBackgroundMap = Partial<Record<DeviceVariant, string>>;

const ALL_GAINZ = new Set(Array.from({ length: 15 }, (_, i) => `bg-${i + 1}.png`));
const ALL_MIDEVILS = new Set(Array.from({ length: 12 }, (_, i) => `bg-${i + 1}.png`));

const MINERS_WITH_DEVICE_ART = new Set([
  "bg-1.png",
  "bg-2.png",
  "bg-3.png",
  "bg-4.png",
  "bg-5.png",
  "bg-6.png",
  "bg-7.png",
  "bg-8.png",
  "bg-9.png",
  "bg-10.png",
  "bg-12.png",
  "bg-13.png",
  "bg-14.png",
  "bg-17.png",
  "bg-18.png",
  "bg-19.png",
  "bg-20.png",
  "bg-21.png",
  "bg-22.png",
  "bg-23.png",
  "bg-24.png",
  "bg-25.png",
  "bg-26.png",
  "bg-27.png",
  "bg-28.png",
]);

const MEOWGA_ALL = new Set([
  "bedroom-plotting.png",
  "brownies.png",
  "cabinet-speaker.png",
  "dimz.png",
  "golden-museum.png",
  "greenz.png",
  "halofang.png",
  "heavenly-realm.png",
  "limey.png",
  "meowpheus.png",
  "normie.png",
  "patriots-lounge.png",
  "smuthe-blue.png",
  "touching-grass.png",
  "vengeance.png",
]);

const SAGA_ALL = new Set([
  "bg-1.png",
  "bg-2.png",
  "bg-3.png",
  "bg-4.png",
  "bg-5.png",
]);

function fileName(path: string) {
  return path.split("/").filter(Boolean).pop() || "";
}

function withFolder(path: string, folder: "ipad" | "comp") {
  return path.replace("/phone/", `/${folder}/`);
}

/**
 * Returns only device variants that are known to exist in the current repo.
 * The phone path is always preserved exactly as the current picker supplied it.
 * Missing variants intentionally fall back to phone art in Composer.
 */
export function getLegacyBackgroundDeviceAssets(
  projectKey: string,
  phoneSrc: string
): DeviceBackgroundMap {
  const key = String(projectKey || "").trim().toLowerCase();
  const name = fileName(phoneSrc);
  const result: DeviceBackgroundMap = { phone: phoneSrc };

  if (key === "gainz" && ALL_GAINZ.has(name)) {
    result.ipad = withFolder(phoneSrc, "ipad");
    result.desktop = withFolder(phoneSrc, "comp");
    return result;
  }

  if (key === "midevils" && ALL_MIDEVILS.has(name)) {
    result.ipad = withFolder(phoneSrc, "ipad");
    result.desktop = withFolder(phoneSrc, "comp");
    return result;
  }

  if (key === "miners" && MINERS_WITH_DEVICE_ART.has(name)) {
    result.ipad = withFolder(phoneSrc, "ipad");
    result.desktop = withFolder(phoneSrc, "comp");
    return result;
  }

  if (key === "meowga" && MEOWGA_ALL.has(name)) {
    // halofang has phone + computer art in the repo, but no iPad asset.
    if (name !== "halofang.png") {
      result.ipad = withFolder(phoneSrc, "ipad");
    }
    result.desktop = withFolder(phoneSrc, "comp");
    return result;
  }

  if (key === "sagamonkes" && SAGA_ALL.has(name)) {
    // Historical filename in the repo is bg--1.png for this single iPad asset.
    result.ipad =
      name === "bg-1.png"
        ? phoneSrc.replace("/phone/bg-1.png", "/ipad/bg--1.png")
        : withFolder(phoneSrc, "ipad");
    result.desktop = withFolder(phoneSrc, "comp");
    return result;
  }

  if (key === "magapixel" && phoneSrc.startsWith("/backgrounds/")) {
    result.ipad = phoneSrc.replace("/phone.png", "/ipad.png");
    result.desktop = phoneSrc.replace("/phone.png", "/desktop.png");
    return result;
  }

  // Doge Miners is currently phone-only. RetroGrave and ZeroMonkeBiz have
  // legacy path/name inconsistencies that we are deliberately not auto-fixing
  // in this adapter until they are normalized and regression-tested.
  return result;
}
