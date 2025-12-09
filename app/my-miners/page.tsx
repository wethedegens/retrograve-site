"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import WalletGate from "../components/WalletGate";
import NftGrid, { NFT } from "../components/NftGrid";

const MINERS_COLLECTION =
  process.env.NEXT_PUBLIC_MINERS_COLLECTION || "";
const MINERS_CREATORS = (process.env.NEXT_PUBLIC_MINERS_CREATORS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

type NftsResponse = {
  nfts: {
    id: string;
    name?: string;
    image?: string | null;
    uri?: string | null;
  }[];
};

export default function MyMinersPage() {
  const { publicKey } = useWallet();
  const router = useRouter();

  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey) return;

    const owner = publicKey.toBase58();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/nfts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            owner,
            collection: MINERS_COLLECTION || undefined,
            creators: MINERS_CREATORS.length ? MINERS_CREATORS : undefined,
          }),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json = (await res.json()) as NftsResponse;

        const cleaned: NFT[] = (json.nfts || []).map((item) => ({
          id: item.id,
          name: item.name || "Enchanted Miner",
          image: item.image ?? null,
        }));

        setNfts(cleaned);
      } catch (err) {
        console.error(err);
        setError("Failed to load your Enchanted Miners.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [publicKey]);

  function handlePick(nft: NFT) {
    if (!nft.id) return;
    router.push(`/enchanted-miners?mint=${encodeURIComponent(nft.id)}`);
  }

  return (
    <WalletGate>
      <main style={{ padding: "32px 18px 48px" }}>
        <header style={{ marginBottom: "24px" }}>
          <h1
            style={{
              fontSize: "32px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            MY MINERS
          </h1>
          <p style={{ marginTop: "4px", opacity: 0.8 }}>
            Select an Enchanted Miner from your wallet to open it in the
            lockscreen locker.
          </p>
        </header>

        {!publicKey && (
          <p>Connect your wallet to see your Enchanted Miners.</p>
        )}

        {publicKey && loading && <p>Loading your Enchanted Miners...</p>}

        {publicKey && error && (
          <p style={{ color: "#ff6b6b" }}>{error}</p>
        )}

        {publicKey && !loading && !error && (
          <NftGrid nfts={nfts} onPick={handlePick} />
        )}
      </main>
    </WalletGate>
  );
}
