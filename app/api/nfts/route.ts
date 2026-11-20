// app/api/nfts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { readBoundedNftMedia } from "../../lib/lockscreened/server/publicNftMedia";

const MAX_REQUEST_BYTES = 16 * 1024;
const PAGE_SIZE = 500;
const MAX_PAGES = 20;
const LOOKUP_TIMEOUT_MS = 15_000;

/** ----- Types ----- */
type DASAsset = {
  id: string;
  content?: {
    links?: { image?: string };
    files?: { uri: string; mime?: string }[];
    json_uri?: string;
    metadata?: { name?: string; symbol?: string };
  };
  grouping?: { group_key: "collection"; group_value: string }[];
  creators?: { address: string; verified?: boolean }[];
  name?: string;
};

/** ----- Config helpers ----- */
function resolveHeliusRpc(): string {
  const full = process.env.NEXT_PUBLIC_SOLANA_RPC?.trim();
  if (full) return full;
  const key = process.env.HELIUS_API_KEY?.trim();
  if (key) return `https://mainnet.helius-rpc.com/?api-key=${key}`;
  return "";
}
function resolveHeliusRestBase() {
  return "https://api.helius.xyz";
}

/** ----- DAS (JSON-RPC) single page fetch ----- */
async function fetchDASPage(
  owner: string,
  endpoint: string,
  page: number,
  limit: number,
  signal: AbortSignal
) {
  const body = {
    jsonrpc: "2.0",
    id: "retrograve-nfts",
    method: "getAssetsByOwner",
    params: { ownerAddress: owner, page, limit },
  };

  const resp = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
    redirect: "error",
    signal,
  });

  return resp;
}

/** ----- Helius REST single page fetch (v0) ----- */
async function fetchRestPage(
  owner: string,
  apiKey: string,
  page: number,
  limit: number,
  signal: AbortSignal
) {
  const query = new URLSearchParams({
    "api-key": apiKey,
    pageNumber: String(page),
    pageSize: String(limit),
  });
  const url = `${resolveHeliusRestBase()}/v0/addresses/${owner}/nfts?${query}`;
  const resp = await fetch(url, { cache: "no-store", redirect: "error", signal });
  return resp;
}

/** ----- Normalize + optional filtering ----- */
function normalizeAndFilter(
  items: DASAsset[],
  opts: { collectionId?: string; creatorsCsv?: string }
) {
  const collectionId = (opts?.collectionId || "").trim();
  const creatorsCsv = (opts?.creatorsCsv || "").trim();

  const allowCreators = creatorsCsv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  let inCollectionCount = 0;
  let byCreatorCount = 0;

  const filtered = items.filter((a) => {
    const groups = a.grouping || [];
    const hasCollection = collectionId
      ? groups.some(
          (g) =>
            g.group_key === "collection" &&
            (g.group_value || "").trim() === collectionId
        )
      : false;

    const hasCreator = allowCreators.length
      ? (a.creators || []).some((c) =>
          allowCreators.includes((c?.address || "").trim())
        )
      : false;

    if (hasCollection) inCollectionCount++;
    if (hasCreator) byCreatorCount++;

    const anyFilterActive = !!collectionId || allowCreators.length > 0;
    return anyFilterActive ? hasCollection || hasCreator : true;
  });

  console.log(
    `Filter debug: input=${items.length} kept=${filtered.length} (inCollection matches=${inCollectionCount}, creator matches=${byCreatorCount})`
  );

  return filtered.map((a) => {
    const image =
      a.content?.links?.image ||
      a.content?.files?.[0]?.uri ||
      a.content?.json_uri ||
      null;

    const name = a.name || a.content?.metadata?.name || "";
    const uri = a.content?.json_uri || null;

    return { id: a.id, name, image, uri };
  });
}

/** ----- Adapt Helius REST item -> DASAsset ----- */
function adaptHeliusRestToDas(rest: any[]): DASAsset[] {
  return (rest || []).map((n: any) => {
    const img =
      n?.offChainData?.image ||
      n?.image ||
      n?.offChainMetadata?.image ||
      n?.onChainMetadata?.metadata?.data?.image ||
      undefined;

    const restCreators: any[] =
      (Array.isArray(n?.creators) ? n.creators : null) ||
      (Array.isArray(n?.onChainMetadata?.metadata?.data?.creators)
        ? n.onChainMetadata.metadata.data.creators
        : []);

    const creators =
      Array.isArray(restCreators)
        ? restCreators
            .map((c: any) => ({
              address: (c?.address || c?.creator || "").toString(),
              verified: !!c?.verified,
            }))
            .filter((c: any) => c.address)
        : [];

    const collectionAddr =
      n?.collection?.address ||
      n?.collection?.key ||
      n?.onChainMetadata?.collection?.address ||
      n?.onChainMetadata?.metadata?.collection?.key ||
      undefined;

    return {
      id: n?.mint || n?.id || "",
      name:
        n?.offChainData?.name ||
        n?.name ||
        n?.onChainMetadata?.metadata?.data?.name ||
        "",
      content: {
        links: { image: img },
        files: Array.isArray(n?.files)
          ? n.files.map((f: any) => ({
              uri: f?.uri || f?.cdn_uri,
              mime: f?.type || "",
            }))
          : undefined,
        json_uri: n?.offChainUrl || n?.metadataUrl,
        metadata: { name: n?.offChainData?.name || n?.name || "" },
      },
      grouping: collectionAddr
        ? [{ group_key: "collection", group_value: String(collectionAddr) }]
        : [],
      creators,
    } as DASAsset;
  });
}

