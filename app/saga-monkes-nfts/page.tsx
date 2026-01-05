// app/saga-monkes-nfts/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import NftGrid, { NFT } from "../components/NftGrid";

const SAGAMONKES_COLLECTION_ID = "HCwFN2CpdwPbfRUFerVUWaYhtV7J587X9cEuZ3Cn8Hst";
const SAGAMONKES_BG_IMAGE = "/saga-monkes-bg-nfts.jpg";

// Optional: where you want “Collect now” to go
const SAGAMONKES_COLLECT_URL = "https://magiceden.us/marketplace/sagamonkes";

function shortAddr(a: string) {
  if (!a) return "";
  if (a.length <= 10) return a;
  return `${a.slice(0, 4)}…${a.slice(-4)}`;
}

/**
 * Try to match a SagaMonkes NFT from a “full wallet” list, even if the API’s
 * server-side collection filter didn’t catch it.
 *
 * Different indexers return different shapes. We check a bunch of common fields:
 * - collectionId / collection / collectionMint / collectionAddress / collection_address
 * - grouping arrays like [{ group_key: "collection", group_value: "..." }]
 */
function looksLikeSagaMonkes(nft: any) {
  const target = (SAGAMONKES_COLLECTION_ID || "").trim();

  const direct =
    nft?.collectionId ||
    nft?.collection ||
    nft?.collectionMint ||
    nft?.collectionAddress ||
    nft?.collection_address ||
    nft?.collection_id;

  if (typeof direct === "string" && direct.trim() === target) return true;

  const grouping = nft?.grouping;
  if (Array.isArray(grouping)) {
    for (const g of grouping) {
      const key = g?.group_key || g?.key || g?.groupKey;
      const val = g?.group_value || g?.value || g?.groupValue;
      if (
        typeof key === "string" &&
        typeof val === "string" &&
        key.toLowerCase() === "collection" &&
        val.trim() === target
      ) {
        return true;
      }
    }
  }

  // Last resort heuristics (safe-ish):
  const name = typeof nft?.name === "string" ? nft.name.toLowerCase() : "";
  if (name.includes("sagamonke") || name.includes("saga monke")) return true;

  return false;
}

