// app/api/nfts/route.ts
import { NextRequest, NextResponse } from "next/server";

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
async function fetchDASPage(owner: string, endpoint: string, page: number, limit: number) {
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
  });
  return resp;
}

/** ----- Helius REST single page fetch (v0) ----- */
async function fetchRestPage(owner: string, apiKey: string, page: number, limit: number) {
  const url = `${resolveHeliusRestBase()}/v0/addresses/${owner}/nfts?api-key=${apiKey}&pageNumber=${page}&pageSize=${limit}`;
  const resp = await fetch(url, { cache: "no-store" });
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
    .map((s) => s.trim().toLowerCase())
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
          allowCreators.includes((c?.address || "").trim().toLowerCase())
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

/** ----- GET all pages from DAS; fall back to REST ----- */
export async function POST(req: NextRequest) {
  try {
    const { owner } = await req.json();
    if (!owner || typeof owner !== "string") {
      return NextResponse.json({ error: "Missing owner" }, { status: 400 });
    }

    const rpcEndpoint = resolveHeliusRpc();
    const apiKey = process.env.HELIUS_API_KEY?.trim() || "";

    if (!rpcEndpoint && !apiKey) {
      return NextResponse.json(
        {
          error:
            "RPC not configured. Set NEXT_PUBLIC_SOLANA_RPC or HELIUS_API_KEY.",
        },
        { status: 500 }
      );
    }

    const COLLECTION_ID = (process.env.NEXT_PUBLIC_COLLECTION_ID || "").trim();
    const CREATOR_ALLOW = (process.env.NEXT_PUBLIC_CREATOR_ALLOWLIST || "").trim();

    console.log("CFG collection:", COLLECTION_ID || "(none)");
    console.log("CFG creators:", CREATOR_ALLOW || "(none)");

    const ALL: DASAsset[] = [];
    const LIMIT = 500;

    let usedRpc = false;
    let lastStatus = 0;

    if (rpcEndpoint) {
      usedRpc = true;
      for (let page = 1; page < 9999; page++) {
        const r = await fetchDASPage(owner, rpcEndpoint, page, LIMIT);
        lastStatus = r.status;
        if (!r.ok) {
          console.error("DAS RPC page error:", page, r.status, await r.text());
          break;
        }
        const j = await r.json();
        const items = (j?.result?.items as DASAsset[]) || [];
        if (!items.length) break;
        ALL.push(...items);
        if (items.length < LIMIT) break;
      }
    }

    if (ALL.length === 0 && apiKey) {
      for (let page = 1; page < 9999; page++) {
        const rr = await fetchRestPage(owner, apiKey, page, LIMIT);
        lastStatus = rr.status;
        if (!rr.ok) {
          console.error("REST page error:", page, rr.status, await rr.text());
          break;
        }
        const json = await rr.json();
        const adapted = adaptHeliusRestToDas(json);
        if (!adapted.length) break;
        ALL.push(...adapted);
        if (adapted.length < LIMIT) break;
      }
    }

    if (ALL.length === 0 && usedRpc && lastStatus === 401) {
      return NextResponse.json(
        { error: "Invalid Helius API key" },
        { status: 401 }
      );
    }

    const nfts = normalizeAndFilter(ALL, {
      collectionId: COLLECTION_ID,
      creatorsCsv: CREATOR_ALLOW,
    });

    return NextResponse.json({ nfts });
  } catch (e) {
    console.error("NFT fetch failed:", e);
    return NextResponse.json({ error: "Failed to fetch NFTs" }, { status: 500 });
  }
}
