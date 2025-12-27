// app/enchanted-miners/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import NftGrid, { type NFT } from "../components/NftGrid";

// ✅ Put your real Enchanted Miners collection address here
const MINERS_COLLECTION = "GzhXjRxLXWkzW6vDVyHgbYmqW75xrfh4WvgVKQ8XA1su";

// Optional creator fallback (leave empty if you don’t need it)
const MINERS_CREATORS: string[] = [
  // "CreatorPubkeyHere",
];

type ApiNft = any;

function normalizeStr(x: any) {
  return typeof x === "string" ? x : "";
}

function getAnyCollectionId(n: ApiNft): string {
  return (
    normalizeStr(n?.collection) ||
    normalizeStr(n?.collectionId) ||
    normalizeStr(n?.collectionAddress) ||
    normalizeStr(n?.collection_address) ||
    normalizeStr(n?.grouping?.[0]?.group_value) ||
    normalizeStr(n?.collection?.address) ||
    normalizeStr(n?.collection?.key) ||
    ""
  );
}

function getCreatorList(n: ApiNft): string[] {
  const creators =
    n?.creators ||
    n?.creator ||
    n?.metadata?.creators ||
    n?.onchain?.creators ||
    n?.content?.metadata?.creators ||
    [];

  if (Array.isArray(creators)) {
    return creators
      .map((c: any) => normalizeStr(c?.address || c?.creator || c))
      .filter(Boolean);
  }
  return [];
}

function isMinerNft(n: ApiNft): boolean {
  const cid = getAnyCollectionId(n);
  if (cid && cid === MINERS_COLLECTION) return true;

  if (MINERS_CREATORS.length) {
    const c = getCreatorList(n);
    return c.some((addr) => MINERS_CREATORS.includes(addr));
  }

  return false;
}

export default function EnchantedMinersPage() {
  const { publicKey } = useWallet();

  const owner = publicKey?.toBase58() || "";
  const isConnected = !!owner;

  // ====== Grid state (only used when connected) ======
  const [all, setAll] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!owner) {
      setAll([]);
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
          body: JSON.stringify({ owner }),
          cache: "no-store",
        });

        if (!r.ok) {
          const msg = await r.text().catch(() => String(r.status));
          throw new Error(msg);
        }

        const data = await r.json();
        const list: any[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.nfts)
          ? data.nfts
          : [];

        if (!cancelled) setAll(list as unknown as NFT[]);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load NFTs");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [owner]);

  const miners = useMemo(() => {
    return (all as any[]).filter(isMinerNft) as unknown as NFT[];
  }, [all]);

  // ====== NOT CONNECTED: LANDING PAGE ======
  if (!isConnected) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "90px 18px 80px",
          backgroundImage: "url(/enchanted-miners-bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
        }}
      >
        <section style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h1 style={{ fontSize: 46, margin: "0 0 12px" }}>
            ENCHANTED MINERS
            <br />
            LOCKSCREEN LOCKER
          </h1>

          <p style={{ maxWidth: 640, opacity: 0.85, marginTop: 0 }}>
            Connect your wallet to view your Miners and export perfect phone lock
            screens.
          </p>

          <div style={{ height: 18 }} />

          <div
            style={{
              width: "min(420px, 92vw)",
              aspectRatio: "9 / 19.5",
              borderRadius: 26,
              overflow: "hidden",
              boxShadow: "0 18px 44px rgba(0,0,0,0.45)",
              background: "rgba(0,0,0,0.15)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <img
              src="/enchanted-miners-preview.png"
              alt="Enchanted Miners preview"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        </section>
      </main>
    );
  }

  // ====== CONNECTED: OWNER GRID ======
  return (
    <main style={{ padding: "18px 0 80px" }}>
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 18px" }}>
        <h1 style={{ margin: "8px 0 8px", fontSize: 28, letterSpacing: "0.04em" }}>
          MY MINERS
        </h1>
        <p style={{ margin: 0, opacity: 0.75 }}>
          Showing Enchanted Miners owned by your connected wallet.
        </p>

        <div style={{ height: 16 }} />

        <NftGrid nfts={miners} loading={loading} error={error} />
      </section>
    </main>
  );
}
