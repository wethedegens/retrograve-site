// app/lib/lockscreened/studioDataClient.ts
"use client";

import { getPublicSupabaseConfig } from "./backendConfig";
import type { LockScreenedSession } from "./web3AuthClient";

function cfg() {
  const value = getPublicSupabaseConfig();
  if (!value) throw new Error("LockScreened Supabase is not configured.");
  return value;
}

async function request<T>(
  session: LockScreenedSession,
  path: string,
  init?: RequestInit
): Promise<T> {
  const { url, publishableKey } = cfg();
  const response = await fetch(url + "/rest/v1/" + path, {
    ...init,
    headers: {
      apikey: publishableKey,
      Authorization: "Bearer " + session.access_token,
      "content-type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `Supabase request failed (${response.status}).`;
    try {
      const data = await response.json();
      message = data?.message || data?.hint || message;
    } catch {}
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

function studioSlug(userId: string) {
  return "studio-" + userId.replace(/-/g, "").slice(0, 20).toLowerCase();
}

function collectionSlug(collectionAddress: string) {
  return "sol-" + collectionAddress.toLowerCase();
}

function preMintSlug(userId: string) {
  return (
    "premint-" +
    userId.replace(/-/g, "").slice(0, 10).toLowerCase() +
    "-" +
    Date.now().toString(36)
  );
}

export async function ensurePersonalStudio(session: LockScreenedSession) {
  const userId = String(session.user?.id || "");
  if (!userId) throw new Error("Supabase user ID is missing.");

  const existing = await request<any[]>(
    session,
    "studios?owner_user_id=eq." +
      encodeURIComponent(userId) +
      "&select=id,name,slug&limit=1"
  );

  if (existing?.[0]) return existing[0];

  const created = await request<any[]>(
    session,
    "studios?select=id,name,slug",
    {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        owner_user_id: userId,
        name: "My LockScreened Studio",
        slug: studioSlug(userId),
      }),
    }
  );

  if (!created?.[0]) throw new Error("Could not create your Studio.");
  return created[0];
}


export async function createPreMintProject(args: {
  session: LockScreenedSession;
  name: string;
  artworkMode: "layered_traits" | "finished_artwork";
}) {
  const userId = String(args.session.user?.id || "");
  if (!userId) throw new Error("Supabase user ID is missing.");

  const name = String(args.name || "").trim().slice(0, 120);
  if (!name) throw new Error("Project name is required.");

  const studio = await ensurePersonalStudio(args.session);
  const slug = preMintSlug(userId);
  const layered = args.artworkMode === "layered_traits";

  const created = await request<any[]>(
    args.session,
    "collections?select=id,studio_id,slug,name,source_type,source_config,render_mode,render_profile,publish_status,created_at",
    {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        studio_id: studio.id,
        slug,
        name,
        source_type: "demo",
        source_config: {
          preMint: true,
          collectionIds: [],
          createdBeforeMint: true,
          artworkMode: args.artworkMode,
        },
        render_mode: layered ? "layered_traits" : "flat_background_extend",
        render_profile: layered
          ? {
              engine: "universal_trait_engine",
              backgroundHandling: "creator_designated",
            }
          : {
              engine: "finished_artwork_engine",
              backgroundHandling: "preserve_finished_artwork",
              placement: "bottom_center",
            },
        flagship: false,
        legacy_assets_locked: false,
        publish_status: "draft",
        created_by: userId,
      }),
    }
  );

  if (!created?.[0]) throw new Error("Could not create pre-mint project.");

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lockscreened-studio-data-changed"));
  }

  return { studio, collection: created[0] };
}

export async function listMyStudioCollections(
  session: LockScreenedSession
): Promise<Array<StudioCollectionRow & { claim_status?: string }>> {
  const userId = String(session.user?.id || "");
  if (!userId) return [];

  const [collections, claims] = await Promise.all([
    request<StudioCollectionRow[]>(
      session,
      "collections?created_by=eq." +
        encodeURIComponent(userId) +
        "&select=id,studio_id,slug,name,source_type,source_config,render_mode,render_profile,publish_status,created_at&order=created_at.desc"
    ),
    request<StudioClaimRow[]>(
      session,
      "collection_claims?requested_by=eq." +
        encodeURIComponent(userId) +
        "&select=id,collection_id,status,wallet_address"
    ),
  ]);

  const claimByCollection = new Map(
    (claims || []).map((claim) => [claim.collection_id, claim.status])
  );

  return (collections || []).map((collection) => ({
    ...collection,
    claim_status: claimByCollection.get(collection.id),
  }));
}

