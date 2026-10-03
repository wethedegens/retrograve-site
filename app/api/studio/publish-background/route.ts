// app/api/studio/publish-background/route.ts
import { NextResponse } from "next/server";
import { publicPreviewPath, STORAGE_BUCKETS } from "../../../lib/lockscreened/storagePaths";
import {
  consumeStudioActionRateLimit,
  isTrustedStudioRequestOrigin,
  copyStorageObjectAsAdmin,
  deleteStorageObjectsAsAdmin,
  getAuthenticatedUser,
  hasSupabaseAdminKey,
  publicStorageUrl,
  restAsAdmin,
  restAsUser,
} from "../../../lib/lockscreened/server/supabaseServer";

export const dynamic = "force-dynamic";

function extension(path: string) {
  const file = String(path || "").split("/").pop() || "";
  const dot = file.lastIndexOf(".");
  const ext = dot >= 0 ? file.slice(dot + 1).toLowerCase() : "png";
  return /^[a-z0-9]+$/.test(ext) ? ext : "png";
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
      return NextResponse.json(
        { error: "Sign in to Creator Studio first." },
        { status: 401 }
      );
    }

    const user = await getAuthenticatedUser(accessToken);
    if (!user?.id) {
      return NextResponse.json(
        { error: "Your Studio session is invalid or expired." },
        { status: 401 }
      );
    }

    const allowed = await consumeStudioActionRateLimit(
      accessToken,
      "publish_background"
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
    const packageId = String(body?.packageId || "").trim();

    if (!packageId) {
      return NextResponse.json(
        { error: "Background package ID is required." },
        { status: 400 }
      );
    }

    const packages = await restAsUser<any[]>(
      accessToken,
      "background_packages?id=eq." +
        encodeURIComponent(packageId) +
        "&select=id,collection_id,name,source,locked,publish_status&limit=1"
    );

    const packageRow = packages?.[0];
    if (!packageRow) {
      return NextResponse.json(
        { error: "Background package was not found." },
        { status: 404 }
      );
    }

    if (packageRow.source !== "official_creator" || packageRow.locked) {
      return NextResponse.json(
        { error: "This background package is not creator-publishable." },
        { status: 403 }
      );
    }

    const [collections, claims, sourceAssets] = await Promise.all([
      restAsUser<any[]>(
        accessToken,
        "collections?id=eq." +
          encodeURIComponent(packageRow.collection_id) +
          "&select=id,slug,name,publish_status&limit=1"
      ),
      restAsUser<any[]>(
        accessToken,
        "collection_claims?collection_id=eq." +
          encodeURIComponent(packageRow.collection_id) +
          "&requested_by=eq." +
          encodeURIComponent(user.id) +
          "&select=id,status,wallet_address&limit=1"
      ),
      restAsUser<any[]>(
        accessToken,
        "background_source_assets?package_id=eq." +
          encodeURIComponent(packageId) +
          "&select=id,device,storage_bucket,storage_path,bytes,mime_type&order=device.asc"
      ),
    ]);

    const collection = collections?.[0];
    const claim = claims?.[0];

    if (!collection) {
      return NextResponse.json(
        { error: "Parent collection was not found." },
        { status: 404 }
      );
    }

    if (claim?.status !== "verified") {
      return NextResponse.json(
        { error: "Verify the collection claim before publishing backgrounds." },
        { status: 403 }
      );
    }

    if (!sourceAssets?.length) {
      return NextResponse.json(
        { error: "Upload private background source files before publishing." },
        { status: 400 }
      );
    }

    if (!sourceAssets.some((asset) => asset.device === "phone")) {
      return NextResponse.json(
        { error: "A phone source asset is required before publishing." },
        { status: 400 }
      );
    }

    if (!hasSupabaseAdminKey()) {
      return NextResponse.json(
        {
          error:
            "The secure server-side Supabase secret is not configured yet.",
          needsServerSecret: true,
        },
        { status: 503 }
      );
    }

    const publishedAssets: any[] = [];

    for (const source of sourceAssets) {
      if (source.storage_bucket !== STORAGE_BUCKETS.creatorSourcePrivate) {
        throw new Error("Unexpected private source bucket.");
      }

      const fileName = `${source.device}.${extension(source.storage_path)}`;
      const destinationPath = publicPreviewPath({
        collectionSlug: collection.slug,
        assetType: "background",
        assetId: packageId,
        fileName,
      });

      try {
        await deleteStorageObjectsAsAdmin({
          bucket: STORAGE_BUCKETS.publishedPublic,
          paths: [destinationPath],
        });
      } catch {
        // A first publish usually has nothing to delete.
      }

      await copyStorageObjectAsAdmin({
        sourceBucket: STORAGE_BUCKETS.creatorSourcePrivate,
        sourcePath: source.storage_path,
        destinationBucket: STORAGE_BUCKETS.publishedPublic,
        destinationPath,
      });

      const rows = await restAsAdmin<any[]>(
        "background_assets?on_conflict=package_id,device&select=id,package_id,device,storage_bucket,storage_path,bytes,mime_type",
        {
          method: "POST",
          headers: {
            Prefer: "resolution=merge-duplicates,return=representation",
          },
          body: JSON.stringify([
            {
              package_id: packageId,
              device: source.device,
              storage_bucket: STORAGE_BUCKETS.publishedPublic,
              storage_path: destinationPath,
              bytes: source.bytes,
              mime_type: source.mime_type,
            },
          ]),
        }
      );

      publishedAssets.push({
        ...(rows?.[0] || {}),
        device: source.device,
        url: publicStorageUrl(
          STORAGE_BUCKETS.publishedPublic,
          destinationPath
        ),
      });
    }

    // Use the founder's own JWT for the final state change. The RLS publish
    // gate independently confirms a verified claim and a published phone asset.
    await restAsUser<void>(
      accessToken,
      "background_packages?id=eq." + encodeURIComponent(packageId),
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ publish_status: "published" }),
      }
    );

    return NextResponse.json({
      ok: true,
      packageId,
      publishStatus: "published",
      assets: publishedAssets,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not publish this background.",
      },
      { status: 500 }
    );
  }
}
