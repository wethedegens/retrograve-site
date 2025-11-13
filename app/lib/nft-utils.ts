// app/lib/nft-utils.ts

/** Minimal shape we use from Helius DAS results */
export type DASAsset = {
  id: string;
  content?: {
    links?: { image?: string };
    files?: Array<{ uri?: string; mime?: string }>;
    json_uri?: string;
  };
  grouping?: Array<{ group_key?: string; group_value?: string }>;
  creators?: Array<{ address?: string; verified?: boolean }>;
};

export type SimpleNft = { id: string; image: string };

export function getImageUrl(a: DASAsset): string | null {
  return (
    a?.content?.links?.image ||
    a?.content?.files?.find((f) => (f?.mime || "").startsWith("image/"))?.uri ||
    a?.content?.json_uri ||
    null
  );
}

/** true if asset belongs to the given verified collection id */
export function inCollection(a: DASAsset, collectionId: string): boolean {
  if (!collectionId) return true;
  const grp = a.grouping || [];
  return grp.some(
    (g) =>
      (g.group_key === "collection" || g.group_key === "mpl_collection") &&
      g.group_value === collectionId
  );
}

/** optional creator allow-list filter (comma separated) */
export function byCreators(a: DASAsset, creatorListCsv?: string): boolean {
  if (!creatorListCsv) return true;
  const allow = creatorListCsv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!allow.length) return true;
  const creators = a.creators || [];
  return creators.some((c) => c?.address && allow.includes(c.address));
}

/** normalize DAS results to SimpleNft[] with filters applied */
export function normalizeAndFilter(
  items: DASAsset[],
  opts: { collectionId?: string; creatorsCsv?: string }
): SimpleNft[] {
  return (items || [])
    .filter((a) => inCollection(a, opts.collectionId || ""))
    .filter((a) => byCreators(a, opts.creatorsCsv))
    .map((a) => ({ id: a.id, image: getImageUrl(a) || "" }))
    .filter((x) => !!x.image);
}
