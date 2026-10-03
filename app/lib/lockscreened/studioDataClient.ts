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
