// app/api/studio/publish-mint-override/route.ts
import { NextResponse } from "next/server";
import { publicPreviewPath, STORAGE_BUCKETS } from "../../../lib/lockscreened/storagePaths";
import {
  consumeStudioActionRateLimit,
  isTrustedStudioRequestOrigin,
  copyStorageObjectAsAdmin,
  deleteStorageObjectsAsAdmin,
  getAuthenticatedUser,
  hasSupabaseAdminKey,
  restAsAdmin,
  restAsUser,
} from "../../../lib/lockscreened/server/supabaseServer";

export const dynamic = "force-dynamic";

function sourceFileName(path: string) {
  return String(path || "").split("/").filter(Boolean).pop() || "override.png";
}

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

    if (!accessToken) {
      return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    }

    const user = await getAuthenticatedUser(accessToken);
    if (!user?.id) {
      return NextResponse.json({ error: "Studio session expired." }, { status: 401 });
    }

    const allowed = await consumeStudioActionRateLimit(
      accessToken,
      "publish_mint_override"
    );

    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Too many Creator Studio requests. Wait a few minutes and try again.",
          rateLimited: true,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const overrideId = String(body?.overrideId || "").trim();
    if (!overrideId) {
      return NextResponse.json({ error: "Override ID is required." }, { status: 400 });
    }

    const rows = await restAsUser<any[]>(
      accessToken,
      "mint_overrides?id=eq." +
        encodeURIComponent(overrideId) +
        "&select=id,collection_id,asset_id,storage_bucket,storage_path,bytes,notes&limit=1"
    );

    const override = rows?.[0];
    if (!override) {
      return NextResponse.json({ error: "Mint override not found." }, { status: 404 });
    }

    const [collections, claims] = await Promise.all([
      restAsUser<any[]>(
        accessToken,
        "collections?id=eq." +
          encodeURIComponent(override.collection_id) +
          "&select=id,slug,name&limit=1"
      ),
      restAsUser<any[]>(
        accessToken,
        "collection_claims?collection_id=eq." +
          encodeURIComponent(override.collection_id) +
          "&requested_by=eq." +
          encodeURIComponent(user.id) +
          "&select=id,status&limit=1"
      ),
    ]);

    const collection = collections?.[0];
    if (!collection) {
      return NextResponse.json({ error: "Parent collection not found." }, { status: 404 });
    }

    if (claims?.[0]?.status !== "verified") {
      return NextResponse.json(
        { error: "Verify the collection claim before publishing overrides." },
        { status: 403 }
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

    if (override.storage_bucket !== STORAGE_BUCKETS.creatorSourcePrivate) {
      throw new Error("Unexpected mint override source bucket.");
    }

    const destinationPath = publicPreviewPath({
      collectionSlug: collection.slug,
      assetType: "mint",
      assetId: override.asset_id,
      fileName: sourceFileName(override.storage_path),
    });

    try {
      await deleteStorageObjectsAsAdmin({
        bucket: STORAGE_BUCKETS.publishedPublic,
        paths: [destinationPath],
      });
    } catch {}

    await copyStorageObjectAsAdmin({
      sourceBucket: override.storage_bucket,
      sourcePath: override.storage_path,
      destinationBucket: STORAGE_BUCKETS.publishedPublic,
      destinationPath,
    });

    const published = await restAsAdmin<any[]>(
      "published_mint_overrides?on_conflict=collection_id,asset_id&select=id,collection_id,asset_id,storage_bucket,storage_path,bytes,mime_type,derivation",
      {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify([
          {
            collection_id: override.collection_id,
            asset_id: override.asset_id,
            storage_bucket: STORAGE_BUCKETS.publishedPublic,
            storage_path: destinationPath,
            bytes: override.bytes,
            derivation: { kind: "copy_v1", source_override_id: override.id },
          },
        ]),
      }
    );

    return NextResponse.json({ ok: true, override: published?.[0] || null });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not publish override." },
      { status: 500 }
    );
  }
}
