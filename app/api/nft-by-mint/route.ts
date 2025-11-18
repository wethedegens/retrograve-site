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

    // 1) If a metadata URI is passed explicitly, just fetch that JSON directly
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

    // 2) No URI, but we DO have a mint – resolve via Helius "getAsset"
    const rpcUrl =
      process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC;

    if (!rpcUrl) {
      console.error("Missing SOLANA_RPC_URL / NEXT_PUBLIC_SOLANA_RPC in env");
      return NextResponse.json(
        { error: "Server not configured with SOLANA_RPC_URL" },
        { status: 500 }
      );
    }

    const rpcBody = {
      jsonrpc: "2.0",
      id: "nft-by-mint",
      method: "getAsset",
      params: {
        id: mint,
        // extra options if Helius supports them; safe to send
        displayOptions: {
          showUnverifiedCollections: true,
        },
      },
    };

    const rpcResp = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(rpcBody),
    });

    if (!rpcResp.ok) {
      console.error("Helius getAsset error:", rpcResp.status, rpcResp.statusText);
      return NextResponse.json(
        { error: "Failed to fetch metadata from Helius getAsset" },
        { status: 502 }
      );
    }

    const rpcJson = (await rpcResp.json()) as any;
    const asset = rpcJson?.result;

    if (!asset) {
      console.warn("No asset found for mint", mint);
      return NextResponse.json(
        { id: mint, name: mint, image: "", attributes: [] as MetaAttr[] },
        { status: 200 }
      );
    }

    // Try a few common places Helius puts metadata
    const content = asset.content || {};
    const metaFromJson = content.json || {};
    const metaFromMetadata = content.metadata || {};

    const name =
      metaFromJson.name ||
      metaFromMetadata.name ||
      asset.name ||
      mint;

    const image =
      // JSON metadata
      metaFromJson.image ||
      // content.links.image (often used)
      content.links?.image ||
      // first file URI, if present
      (Array.isArray(content.files) && content.files[0]?.uri) ||
      "";

    const attributesRaw =
      metaFromJson.attributes ||
      metaFromMetadata.attributes ||
      [];

    const attributes: MetaAttr[] = Array.isArray(attributesRaw)
      ? attributesRaw
      : [];

    return NextResponse.json(
      {
        id: mint,
        name,
        image: image || "",
        attributes,
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
