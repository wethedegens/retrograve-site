// app/api/studio/background-lifecycle/route.ts
import { NextResponse } from "next/server";
import { requireCurrentCollectionAuthority } from "../../../lib/lockscreened/server/currentAuthority";
import {
  consumeStudioActionRateLimit,
  getAuthenticatedUser,
  isTrustedStudioRequestOrigin,
  restAsUser,
} from "../../../lib/lockscreened/server/supabaseServer";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!isTrustedStudioRequestOrigin(request)) {
      return NextResponse.json({ error: "Cross-site Creator Studio request blocked." }, { status: 403 });
    }

    const authHeader = request.headers.get("authorization") || "";
    const accessToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : "";
    if (!accessToken) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

    const user = await getAuthenticatedUser(accessToken);
    if (!user?.id) return NextResponse.json({ error: "Studio session expired." }, { status: 401 });

    const body = await request.json();
    const packageId = String(body?.packageId || "").trim();
    const action = String(body?.action || "").trim().toLowerCase();
    if (!packageId || action !== "unpublish") {
      return NextResponse.json({ error: "A valid background lifecycle action is required." }, { status: 400 });
    }

    const allowed = await consumeStudioActionRateLimit(accessToken, "background_lifecycle");
    if (!allowed) {
      return NextResponse.json({ error: "Too many background changes. Wait a few minutes and try again." }, { status: 429 });
    }

    const packages = await restAsUser<any[]>(
      accessToken,
      "background_packages?id=eq." + encodeURIComponent(packageId) +
        "&select=id,collection_id,source,locked,publish_status&limit=1"
    );
    const packageRow = packages?.[0];
    if (!packageRow) return NextResponse.json({ error: "Background package was not found." }, { status: 404 });

    if (
      packageRow.source !== "official_creator" ||
      packageRow.locked ||
      packageRow.publish_status !== "published"
    ) {
      return NextResponse.json({ error: "This background cannot be unpublished from Creator Studio." }, { status: 403 });
    }

    const collections = await restAsUser<any[]>(
      accessToken,
      "collections?id=eq." + encodeURIComponent(packageRow.collection_id) +
        "&select=id,publish_status,flagship,legacy_assets_locked,source_type,source_config&limit=1"
    );
    const collection = collections?.[0];
    if (!collection) return NextResponse.json({ error: "Parent project was not found." }, { status: 404 });

    if (collection.flagship || collection.legacy_assets_locked) {
      return NextResponse.json({ error: "Legacy flagship backgrounds cannot be changed from Creator Studio." }, { status: 403 });
    }

    const collectionAddress = String(collection?.source_config?.collectionIds?.[0] || "").trim();
    if (collection.source_type !== "solana_collection" || !collectionAddress) {
      return NextResponse.json({ error: "This project does not have a valid Solana collection identity." }, { status: 400 });
    }

    await requireCurrentCollectionAuthority({ user, collectionAddress });

    // Keep this as the authenticated founder so the live RLS and lifecycle
    // trigger remain authoritative, including the last-phone-background guard.
    await restAsUser<void>(
      accessToken,
      "background_packages?id=eq." + encodeURIComponent(packageId),
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ publish_status: "draft" }),
      }
    );

    return NextResponse.json({ ok: true, publishStatus: "draft" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not change background status." },
      { status: 500 }
    );
  }
}
