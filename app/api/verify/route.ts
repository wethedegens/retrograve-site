import { NextRequest, NextResponse } from "next/server";

import { PublicKey } from "@solana/web3.js";
import { readBoundedNftMedia } from "../../lib/lockscreened/server/publicNftMedia";

const MAX_REQUEST_BYTES = 4 * 1024;
const LOOKUP_TIMEOUT_MS = 10_000;
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
  let owner: string;
  try {
    const bytes = await readBoundedNftMedia(req, MAX_REQUEST_BYTES);
    const body = JSON.parse(new TextDecoder().decode(bytes));
    owner = typeof body?.owner === "string" ? body.owner.trim() : "";
    if (owner.length < 32 || owner.length > 44 || new PublicKey(owner).toBase58() !== owner) {
      throw new Error("Invalid owner.");
    }
  } catch {
    return NextResponse.json({ error: "Invalid Solana owner address" }, { status: 400 });
  }

  const apiKey = process.env.HELIUS_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "NFT verification is unavailable." }, { status: 503 });
  }

  try {
    const url = new URL(`https://api.helius.xyz/v0/addresses/${owner}/nfts`);
    url.searchParams.set("api-key", apiKey);
    const res = await fetch(url, {
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
    });
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
  } catch {
    return NextResponse.json({ error: "NFT verification is temporarily unavailable." }, { status: 502 });
  }
}
