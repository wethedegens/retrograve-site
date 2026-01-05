// app/saga-monkes-nfts/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import NftGrid, { NFT } from "../components/NftGrid";

const SAGAMONKES_COLLECTION_ID = "HCwFN2CpdwPbfRUFerVUWaYhtV7J587X9cEuZ3Cn8Hst";
const SAGAMONKES_BG_IMAGE = "/saga-monkes-bg-nfts.jpg";

/**
 * Pull possible collection-ish identifiers off whatever shape your indexer returns.
 * (We keep this flexible because different indexers serialize differently.)
 */
function getPossibleCollectionIds(nft: any): string[] {
  const vals: any[] = [
    nft?.collection,
    nft?.collectionId,
    nft?.collection_id,
    nft?.collectionMint,
    nft?.collectionMintAddress,
    nft?.collectionAddress,
    nft?.collection?.id,
    nft?.collection?.mint,
    nft?.collection?.address,
    nft?.grouping?.[0]?.group_value,
    nft?.grouping?.[0]?.groupValue,
    nft?.grouping?.[0]?.value,
  ];

  const out: string[] = [];
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) out.push(v.trim());
  }
  return Array.from(new Set(out));
}

function isSagaMonkeLoose(nft: any) {
  const name = String(nft?.name || "").toLowerCase();
  const symbol = String(nft?.symbol || "").toLowerCase();

  // ✅ name/symbol heuristics (covers cases where indexer doesn't attach collectionId correctly)
  if (name.includes("sagamonke")) return true;
  if (name.includes("saga monke")) return true;
  if (name.includes("saga")) return true;
  if (symbol.includes("saga")) return true;

  // ✅ check any collection-ish id fields
  const ids = getPossibleCollectionIds(nft).map((s) => s.toLowerCase());
  if (ids.includes(SAGAMONKES_COLLECTION_ID.toLowerCase())) return true;

  return false;
}

type FetchResp = any;

