// app/api/meta/route.ts
import { NextResponse } from "next/server";

function normalizeIpfs(u: string) {
  const s = String(u || "").trim();
  if (!s) return "";
  if (s.startsWith("ipfs://")) {
    const path = s.replace("ipfs://", "").replace(/^ipfs\//, "");
    // You can swap gateways later if you want
    return `https://gateway.pinata.cloud/ipfs/${path}`;
  }
  return s;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = searchParams.get("u") || "";
    const url = normalizeIpfs(raw);

    if (!url) {
      return NextResponse.json({ error: "Missing u" }, { status: 400 });
    }

    const r = await fetch(url, {
      cache: "no-store",
      // Some gateways behave better with a UA
      headers: { "user-agent": "LockscreenedMetaFetcher/1.0" },
    });

    const text = await r.text();

    if (!r.ok) {
      return NextResponse.json(
        { error: `Meta fetch failed (${r.status})`, body: text.slice(0, 400) },
        { status: 502 }
      );
    }

    // Try parse JSON; if fails, return raw snippet
    try {
      const json = JSON.parse(text);
      return NextResponse.json(json, {
        headers: { "cache-control": "no-store" },
      });
    } catch {
      return NextResponse.json(
        { error: "Meta was not valid JSON", body: text.slice(0, 800) },
        { status: 502 }
      );
    }
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unknown meta error" },
      { status: 500 }
    );
  }
}
