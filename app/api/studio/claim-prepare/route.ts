// app/api/studio/claim-prepare/route.ts
import { NextResponse } from "next/server";
import { extractSolanaWalletAddress } from "../../../lib/lockscreened/authIdentity";
import { getFlagshipProjectByCollectionId } from "../../../lib/lockscreened/flagshipProjects";
import {
  inspectCollectionAuthority,
  walletHasAuthorityEvidence,
} from "../../../lib/lockscreened/server/heliusAuthority";
import {
  consumeStudioActionRateLimit,
  getAuthenticatedUser,
  isTrustedStudioRequestOrigin,
  restAsUser,
} from "../../../lib/lockscreened/server/supabaseServer";

export const dynamic = "force-dynamic";

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

    const walletAddress = extractSolanaWalletAddress(user);
    if (!walletAddress) return NextResponse.json({ error: "No verified Solana wallet identity was found." }, { status: 403 });

    const body = await request.json();
    const collectionAddress = String(body?.collectionAddress || "").trim();
    const collectionId = String(body?.collectionId || "").trim();
    const collectionName = String(body?.collectionName || "Solana Collection").trim().slice(0, 120);
    if (!collectionAddress) return NextResponse.json({ error: "Collection address is required." }, { status: 400 });

    const flagship = getFlagshipProjectByCollectionId(collectionAddress);
    if (flagship) {
      return NextResponse.json(
        { error: flagship.name + " is a protected LockScreened flagship.", reservedFlagship: true },
        { status: 409 }
      );
    }

    const allowed = await consumeStudioActionRateLimit(accessToken, "claim_prepare");
    if (!allowed) return NextResponse.json({ error: "Too many claim attempts. Wait a few minutes and try again." }, { status: 429 });

    // Re-check authority on the server. Never trust the browser's earlier inspection.
    const snapshot = await inspectCollectionAuthority(collectionAddress, { fresh: true });
    const authority = walletHasAuthorityEvidence(walletAddress, snapshot);
    if (!authority.allowed && !authority.manualReviewEligible) {
      return NextResponse.json({ error: "This wallet has no current claim evidence for that collection." }, { status: 403 });
    }

    const studios = await restAsUser<any[]>(
      accessToken,
      "studios?owner_user_id=eq." + encodeURIComponent(user.id) + "&select=id&limit=1"
    );
    const studio = studios?.[0];
    if (!studio) return NextResponse.json({ error: "Create your Studio first." }, { status: 400 });

    let collection: any;
    if (collectionId) {
      const rows = await restAsUser<any[]>(
        accessToken,
        "collections?id=eq." + encodeURIComponent(collectionId) +
          "&created_by=eq." + encodeURIComponent(user.id) +
          "&source_type=eq.demo&publish_status=eq.draft&select=id,source_config,flagship,legacy_assets_locked&limit=1"
      );
      collection = rows?.[0];
      if (!collection || collection.flagship || collection.legacy_assets_locked || collection.source_config?.preMint !== true) {
        return NextResponse.json({ error: "Only your private pre-mint draft can be attached." }, { status: 403 });
      }

      await restAsUser<void>(
        accessToken,
        "collections?id=eq." + encodeURIComponent(collection.id),
        {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({
            source_type: "solana_collection",
            source_config: {
              ...(collection.source_config || {}),
              preMint: false,
              attachedAfterMint: true,
              collectionIds: [collectionAddress],
            },
          }),
        }
      );
    } else {
      const slug = "collection-" + collectionAddress.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 36);
      let rows = await restAsUser<any[]>(
        accessToken,
        "collections?studio_id=eq." + encodeURIComponent(studio.id) +
          "&slug=eq." + encodeURIComponent(slug) +
          "&select=id,studio_id,slug,name,source_type,source_config,publish_status&limit=1"
      );
      if (!rows?.[0]) {
        rows = await restAsUser<any[]>(
          accessToken,
          "collections?select=id,studio_id,slug,name,source_type,source_config,publish_status",
          {
            method: "POST",
            headers: { Prefer: "return=representation" },
            body: JSON.stringify({
              studio_id: studio.id,
              slug,
              name: collectionName || snapshot.name || "Solana Collection",
              source_type: "solana_collection",
              source_config: { collectionIds: [collectionAddress] },
              render_mode: "curated_composite",
              render_profile: {},
              flagship: false,
              legacy_assets_locked: false,
              publish_status: "draft",
              created_by: user.id,
            }),
          }
        );
      }
      collection = rows?.[0];
    }

    if (!collection?.id) return NextResponse.json({ error: "Could not prepare collection draft." }, { status: 500 });

    const existingClaims = await restAsUser<any[]>(
      accessToken,
      "collection_claims?collection_id=eq." + encodeURIComponent(collection.id) +
        "&requested_by=eq." + encodeURIComponent(user.id) +
        "&select=id,status,wallet_address&limit=1"
    );
    let claim = existingClaims?.[0];
    if (!claim) {
      const claims = await restAsUser<any[]>(
        accessToken,
        "collection_claims?select=id,status,wallet_address",
        {
          method: "POST",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({
            collection_id: collection.id,
            requested_by: user.id,
            wallet_address: walletAddress,
            status: "pending",
            evidence: [],
            authority_snapshot: {},
          }),
        }
      );
      claim = claims?.[0];
    }

    if (!claim) return NextResponse.json({ error: "Could not create claim request." }, { status: 500 });
    return NextResponse.json({
      ok: true,
      collection,
      claim,
      authorityEligible: authority.allowed,
      manualReviewEligible: authority.manualReviewEligible,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not prepare collection claim." },
      { status: 500 }
    );
  }
}
