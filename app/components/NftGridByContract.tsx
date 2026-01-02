"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import NftGrid, { type NFT } from "./NftGrid";

export default function NftGridByContract({
  // NOTE: keeping prop name "contract" so you don't have to change pages,
  // but we treat it as "collectionId" (collection address) in the API filter.
  contract,
  title = "Collection",
  project = "magapixel",
}: {
  contract: string; // collection id/address (NOT an owner wallet)
  title?: string;
  project?: "magapixel" | "miners" | "gainz" | "midevils" | string;
}) {
  const router = useRouter();
  const { publicKey } = useWallet();

  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;

    const owner = publicKey?.toBase58();
    if (!owner) {
      setNfts([]);
      setErr(null);
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setErr(null);

      try {
        const res = await fetch("/api/nfts", {
          method: "POST",
          headers: { "content-type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({
            owner,                 // ✅ correct: wallet owner
            collection: contract,  // ✅ filter to this collection id
          }),
        });

        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(`Request failed (${res.status}) ${t}`);
        }

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
  }, [publicKey, contract]);

  function onPick(n: NFT) {
    const qs = new URLSearchParams();
    qs.set("mint", n.id);

    // if we have a metadata URI, pass it too (helps /api/nft-by-mint resolve faster)
    if (n.uri) qs.set("uri", n.uri);

    // ✅ pass project so locker knows which grid to go "back" to
    if (project) qs.set("project", String(project));

    // NOTE: we don't pass "image" here; locker will fetch via nft-by-mint
    router.push(`/locker?${qs.toString()}`);
  }

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

      <NftGrid nfts={nfts} onPick={onPick} />
    </section>
  );
}
