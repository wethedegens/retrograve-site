// app/lib/lockscreened/server/heliusAuthority.ts
//
// Server-only authority inspection foundation for collection claiming.
// This module intentionally does not expose an API route yet. Claim inspection
// should only become public after Studio authentication/rate limiting exists.

import { withHeliusCache } from "./heliusCache";

export type HeliusAuthority = {
  address: string;
  scopes: string[];
};

export type HeliusCreator = {
  address: string;
  verified: boolean;
  share?: number;
};

export type CollectionAuthoritySnapshot = {
  assetId: string;
  name: string;
  authorities: HeliusAuthority[];
  verifiedCreators: HeliusCreator[];
  allCreators: HeliusCreator[];
  grouping: Array<{ group_key?: string; group_value?: string }>;
  mutable?: boolean;
};

function heliusRpcUrl() {
  const key = process.env.HELIUS_API_KEY?.trim();
  if (!key) throw new Error("HELIUS_API_KEY is not configured.");
  return `https://mainnet.helius-rpc.com/?api-key=${encodeURIComponent(key)}`;
}

export async function inspectCollectionAuthority(
  collectionAssetId: string
): Promise<CollectionAuthoritySnapshot> {
  const id = String(collectionAssetId || "").trim();
  if (!id) throw new Error("Collection asset ID is required.");

  return withHeliusCache(
    "authority:" + id,
    60_000,
    async () => {
      const response = await fetch(heliusRpcUrl(), {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "lockscreened-collection-authority",
          method: "getAsset",
          params: { id },
        }),
      });

      if (!response.ok) {
        throw new Error("Helius authority lookup failed (" + response.status + ").");
      }

      const payload = await response.json();
      if (payload?.error) {
        throw new Error(
          payload.error?.message || "Helius could not inspect this collection."
        );
      }

      const asset = payload?.result;
      if (!asset?.id) {
        throw new Error("No collection asset was returned by Helius.");
      }

  const authorities: HeliusAuthority[] = Array.isArray(asset.authorities)
    ? asset.authorities
        .filter((item: any) => item?.address)
        .map((item: any) => ({
          address: String(item.address),
          scopes: Array.isArray(item.scopes)
            ? item.scopes.map((scope: any) => String(scope))
            : [],
        }))
    : [];

  const allCreators: HeliusCreator[] = Array.isArray(asset.creators)
    ? asset.creators
        .filter((item: any) => item?.address)
        .map((item: any) => ({
          address: String(item.address),
          verified: Boolean(item.verified),
          share:
            typeof item.share === "number" ? Number(item.share) : undefined,
        }))
    : [];

      return {
        assetId: String(asset.id),
        name: String(asset?.content?.metadata?.name || "Collection"),
        authorities,
        verifiedCreators: allCreators.filter((creator) => creator.verified),
        allCreators,
        grouping: Array.isArray(asset.grouping) ? asset.grouping : [],
        mutable:
          typeof asset.mutable === "boolean" ? Boolean(asset.mutable) : undefined,
      };
    }
  );
}

export function walletHasAuthorityEvidence(
  walletAddress: string,
  snapshot: CollectionAuthoritySnapshot
) {
  const wallet = String(walletAddress || "").trim();
  if (!wallet) return { allowed: false, evidence: [] as string[] };

  const evidence: string[] = [];

  if (snapshot.authorities.some((authority) => authority.address === wallet)) {
    evidence.push("collection_authority");
  }

  if (
    snapshot.verifiedCreators.some((creator) => creator.address === wallet)
  ) {
    evidence.push("verified_creator");
  }

  return {
    allowed: evidence.length > 0,
    evidence,
  };
}
