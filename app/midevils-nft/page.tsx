// app/midevils-nfts/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import NftGrid, { NFT } from "../components/NftGrid";

const MIDEVILS_COLLECTION = "5nJocYN5a8fCNzi11fz28h8Eo3xLcTnGgp2qubq3jMKz";
const MIDEVILS_BG_IMAGE = "/midevils-project-page-bg.jpg";

export default function MidEvilsNftsPage() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();

  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const owner = publicKey?.toBase58();
    if (!owner) {
      setNfts([]);
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
            collection: MIDEVILS_COLLECTION,
            collectionId: MIDEVILS_COLLECTION,
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

        if (!cancelled) setNfts(list);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Failed to load MidEvils");
          setNfts([]);
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
      className="midevils-wrapper"
      style={{
        minHeight: "100vh",
        padding: "18px 0 80px",
        paddingTop: 64,
        backgroundImage: `url(${MIDEVILS_BG_IMAGE})`,
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
                background: "rgba(10, 10, 14, 0.55)",
                border: "1px solid rgba(255,255,255,0.14)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
              }}
            >
              <h1
                style={{
                  margin: "0 0 10px",
                  fontSize: 28,
                  letterSpacing: "0.04em",
                }}
              >
                MIDEVILS
              </h1>

              <p style={{ margin: "0 0 14px", opacity: 0.9, lineHeight: 1.6 }}>
                Connect your wallet to view your MidEvils, then tap one to open
                it in the locker and export wallpapers.
              </p>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <WalletMultiButton />
              </div>

              <p style={{ margin: "12px 0 0", opacity: 0.65, fontSize: 12 }}>
                Your wallet is only used to read your NFTs — nothing can be
                moved or signed without your approval.
              </p>
            </div>
          </div>
        ) : (
          <>
            <h1
              style={{
                margin: "8px 0",
                fontSize: 28,
                letterSpacing: "0.04em",
              }}
            >
              MY MIDEVILS
            </h1>

            <p style={{ margin: 0, opacity: 0.75 }}>
              Showing MidEvils owned by your connected wallet.
            </p>

            <div style={{ height: 16 }} />

            {loading && <p style={{ opacity: 0.85 }}>Loading...</p>}

            {error && <p style={{ opacity: 0.9, color: "#ffb3b3" }}>{error}</p>}

            {!loading && !error && nfts.length === 0 && (
              <p style={{ opacity: 0.85 }}>No MidEvils found.</p>
            )}

            {!loading && !error && nfts.length > 0 && (
              <NftGrid
                nfts={nfts}
                onPick={(nft) => {
                  const mint = nft.id || "";
                  const uri = nft.uri ? encodeURIComponent(nft.uri) : "";
                  router.push(
                    `/locker?mint=${mint}${uri ? `&uri=${uri}` : ""}&project=midevils`
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