/** ----- POST ----- */
export async function POST(req: NextRequest) {
  const signal = AbortSignal.timeout(LOOKUP_TIMEOUT_MS);
  try {
    let body;
    try {
      const bytes = await readBoundedNftMedia(req, MAX_REQUEST_BYTES);
      body = JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return NextResponse.json({ error: "Invalid NFT lookup request." }, { status: 400 });
    }
    const owner = typeof body?.owner === "string" ? body.owner.trim() : "";
    if (owner.length < 32 || owner.length > 44) {
      return NextResponse.json({ error: "Invalid Solana owner address" }, { status: 400 });
    }
    try {
      if (new PublicKey(owner).toBase58() !== owner) throw new Error("Invalid address");
    } catch {
      return NextResponse.json({ error: "Invalid Solana owner address" }, { status: 400 });
    }

    const rpcEndpoint = resolveHeliusRpc();
    const apiKey = process.env.HELIUS_API_KEY?.trim() || "";

    if (!rpcEndpoint && !apiKey) {
      return NextResponse.json(
        {
          error:
            "NFT lookup is unavailable.",
        },
        { status: 503 }
      );
    }

    // ✅ Accept BOTH keys: collectionId OR collection
    const bodyCollection =
      typeof body.collectionId === "string"
        ? body.collectionId.trim()
        : typeof body.collection === "string"
        ? body.collection.trim()
        : "";

    const bodyCreators =
      Array.isArray(body.creators) && body.creators.length
        ? body.creators.join(",")
        : typeof body.creators === "string"
        ? body.creators
        : "";

    const envCollection =
      (process.env.NEXT_PUBLIC_COLLECTION_ID || "").trim() || "";
    const envCreators =
      (process.env.NEXT_PUBLIC_CREATOR_ALLOWLIST || "").trim() || "";

    const effectiveCollection = (bodyCollection || envCollection).trim();
    const effectiveCreators = (bodyCreators || envCreators).trim();

    const ALL: DASAsset[] = [];
    let walletLimitReached = false;

    let usedRpc = false;
    let lastStatus = 0;

    // ----- DAS RPC -----
    if (rpcEndpoint) {
      usedRpc = true;
      for (let page = 1; page <= MAX_PAGES; page++) {
        const r = await fetchDASPage(owner, rpcEndpoint, page, PAGE_SIZE, signal);
        lastStatus = r.status;

        if (!r.ok) {
          console.error("DAS RPC page error:", page, r.status);
          break;
        }

        const j = await r.json();
        const items = (j?.result?.items as DASAsset[]) || [];
        if (!items.length) break;

        ALL.push(...items);
        if (items.length < PAGE_SIZE) break;
        walletLimitReached = page === MAX_PAGES;
      }
    }

    // ----- REST fallback -----
    if (ALL.length === 0 && apiKey) {
      for (let page = 1; page <= MAX_PAGES; page++) {
        const rr = await fetchRestPage(owner, apiKey, page, PAGE_SIZE, signal);
        lastStatus = rr.status;

        if (!rr.ok) {
          console.error("REST page error:", page, rr.status);
          break;
        }

        const json = await rr.json();
        const adapted = adaptHeliusRestToDas(json);
        if (!adapted.length) break;

        ALL.push(...adapted);
        if (adapted.length < PAGE_SIZE) break;
        walletLimitReached = page === MAX_PAGES;
      }
    }

    if (ALL.length === 0 && usedRpc && lastStatus === 401) {
      return NextResponse.json(
        { error: "NFT lookup is temporarily unavailable." },
        { status: 502 }
      );
    }

    if (walletLimitReached) {
      return NextResponse.json({ error: "Wallet contains too many NFTs for a single lookup." }, { status: 422 });
    }

    const nfts = normalizeAndFilter(ALL, {
      collectionId: effectiveCollection,
      creatorsCsv: effectiveCreators,
    });
    return NextResponse.json({ nfts });
  } catch {
    if (signal.aborted) {
      return NextResponse.json({ error: "NFT lookup timed out." }, { status: 504 });
    }
    console.error("NFT fetch failed");
    return NextResponse.json({ error: "Failed to fetch NFTs" }, { status: 500 });
  }
}