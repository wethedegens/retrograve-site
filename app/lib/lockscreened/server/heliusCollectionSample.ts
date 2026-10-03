// app/lib/lockscreened/server/heliusCollectionSample.ts
export type CollectionSampleAsset = {
  id: string;
  name: string;
  image?: string;
  attributes: Array<{
    trait_type?: string;
    value?: string | number | null;
  }>;
};

function heliusRpcUrl() {
  const key = process.env.HELIUS_API_KEY?.trim();
  if (!key) throw new Error("HELIUS_API_KEY is not configured.");
  return `https://mainnet.helius-rpc.com/?api-key=${encodeURIComponent(key)}`;
}

export async function getCollectionValidationSample(
  collectionAddress: string,
  limit = 12
): Promise<CollectionSampleAsset[]> {
  const address = String(collectionAddress || "").trim();
  if (!address) throw new Error("Collection address is required.");

  const safeLimit = Math.max(1, Math.min(20, Math.floor(limit || 12)));

  const response = await fetch(heliusRpcUrl(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "lockscreened-validation-sample",
      method: "getAssetsByGroup",
      params: {
        groupKey: "collection",
        groupValue: address,
        page: 1,
        limit: safeLimit,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Helius collection sample failed (${response.status}).`);
  }

  const payload = await response.json();
  if (payload?.error) {
    throw new Error(
      payload.error?.message || "Helius could not load collection assets."
    );
  }

  const items = Array.isArray(payload?.result?.items)
    ? payload.result.items
    : [];

  return items.map((asset: any) => ({
    id: String(asset?.id || ""),
    name: String(asset?.content?.metadata?.name || asset?.id || "NFT"),
    image:
      asset?.content?.links?.image ||
      asset?.content?.files?.[0]?.uri ||
      undefined,
    attributes: Array.isArray(asset?.content?.metadata?.attributes)
      ? asset.content.metadata.attributes
      : [],
  }));
}
