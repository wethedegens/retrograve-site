export type ArtworkDevice = "phone" | "ipad" | "desktop";

export const FINISHED_ARTWORK_SIZES = {
  phone: { width: 1440, height: 3200 },
  ipad: { width: 2048, height: 2732 },
  desktop: { width: 2560, height: 1440 },
} as const;

/** Fit the complete foreground first; scales above 100% are explicit zoom. */
export function finishedArtworkLayout(
  imageWidth: number,
  imageHeight: number,
  width: number,
  height: number,
  placement: { scale?: number; x?: string; y?: string } = {},
) {
  if (![imageWidth, imageHeight, width, height].every(n => Number.isFinite(n) && n > 0)) {
    throw new Error("Artwork and canvas dimensions must be positive numbers.");
  }
  const requested = Number(placement.scale ?? 0.92);
  const zoom = Number.isFinite(requested) ? Math.max(0.4, Math.min(1.8, requested)) : 0.92;
  const scale = Math.min(width / imageWidth, height / imageHeight) * zoom;
  const drawW = imageWidth * scale;
  const drawH = imageHeight * scale;
  const dx = placement.x === "left" ? 0 : placement.x === "right" ? width - drawW : (width - drawW) / 2;
  const dy = placement.y === "top" ? 0 : placement.y === "center" ? (height - drawH) / 2 : height - drawH;
  return { dx, dy, drawW, drawH };
}
