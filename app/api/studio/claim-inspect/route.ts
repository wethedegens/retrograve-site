// app/api/studio/claim-inspect/route.ts
import { NextResponse } from "next/server";
import { getPublicSupabaseConfig } from "../../../lib/lockscreened/backendConfig";
import { consumeStudioActionRateLimit } from "../../../lib/lockscreened/server/supabaseServer";
import { extractSolanaWalletAddress } from "../../../lib/lockscreened/authIdentity";
import {
  inspectCollectionAuthority,
  walletHasAuthorityEvidence,
} from "../../../lib/lockscreened/server/heliusAuthority";
import { getFlagshipProjectByCollectionId } from "../../../lib/lockscreened/flagshipProjects";

export const dynamic = "force-dynamic";

async function authenticatedUser(accessToken: string) {
  const config = getPublicSupabaseConfig();
  if (!config) throw new Error("Supabase is not configured.");

  const response = await fetch(config.url + "/auth/v1/user", {
    headers: {
      apikey: config.publishableKey,
      Authorization: "Bearer " + accessToken,
    },
    cache: "no-store",
  });

  if (!response.ok) return null;
  return await response.json();
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : "";

    if (!token) {
      return NextResponse.json(
        { error: "Sign in to Creator Studio first." },
        { status: 401 }
      );
    }

    const user = await authenticatedUser(token);
    if (!user?.id) {
      return NextResponse.json(
        { error: "Your Studio session is invalid or expired." },
        { status: 401 }
      );
    }

    const allowed = await consumeStudioActionRateLimit(
      token,
      "claim_inspect"
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

    const walletAddress = extractSolanaWalletAddress(user);
    if (!walletAddress) {
      return NextResponse.json(
        { error: "No verified Solana identity was found on this Studio account." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const collectionAddress = String(body?.collectionAddress || "").trim();

    if (!collectionAddress) {
      return NextResponse.json(
        { error: "Collection address is required." },
        { status: 400 }
      );
    }

    const flagship = getFlagshipProjectByCollectionId(collectionAddress);
    if (flagship) {
      return NextResponse.json(
        {
          error:
            flagship.name +
            " is a protected LockScreened flagship. It is managed through the curated flagship lane rather than normal founder claiming.",
          reservedFlagship: true,
          flagship: {
            slug: flagship.slug,
            name: flagship.name,
          },
        },
        { status: 409 }
      );
    }

    const snapshot = await inspectCollectionAuthority(collectionAddress);
    const authority = walletHasAuthorityEvidence(walletAddress, snapshot);

    return NextResponse.json({
      ok: true,
      allowed: authority.allowed,
      walletAddress,
      evidence: authority.evidence,
      collection: {
        assetId: snapshot.assetId,
        name: snapshot.name,
        authorities: snapshot.authorities,
        verifiedCreators: snapshot.verifiedCreators,
        mutable: snapshot.mutable,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not inspect this collection.",
      },
      { status: 500 }
    );
  }
}
