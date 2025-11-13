import { NextRequest, NextResponse } from "next/server";

const HELIUS_API_KEY = process.env.HELIUS_API_KEY!;
const COLLECTION_ADDRESS = process.env.COLLECTION_ADDRESS || "";
const CREATOR_ADDRESS = process.env.CREATOR_ADDRESS || "";

function pickImageUrl(n: any): string | null {
  return (
    n?.content?.files?.[0]?.uri ||
    n?.content?.links?.image ||
    n?.offChainMetadata?.image ||
    n?.onChainMetadata?.metadata?.data?.image ||
    null
  );
}

export async function POST(req: NextRequest) {
  try {
    const { owner } = (await req.json()) as { owner: string };
    if (!owner) return NextResponse.json({ error: "missing owner" }, { status: 400 });

    const url = `https://api.helius.xyz/v0/addresses/${owner}/nfts?api-key=${HELIUS_API_KEY}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return NextResponse.json({ error: "helius failed" }, { status: 502 });

    const nfts = (await res.json()) as any[];

    const filtered = nfts.filter((n) => {
      const byCollection = COLLECTION_ADDRESS && n?.collection?.address === COLLECTION_ADDRESS;
      const byCreator =
        !COLLECTION_ADDRESS &&
        CREATOR_ADDRESS &&
        (n?.creators || n?.onChainMetadata?.metadata?.data?.creators || []).some(
          (c: any) => c?.address === CREATOR_ADDRESS
        );
      return byCollection || byCreator;
    });

    const items = filtered
      .map((n) => ({
        mint: n?.mint || n?.id || "",
        name:
          n?.content?.metadata?.name ||
          n?.offChainMetadata?.name ||
          n?.onChainMetadata?.metadata?.data?.name ||
          "NFT",
        image: pickImageUrl(n)
      }))
      .filter((x) => x.image);

    return NextResponse.json({ items, verified: items.length > 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "server error" }, { status: 500 });
  }
}
