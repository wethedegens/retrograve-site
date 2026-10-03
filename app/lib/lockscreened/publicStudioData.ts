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
    "collections?slug=eq." +
      encodeURIComponent(safeSlug) +
      "&publish_status=eq.published" +
      "&select=id,slug,name,source_type,source_config,render_mode,render_profile,publish_status,flagship,legacy_assets_locked&limit=1"
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

  return {
    ...collection,
    backgrounds,
  };
}
