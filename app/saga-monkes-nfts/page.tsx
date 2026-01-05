// app/saga-monkes-nfts/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import NftGrid, { NFT } from "../components/NftGrid";

const SAGAMONKES_COLLECTION_ID = "HCwFN2CpdwPbfRUFerVUWaYhtV7J587X9cEuZ3Cn8Hst";
const SAGAMONKES_BG_IMAGE = "/saga-monkes-bg-nfts.jpg";

// Magic Eden collection page (optional but helpful)
const MAGICEDEN_COLLECTION_URL = "https://magiceden.us/marketplace/saga_monkes";

function safeLower(v: any) {
  return String(v ?? "").toLowerCase();
}

// Try to match SagaMonkes even if the indexer labels fields differently
function isSagaMonkes(nft: any) {
  const name = safeLower(nft?.name);
  const symbol = safeLower(nft?.symbol);
  const collection = safeLower(nft?.collection);
  const collectionId = safeLower(nft?.collectionId);
  const collectionAddress = safeLower(nft?.collectionAddress);
  const group = safeLower(nft?.group);
  const grouping = safeLower(nft?.grouping);

  const updateAuthority = safeLower(nft?.updateAuthority);
  const creators = Array.isArray(nft?.creators) ? nft.creators : [];
  const creatorAddrs = creators.map((c: any) => safeLower(c?.address || c)).join(" ");

  const metaCollectionKey =
    safeLower(nft?.metadata?.collection?.key) ||
    safeLower(nft?.metadata?.collection?.address) ||
    safeLower(nft?.raw?.collection?.key);

  const idHits =
    collectionId === safeLower(SAGAMONKES_COLLECTION_ID) ||
    collection === safeLower(SAGAMONKES_COLLECTION_ID) ||
    collectionAddress === safeLower(SAGAMONKES_COLLECTION_ID) ||
    metaCollectionKey === safeLower(SAGAMONKES_COLLECTION_ID);

  const textHits =
    name.includes("sagamonke") ||
    name.includes("saga monke") ||
    name.includes("saga") ||
    symbol.includes("saga") ||
    collection.includes("saga") ||
    group.includes("saga") ||
    grouping.includes("saga") ||
    creatorAddrs.includes("saga");

  const authorityHits =
    updateAuthority.includes("saga") ||
    updateAuthority === safeLower(SAGAMONKES_COLLECTION_ID);

  // Prefer ID match, but allow text match as fallback
  return idHits || authorityHits || textHits;
}

export default function SagaMonkesNftsPage() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();

  const [items, setItems] = useState<NFT[]>([]);
  const [allCount, setAllCount] = useState<number>(0);
  const [strictCount, setStrictCount] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wallet = useMemo(() => publicKey?.toBase58() || "", [publicKey]);

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
    if (!wallet) return;

    setLoading(true);
    setError(null);

    try {
      // 1) Strict filter attempt (fast path)
      const strict = await fetchNfts({
        owner: wallet,
        collection: SAGAMONKES_COLLECTION_ID,
        collectionId: SAGAMONKES_COLLECTION_ID,
      });

      setStrictCount(strict.length);

      // If strict worked, use it
      if (strict.length > 0) {
        setItems(strict as NFT[]);
        setAllCount(strict.length);
        return;
      }

      // 2) Fallback: fetch ALL wallet NFTs, then filter locally
      const all = await fetchNfts({ owner: wallet });
      setAllCount(all.length);

      const filtered = all.filter((n) => isSagaMonkes(n));
      setItems(filtered as NFT[]);
    } catch (e: any) {
      setError(e?.message || "Failed to load SagaMonkes");
      setItems([]);
      setAllCount(0);
      setStrictCount(0);
    } finally {
      setLoading(false);
    }
  }

  // Load whenever wallet changes
  useEffect(() => {
    if (!wallet) {
      setItems([]);
      setError(null);
      setLoading(false);
      setAllCount(0);
      setStrictCount(0);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);

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
                Connect your wallet to view your SagaMonkes, then tap one to open it
                in the locker and export wallpapers.
              </p>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <WalletMultiButton />
              </div>

              <p
                style={{
                  margin: "12px 0 0",
                  opacity: 0.7,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.78)",
                }}
              >
                Your wallet is only used to read your NFTs — nothing can be moved or
                signed without your approval.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* HEADER CARD */}
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
                Showing SagaMonkes owned by your connected wallet ({wallet.slice(0, 4)}…
                {wallet.slice(-4)}).
              </p>

              <p
                style={{
                  margin: "8px 0 0",
                  opacity: 0.72,
                  color: "rgba(255,255,255,0.78)",
                  fontSize: 12,
                  lineHeight: 1.45,
                }}
              >
                Strict filter count: <b>{strictCount}</b> • Wallet NFT count: <b>{allCount}</b>
                <br />
                Expected collection id:{" "}
                <span style={{ opacity: 0.95 }}>{SAGAMONKES_COLLECTION_ID}</span>
              </p>
            </div>

            <div style={{ height: 16 }} />

            {loading && <p style={{ opacity: 0.92, color: "rgba(255,255,255,0.92)" }}>Loading...</p>}

            {error && <p style={{ opacity: 0.95, color: "#ffb3b3" }}>{error}</p>}

            {/* POPPING EMPTY STATE */}
            {!loading && !error && items.length === 0 && (
              <div
                style={{
                  marginTop: 10,
                  maxWidth: 720,
                  padding: "16px 16px",
                  borderRadius: 18,
                  background: "rgba(10, 10, 14, 0.72)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 22px 50px rgba(0,0,0,0.65)",
                }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 12,
                      display: "grid",
                      placeItems: "center",
                      background: "rgba(255,255,255,0.10)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      flex: "0 0 auto",
                    }}
                    aria-hidden="true"
                  >
                    🔎
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 12,
                        letterSpacing: "0.20em",
                        fontWeight: 900,
                        color: "rgba(255,255,255,0.96)",
                        textTransform: "uppercase",
                      }}
                    >
                      NO SAGAMONKES FOUND
                    </div>

                    <p style={{ margin: "8px 0 0", opacity: 0.86, color: "rgba(255,255,255,0.86)", lineHeight: 1.5 }}>
                      If you’re sure you own one, it’s likely the indexer labels this collection
                      differently. We’re already doing a fallback “fetch all + match” pass — if it
                      still shows zero, the next step is to inspect what fields your SagaMonke is
                      returning in <code>/api/nfts</code>.
                    </p>

                    <div style={{ height: 10 }} />

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => load()}
                        style={{
                          height: 34,
                          padding: "0 14px",
                          borderRadius: 999,
                          border: "1px solid rgba(255,255,255,0.18)",
                          background: "rgba(255,255,255,0.10)",
                          color: "rgba(255,255,255,0.92)",
                          fontWeight: 900,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          cursor: "pointer",
                        }}
                      >
                        Refresh
                      </button>

                      <a
                        href={MAGICEDEN_COLLECTION_URL}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          height: 34,
                          padding: "0 14px",
                          borderRadius: 999,
                          display: "inline-flex",
                          alignItems: "center",
                          textDecoration: "none",
                          background: "#ff3fb4",
                          color: "#151019",
                          fontWeight: 900,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          boxShadow: "0 12px 26px rgba(0,0,0,0.35)",
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
                  router.push(`/locker?mint=${mint}${uri ? `&uri=${uri}` : ""}&project=sagamonkes`);
                }}
              />
            )}
          </>
        )}
      </section>
    </main>
  );
}
