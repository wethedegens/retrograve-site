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

export async function createPendingCollectionClaim(args: {
  session: LockScreenedSession;
  collectionAddress: string;
  collectionName: string;
  walletAddress: string;
}) {
  const { session, collectionAddress, collectionName, walletAddress } = args;
  const userId = String(session.user?.id || "");
  if (!userId) throw new Error("Supabase user ID is missing.");

  const studio = await ensurePersonalStudio(session);
  const slug = collectionSlug(collectionAddress);

  let collections = await request<any[]>(
    session,
    "collections?slug=eq." +
      encodeURIComponent(slug) +
      "&select=id,studio_id,name,publish_status&limit=1"
  );

  if (!collections?.[0]) {
    collections = await request<any[]>(
      session,
      "collections?select=id,studio_id,name,publish_status",
      {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          studio_id: studio.id,
          slug,
          name: collectionName || "Solana Collection",
          source_type: "solana_collection",
          source_config: { collectionIds: [collectionAddress] },
          render_mode: "curated_composite",
          render_profile: {},
          flagship: false,
          legacy_assets_locked: false,
          publish_status: "draft",
          created_by: userId,
        }),
      }
    );
  }

  const collection = collections?.[0];
  if (!collection) throw new Error("Could not create collection draft.");

  const existingClaims = await request<any[]>(
    session,
    "collection_claims?collection_id=eq." +
      encodeURIComponent(collection.id) +
      "&requested_by=eq." +
      encodeURIComponent(userId) +
      "&select=id,status,wallet_address&limit=1"
  );

  if (existingClaims?.[0]) {
    return { studio, collection, claim: existingClaims[0], created: false };
  }

  const claims = await request<any[]>(
    session,
    "collection_claims?select=id,status,wallet_address",
    {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        collection_id: collection.id,
        requested_by: userId,
        wallet_address: walletAddress,
        status: "pending",
        evidence: [],
        authority_snapshot: {},
      }),
    }
  );

  if (!claims?.[0]) throw new Error("Could not create claim request.");

  return { studio, collection, claim: claims[0], created: true };
}


export type StudioCollectionRow = {
  id: string;
  studio_id: string;
  slug: string;
  name: string;
  source_type: string;
  render_mode: string;
  publish_status: "draft" | "published" | "archived";
  created_at?: string;
};

export type StudioClaimRow = {
  id: string;
  collection_id: string;
  status: "pending" | "verified" | "rejected" | "manual_review";
  wallet_address: string;
};

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
        "&select=id,studio_id,slug,name,source_type,render_mode,publish_status,created_at&order=created_at.desc"
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
  layers: Array<{
    name: string;
    suggestedOrder: number;
    likelyBackground: boolean;
  }>;
}) {
  const rows = args.layers.map((layer) => ({
    collection_id: args.collectionId,
    trait_type: layer.name,
    display_name: layer.name,
    layer_order: layer.suggestedOrder,
    is_background: layer.likelyBackground,
  }));

  if (!rows.length) throw new Error("No trait layers were detected.");

  const savedLayers = await request<any[]>(
    args.session,
    "trait_layers?on_conflict=collection_id,trait_type&select=id,trait_type,display_name,layer_order,is_background",
    {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(rows),
    }
  );

  await request<void>(
    args.session,
    "collections?id=eq." + encodeURIComponent(args.collectionId),
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        render_mode: "layered_traits",
        render_profile: {
          engine: "universal_trait_engine",
          backgroundHandling: "creator_designated",
        },
      }),
    }
  );

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lockscreened-studio-data-changed"));
  }

  return savedLayers || [];
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
  if (!args.rows.length) return [];

  return await request<any[]>(
    args.session,
    "trait_assets?on_conflict=layer_id,trait_value&select=id,layer_id,trait_value,storage_bucket,storage_path,bytes,mime_type",
    {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(args.rows),
    }
  );
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
  await request<void>(
    args.session,
    "collections?id=eq." + encodeURIComponent(args.collectionId),
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ publish_status: "published" }),
    }
  );

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lockscreened-studio-data-changed"));
  }
}

