// app/api/studio/validation-sample/route.ts
import { NextResponse } from "next/server";
import { getCollectionValidationSample } from "../../../lib/lockscreened/server/heliusCollectionSample";
import {
  consumeStudioActionRateLimit,
  isTrustedStudioRequestOrigin,
  getAuthenticatedUser,
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
      return NextResponse.json(
        { error: "Collection ID is required." },
        { status: 400 }
      );
    }

    const [collections, claims] = await Promise.all([
      restAsUser<any[]>(
        accessToken,
        "collections?id=eq." +
          encodeURIComponent(collectionId) +
          "&select=id,name,source_type,source_config&limit=1"
      ),
      restAsUser<any[]>(
        accessToken,
        "collection_claims?collection_id=eq." +
          encodeURIComponent(collectionId) +
          "&requested_by=eq." +
          encodeURIComponent(user.id) +
          "&select=id,status&limit=1"
      ),
    ]);

    const collection = collections?.[0];
    const claim = claims?.[0];

    if (!collection) {
      return NextResponse.json(
        { error: "Collection draft was not found." },
        { status: 404 }
      );
    }

    if (claim?.status !== "verified") {
      return NextResponse.json(
        { error: "Verify the collection claim before running validation." },
        { status: 403 }
      );
    }

    if (collection.source_type !== "solana_collection") {
      return NextResponse.json(
        { error: "Minted-collection validation currently supports Solana collections." },
        { status: 400 }
      );
    }

    const collectionAddress = String(
      collection?.source_config?.collectionIds?.[0] || ""
    ).trim();

    if (!collectionAddress) {
      return NextResponse.json(
        { error: "Collection address is missing from this draft." },
        { status: 400 }
      );
    }

    const sample = await getCollectionValidationSample(collectionAddress, 12);

    return NextResponse.json({
      ok: true,
      collection: {
        id: collection.id,
        name: collection.name,
        address: collectionAddress,
      },
      sample,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not load a validation sample.",
      },
      { status: 500 }
    );
  }
}
