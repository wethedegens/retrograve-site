// app/api/studio/update-public-profile/route.ts
import { NextResponse } from "next/server";
import { requireCurrentCollectionAuthority } from "../../../lib/lockscreened/server/currentAuthority";
import {
  consumeStudioActionRateLimit,
  getAuthenticatedUser,
  isTrustedStudioRequestOrigin,
  restAsUser,
} from "../../../lib/lockscreened/server/supabaseServer";

export const dynamic = "force-dynamic";

function safeUrl(value: unknown) {
  const raw = String(value || "").trim().slice(0, 500);
  if (!raw) return "";
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}

export async function POST(request: Request) {
  try {
    if (!isTrustedStudioRequestOrigin(request)) {
      return NextResponse.json({ error: "Cross-site Creator Studio request blocked." }, { status: 403 });
    }
    const authHeader = request.headers.get("authorization") || "";
    const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    if (!accessToken) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

    const user = await getAuthenticatedUser(accessToken);
    if (!user?.id) return NextResponse.json({ error: "Studio session expired." }, { status: 401 });

    const body = await request.json();
    const collectionId = String(body?.collectionId || "").trim();
    const name = String(body?.name || "").trim().slice(0, 120);
    const publicSlug = String(body?.publicSlug || "").trim().toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-").replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
    if (!collectionId || !name) {
      return NextResponse.json({ error: "Project and project name are required." }, { status: 400 });
    }

    const allowed = await consumeStudioActionRateLimit(accessToken, "update_public_profile");
    if (!allowed) return NextResponse.json({ error: "Too many profile changes. Wait a few minutes and try again." }, { status: 429 });

    const rows = await restAsUser<any[]>(
      accessToken,
      "collections?id=eq." + encodeURIComponent(collectionId) +
        "&select=id,created_by,publish_status,flagship,legacy_assets_locked,source_type,source_config&limit=1"
    );
    const collection = rows?.[0];
    if (!collection) return NextResponse.json({ error: "Project not found." }, { status: 404 });
    if (collection.flagship || collection.legacy_assets_locked) {
      return NextResponse.json({ error: "Legacy flagship projects cannot be edited from Creator Studio." }, { status: 403 });
    }

    const isPrivatePreMint =
      collection.created_by === user.id &&
      collection.source_type === "demo" &&
      collection.source_config?.preMint === true &&
      collection.publish_status === "draft";

    if (!isPrivatePreMint) {
      const collectionAddress = String(collection?.source_config?.collectionIds?.[0] || "").trim();
      if (collection.source_type !== "solana_collection" || !collectionAddress) {
        return NextResponse.json({ error: "This project does not have a valid Solana collection identity." }, { status: 400 });
      }
      await requireCurrentCollectionAuthority({ user, collectionAddress });
    }

    const profile = body?.profile || {};
    await restAsUser<void>(
      accessToken,
      "collections?id=eq." + encodeURIComponent(collectionId),
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          name,
          public_slug: publicSlug || null,
          public_profile: {
            tagline: String(profile.tagline || "").trim().slice(0, 160),
            description: String(profile.description || "").trim().slice(0, 1200),
            website: safeUrl(profile.website),
            marketplace: safeUrl(profile.marketplace),
            discord: safeUrl(profile.discord),
            x: safeUrl(profile.x),
          },
        }),
      }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save public profile." },
      { status: 500 }
    );
  }
}
