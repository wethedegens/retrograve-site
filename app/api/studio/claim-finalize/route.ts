// app/api/studio/claim-finalize/route.ts
import { NextResponse } from "next/server";
import { extractSolanaWalletAddress } from "../../../lib/lockscreened/authIdentity";
import {
  inspectCollectionAuthority,
  walletHasAuthorityEvidence,
} from "../../../lib/lockscreened/server/heliusAuthority";
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
      "claim_finalize"
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

    const authenticatedWallet = extractSolanaWalletAddress(user);
    if (!authenticatedWallet) {
      return NextResponse.json(
        { error: "No verified Solana identity was found on this account." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const claimId = String(body?.claimId || "").trim();

    if (!claimId) {
      return NextResponse.json(
        { error: "Claim ID is required." },
        { status: 400 }
      );
    }

    const claims = await restAsUser<any[]>(
      accessToken,
      "collection_claims?id=eq." +
        encodeURIComponent(claimId) +
        "&requested_by=eq." +
        encodeURIComponent(user.id) +
        "&select=id,collection_id,wallet_address,status&limit=1"
    );

    const claim = claims?.[0];
    if (!claim) {
      return NextResponse.json(
        { error: "Claim was not found for this Studio account." },
        { status: 404 }
      );
    }

    if (claim.wallet_address !== authenticatedWallet) {
      return NextResponse.json(
        { error: "The claim wallet does not match the authenticated wallet." },
        { status: 403 }
      );
    }

    const collections = await restAsUser<any[]>(
      accessToken,
      "collections?id=eq." +
        encodeURIComponent(claim.collection_id) +
        "&select=id,name,source_type,source_config&limit=1"
    );

    const collection = collections?.[0];
    if (!collection || collection.source_type !== "solana_collection") {
      return NextResponse.json(
        { error: "This claim is not attached to a Solana collection." },
        { status: 400 }
      );
    }

    const collectionAddress = String(
      collection?.source_config?.collectionIds?.[0] || ""
    ).trim();

    if (!collectionAddress) {
      return NextResponse.json(
        { error: "Collection address is missing from the draft." },
        { status: 400 }
      );
    }

    // Re-check Helius at finalization time. We do not trust the earlier browser
    // inspection result or any client-supplied authority evidence.
    const snapshot = await inspectCollectionAuthority(collectionAddress);
    const authority = walletHasAuthorityEvidence(
      authenticatedWallet,
      snapshot
    );

    if (!authority.allowed) {
      return NextResponse.json(
        {
          error:
            "This wallet no longer has collection authority or verified-creator evidence.",
          authorityConfirmed: false,
        },
        { status: 403 }
      );
    }

    if (!hasSupabaseAdminKey()) {
      return NextResponse.json(
        {
          error:
            "Authority is confirmed, but secure claim finalization is not configured on the server yet.",
          authorityConfirmed: true,
          needsServerSecret: true,
        },
        { status: 503 }
      );
    }

    const storedSnapshot = {
      assetId: snapshot.assetId,
      name: snapshot.name,
      authorities: snapshot.authorities,
      verifiedCreators: snapshot.verifiedCreators,
      mutable: snapshot.mutable,
    };

    const updated = await restAsAdmin<any[]>(
      "collection_claims?id=eq." +
        encodeURIComponent(claim.id) +
        "&select=id,status,wallet_address,verified_at",
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          status: "verified",
          evidence: authority.evidence,
          authority_snapshot: storedSnapshot,
          verified_at: new Date().toISOString(),
        }),
      }
    );

    return NextResponse.json({
      ok: true,
      verified: true,
      authorityConfirmed: true,
      claim: updated?.[0] || {
        id: claim.id,
        status: "verified",
      },
      evidence: authority.evidence,
      collection: {
        assetId: snapshot.assetId,
        name: snapshot.name,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not finalize this claim.",
      },
      { status: 500 }
    );
  }
}
