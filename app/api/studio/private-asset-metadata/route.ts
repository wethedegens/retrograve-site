// app/api/studio/private-asset-metadata/route.ts
import { NextResponse } from "next/server";
import { requireCurrentCollectionAuthority } from "../../../lib/lockscreened/server/currentAuthority";
import {
  consumeStudioActionRateLimit,
  getAuthenticatedUser,
  isTrustedStudioRequestOrigin,
  restAsUser,
} from "../../../lib/lockscreened/server/supabaseServer";

export const dynamic = "force-dynamic";
const PRIVATE_BUCKET = "creator-source-private";
const SAFE_MIME = new Set(["image/png", "image/webp", "image/jpeg"]);

function validPath(path: string, studioId: string, collectionId: string) {
  const normalized = String(path || "").replace(/\\/g, "/");
  const prefix = studioId.toLowerCase() + "/collections/" + collectionId.toLowerCase() + "/";
  return normalized.toLowerCase().startsWith(prefix) && !normalized.includes("../") && !normalized.includes("/..");
}

async function authorize(token: string, user: any, collectionId: string) {
  const rows = await restAsUser<any[]>(
    token,
    "collections?id=eq." + encodeURIComponent(collectionId) +
      "&created_by=eq." + encodeURIComponent(user.id) +
      "&select=id,studio_id,source_type,source_config,publish_status,flagship,legacy_assets_locked&limit=1"
  );
  const collection = rows?.[0];
  if (!collection) throw new Error("Project not found.");
  if (collection.flagship || collection.legacy_assets_locked) throw new Error("Legacy flagship projects cannot accept Creator Studio uploads.");

  const preMint = collection.source_type === "demo" && collection.source_config?.preMint === true && collection.publish_status === "draft";
  if (!preMint) {
    const address = String(collection?.source_config?.collectionIds?.[0] || "").trim();
    if (collection.source_type !== "solana_collection" || !address) throw new Error("This project has no valid Solana collection identity.");
    await requireCurrentCollectionAuthority({ user, collectionAddress: address });
  }
  return collection;
}

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
    const kind = String(body?.kind || "").trim();
    if (!collectionId || !["trait", "background", "mint_override"].includes(kind)) {
      return NextResponse.json({ error: "A valid private asset type and project are required." }, { status: 400 });
    }

    const allowed = await consumeStudioActionRateLimit(token, "private_asset_metadata");
    if (!allowed) return NextResponse.json({ error: "Too many asset changes. Wait a few minutes and try again." }, { status: 429 });

    const collection = await authorize(token, user, collectionId);

    if (kind === "trait") {
      const rows = Array.isArray(body?.rows) ? body.rows.slice(0, 100) : [];
      if (!rows.length) return NextResponse.json({ error: "Trait asset metadata is required." }, { status: 400 });
      const layerIds = [...new Set(rows.map((r: any) => String(r?.layer_id || "").trim()).filter(Boolean))];
      const layers = await restAsUser<any[]>(
        token,
        "trait_layers?collection_id=eq." + encodeURIComponent(collectionId) +
          "&id=in.(" + layerIds.map((id) => encodeURIComponent(id)).join(",") + ")&select=id"
      );
      const owned = new Set((layers || []).map((l: any) => String(l.id)));
      const clean = rows.map((r: any) => {
        const layerId = String(r?.layer_id || "").trim();
        const path = String(r?.storage_path || "");
        const bytes = Number(r?.bytes || 0);
        const mime = String(r?.mime_type || "").toLowerCase();
        if (!owned.has(layerId) || r?.storage_bucket !== PRIVATE_BUCKET || !validPath(path, collection.studio_id, collectionId) || bytes <= 0 || bytes > 2 * 1024 * 1024 || !SAFE_MIME.has(mime)) {
          throw new Error("Unsafe trait asset metadata was blocked.");
        }
        return { layer_id: layerId, trait_value: String(r?.trait_value || "").trim().slice(0, 160), storage_bucket: PRIVATE_BUCKET, storage_path: path, bytes, mime_type: mime };
      });
      const saved = await restAsUser<any[]>(token, "trait_assets?on_conflict=layer_id,trait_value&select=id,layer_id,trait_value,storage_bucket,storage_path,bytes,mime_type", {
        method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(clean),
      });
      return NextResponse.json({ ok: true, rows: saved || [] });
    }

    if (kind === "background") {
      const rows = Array.isArray(body?.rows) ? body.rows.slice(0, 4) : [];
      const packageId = String(rows?.[0]?.package_id || "").trim();
      const packages = await restAsUser<any[]>(token, "background_packages?id=eq." + encodeURIComponent(packageId) + "&collection_id=eq." + encodeURIComponent(collectionId) + "&select=id&limit=1");
      if (!packages?.[0]) throw new Error("Background package does not belong to this project.");
      const clean = rows.map((r: any) => {
        const path = String(r?.storage_path || ""); const bytes = Number(r?.bytes || 0); const mime = String(r?.mime_type || "").toLowerCase();
        if (String(r?.package_id || "") !== packageId || r?.storage_bucket !== PRIVATE_BUCKET || !validPath(path, collection.studio_id, collectionId) || bytes <= 0 || bytes > 8 * 1024 * 1024 || !SAFE_MIME.has(mime) || !["phone","ipad","desktop","thumb"].includes(r?.device)) throw new Error("Unsafe background asset metadata was blocked.");
        return { package_id: packageId, device: r.device, storage_bucket: PRIVATE_BUCKET, storage_path: path, bytes, mime_type: mime };
      });
      const saved = await restAsUser<any[]>(token, "background_source_assets?on_conflict=package_id,device&select=id,package_id,device,storage_bucket,storage_path,bytes,mime_type", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(clean) });
      return NextResponse.json({ ok: true, rows: saved || [] });
    }

    const assetId = String(body?.assetId || "").trim();
    const path = String(body?.storagePath || ""); const bytes = Number(body?.bytes || 0);
    if (!assetId || body?.storageBucket !== PRIVATE_BUCKET || !validPath(path, collection.studio_id, collectionId) || bytes <= 0 || bytes > 8 * 1024 * 1024) throw new Error("Unsafe mint override metadata was blocked.");
    const saved = await restAsUser<any[]>(token, "mint_overrides?on_conflict=collection_id,asset_id&select=id,collection_id,asset_id,storage_bucket,storage_path,bytes,notes,created_at", {
      method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify([{ collection_id: collectionId, asset_id: assetId.slice(0, 160), storage_bucket: PRIVATE_BUCKET, storage_path: path, bytes, notes: String(body?.notes || "").trim().slice(0, 500) }]),
    });
    return NextResponse.json({ ok: true, rows: saved || [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Private asset metadata was blocked." }, { status: 500 });
  }
}
