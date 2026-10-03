// app/lib/lockscreened/storagePaths.ts
//
// Storage layout is intentionally provider-agnostic. Supabase is the first
// provider, but URLs/paths do not leak Supabase assumptions into Composer.

export const STORAGE_BUCKETS = {
  /**
   * Original trait art, source PSD-equivalent exports, private founder files.
   * MUST remain private. Only verified collection members should receive access.
   */
  creatorSourcePrivate: "creator-source-private",

  /**
   * Published wallpaper backgrounds, thumbnails, and generated previews that
   * are safe for collectors to fetch through the public site/CDN.
   */
  publishedPublic: "published-public",
} as const;

function safeSegment(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 120);
}

function safeFileName(fileName: string) {
  const raw = String(fileName || "").split(/[\\/]/).pop() || "asset";
  const lastDot = raw.lastIndexOf(".");
  const base = lastDot > 0 ? raw.slice(0, lastDot) : raw;
  const extension = lastDot > 0 ? raw.slice(lastDot + 1) : "";

  const safeBase = safeSegment(base) || "asset";
  const safeExt = safeSegment(extension);
  return safeExt ? `${safeBase}.${safeExt}` : safeBase;
}

export function traitSourcePath(args: {
  studioId: string;
  collectionId: string;
  layerName: string;
  fileName: string;
}) {
  return [
    safeSegment(args.studioId),
    "collections",
    safeSegment(args.collectionId),
    "traits",
    safeSegment(args.layerName),
    safeFileName(args.fileName),
  ].join("/");
}

export function backgroundSourcePath(args: {
  studioId: string;
  collectionId: string;
  backgroundId: string;
  device: "phone" | "ipad" | "desktop";
  fileName: string;
}) {
  return [
    safeSegment(args.studioId),
    "collections",
    safeSegment(args.collectionId),
    "backgrounds",
    safeSegment(args.backgroundId),
    args.device,
    safeFileName(args.fileName),
  ].join("/");
}

export function publicPreviewPath(args: {
  collectionSlug: string;
  assetType: "background" | "project" | "thumbnail" | "trait" | "mint";
  assetId: string;
  fileName: string;
}) {
  return [
    "collections",
    safeSegment(args.collectionSlug),
    args.assetType,
    safeSegment(args.assetId),
    safeFileName(args.fileName),
  ].join("/");
}


export function traitSourcePathFromRelative(args: {
  studioId: string;
  collectionId: string;
  relativePath: string;
}) {
  const relativeSegments = String(args.relativePath || "")
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
    .map((segment, index, all) =>
      index === all.length - 1 ? safeFileName(segment) : safeSegment(segment)
    )
    .filter(Boolean);

  if (!relativeSegments.length) {
    throw new Error("Trait source path is empty.");
  }

  return [
    safeSegment(args.studioId),
    "collections",
    safeSegment(args.collectionId),
    "traits",
    ...relativeSegments,
  ].join("/");
}

export function mintOverrideSourcePath(args: {
  studioId: string;
  collectionId: string;
  assetId: string;
  fileName: string;
}) {
  return [
    safeSegment(args.studioId),
    "collections",
    safeSegment(args.collectionId),
    "mint-overrides",
    safeSegment(args.assetId),
    safeFileName(args.fileName),
  ].join("/");
}
