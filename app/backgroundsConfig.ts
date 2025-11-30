// app/backgroundsConfig.ts

// Which device size we’re drawing for
export type DeviceVariant = "phone" | "ipad" | "desktop";

export type BackgroundConfig = {
  /** Internal ID, e.g. "austere-grey" */
  id: string;
  /** Human readable label, e.g. "Austere Grey" */
  label: string;
  /** Folder name under /public/backgrounds */
  folder: string;
  /** Thumbnail shown in the picker */
  thumb: string;
  /** Phone-optimized image */
  phone: string;
  /** iPad-optimized image (optional) */
  ipad?: string;
  /** Desktop-optimized image (optional) */
  desktop?: string;
};

// Helper to DRY up paths since your structure is consistent
function makeBg(folder: string, label?: string): BackgroundConfig {
  const base = `/backgrounds/${folder}`;
  // Auto title-case from the folder name if label not provided
  const autoLabel = folder
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    id: folder,
    label: label ?? autoLabel,
    folder,
    thumb: `${base}/thumb.png`,
    phone: `${base}/phone.png`,
    ipad: `${base}/ipad.png`,
    desktop: `${base}/desktop.png`,
  };
}

/**
 * Master list of all backgrounds you created under /public/backgrounds.
 *
 * Folder names are:
 * austere-grey
 * bitcoined
 * black
 * bookcase-brown
 * in-the-vault
 * make-art-great-again
 * military-green
 * navy-blue
 * north-american-sky
 * out-at-night
 * patriotic
 * republican-red
 * sea-to-shining-sea
 * trump-international-golf-club
 * whitehouse-hallway
 */
export const BACKGROUNDS: BackgroundConfig[] = [
  makeBg("austere-grey"),
  makeBg("bitcoined"),
  makeBg("black"),
  makeBg("bookcase-brown"),
  makeBg("in-the-vault"),
  makeBg("make-art-great-again"),
  makeBg("military-green"),
  makeBg("navy-blue"),
  makeBg("north-american-sky"),
  makeBg("out-at-night"),
  makeBg("patriotic"),
  makeBg("republican-red"),
  makeBg("sea-to-shining-sea"),
  makeBg("trump-international-golf-club"),
  makeBg("whitehouse-hallway"),
];

// Quick lookup by id
export function getBackgroundById(id: string): BackgroundConfig | undefined {
  return BACKGROUNDS.find((bg) => bg.id === id);
}

/**
 * Get the correct image path for a given background + device.
 * Falls back to the phone image if ipad/desktop isn’t present.
 */
export function getBackgroundImagePath(
  id: string,
  device: DeviceVariant
): string | null {
  const bg = getBackgroundById(id);
  if (!bg) return null;

  if (device === "ipad" && bg.ipad) return bg.ipad;
  if (device === "desktop" && bg.desktop) return bg.desktop;
  return bg.phone;
}