export async function saveTraitLayerMap(args: {
  session: LockScreenedSession;
  collectionId: string;
  currentRenderProfile?: any;
  layers: Array<{
    name: string;
    suggestedOrder: number;
    likelyBackground: boolean;
  }>;
}) {
  if (!args.layers.length) throw new Error("No trait layers were detected.");

  const response = await fetch("/api/studio/trait-layer-map", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: "Bearer " + args.session.access_token,
    },
    body: JSON.stringify({
      collectionId: args.collectionId,
      layers: args.layers,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.error || "Trait layer map change was blocked.");
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lockscreened-studio-data-changed"));
  }

  return result.layers || [];
}

export async function upsertTraitAssetMetadata(args: {
  session: LockScreenedSession;
  rows: Array<{
    layer_id: string;
    trait_value: string;
    storage_bucket: string;
    storage_path: string;
    bytes: number;
    mime_type?: string | null;
  }>;
}) {
  const response = await fetch("/api/studio/private-asset-metadata", {
    method: "POST",
    headers: { "content-type": "application/json", Authorization: "Bearer " + args.session.access_token },
    body: JSON.stringify({ kind: "trait", collectionId: args.collectionId, rows: args.rows }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result?.error || "Private asset metadata was blocked.");
  return result.rows || [];
}

export async function saveBackgroundPackageDraft(args: {
  session: LockScreenedSession;
  collectionId: string;
  name: string;
}) {
  const userId = String(args.session.user?.id || "");
  if (!userId) throw new Error("Supabase user ID is missing.");

  const name = String(args.name || "").trim();
  if (!name) throw new Error("Background name is required.");

  const created = await request<any[]>(
    args.session,
    "background_packages?select=id,collection_id,name,source,locked,publish_status,created_at",
    {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        collection_id: args.collectionId,
        name,
        source: "official_creator",
        locked: false,
        publish_status: "draft",
        created_by: userId,
      }),
    }
  );

  if (!created?.[0]) throw new Error("Could not save background package.");

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lockscreened-studio-data-changed"));
  }

  return created[0];
}


export async function getStudioCollection(
  session: LockScreenedSession,
  collectionId: string
) {
  const [collections, claims, layers, backgrounds, mintOverrides, publishedMintOverrides, validationRuns, auditEvents] = await Promise.all([
    request<any[]>(
      session,
      "collections?id=eq." +
        encodeURIComponent(collectionId) +
        "&select=id,studio_id,slug,public_slug,name,source_type,source_config,render_mode,render_profile,public_profile,publish_status,created_at&limit=1"
    ),
    request<any[]>(
      session,
      "collection_claims?collection_id=eq." +
        encodeURIComponent(collectionId) +
        "&select=id,status,wallet_address,evidence,verified_at&limit=1"
    ),
    request<any[]>(
      session,
      "trait_layers?collection_id=eq." +
        encodeURIComponent(collectionId) +
        "&select=id,trait_type,display_name,layer_order,is_background&order=layer_order.asc"
    ),
    request<any[]>(
      session,
      "background_packages?collection_id=eq." +
        encodeURIComponent(collectionId) +
        "&select=id,name,source,locked,publish_status,created_at&order=created_at.desc"
    ),
    request<any[]>(
      session,
      "mint_overrides?collection_id=eq." +
        encodeURIComponent(collectionId) +
        "&select=id,collection_id,asset_id,storage_bucket,storage_path,bytes,notes,created_at&order=created_at.desc"
    ),
    request<any[]>(
      session,
      "published_mint_overrides?collection_id=eq." +
        encodeURIComponent(collectionId) +
        "&select=id,collection_id,asset_id,storage_bucket,storage_path,bytes,mime_type,created_at"
    ),
    request<any[]>(
      session,
      "collection_validation_runs?collection_id=eq." +
        encodeURIComponent(collectionId) +
        "&select=id,status,sampled_nfts,matched_traits,missing_traits,unmapped_metadata,report,checked_at&order=checked_at.desc&limit=1"
    ),
    request<any[]>(
      session,
      "studio_audit_events?collection_id=eq." +
        encodeURIComponent(collectionId) +
        "&select=id,event_type,details,created_at&order=created_at.desc&limit=30"
    ),
  ]);

  const collection = collections?.[0];
  if (!collection) throw new Error("Collection draft was not found.");

  const layerIds = (layers || []).map((layer: any) => layer.id).filter(Boolean);
  let traitAssets: any[] = [];

  if (layerIds.length) {
    const encodedIds = layerIds
      .map((id: string) => `"${String(id).replace(/"/g, "")}"`)
      .join(",");

    traitAssets = await request<any[]>(
      session,
      "trait_assets?layer_id=in.(" +
        encodeURIComponent(encodedIds) +
        ")&select=id,layer_id,trait_value,storage_bucket,storage_path,bytes,mime_type"
    );
  }

  let publishedTraitAssets: any[] = [];
  if (layerIds.length) {
    const encodedIds = layerIds
      .map((id: string) => '"' + String(id).replace(/"/g, "") + '"')
      .join(",");

    publishedTraitAssets = await request<any[]>(
      session,
      "published_trait_assets?layer_id=in.(" +
        encodeURIComponent(encodedIds) +
        ")&select=id,layer_id,trait_value,storage_bucket,storage_path,bytes,mime_type"
    );
  }

  const packageIds = (backgrounds || []).map((item: any) => item.id).filter(Boolean);
  let backgroundSourceAssets: any[] = [];
  let publishedBackgroundAssets: any[] = [];

  if (packageIds.length) {
    const encodedPackageIds = packageIds
      .map((id: string) => '"' + String(id).replace(/"/g, "") + '"')
      .join(",");

    [backgroundSourceAssets, publishedBackgroundAssets] = await Promise.all([
      request<any[]>(
        session,
        "background_source_assets?package_id=in.(" +
          encodeURIComponent(encodedPackageIds) +
          ")&select=id,package_id,device,storage_bucket,storage_path,bytes,mime_type"
      ),
      request<any[]>(
        session,
        "background_assets?package_id=in.(" +
          encodeURIComponent(encodedPackageIds) +
          ")&select=id,package_id,device,storage_bucket,storage_path,bytes,mime_type"
      ),
    ]);
  }

  return {
    collection,
    claim: claims?.[0] || null,
    layers: layers || [],
    traitAssets: traitAssets || [],
    publishedTraitAssets: publishedTraitAssets || [],
    backgrounds: backgrounds || [],
    backgroundSourceAssets: backgroundSourceAssets || [],
    publishedBackgroundAssets: publishedBackgroundAssets || [],
    mintOverrides: mintOverrides || [],
    publishedMintOverrides: publishedMintOverrides || [],
    validationRun: validationRuns?.[0] || null,
    auditEvents: auditEvents || [],
  };
}

export async function publishStudioCollection(args: {
  session: LockScreenedSession;
  collectionId: string;
}) {
  const response = await fetch("/api/studio/publish-project", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: "Bearer " + args.session.access_token,
    },
    body: JSON.stringify({ collectionId: args.collectionId }),
  });

  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result?.error || "Project publishing was blocked.") as Error & {
      needsServerSecret?: boolean;
    };
    error.needsServerSecret = Boolean(result?.needsServerSecret);
    throw error;
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lockscreened-studio-data-changed"));
  }

  return result;
}

