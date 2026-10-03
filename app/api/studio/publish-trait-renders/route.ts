// app/api/studio/publish-trait-renders/route.ts
import { NextResponse } from "next/server";
import { publicPreviewPath, STORAGE_BUCKETS } from "../../../lib/lockscreened/storagePaths";
import {
  copyStorageObjectAsAdmin,
  deleteStorageObjectsAsAdmin,
  getAuthenticatedUser,
  hasSupabaseAdminKey,
  restAsAdmin,
  restAsUser,
} from "../../../lib/lockscreened/server/supabaseServer";

export const dynamic = "force-dynamic";

function fileNameFromPath(path: string) {
  return String(path || "").split("/").filter(Boolean).pop() || "asset.png";
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const accessToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : "";

    if (!accessToken) {
      return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    }

    const user = await getAuthenticatedUser(accessToken);
    if (!user?.id) {
      return NextResponse.json({ error: "Studio session expired." }, { status: 401 });
    }

    const body = await request.json();
    const collectionId = String(body?.collectionId || "").trim();
    if (!collectionId) {
      return NextResponse.json({ error: "Collection ID is required." }, { status: 400 });
    }

    const [collections, claims, layers] = await Promise.all([
      restAsUser<any[]>(
        accessToken,
        "collections?id=eq." +
          encodeURIComponent(collectionId) +
          "&select=id,slug,name,render_mode&limit=1"
      ),
      restAsUser<any[]>(
        accessToken,
        "collection_claims?collection_id=eq." +
          encodeURIComponent(collectionId) +
          "&requested_by=eq." +
          encodeURIComponent(user.id) +
          "&select=id,status&limit=1"
      ),
      restAsUser<any[]>(
        accessToken,
        "trait_layers?collection_id=eq." +
          encodeURIComponent(collectionId) +
          "&select=id,trait_type,display_name,layer_order,is_background&order=layer_order.asc"
      ),
    ]);

    const collection = collections?.[0];
    if (!collection) {
      return NextResponse.json({ error: "Collection draft not found." }, { status: 404 });
    }

    if (claims?.[0]?.status !== "verified") {
      return NextResponse.json(
        { error: "Verify the collection claim before publishing render assets." },
        { status: 403 }
      );
    }

    if (collection.render_mode !== "layered_traits") {
      return NextResponse.json(
        { error: "This project is not configured for layered trait rendering." },
        { status: 400 }
      );
    }

    if (!layers?.length) {
      return NextResponse.json(
        { error: "Save and upload the trait library first." },
        { status: 400 }
      );
    }

    if (!hasSupabaseAdminKey()) {
      return NextResponse.json(
        {
          error: "Secure server publishing is waiting for SUPABASE_SECRET_KEY.",
          needsServerSecret: true,
        },
        { status: 503 }
      );
    }

    const layerIds = layers.map((layer) => layer.id);
    const inList = layerIds
      .map((id: string) => '"' + String(id).replace(/"/g, "") + '"')
      .join(",");

    const sourceAssets = await restAsUser<any[]>(
      accessToken,
      "trait_assets?layer_id=in.(" +
        encodeURIComponent(inList) +
        ")&select=id,layer_id,trait_value,storage_bucket,storage_path,bytes,mime_type"
    );

    if (!sourceAssets?.length) {
      return NextResponse.json(
        { error: "No private trait source assets were found." },
        { status: 400 }
      );
    }

    const published: any[] = [];

    for (const source of sourceAssets) {
      if (source.storage_bucket !== STORAGE_BUCKETS.creatorSourcePrivate) {
        throw new Error("Unexpected source bucket.");
      }

      const destinationPath = publicPreviewPath({
        collectionSlug: collection.slug,
        assetType: "trait",
        assetId: source.layer_id,
        fileName: fileNameFromPath(source.storage_path),
      });

      try {
        await deleteStorageObjectsAsAdmin({
          bucket: STORAGE_BUCKETS.publishedPublic,
          paths: [destinationPath],
        });
      } catch {}

      await copyStorageObjectAsAdmin({
        sourceBucket: STORAGE_BUCKETS.creatorSourcePrivate,
        sourcePath: source.storage_path,
        destinationBucket: STORAGE_BUCKETS.publishedPublic,
        destinationPath,
      });

      const rows = await restAsAdmin<any[]>(
        "published_trait_assets?on_conflict=layer_id,trait_value&select=id,layer_id,trait_value,storage_bucket,storage_path,bytes,mime_type,derivation",
        {
          method: "POST",
          headers: {
            Prefer: "resolution=merge-duplicates,return=representation",
          },
          body: JSON.stringify([
            {
              layer_id: source.layer_id,
              trait_value: source.trait_value,
              storage_bucket: STORAGE_BUCKETS.publishedPublic,
              storage_path: destinationPath,
              bytes: source.bytes,
              mime_type: source.mime_type,
              derivation: {
                kind: "copy_v1",
                source_asset_id: source.id,
              },
            },
          ]),
        }
      );

      published.push(rows?.[0] || { layer_id: source.layer_id, trait_value: source.trait_value });
    }

    return NextResponse.json({
      ok: true,
      publishedCount: published.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not publish render assets." },
      { status: 500 }
    );
  }
}
