// app/api/nft-by-mint/route.ts
import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { fetchPublicNftMetadata, getPublicNftMediaUrl } from "../../lib/lockscreened/server/publicNftMedia";

type MetaAttr = { trait_type?: string; value?: string | number | null };
type MetaJson = {
  name?: string;
  image?: string;
  attributes?: MetaAttr[];
};

const LOOKUP_TIMEOUT_MS = 10_000;

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

    if (uri) {
      const metadataUrl = getPublicNftMediaUrl(uri);
      if (!metadataUrl) {
        return NextResponse.json({ error: "Unsupported NFT metadata URL." }, { status: 400 });
      }
      let meta: MetaJson;
      try {
        meta = (await fetchPublicNftMetadata(metadataUrl)) as MetaJson;
      } catch {
        return NextResponse.json({ error: "NFT metadata unavailable." }, { status: 502 });
      }

      return NextResponse.json({
        id: mint || meta?.name || "",
        name: meta?.name || mint || "",
        image: meta?.image || "",
        attributes: Array.isArray(meta?.attributes) ? meta.attributes! : [],
      });
    }

    try {
      if (mint.length < 32 || mint.length > 44 || new PublicKey(mint).toBase58() !== mint) {
        throw new Error("Invalid mint.");
      }
    } catch {
      return NextResponse.json({ error: "Invalid Solana mint address" }, { status: 400 });
    }

    // Resolve the mint through Helius when no metadata URI was supplied.
    const rpcUrl =
      process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC;

    if (!rpcUrl) {
      console.error("Missing SOLANA_RPC_URL / NEXT_PUBLIC_SOLANA_RPC in env");
      return NextResponse.json(
        { error: "NFT metadata lookup is unavailable." },
        { status: 503 }
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
      redirect: "error",
      signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
      body: JSON.stringify(rpcBody),
    });

    if (!rpcResp.ok) {
      console.error("Helius getAsset failed with status:", rpcResp.status);
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
  } catch {
    return NextResponse.json(
      { error: "NFT metadata lookup is temporarily unavailable." },
      { status: 502 }
    );
  }
}