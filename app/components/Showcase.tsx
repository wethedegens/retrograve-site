// app/components/Showcase.tsx
"use client";

import { useEffect, useState } from "react";
import NftGrid, { NFT } from "./NftGrid";
import { useWallet } from "@solana/wallet-adapter-react";

type ShowcaseProps = {
  /**
   * Heading label. Defaults to "MAGAPIXEL" to preserve your current behavior.
   */
  title?: string;

  /**
   * Optional verified collection mint to filter results (uses /api/nfts body.collection).
   * If omitted, behavior stays the same as your current setup (no filter).
   */
  collection?: string;

  /**
   * Which project mode the locker should open in after clicking an NFT.
   * Defaults to "magapixel" to preserve current behavior.
   */
  project?: string;
};

export default function Showcase(props: ShowcaseProps) {
  const { publicKey } = useWallet();

  const title = (props.title || "MAGAPIXEL").toUpperCase();
  const collection = (props.collection || "").trim();
  const project = (props.project || "magapixel").trim();

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
        const payload: any = { owner };
        if (collection) payload.collection = collection;

        const r = await fetch("/api/nfts", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
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
  }, [publicKey, collection]);

  return (
    <div className="page-wrap">
      <h1 style={{ margin: "16px 18px" }}>
        {title}
        {nfts.length ? ` · ${nfts.length}` : ""}
      </h1>

      {!publicKey && (
        <p style={{ margin: "0 18px 16px" }}>
          Connect your wallet (purple button top-right) to see your grid.
        </p>
      )}

      {loading && <p style={{ margin: "0 18px 16px" }}>Loading your NFTs…</p>}

      {error && (
        <p className="error" style={{ margin: "0 18px 16px" }}>
          {error}
        </p>
      )}

      {publicKey && !loading && (
        <NftGrid
          nfts={nfts}
          onPick={(n) => {
            if (!n?.id) return;

            // ✅ Preserve your existing behavior, but allow other projects to override
            window.location.href = `/locker?mint=${encodeURIComponent(
              n.id
            )}&project=${encodeURIComponent(project)}`;
          }}
        />
      )}
    </div>
  );
}
