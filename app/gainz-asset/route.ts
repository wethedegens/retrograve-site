// app/api/gainz-asset/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mint = searchParams.get("mint") || "";

  if (!mint) {
    return NextResponse.json({ error: "Missing ?mint=" }, { status: 400 });
  }

  const key = process.env.HELIUS_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Missing HELIUS_API_KEY in env" },
      { status: 500 }
    );
  }

  const url = `https://mainnet.helius-rpc.com/?api-key=${key}`;

  const body = {
    jsonrpc: "2.0",
    id: "gainz-asset",
    method: "getAsset",
    params: { id: mint },
  };

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const j = await r.json();

  // Return the useful bits only
  const result = j?.result || null;

  return NextResponse.json({
    mint,
    grouping: result?.grouping || null,
    creators: result?.creators || null,
    authorities: result?.authorities || null,
    content: {
      json_uri: result?.content?.json_uri || null,
      files: result?.content?.files || null,
    },
  });
}
