// app/api/studio/background-draft/route.ts
import { NextResponse } from "next/server";
import { requireCurrentCollectionAuthority, studioSecurityErrorStatus } from "../../../lib/lockscreened/server/currentAuthority";
import {
  consumeStudioActionRateLimit,
  getAuthenticatedUser,
  isTrustedStudioRequestOrigin,
  restAsUser,
} from "../../../lib/lockscreened/server/supabaseServer";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!isTrustedStudioRequestOrigin(request)) return NextResponse.json({ error: "Cross-site Creator Studio request blocked." }, { status: 403 });
    const auth = request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    if (!token) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    const user = await getAuthenticatedUser(token);
    if (!user?.id) return NextResponse.json({ error: "Studio session expired." }, { status: 401 });

    const body = await request.json();
    const collectionId = String(body?.collectionId || "").trim();
    const name = String(body?.name || "").trim().slice(0, 120);
    if (!collectionId || !name) return NextResponse.json({ error: "Project and background name are required." }, { status: 400 });

    const allowed = await consumeStudioActionRateLimit(token, "background_draft");
    if (!allowed) return NextResponse.json({ error: "Too many background changes. Wait a few minutes and try again." }, { status: 429 });

    const rows = await restAsUser<any[]>(
      token,
      "collections?id=eq." + encodeURIComponent(collectionId) +
        "&created_by=eq." + encodeURIComponent(user.id) +
        "&select=id,source_type,source_config,publish_status,flagship,legacy_assets_locked&limit=1"
    );
    const collection = rows?.[0];
    if (!collection) return NextResponse.json({ error: "Project not found." }, { status: 404 });
    if (collection.flagship || collection.legacy_assets_locked) return NextResponse.json({ error: "Legacy flagship projects cannot accept Creator Studio backgrounds." }, { status: 403 });

    const preMint = collection.source_type === "demo" && collection.source_config?.preMint === true && collection.publish_status === "draft";
    if (!preMint) {
      const address = String(collection?.source_config?.collectionIds?.[0] || "").trim();
      if (collection.source_type !== "solana_collection" || !address) return NextResponse.json({ error: "This project has no valid Solana collection identity." }, { status: 400 });
      await requireCurrentCollectionAuthority({ user, collectionAddress: address });
    }

    const created = await restAsUser<any[]>(
      token,
      "background_packages?select=id,collection_id,name,source,locked,publish_status,created_at",
      {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          collection_id: collectionId,
          name,
          source: "official_creator",
          locked: false,
          publish_status: "draft",
          created_by: user.id,
        }),
      }
    );
    if (!created?.[0]) throw new Error("Could not save background package.");
    return NextResponse.json({ ok: true, background: created[0] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create background draft." },
      { status: studioSecurityErrorStatus(error) }
    );
  }
}