export async function upsertBackgroundSourceAssetMetadata(args: {
  session: LockScreenedSession;
  rows: Array<{
    package_id: string;
    device: "phone" | "ipad" | "desktop" | "thumb";
    storage_bucket: string;
    storage_path: string;
    bytes: number;
    mime_type?: string | null;
  }>;
}) {
  const response = await fetch("/api/studio/private-asset-metadata", {
    method: "POST",
    headers: { "content-type": "application/json", Authorization: "Bearer " + args.session.access_token },
    body: JSON.stringify({ kind: "background", collectionId: args.collectionId, rows: args.rows }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result?.error || "Private asset metadata was blocked.");
  return result.rows || [];
}

export async function updateStudioPublicProfile(args: {
  session: LockScreenedSession;
  collectionId: string;
  name: string;
  publicSlug?: string;
  profile: {
    tagline?: string;
    description?: string;
    website?: string;
    marketplace?: string;
    discord?: string;
    x?: string;
  };
}) {
  const response = await fetch("/api/studio/update-public-profile", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: "Bearer " + args.session.access_token,
    },
    body: JSON.stringify({
      collectionId: args.collectionId,
      name: args.name,
      publicSlug: args.publicSlug,
      profile: args.profile,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.error || "Could not save public profile.");
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lockscreened-studio-data-changed"));
  }

  return result;
}


export async function saveTraitLayerConfiguration(args: {
  session: LockScreenedSession;
  collectionId: string;
  layers: Array<{
    id: string;
    trait_type: string;
    display_name: string;
    layer_order: number;
    is_background: boolean;
  }>;
  omitOriginalBackgroundWhenCustom: boolean;
  currentRenderProfile?: any;
}) {
  const response = await fetch("/api/studio/update-render-config", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: "Bearer " + args.session.access_token,
    },
    body: JSON.stringify({
      collectionId: args.collectionId,
      action: "layer_config",
      layers: args.layers,
      omitOriginalBackgroundWhenCustom: args.omitOriginalBackgroundWhenCustom,
    }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result?.error || "Render configuration change was blocked.");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lockscreened-studio-data-changed"));
  }
  return result;
}

export async function upsertMintOverrideMetadata(args: {
  session: LockScreenedSession;
  collectionId: string;
  assetId: string;
  storageBucket: string;
  storagePath: string;
  bytes: number;
  notes?: string;
}) {
  const response = await fetch("/api/studio/private-asset-metadata", {
    method: "POST",
    headers: { "content-type": "application/json", Authorization: "Bearer " + args.session.access_token },
    body: JSON.stringify({ kind: "mint_override", collectionId: args.collectionId, assetId: args.assetId, storageBucket: args.storageBucket, storagePath: args.storagePath, bytes: args.bytes, notes: args.notes }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result?.error || "Private asset metadata was blocked.");
  return result.rows || [];
}

export async function assertCollectionStorageBudget(args: {
  session: LockScreenedSession;
  collectionId: string;
  incomingBytes: number;
}) {
  const data = await getStudioCollection(args.session, args.collectionId);
  const currentBytes =
    (data.traitAssets || []).reduce((sum: number, item: any) => sum + Number(item.bytes || 0), 0) +
    (data.backgroundSourceAssets || []).reduce((sum: number, item: any) => sum + Number(item.bytes || 0), 0) +
    (data.mintOverrides || []).reduce((sum: number, item: any) => sum + Number(item.bytes || 0), 0);

  const hardLimit = 150 * 1024 * 1024;
  const projectedBytes = currentBytes + Math.max(0, Number(args.incomingBytes || 0));

  if (projectedBytes > hardLimit) {
    const mb = (projectedBytes / (1024 * 1024)).toFixed(1);
    throw new Error(
      "This upload would bring the collection to " + mb + " MB of private source art, above the 150 MB beta hard cap."
    );
  }

  return { currentBytes, projectedBytes, hardLimit };
}

export async function updateFinishedArtworkProfile(args: {
  session: LockScreenedSession;
  collectionId: string;
  currentRenderProfile?: any;
  finishedArtwork: {
    extensionStyle: "edge_color" | "gradient" | "blur";
    sampledColor: string;
    artworkScale: number;
    verticalAlign: "top" | "center" | "bottom";
  };
}) {
  const response = await fetch("/api/studio/update-render-config", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: "Bearer " + args.session.access_token,
    },
    body: JSON.stringify({
      collectionId: args.collectionId,
      action: "finished_artwork",
      finishedArtwork: args.finishedArtwork,
    }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result?.error || "Render configuration change was blocked.");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lockscreened-studio-data-changed"));
  }
  return result;
}

export async function updateCollectionRenderPlacement(args: {
  session: LockScreenedSession;
  collectionId: string;
  currentRenderProfile?: any;
  devicePlacement: {
    phone: { scale: number; x: "left" | "center" | "right"; y: "top" | "center" | "bottom" };
    ipad: { scale: number; x: "left" | "center" | "right"; y: "top" | "center" | "bottom" };
    desktop: { scale: number; x: "left" | "center" | "right"; y: "top" | "center" | "bottom" };
  };
}) {
  const response = await fetch("/api/studio/update-render-config", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: "Bearer " + args.session.access_token,
    },
    body: JSON.stringify({
      collectionId: args.collectionId,
      action: "device_placement",
      devicePlacement: args.devicePlacement,
    }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result?.error || "Render configuration change was blocked.");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lockscreened-studio-data-changed"));
  }
  return result;
}

async function changeStudioCollectionLifecycle(args: {
  session: LockScreenedSession;
  collectionId: string;
  action: "unpublish" | "archive" | "restore";
}) {
  const response = await fetch("/api/studio/project-lifecycle", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: "Bearer " + args.session.access_token,
    },
    body: JSON.stringify({
      collectionId: args.collectionId,
      action: args.action,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.error || "Project status change was blocked.");
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lockscreened-studio-data-changed"));
  }

  return result;
}

export async function unpublishStudioCollection(args: {
  session: LockScreenedSession;
  collectionId: string;
}) {
  return changeStudioCollectionLifecycle({ ...args, action: "unpublish" });
}

export async function unpublishBackgroundPackage(args: {
  session: LockScreenedSession;
  packageId: string;
}) {
  const response = await fetch("/api/studio/background-lifecycle", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: "Bearer " + args.session.access_token,
    },
    body: JSON.stringify({
      packageId: args.packageId,
      action: "unpublish",
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.error || "Background unpublishing was blocked.");
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lockscreened-studio-data-changed"));
  }

  return result;
}

export async function archiveStudioCollection(args: {
  session: LockScreenedSession;
  collectionId: string;
}) {
  return changeStudioCollectionLifecycle({ ...args, action: "archive" });
}

export async function restoreStudioCollection(args: {
  session: LockScreenedSession;
  collectionId: string;
}) {
  return changeStudioCollectionLifecycle({ ...args, action: "restore" });
}

