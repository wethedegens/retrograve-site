// app/lib/lockscreened/traitMapping.ts
//
// Metadata-to-uploaded-trait matching for the Universal Trait Engine.
// This is deliberately deterministic: exact normalized values first, then
// slug-equivalent values. Missing assets are reported rather than guessed.

import type {
  ImportedTraitAsset,
  ImportedTraitLayer,
} from "./traitImport";

export type NftMetadataAttribute = {
  trait_type?: string;
  value?: string | number | null;
};

export type MatchedTrait = {
  traitType: string;
  traitValue: string;
  asset: ImportedTraitAsset;
};

export type TraitMatchResult = {
  matched: MatchedTrait[];
  missing: Array<{ traitType: string; traitValue: string }>;
  unusedMetadata: Array<{ traitType: string; traitValue: string }>;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function slug(value: string) {
  return normalize(value)
    .replace(/&/g, " and ")
    .replace(/[+]/g, " plus ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function findLayer(
  layers: ImportedTraitLayer[],
  traitType: string
): ImportedTraitLayer | undefined {
  const exact = layers.find(
    (layer) => normalize(layer.name) === normalize(traitType)
  );
  if (exact) return exact;

  const traitSlug = slug(traitType);
  return layers.find((layer) => slug(layer.name) === traitSlug);
}

function findAsset(
  layer: ImportedTraitLayer,
  traitValue: string
): ImportedTraitAsset | undefined {
  const exact = layer.assets.find(
    (asset) => normalize(asset.traitValue) === normalize(traitValue)
  );
  if (exact) return exact;

  const valueSlug = slug(traitValue);
  return layer.assets.find((asset) => slug(asset.traitValue) === valueSlug);
}

export function matchMetadataToTraitAssets(
  layers: ImportedTraitLayer[],
  attributes?: NftMetadataAttribute[] | null
): TraitMatchResult {
  const matched: MatchedTrait[] = [];
  const missing: Array<{ traitType: string; traitValue: string }> = [];
  const unusedMetadata: Array<{ traitType: string; traitValue: string }> = [];

  for (const attribute of attributes || []) {
    const traitType = String(attribute?.trait_type || "").trim();
    const traitValue =
      attribute?.value == null ? "" : String(attribute.value).trim();

    if (!traitType || !traitValue) continue;

    const layer = findLayer(layers, traitType);
    if (!layer) {
      unusedMetadata.push({ traitType, traitValue });
      continue;
    }

    const asset = findAsset(layer, traitValue);
    if (!asset) {
      missing.push({ traitType, traitValue });
      continue;
    }

    matched.push({ traitType, traitValue, asset });
  }

  matched.sort((a, b) => {
    const aLayer = findLayer(layers, a.traitType);
    const bLayer = findLayer(layers, b.traitType);
    return (aLayer?.suggestedOrder ?? 0) - (bLayer?.suggestedOrder ?? 0);
  });

  return { matched, missing, unusedMetadata };
}
