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

    if (!uri) {
      return NextResponse.json(
        { error: "Missing metadata URI. Pass ?uri=<metadata-json-url>." },
        { status: 400 }
      );
    }

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
      attributes: Array.isArray(meta?.attributes) ? meta!.attributes : [],
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "unknown error" },
      { status: 500 }
    );
  }
}
