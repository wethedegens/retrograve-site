// app/api/studio/update-render-config/route.ts
import { NextResponse } from "next/server";
import { requireCurrentCollectionAuthority } from "../../../lib/lockscreened/server/currentAuthority";
import {
  consumeStudioActionRateLimit,
  getAuthenticatedUser,
  isTrustedStudioRequestOrigin,
  restAsUser,
} from "../../../lib/lockscreened/server/supabaseServer";

export const dynamic = "force-dynamic";

async function loadCollection(accessToken: string, userId: string, collectionId: string) {
  const rows = await restAsUser<any[]>(
    accessToken,
    "collections?id=eq." + encodeURIComponent(collectionId) +
      "&select=id,created_by,source_type,source_config,publish_status,flagship,legacy_assets_locked,render_profile&limit=1"
  );
  const collection = rows?.[0];
  if (!collection || collection.created_by !== userId) throw new Error("Project not found.");
  if (collection.flagship || collection.legacy_assets_locked) throw new Error("Legacy flagship projects cannot be edited from Creator Studio.");

  const preMint =
    collection.source_type === "demo" &&
    collection.source_config?.preMint === true &&
    collection.publish_status === "draft";

  if (!preMint) {
    const collectionAddress = String(collection?.source_config?.collectionIds?.[0] || "").trim();
    if (collection.source_type !== "solana_collection" || !collectionAddress) {
      throw new Error("This project does not have a valid Solana collection identity.");
    }
    await requireCurrentCollectionAuthority({ user: { id: userId }, collectionAddress });
  }
  return collection;
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
    const action = String(body?.action || "").trim();
    if (!collectionId || !["layer_config", "finished_artwork", "device_placement"].includes(action)) {
      return NextResponse.json({ error: "A valid render configuration action is required." }, { status: 400 });
    }

    const allowed = await consumeStudioActionRateLimit(accessToken, "update_render_config");
    if (!allowed) return NextResponse.json({ error: "Too many configuration changes. Wait a few minutes and try again." }, { status: 429 });

    const collection = await loadCollection(accessToken, user.id, collectionId);
    const current = collection.render_profile || {};

    if (action === "layer_config") {
      const layers = Array.isArray(body?.layers) ? body.layers.slice(0, 100) : [];
      if (!layers.length) return NextResponse.json({ error: "Trait layers are required." }, { status: 400 });

      for (const layer of layers) {
        const layerId = String(layer?.id || "").trim();
        if (!layerId) continue;
        await restAsUser<void>(
          accessToken,
          "trait_layers?id=eq." + encodeURIComponent(layerId) +
            "&collection_id=eq." + encodeURIComponent(collectionId),
          {
            method: "PATCH",
            headers: { Prefer: "return=minimal" },
            body: JSON.stringify({
              display_name: String(layer?.display_name || "").trim().slice(0, 120),
              layer_order: Math.max(0, Math.min(999, Number(layer?.layer_order) || 0)),
              is_background: Boolean(layer?.is_background),
            }),
          }
        );
      }

      await restAsUser<void>(accessToken, "collections?id=eq." + encodeURIComponent(collectionId), {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          render_mode: "layered_traits",
          render_profile: {
            ...current,
            engine: "universal_trait_engine",
            backgroundHandling: body?.omitOriginalBackgroundWhenCustom
              ? "omit_original_when_custom"
              : "keep_original_background",
            layerOrderConfirmedAt: new Date().toISOString(),
          },
        }),
      });
    } else if (action === "finished_artwork") {
      const config = body?.finishedArtwork || {};
      const extensionStyle = ["edge_color", "gradient", "blur"].includes(config.extensionStyle)
        ? config.extensionStyle : "edge_color";
      const verticalAlign = ["top", "center", "bottom"].includes(config.verticalAlign)
        ? config.verticalAlign : "center";
      const artworkScale = Math.max(0.1, Math.min(3, Number(config.artworkScale) || 1));
      const sampledColor = /^#[0-9a-f]{6}$/i.test(String(config.sampledColor || ""))
        ? String(config.sampledColor) : "#000000";

      await restAsUser<void>(accessToken, "collections?id=eq." + encodeURIComponent(collectionId), {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          render_mode: "flat_background_extend",
          render_profile: {
            ...current,
            engine: "finished_artwork_engine",
            backgroundHandling: "preserve_finished_artwork",
            finishedArtwork: { extensionStyle, sampledColor, artworkScale, verticalAlign, configuredAt: new Date().toISOString() },
          },
        }),
      });
    } else {
      const placement = body?.devicePlacement || {};
      const clean = (value: any) => ({
        scale: Math.max(0.1, Math.min(3, Number(value?.scale) || 1)),
        x: ["left", "center", "right"].includes(value?.x) ? value.x : "center",
        y: ["top", "center", "bottom"].includes(value?.y) ? value.y : "center",
      });
      await restAsUser<void>(accessToken, "collections?id=eq." + encodeURIComponent(collectionId), {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          render_profile: {
            ...current,
            engine: current.engine || "universal_trait_engine",
            devicePlacement: {
              phone: clean(placement.phone),
              ipad: clean(placement.ipad),
              desktop: clean(placement.desktop),
            },
          },
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update render configuration.";
    const status = /authority|wallet|flagship|not found/i.test(message) ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
