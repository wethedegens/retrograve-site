// app/lib/lockscreened/types.ts
//
// Foundation types for the next-generation LockScreened creator/collection system.
// IMPORTANT: these types are intentionally additive. Existing flagship routes and UI
// continue to work exactly as they do today.

export type DeviceVariant = "phone" | "ipad" | "desktop";

export type ProjectSourceType =
  | "solana_collection"
  | "doge_inscription"
  | "uploaded_art"
  | "demo";

export type RenderMode =
  | "layered_traits"
  | "curated_composite"
  | "remote_image"
  | "flat_background_extend";

export type BackgroundSource =
  | "legacy_curated"
  | "official_creator"
  | "lockscreened"
  | "holder_custom";

export type DeviceAssetSet = {
  phone: string;
  ipad?: string;
  desktop?: string;
  thumb?: string;
};

export type BackgroundPackage = {
  id: string;
  label: string;
  source: BackgroundSource;
  locked?: boolean;
  assets: DeviceAssetSet;
};

export type SolanaCollectionSource = {
  kind: "solana_collection";
  collectionIds?: string[];
  creatorAddresses?: string[];
  /**
   * Some older flagship flows still rely on server env configuration.
   * We preserve that behavior until the collection is formally claimed.
   */
  legacyEnvFallback?: boolean;
};

export type DogeInscriptionSource = {
  kind: "doge_inscription";
  contentUrlTemplate: string;
};

export type UploadedArtSource = {
  kind: "uploaded_art";
};

export type DemoSource = {
  kind: "demo";
};

export type ProjectSource =
  | SolanaCollectionSource
  | DogeInscriptionSource
  | UploadedArtSource
  | DemoSource;

export type TraitLayerConfig = {
  traitType: string;
  assetFolder: string;
  order: number;
  isBackground?: boolean;
};

export type TraitRenderProfile = {
  enabled: boolean;
  layerOrder: TraitLayerConfig[];
  assetRoot?: string;
  candidateExtensions?: string[];
};

export type RenderProfile = {
  mode: RenderMode;
  pixelated?: boolean;
  traitProfile?: TraitRenderProfile;
};

export type ProjectLinks = {
  marketplace?: string;
  discord?: string;
  x?: string;
  website?: string;
};

export type ProjectRoutes = {
  landing: string;
  ownerGrid?: string;
  lockerProjectKey: string;
};

export type FlagshipProjectDefinition = {
  slug: string;
  name: string;
  flagship: true;
  source: ProjectSource;
  render: RenderProfile;
  routes: ProjectRoutes;
  links: ProjectLinks;
  /**
   * Existing hand-authored assets are marked locked so a future creator claim
   * can ADD to them without accidentally deleting/replacing the original work.
   */
  legacyAssetsLocked: boolean;
  backgroundPackages?: BackgroundPackage[];
};

export function resolveDeviceAsset(
  assets: DeviceAssetSet,
  device: DeviceVariant
): string {
  if (device === "ipad" && assets.ipad) return assets.ipad;
  if (device === "desktop" && assets.desktop) return assets.desktop;
  return assets.phone;
}
