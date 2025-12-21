// app/my-miners/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import WalletGate from "../components/WalletGate";
import NftGrid, { NFT } from "../components/NftGrid";
import LockscreenedFAQ from "../components/LockscreenedFAQ";

// 🔐 Hard-coded Enchanted Miners filters
const MINERS_COLLECTION = "GzhXjRxLXWkzW6vDVyHgbYmqW75xrfh4WvgVKQ8XA1su";
const MINERS_CREATORS = [
  "9Ci6L43CmtaXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // keep your real list here
];

export default function MyMinersPage() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!connected || !publicKey) return;

    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/nfts?wallet=${publicKey.toBase58()}`);
        const data = await res.json();

        // Filter for Miners (collection + creators)
        const filtered: NFT[] = (data?.nfts || []).filter((n: any) => {
          const collectionOk = n?.collection === MINERS_COLLECTION;
          const creators = n?.creators || [];
          const creatorOk = creators.some((c: any) =>
            MINERS_CREATORS.includes(c?.address)
          );
          return collectionOk || creatorOk;
        });

        setNfts(filtered);
      } catch (e) {
        console.error(e);
        setNfts([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [connected, publicKey]);

  if (!connected) return <WalletGate />;

  return (
    <main style={{ minHeight: "100vh", paddingBottom: 80 }}>
      <section style={{ padding: "90px 18px 18px", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: 28, letterSpacing: "0.06em" }}>
          ENCHANTED MINERS — MY NFTs
        </h1>
        <p style={{ margin: "10px auto 0", maxWidth: 680, opacity: 0.8 }}>
          Select a Miner to open the lockscreen builder.
        </p>
      </section>

      <section style={{ maxWidth: 1200, margin: "0 auto" }}>
        {loading ? (
          <p style={{ textAlign: "center", opacity: 0.8 }}>Loading…</p>
        ) : (
          <NftGrid
            nfts={nfts}
            onPick={(nft) => {
              // Route into locker with mint + uri if present
              const params = new URLSearchParams();
              if (nft.id) params.set("mint", nft.id);
              if ((nft as any).uri) params.set("uri", (nft as any).uri);
              router.push(`/enchanted-miners?${params.toString()}`);
            }}
          />
        )}
      </section>

      <section style={{ marginTop: 40 }}>
        <LockscreenedFAQ />
      </section>
    </main>
  );
}
