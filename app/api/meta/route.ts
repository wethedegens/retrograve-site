import { NextResponse } from "next/server";
import {
  fetchPublicNftMetadata,
  getPublicNftMediaUrl,
} from "../../lib/lockscreened/server/publicNftMedia";

const headers = {
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
};

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("u") ?? "";
  const url = getPublicNftMediaUrl(raw);
  if (!url) {
    return NextResponse.json({ error: "Unsupported NFT metadata URL." }, {
      status: 400,
      headers,
    });
  }

  try {
    const metadata = await fetchPublicNftMetadata(url);
    return NextResponse.json(metadata, { headers });
  } catch {
    return NextResponse.json({ error: "NFT metadata unavailable." }, {
      status: 502,
      headers,
    });
  }
}