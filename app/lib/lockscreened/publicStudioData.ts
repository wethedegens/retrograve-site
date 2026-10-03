// app/lib/lockscreened/publicStudioData.ts
import { getPublicSupabaseConfig } from "./backendConfig";

function config() {
  const value = getPublicSupabaseConfig();
  if (!value) throw new Error("LockScreened Supabase is not configured.");
  return value;
}

async function publicRequest<T>(path: string): Promise<T> {
  const { url, publishableKey } = config();

  const response = await fetch(url + "/rest/v1/" + path, {
    headers: {
      apikey: publishableKey,
      Authorization: "Bearer " + publishableKey,
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error("Published Studio data request failed (" + response.status + ").");
  }

  return (await response.json()) as T;
}

export async function getPublishedStudioProjectBySlug(slug: string) {
  const safeSlug = String(slug || "").trim().toLowerCase();

  const collections = await publicRequest<any[]>(
    "collections?or=(public_slug.eq." +
      encodeURIComponent(safeSlug) +
      ",slug.eq." +
      encodeURIComponent(safeSlug) +
      ")" +
      "&publish_status=eq.published" +
      "&select=id,slug,public_slug,name,source_type,source_config,render_mode,render_profile,public_profile,publish_status,flagship,legacy_assets_locked&limit=1"
  );

  const collection = collections?.[0];
  if (!collection || collection.flagship) return null;

  const packages = await publicRequest<any[]>(
    "background_packages?collection_id=eq." +
      encodeURIComponent(collection.id) +
      "&publish_status=eq.published" +
      "&select=id,name,source,publish_status,created_at&order=created_at.asc"
  );

  const packageIds = (packages || []).map((item) => item.id).filter(Boolean);
  let assets: any[] = [];

  if (packageIds.length) {
    const inList = packageIds
      .map((id: string) => '"' + String(id).replace(/"/g, "") + '"')
      .join(",");

    assets = await publicRequest<any[]>(
      "background_assets?package_id=in.(" +
        encodeURIComponent(inList) +
        ")&select=id,package_id,device,storage_bucket,storage_path,bytes,mime_type"
    );
  }

  const { url } = config();
  const publicAssetUrl = (bucket: string, path: string) => {
    const encoded = String(path || "")
      .split("/")
      .filter(Boolean)
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    return (
      url +
      "/storage/v1/object/public/" +
      encodeURIComponent(bucket) +
      "/" +
      encoded
    );
  };

  const backgrounds = (packages || []).map((pkg) => {
    const packageAssets = assets.filter((asset) => asset.package_id === pkg.id);
    const byDevice: Record<string, string> = {};

    for (const asset of packageAssets) {
      byDevice[asset.device] = publicAssetUrl(
        asset.storage_bucket,
        asset.storage_path
      );
    }

    return {
      id: pkg.id,
      name: pkg.name,
      source: pkg.source,
      deviceAssets: byDevice,
    };
  });

  const layers = await publicRequest<any[]>(
    "trait_layers?collection_id=eq." +
      encodeURIComponent(collection.id) +
      "&select=id,trait_type,display_name,layer_order,is_background&order=layer_order.asc"
  );

  let publishedTraitAssets: any[] = [];
  const layerIds = (layers || []).map((layer) => layer.id).filter(Boolean);

  if (layerIds.length) {
    const inList = layerIds
      .map((id: string) => '"' + String(id).replace(/"/g, "") + '"')
      .join(",");

    publishedTraitAssets = await publicRequest<any[]>(
      "published_trait_assets?layer_id=in.(" +
        encodeURIComponent(inList) +
        ")&select=id,layer_id,trait_value,storage_bucket,storage_path,bytes,mime_type"
    );
  }

  const publicTraitAssets = publishedTraitAssets.map((asset) => ({
    ...asset,
    url: publicAssetUrl(asset.storage_bucket, asset.storage_path),
  }));

  const publishedMintOverrides = await publicRequest<any[]>(
    "published_mint_overrides?collection_id=eq." +
      encodeURIComponent(collection.id) +
      "&select=id,collection_id,asset_id,storage_bucket,storage_path,bytes,mime_type"
  );

  const publicMintOverrides = (publishedMintOverrides || []).map((asset) => ({
    ...asset,
    url: publicAssetUrl(asset.storage_bucket, asset.storage_path),
  }));

  return {
    ...collection,
    backgrounds,
    layers,
    publishedTraitAssets: publicTraitAssets,
    publishedMintOverrides: publicMintOverrides,
    route_slug: collection.public_slug || collection.slug,
  };
}

export async function listPublishedStudioProjects() {
  const collections = await publicRequest<any[]>(
    "collections?publish_status=eq.published&flagship=eq.false&select=id,slug,public_slug,name,render_mode,public_profile,created_at&order=created_at.desc&limit=24"
  );

  if (!collections.length) return [];

  const collectionIds = collections.map((item) => item.id);
  const collectionIn = collectionIds
    .map((id: string) => '"' + String(id).replace(/"/g, "") + '"')
    .join(",");

  const packages = await publicRequest<any[]>(
    "background_packages?collection_id=in.(" +
      encodeURIComponent(collectionIn) +
      ")&publish_status=eq.published&select=id,collection_id,name,created_at&order=created_at.asc"
  );

  const packageIds = packages.map((item) => item.id);
  let assets: any[] = [];

  if (packageIds.length) {
    const packageIn = packageIds
      .map((id: string) => '"' + String(id).replace(/"/g, "") + '"')
      .join(",");

    assets = await publicRequest<any[]>(
      "background_assets?package_id=in.(" +
        encodeURIComponent(packageIn) +
        ")&device=eq.phone&select=id,package_id,storage_bucket,storage_path"
    );
  }

  const { url } = config();
  const publicUrl = (bucket: string, path: string) => {
    const encoded = String(path || "")
      .split("/")
      .filter(Boolean)
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    return url + "/storage/v1/object/public/" + encodeURIComponent(bucket) + "/" + encoded;
  };

  return collections.map((collection) => {
    const projectPackages = packages.filter(
      (item) => item.collection_id === collection.id
    );
    const firstPackage = projectPackages[0];
    const phoneAsset = firstPackage
      ? assets.find((item) => item.package_id === firstPackage.id)
      : null;

    return {
      id: collection.id,
      slug: collection.public_slug || collection.slug,
      name: collection.name,
      render_mode: collection.render_mode,
      public_profile: collection.public_profile || {},
      preview: phoneAsset
        ? publicUrl(phoneAsset.storage_bucket, phoneAsset.storage_path)
        : "",
    };
  });
}
