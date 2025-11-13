import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const u = req.nextUrl.searchParams.get("u");
  if (!u) return new NextResponse("Missing ?u", { status: 400 });

  try {
    const upstream = await fetch(u, {
      headers: { "user-agent": "Mozilla/5.0 (RetroGrave Proxy)" },
    });
    if (!upstream.ok) {
      return new NextResponse(`Upstream error ${upstream.status}`, {
        status: upstream.status,
      });
    }

    const buf = Buffer.from(await upstream.arrayBuffer());
    const ct = upstream.headers.get("content-type") || "image/png";

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "content-type": ct,
        "cache-control": "public, max-age=3600, immutable",
        "access-control-allow-origin": "*",
      },
    });
  } catch {
    return new NextResponse("Proxy fetch failed", { status: 500 });
  }
}
