// app/backgroundsConfig.ts

// Which device size we’re drawing for
export type DeviceVariant = "phone" | "ipad" | "desktop";

// Which project a background belongs to
export type BackgroundProject = "magapixel" | "gainz";

export type BackgroundConfig = {
  /** Internal ID, e.g. "austere-grey" or "blue-star" */
  id: string;
  /** Human readable label, e.g. "Austere Grey" or "Blue Star" */
  label: string;
  /** Project bucket */
  project: BackgroundProject;

  /** Thumbnail shown in the picker (optional) */
  thumb?: string;

  /** Phone-optimized image */
  phone: string;

  /** iPad-optimized image (optional) */
  ipad?: string;

  /** Desktop-optimized image (optional) */
  desktop?: string;
};

function titleCaseFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * MAGAPIXEL: background packs with /thumb.png /phone.png /ipad.png /desktop.png
 * Folder: /public/backgrounds/<slug>/
 */
function makeMagapixelBg(folder: string, label?: string): BackgroundConfig {
  const base = `/backgrounds/${folder}`;
  return {
    id: folder,
    label: label ?? titleCaseFromSlug(folder),
    project: "magapixel",
    thumb: `${base}/thumb.png`,
    phone: `${base}/phone.png`,
    ipad: `${base}/ipad.png`,
    desktop: `${base}/desktop.png`,
  };
}

/**
 * GAINZ: simple files per device folder
 * Folder: /public/gainz/<device>/(phone|ipad|desktop)-<id>.png
 * Example: /gainz/phone/phone-blue.png
 */
function makeGainzBg(id: string, label?: string): BackgroundConfig {
  return {
    id,
    label: label ?? titleCaseFromSlug(id),
    project: "gainz",
    // No separate thumbs right now; we’ll just show the phone image in the picker
    phone: `/gainz/phone/phone-${id}.png`,
    ipad: `/gainz/ipad/ipad-${id}.png`,
    desktop: `/gainz/desktop/desktop-${id}.png`,
  };
}

/**
 * MASTER LIST
 * (We keep this as one list so Composer can stay simple.)
 */
export const BACKGROUNDS: BackgroundConfig[] = [
  // ----------------
  // MAGAPIXEL
  // ----------------
  makeMagapixelBg("austere-grey"),
  makeMagapixelBg("bitcoined"),
  makeMagapixelBg("black"),
  makeMagapixelBg("bookcase-brown"),
  makeMagapixelBg("in-the-vault"),
  makeMagapixelBg("make-art-great-again"),
  makeMagapixelBg("military-green"),
  makeMagapixelBg("navy-blue"),
  makeMagapixelBg("north-american-sky"),
  makeMagapixelBg("out-at-night"),
  makeMagapixelBg("patriotic"),
  makeMagapixelBg("republican-red"),
  makeMagapixelBg("sea-to-shining-sea"),
  makeMagapixelBg("trump-international-golf-club"),
  makeMagapixelBg("whitehouse-hallway"),

  // ----------------
  // GAINZ
  // (These ids MUST match your filenames exactly)
  // ----------------
  makeGainzBg("blue"),
  makeGainzBg("blue-star"),
  makeGainzBg("burgundy"),
  makeGainzBg("emerald"),
  makeGainzBg("galaxy"),
  makeGainzBg("gray"), // trait is "Grey" on HowRare, but your file is "gray" — we’ll map it.
  makeGainzBg("green"),
  makeGainzBg("nebula"),
  makeGainzBg("orbs"),
  makeGainzBg("purple"),
  makeGainzBg("red"),
  makeGainzBg("steel"),
  makeGainzBg("steel2"),
  makeGainzBg("street"),
  makeGainzBg("trench"),
];

// Quick lookup by project + id
export function getBackgroundByProjectId(
  project: BackgroundProject,
  id: string
): BackgroundConfig | undefined {
  return BACKGROUNDS.find((bg) => bg.project === project && bg.id === id);
}

/**
 * Get the correct image path for a given background + device.
 * Falls back to the phone image if ipad/desktop isn’t present.
 */
export function getBackgroundImagePath(
  project: BackgroundProject,
  id: string,
  device: DeviceVariant
): string | null {
  const bg = getBackgroundByProjectId(project, id);
  if (!bg) return null;

  if (device === "ipad" && bg.ipad) return bg.ipad;
  if (device === "desktop" && bg.desktop) return bg.desktop;
  return bg.phone;
}

/**
 * Given a GAINZ NFT metadata Background trait value (e.g. "Blue Star" or "Grey"),
 * return the background id that matches our filenames.
 */
export function gainzTraitToBgId(traitValueRaw: string): string {
  const v = String(traitValueRaw || "").trim().toLowerCase();

  // Normalize known mismatches between trait labels and your filenames
  if (v === "grey") return "gray";
  if (v === "blue star") return "blue-star";

  // Default slugify: "Server Farm" -> "server-farm"
  return v.replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
