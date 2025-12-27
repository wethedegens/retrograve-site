// app/enchanted-miners/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import NftGrid, { type NFT } from "../components/NftGrid";

const ENCHANTED_MINERS_COLLECTION = "GzhXjRxLXWkzW6vDVyHgbYmqW75xrfh4WvgVKQ8XA1su";

export default function EnchantedMinersPage() {
  const { publicKey } = useWallet();
  const router = useRouter();

  const [miners, setMiners] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const owner = publicKey?.toBase58();
    if (!owner) {
      setMiners([]);
      setError(null);
      return;
    }

    let cancelled = false;

    async function loadMiners() {
      setLoading(true);
      setError(null);

      try {
        const r = await fetch("/api/nfts", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            owner,
            collection: ENCHANTED_MINERS_COLLECTION,
          }),
          cache: "no-store",
        });

        if (!r.ok) {
          const msg = await r.text().catch(() => String(r.status));
          throw new Error(msg);
        }

        const data = await r.json();
        if (!cancelled) setMiners(Array.isArray(data) ? data : []);
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
  }, [publicKey]);

  function handlePick(n: NFT) {
    // ✅ Option A: send into the main locker by mint id
    // (if you’d rather do nothing for now, replace this with: return;)
    router.push(`/locker?mint=${encodeURIComponent(n.id)}`);
  }

  return (
    <main style={{ padding: "18px 0 80px", marginTop: 64 }}>
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 18px" }}>
        <h1 style={{ margin: "8px 0", fontSize: 28, letterSpacing: "0.04em" }}>
          MY MINERS
        </h1>

        <p style={{ margin: 0, opacity: 0.75 }}>
          Showing Enchanted Miners owned by your connected wallet.
        </p>

        <div style={{ height: 16 }} />

        {loading && <p style={{ opacity: 0.85 }}>Loading…</p>}
        {error && <p style={{ opacity: 0.9, color: "#ffb3b3" }}>{error}</p>}

        {!loading && !error && miners.length === 0 && (
          <p style={{ opacity: 0.85 }}>No Enchanted Miners found.</p>
        )}

        {!loading && !error && miners.length > 0 && (
          <NftGrid nfts={miners} onPick={handlePick} />
        )}
      </section>
    </main>
  );
}
