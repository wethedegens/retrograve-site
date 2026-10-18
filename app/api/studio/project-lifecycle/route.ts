// app/api/studio/project-lifecycle/route.ts
import { NextResponse } from "next/server";
import { requireCurrentCollectionAuthority } from "../../../lib/lockscreened/server/currentAuthority";
import {
  consumeStudioActionRateLimit,
  getAuthenticatedUser,
  isTrustedStudioRequestOrigin,
  restAsUser,
} from "../../../lib/lockscreened/server/supabaseServer";

export const dynamic = "force-dynamic";

const ALLOWED_TRANSITIONS: Record<string, { from: string[]; to: string }> = {
  unpublish: { from: ["published"], to: "draft" },
  archive: { from: ["draft"], to: "archived" },
  restore: { from: ["archived"], to: "draft" },
};

export async function POST(request: Request) {
  try {
    if (!isTrustedStudioRequestOrigin(request)) {
      return NextResponse.json(
        { error: "Cross-site Creator Studio request blocked." },
        { status: 403 }
      );
    }
    const authHeader = request.headers.get("authorization") || "";
    const accessToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : "";
    if (!accessToken) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

    const user = await getAuthenticatedUser(accessToken);
    if (!user?.id) return NextResponse.json({ error: "Studio session expired." }, { status: 401 });

    const body = await request.json();
    const collectionId = String(body?.collectionId || "").trim();
    const action = String(body?.action || "").trim().toLowerCase();
    const transition = ALLOWED_TRANSITIONS[action];
    if (!collectionId || !transition) {
      return NextResponse.json({ error: "A valid project and lifecycle action are required." }, { status: 400 });
    }

    const allowed = await consumeStudioActionRateLimit(accessToken, "project_lifecycle");
    if (!allowed) {
      return NextResponse.json({ error: "Too many project changes. Wait a few minutes and try again." }, { status: 429 });
    }

    const collections = await restAsUser<any[]>(
      accessToken,
      "collections?id=eq." + encodeURIComponent(collectionId) +
        "&select=id,publish_status,flagship,legacy_assets_locked,source_type,source_config&limit=1"
    );
    const collection = collections?.[0];
    if (!collection) return NextResponse.json({ error: "Project not found." }, { status: 404 });

    if (collection.flagship || collection.legacy_assets_locked) {
      return NextResponse.json(
        { error: "Legacy flagship projects cannot be changed from Creator Studio." },
        { status: 403 }
      );
    }

    if (!transition.from.includes(String(collection.publish_status || ""))) {
      return NextResponse.json(
        { error: "That project state change is not allowed from its current status." },
        { status: 409 }
      );
    }

    const collectionAddress = String(
      collection?.source_config?.collectionIds?.[0] || ""
    ).trim();
    if (collection.source_type !== "solana_collection" || !collectionAddress) {
      return NextResponse.json(
        { error: "This project does not have a valid Solana collection identity." },
        { status: 400 }
      );
    }

    await requireCurrentCollectionAuthority({
      user,
      collectionAddress,
    });

    await restAsUser<void>(
      accessToken,
      "collections?id=eq." + encodeURIComponent(collectionId),
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ publish_status: transition.to }),
      }
    );

    return NextResponse.json({ ok: true, publishStatus: transition.to });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not change project status." },
      { status: 500 }
    );
  }
}