export default function SagaMonkesNftsPage() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();

  const [allNfts, setAllNfts] = useState<NFT[]>([]);
  const [items, setItems] = useState<NFT[]>([]);
  const [usedFallback, setUsedFallback] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const owner = useMemo(() => publicKey?.toBase58() || "", [publicKey]);

  async function fetchNfts(body: any): Promise<NFT[]> {
    const r = await fetch("/api/nfts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data: FetchResp = await r.json().catch(() => null);

    if (!r.ok) {
      const msg =
        (data && (data.error || data.message)) ||
        (typeof data === "string" ? data : "") ||
        `Request failed (${r.status})`;
      throw new Error(msg);
    }

    const list: NFT[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.nfts)
      ? data.nfts
      : [];

    return list;
  }

  async function load() {
    if (!owner) return;

    setLoading(true);
    setError(null);
    setUsedFallback(false);

    try {
      // 1) Try strict collection filter first (fast when it works)
      const strictBody: any = {
        owner,
        collection: SAGAMONKES_COLLECTION_ID,
        collectionId: SAGAMONKES_COLLECTION_ID,
      };

      const strictList = await fetchNfts(strictBody);

      if (strictList.length > 0) {
        setAllNfts(strictList);
        setItems(strictList);
        setUsedFallback(false);
        return;
      }

      // 2) Fallback: fetch ALL NFTs and filter locally
      const all = await fetchNfts({ owner });

      const filtered = (all || []).filter((n) => isSagaMonkeLoose(n as any));

      setAllNfts(all);
      setItems(filtered);
      setUsedFallback(true);
    } catch (e: any) {
      setError(e?.message || "Failed to load SagaMonkes");
      setAllNfts([]);
      setItems([]);
      setUsedFallback(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!owner) {
      setAllNfts([]);
      setItems([]);
      setError(null);
      setLoading(false);
      setUsedFallback(false);
      return;
    }
    let cancelled = false;

    (async () => {
      if (cancelled) return;
      await load();
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner]);

  const expected = SAGAMONKES_COLLECTION_ID;
  const walletShort = owner ? `${owner.slice(0, 4)}…${owner.slice(-4)}` : "";

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "18px 0 80px",
        paddingTop: 64,
        backgroundImage: `url(${SAGAMONKES_BG_IMAGE})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 18px" }}>
        {!connected ? (
          <div
            style={{
              minHeight: "calc(100vh - 64px - 98px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "40px 0",
            }}
          >
            <div
              style={{
                maxWidth: 520,
                padding: "22px 18px",
                borderRadius: 18,
                background: "rgba(10, 10, 14, 0.62)",
                border: "1px solid rgba(255,255,255,0.16)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 18px 40px rgba(0,0,0,0.55)",
              }}
            >
              <h1
                style={{
                  margin: "0 0 10px",
                  fontSize: 28,
                  letterSpacing: "0.04em",
                  color: "rgba(255,255,255,0.95)",
                }}
              >
                SAGAMONKES
              </h1>

              <p
                style={{
                  margin: "0 0 14px",
                  opacity: 0.9,
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,0.86)",
                }}
              >
                Connect your wallet to view your SagaMonkes, then tap one to open
                it in the locker and export wallpapers.
              </p>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <WalletMultiButton />
              </div>

              <p
                style={{
                  margin: "12px 0 0",
                  opacity: 0.65,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                Your wallet is only used to read your NFTs — nothing can be moved
                or signed without your approval.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "inline-block",
                padding: "12px 14px",
                borderRadius: 16,
                background: "rgba(10, 10, 14, 0.62)",
                border: "1px solid rgba(255,255,255,0.16)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 18px 40px rgba(0,0,0,0.55)",
              }}
            >
              <h1
                style={{
                  margin: "0 0 6px",
                  fontSize: 28,
                  letterSpacing: "0.04em",
                  color: "rgba(255,255,255,0.95)",
                }}
              >
                MY SAGAMONKES
              </h1>

              <p style={{ margin: 0, opacity: 0.85, color: "rgba(255,255,255,0.86)" }}>
                Showing SagaMonkes owned by your connected wallet ({walletShort}).
              </p>

              {usedFallback && (
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 12,
                    opacity: 0.75,
                    color: "rgba(255,255,255,0.82)",
                  }}
                >
                  (Fallback mode) No SagaMonkes matched the strict collection filter in the indexer response —
                  we’re filtering your wallet NFTs locally.
                </p>
              )}
            </div>

            <div style={{ height: 16 }} />

            {loading && <p style={{ opacity: 0.9, color: "rgba(255,255,255,0.95)" }}>Loading…</p>}

            {error && <p style={{ opacity: 0.95, color: "#ffb3b3" }}>{error}</p>}

            {!loading && !error && items.length === 0 && (
              <div
                style={{
                  maxWidth: 760,
                  padding: "16px 16px",
                  borderRadius: 18,
                  background: "rgba(10, 10, 14, 0.70)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 18px 40px rgba(0,0,0,0.60)",
                }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.10)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 16,
                    }}
                  >
                    🔍
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 900,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        fontSize: 12,
                        color: "rgba(255,255,255,0.95)",
                      }}
                    >
                      NO SAGAMONKES FOUND
                    </div>

                    <p style={{ margin: "6px 0 0", opacity: 0.9, color: "rgba(255,255,255,0.86)" }}>
                      If you’re sure you own one, it may be labeled differently by the indexer.
                    </p>

                    <div style={{ marginTop: 10, fontSize: 12, opacity: 0.85, color: "rgba(255,255,255,0.86)" }}>
                      <div>Wallet: {owner || "-"}</div>
                      <div>Expected collection ID: {expected}</div>
                      <div>Wallet NFT count (raw): {allNfts.length}</div>
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                      <button
                        type="button"
                        onClick={() => load()}
                        style={{
                          height: 34,
                          padding: "0 12px",
                          borderRadius: 999,
                          border: "1px solid rgba(255,255,255,0.20)",
                          background: "rgba(255,255,255,0.10)",
                          color: "rgba(255,255,255,0.92)",
                          fontWeight: 900,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          cursor: "pointer",
                        }}
                      >
                        Refresh
                      </button>

                      <a
                        href={`https://magiceden.io/u/${owner}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          height: 34,
                          padding: "0 12px",
                          borderRadius: 999,
                          background: "#ff3fb4",
                          color: "#151019",
                          fontWeight: 900,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textDecoration: "none",
                          boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
                        }}
                      >
                        View on Magic Eden
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && items.length > 0 && (
              <NftGrid
                nfts={items}
                onPick={(nft) => {
                  const mint = nft.id || "";
                  const uri = nft.uri ? encodeURIComponent(nft.uri) : "";

                  // NOTE: your locker currently supports:
                  // "magapixel" | "miners" | "gainz" | "midevils" | "meowga" | "zeromonkebiz"
                  // If you want SagaMonkes backgrounds + routing, we’ll add "sagamonkes" next.
                  router.push(`/locker?mint=${mint}${uri ? `&uri=${uri}` : ""}&project=miners`);
                }}
              />
            )}
          </>
        )}
      </section>
    </main>
  );
}
