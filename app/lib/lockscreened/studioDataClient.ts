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
  const [collections, claims, layers, backgrounds] = await Promise.all([
    request<any[]>(
      session,
      "collections?id=eq." +
        encodeURIComponent(collectionId) +
        "&select=id,studio_id,slug,name,source_type,source_config,render_mode,render_profile,publish_status,created_at&limit=1"
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
  ]);

  const collection = collections?.[0];
  if (!collection) throw new Error("Collection draft was not found.");

  return {
    collection,
    claim: claims?.[0] || null,
    layers: layers || [],
    backgrounds: backgrounds || [],
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