export async function publishBackgroundPackage(args: {
  session: LockScreenedSession;
  packageId: string;
}) {
  await request<void>(
    args.session,
    "background_packages?id=eq." + encodeURIComponent(args.packageId),
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ publish_status: "published" }),
    }
  );

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lockscreened-studio-data-changed"));
  }
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
  if (!args.rows.length) return [];

  return await request<any[]>(
    args.session,
    "background_source_assets?on_conflict=package_id,device&select=id,package_id,device,storage_bucket,storage_path,bytes,mime_type",
    {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(args.rows),
    }
  );
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
  const safeUrl = (value?: string) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try {
      const url = new URL(raw);
      return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
    } catch {
      return "";
    }
  };

  const publicSlug = String(args.publicSlug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  const profile = {
    tagline: String(args.profile.tagline || "").trim().slice(0, 160),
    description: String(args.profile.description || "").trim().slice(0, 1200),
    website: safeUrl(args.profile.website),
    marketplace: safeUrl(args.profile.marketplace),
    discord: safeUrl(args.profile.discord),
    x: safeUrl(args.profile.x),
  };

  await request<void>(args.session, "collections?id=eq." + encodeURIComponent(args.collectionId), {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      name: String(args.name || "").trim().slice(0, 120),
      public_slug: publicSlug || null,
      public_profile: profile,
    }),
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lockscreened-studio-data-changed"));
  }
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
  for (const layer of args.layers) {
    await request<void>(
      args.session,
      "trait_layers?id=eq." + encodeURIComponent(layer.id),
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          display_name: layer.display_name,
          layer_order: layer.layer_order,
          is_background: layer.is_background,
        }),
      }
    );
  }

  await request<void>(
    args.session,
    "collections?id=eq." + encodeURIComponent(args.collectionId),
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        render_mode: "layered_traits",
        render_profile: {
          ...(args.currentRenderProfile || {}),
          engine: "universal_trait_engine",
          backgroundHandling: args.omitOriginalBackgroundWhenCustom
            ? "omit_original_when_custom"
            : "keep_original_background",
        },
      }),
    }
  );

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lockscreened-studio-data-changed"));
  }
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
  return await request<any[]>(
    args.session,
    "mint_overrides?on_conflict=collection_id,asset_id&select=id,collection_id,asset_id,storage_bucket,storage_path,bytes,notes,created_at",
    {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify([
        {
          collection_id: args.collectionId,
          asset_id: String(args.assetId || "").trim(),
          storage_bucket: args.storageBucket,
          storage_path: args.storagePath,
          bytes: args.bytes,
          notes: String(args.notes || "").trim().slice(0, 500),
        },
      ]),
    }
  );
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
  await request<void>(
    args.session,
    "collections?id=eq." + encodeURIComponent(args.collectionId),
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        render_profile: {
          ...(args.currentRenderProfile || {}),
          engine: "universal_trait_engine",
          devicePlacement: args.devicePlacement,
        },
      }),
    }
  );

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lockscreened-studio-data-changed"));
  }
}


export async function unpublishStudioCollection(args: {
  session: LockScreenedSession;
  collectionId: string;
}) {
  await request<void>(
    args.session,
    "collections?id=eq." + encodeURIComponent(args.collectionId),
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ publish_status: "draft" }),
    }
  );

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lockscreened-studio-data-changed"));
  }
}

export async function unpublishBackgroundPackage(args: {
  session: LockScreenedSession;
  packageId: string;
}) {
  await request<void>(
    args.session,
    "background_packages?id=eq." + encodeURIComponent(args.packageId),
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ publish_status: "draft" }),
    }
  );

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lockscreened-studio-data-changed"));
  }
}


export async function archiveStudioCollection(args: {
  session: LockScreenedSession;
  collectionId: string;
}) {
  await request<void>(
    args.session,
    "collections?id=eq." + encodeURIComponent(args.collectionId),
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ publish_status: "archived" }),
    }
  );

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lockscreened-studio-data-changed"));
  }
}

export async function restoreStudioCollection(args: {
  session: LockScreenedSession;
  collectionId: string;
}) {
  await request<void>(
    args.session,
    "collections?id=eq." + encodeURIComponent(args.collectionId),
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ publish_status: "draft" }),
    }
  );

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lockscreened-studio-data-changed"));
  }
}
