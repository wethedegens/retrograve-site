import { NextRequest, NextResponse } from "next/server";
import {
  NFT_IMAGE_TYPES,
  fetchPublicNftMedia,
  getPublicNftMediaUrl,
  readBoundedNftMedia,
} from "../../lib/lockscreened/server/publicNftMedia";

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const errorHeaders = { "cache-control": "no-store" };

export async function GET(req: NextRequest) {
  const url = getPublicNftMediaUrl(req.nextUrl.searchParams.get("u") ?? "");
  if (!url) {
    return new NextResponse("Unsupported NFT image URL.", {
      status: 400,
      headers: errorHeaders,
    });
  }

  try {
    const upstream = await fetchPublicNftMedia(url);
    const mime = upstream.headers.get("content-type")?.split(";")[0]
      .trim().toLowerCase() ?? "";
    if (!upstream.ok || !NFT_IMAGE_TYPES.has(mime)) {
      void upstream.body?.cancel().catch(() => {});
      throw new Error("Unsupported upstream image.");
    }

    const bytes = await readBoundedNftMedia(upstream, MAX_IMAGE_BYTES);
    return new NextResponse(bytes, {
      headers: {
        "content-type": mime,
        "cache-control": "public, max-age=3600",
        "x-content-type-options": "nosniff",
        "content-security-policy": "sandbox; default-src 'none'",
      },
    });
  } catch {
    return new NextResponse("NFT image unavailable.", {
      status: 502,
      headers: errorHeaders,
    });
  }
}