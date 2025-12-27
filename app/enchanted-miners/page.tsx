// app/enchanted-miners/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";

type ApiNft = any;

type MinerNft = {
  mint: string;
  name?: string;
  image?: string;
};

const ENCHANTED_MINERS_COLLECTION = "GzhXjRxLXWkzW6vDVyHgbYmqW75xrfh4WvgVKQ8XA1su";

// ✅ Your miners background
const MINERS_BG_IMAGE = "/enchanted-miners-bg.png";
const MINERS_BG_COLOR = "#111827";

function lockerHref(mint: string) {
  const sp = new URLSearchParams();
  sp.set("mint", mint);
  sp.set("project", "miners");
  return `/locker?${sp.toString()}`;
}

// Try to detect the collection address from many possible shapes
function getCollectionCandidates(nft: ApiNft): string[] {
  const out: string[] = [];

  const direct = [
    nft?.collection,
    nft?.collectionMint,
    nft?.collectionAddress,
    nft?.collection_id,
    nft?.collectionId,
    nft?.group_value,
    nft?.groupValue,
    nft?.grouping?.[0]?.group_value,
    nft?.grouping?.[0]?.groupValue,
  ];

  for (const v of direct) {
    if (typeof v === "string" && v.length > 20) out.push(v);
  }

  // Helius-style grouping: [{ group_key: "collection", group_value: "<mint>" }]
  if (Array.isArray(nft?.grouping)) {
    for (const g of nft.grouping) {
      const key = g?.group_key || g?.groupKey;
      const val = g?.group_value || g?.groupValue;
      if (key === "collection" && typeof val === "string") out.push(val);
    }
  }

  // Some APIs: nft?.collection?.address
  const nestedAddr = nft?.collection?.address;
  if (typeof nestedAddr === "string") out.push(nestedAddr);

  return out.filter(Boolean);
}

function parseNftsToMiners(list: ApiNft[]): MinerNft[] {
  return (Array.isArray(list) ? list : [])
    .map((x) => ({
      mint: String(x?.mint || x?.id || x?.tokenMint || x?.token_mint || ""),
      name: x?.name ? String(x.name) : undefined,
      image: x?.image ? String(x.image) : x?.content?.links?.image ? String(x.content.links.image) : undefined,
    }))
    .filter((x) => !!x.mint);
}

export default function EnchantedMinersPage() {
  const { publicKey } = useWallet();
  const owner = publicKey?.toBase58() || "";

  const [miners, setMiners] = useState<MinerNft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gridStyle = useMemo<React.CSSProperties>(
    () => ({
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
      gap: 14,
      marginTop: 18,
    }),
    []
  );

  useEffect(() => {
    if (!owner) {
      setMiners([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchJson(body: any) {
      const r = await fetch("/api/nfts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      });
      if (!r.ok) {
        const msg = await r.text().catch(() => String(r.status));
        throw new Error(msg);
      }
      return r.json();
    }

    async function loadMiners() {
      setLoading(true);
      setError(null);

      try {
        // 1) TRY: server-side filter (fast if supported)
        let data: ApiNft[] = await fetchJson({
          owner,
          collection: ENCHANTED_MINERS_COLLECTION,
        });

        // If API ignores collection filter, it might return [] — fallback
        if (!Array.isArray(data) || data.length === 0) {
          const all = await fetchJson({ owner });

          // Client-side filter using many possible collection shapes
          const filtered = (Array.isArray(all) ? all : []).filter((nft) => {
            const cands = getCollectionCandidates(nft);
            return cands.includes(ENCHANTED_MINERS_COLLECTION);
          });

          data = filtered;
        }

        const parsed = parseNftsToMiners(data);

        if (!cancelled) setMiners(parsed);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load miners");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMiners();

    return () => {
      cancelled = true;
    };
  }, [owner]);

  return (
    <main
      className="miners-wrapper"
      style={{
        minHeight: "100vh",
        padding: "18px 0 80px",

        // ✅ IMPORTANT: offset for fixed nav so content never tucks under it
        marginTop: 64,

        // ✅ Background restored
        backgroundColor: MINERS_BG_COLOR,
        backgroundImage: `url(${MINERS_BG_IMAGE})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 18px" }}>
        <h1 style={{ margin: "8px 0", fontSize: 28, letterSpacing: "0.04em" }}>
          MY MINERS
        </h1>

        <p style={{ margin: 0, opacity: 0.8 }}>
          Showing Enchanted Miners owned by your connected wallet.
        </p>

        <div style={{ height: 14 }} />

        {!owner && (
          <p style={{ opacity: 0.85 }}>Connect your wallet to view your Enchanted Miners.</p>
        )}

        {owner && loading && <p style={{ opacity: 0.85 }}>Loading…</p>}

        {owner && error && <p style={{ opacity: 0.9, color: "#ffb3b3" }}>{error}</p>}

        {owner && !loading && !error && miners.length === 0 && (
          <p style={{ opacity: 0.85 }}>No Enchanted Miners found.</p>
        )}

        {owner && !loading && !error && miners.length > 0 && (
          <div style={gridStyle}>
            {miners.map((nft) => {
              const href = lockerHref(nft.mint);

              return (
                <Link
                  key={nft.mint}
                  href={href}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    border: "1px solid rgba(255,255,255,0.14)",
                    borderRadius: 14,
                    overflow: "hidden",
                    background: "rgba(0,0,0,0.35)",
                  }}
                >
                  <div
                    style={{
                      aspectRatio: "1 / 1",
                      background: "rgba(0,0,0,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {nft.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={nft.image}
                        alt={nft.name || nft.mint}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <span style={{ opacity: 0.75, fontSize: 12 }}>No image</span>
                    )}
                  </div>

                  <div style={{ padding: 10 }}>
                    <div
                      style={{
                        fontSize: 12,
                        opacity: 0.95,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {nft.name || "Enchanted Miner"}
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 11,
                        opacity: 0.65,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {nft.mint}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
