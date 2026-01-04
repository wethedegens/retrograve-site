// app/saga-monkes-nfts/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import NftGrid, { NFT } from "../components/NftGrid";

const SAGAMONKES_COLLECTION_ID = "HCwFN2CpdwPbfRUFerVUWaYhtV7J587X9cEuZ3Cn8Hst";
const SAGAMONKES_BG_IMAGE = "/saga-monkes-bg.png"; // ✅ you have this in /public

export default function SagaMonkesNftsPage() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();

  const [items, setItems] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only load AFTER wallet is connected
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
        const body: any = { owner };

        const collection = SAGAMONKES_COLLECTION_ID.trim();
        if (collection.length > 0) {
          body.collection = collection;
          body.collectionId = collection;
        }

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
        {/* ✅ readable header block */}
        <div
          style={{
            maxWidth: 720,
            margin: "10px auto 16px",
            padding: "18px 18px",
            borderRadius: 18,
            background: "rgba(10, 10, 14, 0.62)",
            border: "1px solid rgba(255,255,255,0.14)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              margin: "0 0 8px",
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
              opacity: 0.9,
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.85)",
              fontSize: 13,
            }}
          >
            Connect your wallet to view your SagaMonkes, then tap one to open it in the locker and export wallpapers.
          </p>
        </div>

        {!connected ? (
          <div
            style={{
              minHeight: "calc(100vh - 64px - 170px)",
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
                border: "1px solid rgba(255,255,255,0.14)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
              }}
            >
              <p
                style={{
                  margin: "0 0 14px",
                  opacity: 0.9,
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                Connect your wallet to view your SagaMonkes.
              </p>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <WalletMultiButton />
              </div>

              <p style={{ margin: "12px 0 0", opacity: 0.65, fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
                Wallet is only used to read your NFTs — nothing can be moved or signed without approval.
              </p>
            </div>
          </div>
        ) : (
          <>
            {loading && (
              <p style={{ opacity: 0.9, color: "rgba(255,255,255,0.9)", textAlign: "center" }}>
                Loading...
              </p>
            )}

            {error && (
              <p style={{ opacity: 0.95, color: "#ffb3b3", textAlign: "center" }}>
                {error}
              </p>
            )}

            {!loading && !error && items.length === 0 && (
              <p style={{ opacity: 0.9, color: "rgba(255,255,255,0.9)", textAlign: "center" }}>
                No SagaMonkes found.
              </p>
            )}

            {!loading && !error && items.length > 0 && (
              <NftGrid
                nfts={items}
                onPick={(nft) => {
                  const mint = nft.id || "";
                  const uri = nft.uri ? encodeURIComponent(nft.uri) : "";
                  router.push(`/locker?mint=${mint}${uri ? `&uri=${uri}` : ""}&project=saga-monkes`);
                }}
              />
            )}
          </>
        )}
      </section>
    </main>
  );
}
