// app/api/studio/run-validation/route.ts
import { NextResponse } from "next/server";
import { matchMetadataToTraitAssets } from "../../../lib/lockscreened/traitMapping";
import { getCollectionValidationSample } from "../../../lib/lockscreened/server/heliusCollectionSample";
import {
  consumeStudioActionRateLimit,
  getAuthenticatedUser,
  hasSupabaseAdminKey,
  restAsAdmin,
  restAsUser,
} from "../../../lib/lockscreened/server/supabaseServer";

export const dynamic = "force-dynamic";

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

    const allowed = await consumeStudioActionRateLimit(
      accessToken,
      "validation"
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
    const collectionId = String(body?.collectionId || "").trim();

    if (!collectionId) {
      return NextResponse.json({ error: "Collection ID is required." }, { status: 400 });
    }

    const [collections, claims, layers] = await Promise.all([
      restAsUser<any[]>(
        accessToken,
        "collections?id=eq." +
          encodeURIComponent(collectionId) +
          "&select=id,name,source_type,source_config,render_mode&limit=1"
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
        { error: "Verify collection authority before validation." },
        { status: 403 }
      );
    }

    if (collection.render_mode !== "layered_traits") {
      return NextResponse.json(
        { error: "This project is not configured for layered reconstruction." },
        { status: 400 }
      );
    }

    const collectionAddress = String(
      collection?.source_config?.collectionIds?.[0] || ""
    ).trim();

    if (!collectionAddress) {
      return NextResponse.json(
        { error: "Collection address is missing." },
        { status: 400 }
      );
    }

    const layerIds = (layers || []).map((layer) => layer.id).filter(Boolean);
    if (!layerIds.length) {
      return NextResponse.json(
        { error: "Save the trait layer map before validation." },
        { status: 400 }
      );
    }

    const layerIn = layerIds
      .map((id: string) => '"' + String(id).replace(/"/g, "") + '"')
      .join(",");

    const traitAssets = await restAsUser<any[]>(
      accessToken,
      "trait_assets?layer_id=in.(" +
        encodeURIComponent(layerIn) +
        ")&select=id,layer_id,trait_value,storage_bucket,storage_path,bytes,mime_type"
    );

    if (!traitAssets?.length) {
      return NextResponse.json(
        { error: "Upload private trait source assets before validation." },
        { status: 400 }
      );
    }

    const importedLayers = layers.map((layer: any) => ({
      name: layer.display_name || layer.trait_type,
      suggestedOrder: Number(layer.layer_order || 0),
      likelyBackground: Boolean(layer.is_background),
      assets: traitAssets
        .filter((asset: any) => asset.layer_id === layer.id)
        .map((asset: any) => ({
          layerName: layer.display_name || layer.trait_type,
          traitValue: asset.trait_value,
          relativePath: asset.storage_path,
        })),
    }));

    const sample = await getCollectionValidationSample(collectionAddress, 12);

    const results = sample.map((nft) => {
      const match = matchMetadataToTraitAssets(
        importedLayers as any,
        nft.attributes || []
      );

      return {
        nft,
        match,
      };
    });

    const matchedTraits = results.reduce(
      (sum, result) => sum + result.match.matched.length,
      0
    );
    const missingTraits = results.reduce(
      (sum, result) => sum + result.match.missing.length,
      0
    );
    const unmappedMetadata = results.reduce(
      (sum, result) => sum + result.match.unusedMetadata.length,
      0
    );

    const passed =
      sample.length > 0 &&
      matchedTraits > 0 &&
      missingTraits === 0;

    const compactReport = {
      collectionAddress,
      sampledNfts: sample.length,
      matchedTraits,
      missingTraits,
      unmappedMetadata,
      missingExamples: results.flatMap((result) =>
        result.match.missing.slice(0, 6).map((item) => ({
          nftId: result.nft.id,
          nftName: result.nft.name,
          traitType: item.traitType,
          traitValue: item.traitValue,
        }))
      ).slice(0, 30),
    };

    let persisted = false;

    if (hasSupabaseAdminKey()) {
      await restAsAdmin<any[]>(
        "collection_validation_runs?select=id,status,checked_at",
        {
          method: "POST",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({
            collection_id: collectionId,
            status: passed ? "passed" : "failed",
            sampled_nfts: sample.length,
            matched_traits: matchedTraits,
            missing_traits: missingTraits,
            unmapped_metadata: unmappedMetadata,
            report: compactReport,
          }),
        }
      );
      persisted = true;
    }

    return NextResponse.json({
      ok: true,
      status: passed ? "passed" : "failed",
      persisted,
      needsServerSecret: !persisted,
      totals: {
        sampledNfts: sample.length,
        matchedTraits,
        missingTraits,
        unmappedMetadata,
      },
      sample,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Validation failed.",
      },
      { status: 500 }
    );
  }
}
