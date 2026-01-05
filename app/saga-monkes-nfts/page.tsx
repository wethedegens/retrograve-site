"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import NftGrid, { NFT } from "../components/NftGrid";

const SAGAMONKES_COLLECTION_ID =
  "HCwFN2CpdwPbfRUFerVUWaYhtV7J587X9cEuZ3Cn8Hst";
const SAGAMONKES_BG_IMAGE = "/saga-monkes-bg-nfts.jpg";
const MAGICEDEN_COLLECTION_URL =
  "https://magiceden.us/marketplace/saga_monkes";

export default function SagaMonkesNftsPage() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();

  const [items, setItems] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const owner = publicKey?.toBase58();

    if (!owner) {
      setItems([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const r = await fetch("/api/nfts", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            owner,
            collection: SAGAMONKES_COLLECTION_ID,
            collectionId: SAGAMONKES_COLLECTION_ID,
          }),
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

        const list: NFT[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.nfts)
          ? data.nfts
          : [];

        if (!cancelled) setItems(list);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Failed to load SagaMonkes");
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [publicKey]);

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
                  opacity: 0.7,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.78)",
                }}
              >
                Your wallet is only used to read your NFTs — nothing can be
                moved or signed without your approval.
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

              <p
                style={{
                  margin: 0,
                  opacity: 0.82,
                  color: "rgba(255,255,255,0.88)",
                }}
              >
                Showing SagaMonkes owned by your connected wallet.
              </p>
            </div>

            <div style={{ height: 16 }} />

            {loading && (
              <p style={{ opacity: 0.92, color: "rgba(255,255,255,0.92)" }}>
                Loading...
              </p>
            )}

            {error && <p style={{ opacity: 0.95, color: "#ffb3b3" }}>{error}</p>}

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
                <div style={{ fontWeight: 900, letterSpacing: "0.2em" }}>
                  NO SAGAMONKES FOUND
                </div>

                <p
                  style={{
                    margin: "8px 0 0",
                    opacity: 0.86,
                    color: "rgba(255,255,255,0.86)",
                    lineHeight: 1.5,
                  }}
                >
                  If you&apos;re sure you own one, the collection filter may not
                  match how the indexer labels this collection. In that case,
                  we need to fix filtering in <code>/api/nfts</code> (recommended)
                  instead of guessing on the client.
                </p>

                <div style={{ height: 10 }} />

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
            )}

            {!loading && !error && items.length > 0 && (
              <NftGrid
                nfts={items}
                onPick={(nft) => {
                  const mint = nft.id || "";
                  const uri = nft.uri ? encodeURIComponent(nft.uri) : "";
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
