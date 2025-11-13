"use client";

import { useEffect, useState } from "react";
import NftGrid, { NFT } from "./NftGrid";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Showcase() {
  const { publicKey } = useWallet();

  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const owner = publicKey?.toBase58();
    if (!owner) {
      setNfts([]);
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

        const j = await r.json();
        const list: NFT[] = Array.isArray(j?.nfts) ? j.nfts : [];
        if (!cancelled) setNfts(list);
      } catch (e) {
        console.error("NFT fetch failed:", e);
        if (!cancelled) {
          setError("Couldn’t load NFTs");
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
    <div className="page-wrap">
      <h1 style={{ margin: "16px 18px" }}>
        MAGAPIXEL{nfts.length ? ` · ${nfts.length}` : ""}
      </h1>

      {!publicKey && (
        <p style={{ margin: "0 18px 16px" }}>
          Connect your wallet (purple button top-right) to see your grid.
        </p>
      )}

      {loading && <p style={{ margin: "0 18px 16px" }}>Loading your NFTs…</p>}
      {error && <p className="error" style={{ margin: "0 18px 16px" }}>{error}</p>}

      {publicKey && !loading && (
        <NftGrid
          nfts={nfts}
          onPick={(n) => {
            window.location.href = `/locker?mint=${n.id}`;
          }}
        />
      )}
    </div>
  );
}
