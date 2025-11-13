"use client";

import { useEffect, useState } from "react";
import NftGrid, { type NFT } from "./NftGrid";

export default function NftGridByContract({
  contract,
  title = "Collection",
}: {
  contract: string;
  title?: string;
}) {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;

    (async () => {
      setLoading(true);
      setErr(null);

      try {
        // Your /api/nfts expects POST { owner }, but if you're using
        // a “by contract” view, you can still POST any owner and then
        // let the API filter by collection id from env.
        // If this component actually passes an owner, keep that;
        // otherwise use a no-op owner and rely on filtering.
        const res = await fetch("/api/nfts", {
          method: "POST",
          headers: { "content-type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ owner: contract }),
        });

        if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
        const json = await res.json();

        const items: NFT[] = (json.nfts || []).map((it: any) => ({
          id: it.id,
          name: it.name,
          image: it.image,
          uri: it.uri ?? null,
        }));

        if (!aborted) setNfts(items);
      } catch (e: any) {
        if (!aborted) setErr(e?.message || "Failed to load NFTs");
      } finally {
        if (!aborted) setLoading(false);
      }
    })();

    return () => {
      aborted = true;
    };
  }, [contract]);

  return (
    <section>
      <h1 style={{ margin: "0 18px 8px" }}>
        {title} · {nfts.length}
      </h1>

      {loading && (
        <div style={{ margin: "0 18px 14px", opacity: 0.7 }}>Loading…</div>
      )}
      {err && (
        <div style={{ margin: "0 18px 14px", color: "#f88" }}>{err}</div>
      )}

      <NftGrid nfts={nfts} />
    </section>
  );
}