export default function SagaMonkesNftsPage() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();

  const owner = useMemo(() => publicKey?.toBase58() || "", [publicKey]);

  const [items, setItems] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 👀 Helpful debug text shown only when connected
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (!owner) {
      setItems([]);
      setError(null);
      setNote(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchNfts(body: any) {
      const r = await fetch("/api/nfts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      });

      const data = await r.json().catch(() => null);

      if (!r.ok) {
        const msg =
          (data && (data.error || data.message)) ||
          (typeof data === "string" ? data : "") ||
          `Request failed (${r.status})`;
        throw new Error(msg);
      }

      const list: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.nfts)
        ? data.nfts
        : [];

      return list;
    }

    async function load() {
      setLoading(true);
      setError(null);
      setNote(null);

      try {
        // 1) First try: server-side collection filter (like MEOWGA)
        const filteredBody: any = { owner };
        const collection = SAGAMONKES_COLLECTION_ID.trim();
        if (collection.length > 0) {
          filteredBody.collection = collection;
          filteredBody.collectionId = collection;
        }

        const filtered = await fetchNfts(filteredBody);

        if (cancelled) return;

        if (filtered.length > 0) {
          setItems(filtered as NFT[]);
          setNote(null);
          return;
        }

        // 2) Fallback: fetch ALL wallet NFTs, then match client-side.
        // This fixes cases where the API expects a different param name/shape for “collection”.
        const all = await fetchNfts({ owner });

        if (cancelled) return;

        const matched = all.filter(looksLikeSagaMonkes);

        if (matched.length > 0) {
          setItems(matched as NFT[]);
          setNote(
            "Found SagaMonkes via fallback scan (your wallet has them, but the collection filter didn’t match the indexer response)."
          );
          return;
        }

        // Nothing matched either way
        setItems([]);
        setNote(
          "No SagaMonkes matched the collection ID in the indexer response. If you’re sure you own one, we should confirm its collection address / how the API is labeling it."
        );
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Failed to load SagaMonkes");
          setItems([]);
          setNote(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [owner]);

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
            {/* Header card */}
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

              <p style={{ margin: 0, opacity: 0.82, color: "rgba(255,255,255,0.88)" }}>
                Showing SagaMonkes owned by your connected wallet ({shortAddr(owner)}).
              </p>

              {note && (
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 12,
                    lineHeight: 1.35,
                    color: "rgba(255,255,255,0.80)",
                    opacity: 0.95,
                  }}
                >
                  {note}
                </p>
              )}
            </div>

            <div style={{ height: 16 }} />

            {loading && (
              <p style={{ opacity: 0.92, color: "rgba(255,255,255,0.92)" }}>Loading...</p>
            )}

            {error && (
              <div
                style={{
                  marginTop: 10,
                  padding: "14px 14px",
                  borderRadius: 16,
                  background: "rgba(120, 0, 0, 0.35)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 18px 40px rgba(0,0,0,0.55)",
                  color: "#ffd0d0",
                  maxWidth: 760,
                }}
              >
                <div style={{ fontWeight: 900, letterSpacing: "0.06em" }}>ERROR</div>
                <div style={{ marginTop: 6, opacity: 0.95 }}>{error}</div>
              </div>
            )}

            {/* ✅ POPPING empty state */}
            {!loading && !error && items.length === 0 && (
              <div
                style={{
                  marginTop: 18,
                  maxWidth: 760,
                  padding: "18px 16px",
                  borderRadius: 18,
                  background: "rgba(10, 10, 14, 0.70)",
                  border: "1px solid rgba(255,255,255,0.20)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 24px 60px rgba(0,0,0,0.60)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      display: "grid",
                      placeItems: "center",
                      background: "rgba(255,255,255,0.10)",
                      border: "1px solid rgba(255,255,255,0.20)",
                      fontSize: 20,
                    }}
                  >
                    🔍
                  </div>

                  <div>
                    <div
                      style={{
                        fontWeight: 900,
                        fontSize: 14,
                        letterSpacing: "0.10em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.95)",
                      }}
                    >
                      No SagaMonkes found
                    </div>
                    <div style={{ marginTop: 4, color: "rgba(255,255,255,0.80)", fontSize: 12 }}>
                      If you’re sure you own one, it may be labeled differently by the indexer.
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.78)",
                    lineHeight: 1.45,
                  }}
                >
                  <div>
                    Wallet: <span style={{ color: "rgba(255,255,255,0.92)" }}>{owner}</span>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    Expected collection ID:{" "}
                    <span style={{ color: "rgba(255,255,255,0.92)" }}>
                      {SAGAMONKES_COLLECTION_ID}
                    </span>
                  </div>
                </div>

                <div style={{ height: 12 }} />

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    style={{
                      height: 36,
                      padding: "0 14px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.22)",
                      background: "rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.92)",
                      fontWeight: 900,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                  >
                    Refresh
                  </button>

                  <a
                    href={SAGAMONKES_COLLECT_URL}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      height: 36,
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "0 14px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.22)",
                      background: "rgba(255, 63, 180, 0.90)",
                      color: "#140b18",
                      fontWeight: 900,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      textDecoration: "none",
                      cursor: "pointer",
                    }}
                  >
                    View on Magic Eden
                  </a>
                </div>
              </div>
            )}

            {!loading && !error && items.length > 0 && (
              <NftGrid
                nfts={items}
                onPick={(nft) => {
                  const mint = nft.id || "";
                  const uri = (nft as any)?.uri ? encodeURIComponent((nft as any).uri) : "";
                  router.push(
                    `/locker?mint=${mint}${uri ? `&uri=${uri}` : ""}&project=sagamonkes`
                  );
                }}
              />
            )}
          </>
        )}
      </section>
    </main>
  );
}
