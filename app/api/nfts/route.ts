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
  grouping?: { group_key: "collection" | string; group_value: string }[];
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

function normAddr(v: any) {
  return String(v ?? "").trim().toLowerCase();
}

/** ----- DAS (JSON-RPC) single page fetch ----- */
async function fetchDASPage(
  owner: string,
  endpoint: string,
  page: number,
  limit: number
) {
  const body = {
    jsonrpc: "2.0",
    id: "retrograve-nfts",
    method: "getAssetsByOwner",
    params: { ownerAddress: owner, page, limit },
  };

  return fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

/** ----- Helius REST single page fetch (v0) ----- */
async function fetchRestPage(
  owner: string,
  apiKey: string,
  page: number,
  limit: number
) {
  const url = `${resolveHeliusRestBase()}/v0/addresses/${owner}/nfts?api-key=${apiKey}&pageNumber=${page}&pageSize=${limit}`;
  return fetch(url, { cache: "no-store" });
}

/** ----- Normalize + optional filtering (DAS fields) ----- */
function normalizeAndFilter(
  items: DASAsset[],
  opts: { collectionId?: string; creatorsCsv?: string }
) {
  const collectionId = normAddr((opts?.collectionId || "").trim());
  const creatorsCsv = (opts?.creatorsCsv || "").trim();

  const allowCreators = creatorsCsv
    .split(",")
    .map((s) => normAddr(s))
    .filter(Boolean);

  let inCollectionCount = 0;
  let byCreatorCount = 0;

  const anyFilterActive = !!collectionId || allowCreators.length > 0;

  const filtered = items.filter((a) => {
    const groups = a.grouping || [];
    const hasCollection = collectionId
      ? groups.some(
          (g) =>
            normAddr(g?.group_key) === "collection" &&
            normAddr(g?.group_value) === collectionId
        )
      : false;

    const hasCreator = allowCreators.length
      ? (a.creators || []).some((c) =>
          allowCreators.includes(normAddr(c?.address))
        )
      : false;

    if (hasCollection) inCollectionCount++;
    if (hasCreator) byCreatorCount++;

    return anyFilterActive ? hasCollection || hasCreator : true;
  });

  console.log(
    `Filter debug (DAS): input=${items.length} kept=${filtered.length} (collection matches=${inCollectionCount}, creator matches=${byCreatorCount})`
  );

  return filtered.map((a) => normalizeAsset(a));
}

function normalizeAsset(a: DASAsset) {
  const image =
    a.content?.links?.image ||
    a.content?.files?.[0]?.uri ||
    a.content?.json_uri ||
    null;

  const name = a.name || a.content?.metadata?.name || "";
  const uri = a.content?.json_uri || null;

  return { id: a.id, name, image, uri };
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

/** ----- Small concurrency helper ----- */
async function mapLimit<T, R>(
  list: T[],
  limit: number,
  fn: (item: T, idx: number) => Promise<R>
): Promise<R[]> {
  const out: R[] = new Array(list.length) as any;
  let i = 0;

  async function worker() {
    while (i < list.length) {
      const idx = i++;
      out[idx] = await fn(list[idx], idx);
    }
  }

  const workers = Array.from({ length: Math.min(limit, list.length) }, worker);
  await Promise.all(workers);
  return out;
}

/** ----- Off-chain creator fallback (json_uri -> properties.creators) ----- */
async function offchainCreatorMatch(
  all: DASAsset[],
  allowCreators: string[]
): Promise<DASAsset[]> {
  const allow = new Set(allowCreators.map((x) => normAddr(x)).filter(Boolean));
  if (allow.size === 0) return [];

  // Only try candidates that have a json_uri (metadata url)
  // and look somewhat relevant (name/symbol heuristic) to avoid tons of fetches.
  const candidates = all.filter((a) => {
    const uri = a.content?.json_uri;
    if (!uri) return false;

    const name = normAddr(a.name || a.content?.metadata?.name);
    const sym = normAddr(a.content?.metadata?.symbol);

    // broad heuristic (safe): MONKE / SAGA / etc.
    return (
      name.includes("monke") ||
      name.includes("saga") ||
      sym.includes("monke") ||
      sym.includes("saga")
    );
  });

  console.log(
    `Offchain fallback: candidates=${candidates.length} (will fetch json_uri)`
  );

  const matchedFlags = await mapLimit(
    candidates,
    10, // concurrency cap (safe for serverless)
    async (a) => {
      const url = a.content?.json_uri || "";
      if (!url) return false;

      try {
        const r = await fetch(url, {
          cache: "no-store",
          headers: { "user-agent": "LockscreenedMetaFetcher/1.0" },
        });
        if (!r.ok) return false;

        const json = await r.json().catch(() => null);
        const creators = json?.properties?.creators;

        if (!Array.isArray(creators)) return false;

        // creators: [{address, share}] in your metadata
        const addrs = creators
          .map((c: any) => normAddr(c?.address))
          .filter(Boolean);

        return addrs.some((addr) => allow.has(addr));
      } catch {
        return false;
      }
    }
  );

  const matched = candidates.filter((_, idx) => matchedFlags[idx]);
  console.log(`Offchain fallback: matched=${matched.length}`);
  return matched;
}

/** ----- POST handler ----- */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const owner = body?.owner as string | undefined;

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

    // ✅ Honor collectionId AND collection (back-compat)
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

    console.log("CFG collection:", effectiveCollection || "(none)");
    console.log("CFG creators:", effectiveCreators || "(none)");

    const ALL: DASAsset[] = [];
    const LIMIT = 500;

    let usedRpc = false;
    let lastStatus = 0;

    // ----- DAS RPC -----
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

    // ----- REST fallback -----
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

    // First pass: DAS-native filtering
    let nfts = normalizeAndFilter(ALL, {
      collectionId: effectiveCollection,
      creatorsCsv: effectiveCreators,
    });

    // ✅ Second pass: Off-chain metadata creator fallback
    // Only if:
    // - we asked for creators filtering
    // - and the first pass returned 0
    if (nfts.length === 0 && effectiveCreators.trim()) {
      const allowCreators = effectiveCreators
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const matchedAssets = await offchainCreatorMatch(ALL, allowCreators);
      nfts = matchedAssets.map((a) => normalizeAsset(a));
    }

    // IMPORTANT: keep the same shape { nfts } so existing pages keep working
    return NextResponse.json({ nfts });
  } catch (e) {
    console.error("NFT fetch failed:", e);
    return NextResponse.json(
      { error: "Failed to fetch NFTs" },
      { status: 500 }
    );
  }
}
