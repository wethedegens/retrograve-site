// app/api/nft-by-mint/route.ts
import { NextResponse } from "next/server";

type MetaAttr = { trait_type?: string; value?: string | number | null };
type MetaJson = {
  name?: string;
  image?: string;
  attributes?: MetaAttr[];
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const mint = (url.searchParams.get("mint") || "").trim();
    const uri = (url.searchParams.get("uri") || "").trim();

    if (!mint && !uri) {
      return NextResponse.json(
        { error: "Missing mint or uri" },
        { status: 400 }
      );
    }

    // 1) If a metadata URI is passed explicitly, use that directly
    if (uri) {
      const r = await fetch(uri, { cache: "no-store" });
      if (!r.ok) {
        return NextResponse.json(
          { error: `Failed to fetch metadata (${r.status})` },
          { status: 502 }
        );
      }
      const meta = (await r.json()) as MetaJson;

      return NextResponse.json({
        id: mint || meta?.name || "",
        name: meta?.name || mint || "",
        image: meta?.image || "",
        attributes: Array.isArray(meta?.attributes) ? meta.attributes! : [],
      });
    }

    // 2) No URI, but we DO have a mint – resolve via Helius
    const heliusKey = process.env.HELIUS_API_KEY;
    if (!heliusKey) {
      console.error("Missing HELIUS_API_KEY in env");
      return NextResponse.json(
        { error: "Server not configured with HELIUS_API_KEY" },
        { status: 500 }
      );
    }

    const heliusUrl = `https://api.helius.xyz/v0/token-metadata?api-key=${heliusKey}`;

    const heliusResp = await fetch(heliusUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        mintAccounts: [mint],
        includeOffChain: true,
        includeOnChain: true,
        disableCache: true,
      }),
    });

    if (!heliusResp.ok) {
      console.error("Helius token-metadata error:", heliusResp.statusText);
      return NextResponse.json(
        { error: "Failed to fetch metadata from Helius" },
        { status: 502 }
      );
    }

    const arr = (await heliusResp.json()) as any[];
    const first = Array.isArray(arr) ? arr[0] : null;

    const meta: MetaJson | undefined =
      first?.offChainMetadata?.metadata || first?.onChainMetadata?.metadata;

    if (!meta) {
      console.warn("No metadata found for mint", mint);
      return NextResponse.json(
        {
          id: mint,
          name: mint,
          image: "",
          attributes: [] as MetaAttr[],
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        id: mint,
        name: meta.name || mint,
        image: meta.image || "",
        attributes: Array.isArray(meta.attributes) ? meta.attributes : [],
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("nft-by-mint route error:", e);
    return NextResponse.json(
      { error: e?.message || "unknown error" },
      { status: 500 }
    );
  }
}
