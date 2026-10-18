// app/api/studio/publish-project/route.ts
import { NextResponse } from "next/server";
import { requireCurrentCollectionAuthority } from "../../../lib/lockscreened/server/currentAuthority";
import {
  consumeStudioActionRateLimit,
  getAuthenticatedUser,
  hasSupabaseAdminKey,
  isTrustedStudioRequestOrigin,
  restAsAdmin,
  restAsUser,
} from "../../../lib/lockscreened/server/supabaseServer";

export const dynamic = "force-dynamic";

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
      "publish_project"
    );

    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Too many publish attempts. Wait a few minutes and try again.",
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

    const [collections, claims, backgrounds, validationRuns] = await Promise.all([
      restAsUser<any[]>(
        accessToken,
        "collections?id=eq." +
          encodeURIComponent(collectionId) +
          "&select=id,source_type,source_config,render_mode,render_profile,public_profile,publish_status&limit=1"
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
        "background_packages?collection_id=eq." +
          encodeURIComponent(collectionId) +
          "&publish_status=eq.published&select=id"
      ),
      restAsUser<any[]>(
        accessToken,
        "collection_validation_runs?collection_id=eq." +
          encodeURIComponent(collectionId) +
          "&select=id,status,checked_at&order=checked_at.desc&limit=1"
      ),
    ]);

    const collection = collections?.[0];
    if (!collection) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    if (claims?.[0]?.status !== "verified") {
      return NextResponse.json(
        { error: "Verify current collection authority before publishing." },
        { status: 403 }
      );
    }

    const profile = collection.public_profile || {};
    if (!String(profile.description || profile.tagline || "").trim()) {
      return NextResponse.json(
        { error: "Add a project tagline or description before publishing." },
        { status: 400 }
      );
    }

    const packageIds = (backgrounds || []).map((item: any) => item.id).filter(Boolean);
    let phoneBackgrounds: any[] = [];

    if (packageIds.length) {
      const encodedIds = packageIds
        .map((id: string) => '"' + String(id).replace(/"/g, "") + '"')
        .join(",");

      phoneBackgrounds = await restAsUser<any[]>(
        accessToken,
        "background_assets?package_id=in.(" +
          encodeURIComponent(encodedIds) +
          ")&device=eq.phone&storage_bucket=eq.published-public&select=id&limit=1"
      );
    }

    const finishedArtworkConfigured =
      collection.render_mode === "flat_background_extend" &&
      Boolean(collection?.render_profile?.finishedArtwork?.configuredAt);

    if (!phoneBackgrounds?.length && !finishedArtworkConfigured) {
      return NextResponse.json(
        {
          error:
            collection.render_mode === "flat_background_extend"
              ? "Save a finished-artwork extension treatment or publish a phone background before launching."
              : "Publish at least one phone background before launching.",
        },
        { status: 400 }
      );
    }

    if (collection.render_mode === "layered_traits") {
      if (!collection.render_profile?.layerOrderConfirmedAt) {
        return NextResponse.json(
          { error: "Confirm the trait layer order before publishing." },
          { status: 400 }
        );
      }

      if (validationRuns?.[0]?.status !== "passed") {
        return NextResponse.json(
          { error: "Run and pass reconstruction validation before publishing." },
          { status: 400 }
        );
      }

      const layers = await restAsUser<any[]>(
        accessToken,
        "trait_layers?collection_id=eq." +
          encodeURIComponent(collectionId) +
          "&select=id"
      );

      const layerIds = (layers || []).map((item: any) => item.id).filter(Boolean);
      let publishedTraits: any[] = [];

      if (layerIds.length) {
        const encodedLayerIds = layerIds
          .map((id: string) => '"' + String(id).replace(/"/g, "") + '"')
          .join(",");

        publishedTraits = await restAsUser<any[]>(
          accessToken,
          "published_trait_assets?layer_id=in.(" +
            encodeURIComponent(encodedLayerIds) +
            ")&select=id&limit=1"
        );
      }

      if (!publishedTraits?.length) {
        return NextResponse.json(
          { error: "Publish the validated render assets before launching." },
          { status: 400 }
        );
      }
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

    if (!hasSupabaseAdminKey()) {
      return NextResponse.json(
        {
          error: "Secure project publishing is waiting for SUPABASE_SECRET_KEY.",
          needsServerSecret: true,
        },
        { status: 503 }
      );
    }

    await restAsAdmin<void>(
      "collections?id=eq." + encodeURIComponent(collectionId),
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ publish_status: "published" }),
      }
    );

    return NextResponse.json({ ok: true, publishStatus: "published" });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not publish project.",
      },
      { status: 500 }
    );
  }
}
