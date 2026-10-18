// app/api/studio/trait-layer-map/route.ts
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
    if (!isTrustedStudioRequestOrigin(request)) return NextResponse.json({ error: "Cross-site Creator Studio request blocked." }, { status: 403 });
    const auth = request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    if (!token) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    const user = await getAuthenticatedUser(token);
    if (!user?.id) return NextResponse.json({ error: "Studio session expired." }, { status: 401 });

    const body = await request.json();
    const collectionId = String(body?.collectionId || "").trim();
    const layers = Array.isArray(body?.layers) ? body.layers.slice(0, 100) : [];
    if (!collectionId || !layers.length) return NextResponse.json({ error: "Project and trait layers are required." }, { status: 400 });

    const allowed = await consumeStudioActionRateLimit(token, "trait_layer_map");
    if (!allowed) return NextResponse.json({ error: "Too many trait changes. Wait a few minutes and try again." }, { status: 429 });

    const rows = await restAsUser<any[]>(
      token,
      "collections?id=eq." + encodeURIComponent(collectionId) +
        "&created_by=eq." + encodeURIComponent(user.id) +
        "&select=id,source_type,source_config,publish_status,flagship,legacy_assets_locked,render_profile&limit=1"
    );
    const collection = rows?.[0];
    if (!collection) return NextResponse.json({ error: "Project not found." }, { status: 404 });
    if (collection.flagship || collection.legacy_assets_locked) return NextResponse.json({ error: "Legacy flagship projects cannot be edited from Creator Studio." }, { status: 403 });

    const preMint = collection.source_type === "demo" && collection.source_config?.preMint === true && collection.publish_status === "draft";
    if (!preMint) {
      const address = String(collection?.source_config?.collectionIds?.[0] || "").trim();
      if (collection.source_type !== "solana_collection" || !address) return NextResponse.json({ error: "This project has no valid Solana collection identity." }, { status: 400 });
      await requireCurrentCollectionAuthority({ user, collectionAddress: address });
    }

    const cleanRows = layers.map((layer: any, index: number) => {
      const name = String(layer?.name || "").trim().slice(0, 120);
      if (!name) throw new Error("Every trait layer needs a name.");
      return {
        collection_id: collectionId,
        trait_type: name,
        display_name: name,
        layer_order: Math.max(0, Math.min(999, Number(layer?.suggestedOrder) || index)),
        is_background: Boolean(layer?.likelyBackground),
      };
    });

    const saved = await restAsUser<any[]>(
      token,
      "trait_layers?on_conflict=collection_id,trait_type&select=id,trait_type,display_name,layer_order,is_background",
      { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(cleanRows) }
    );

    await restAsUser<void>(token, "collections?id=eq." + encodeURIComponent(collectionId), {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        render_mode: "layered_traits",
        render_profile: {
          ...(collection.render_profile || {}),
          engine: "universal_trait_engine",
          backgroundHandling: collection.render_profile?.backgroundHandling || "creator_designated",
          layerOrderConfirmedAt: null,
        },
      }),
    });

    return NextResponse.json({ ok: true, layers: saved || [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save trait layer map." }, { status: 500 });
  }
}
