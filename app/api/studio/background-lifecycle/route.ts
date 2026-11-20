// app/api/studio/background-lifecycle/route.ts
import { NextResponse } from "next/server";
import { requireCurrentCollectionAuthority, studioSecurityErrorStatus } from "../../../lib/lockscreened/server/currentAuthority";
import {
  consumeStudioActionRateLimit,
  getAuthenticatedUser,
  isTrustedStudioRequestOrigin,
  restAsUser,
  restAsAdmin,
} from "../../../lib/lockscreened/server/supabaseServer";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!isTrustedStudioRequestOrigin(request)) {
      return NextResponse.json({ error: "Cross-site Creator Studio request blocked." }, { status: 403 });
    }

    const authHeader = request.headers.get("authorization") || "";
    const accessToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : "";
    if (!accessToken) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

    const user = await getAuthenticatedUser(accessToken);
    if (!user?.id) return NextResponse.json({ error: "Studio session expired." }, { status: 401 });

    const body = await request.json();
    const packageId = String(body?.packageId || "").trim();
    const action = String(body?.action || "").trim().toLowerCase();
    if (!/^[0-9a-f-]{36}$/i.test(packageId) || !["unpublish","delete"].includes(action)) {
      return NextResponse.json({ error: "A valid background lifecycle action is required." }, { status: 400 });
    }

    const allowed = await consumeStudioActionRateLimit(accessToken, "background_lifecycle");
    if (!allowed) {
      return NextResponse.json({ error: "Too many background changes. Wait a few minutes and try again." }, { status: 429 });
    }

    const packages = await restAsUser<any[]>(
      accessToken,
      "background_packages?id=eq." + encodeURIComponent(packageId) +
        "&select=id,collection_id,source,locked,publish_status&limit=1"
    );
    const packageRow = packages?.[0];
    if (!packageRow) return NextResponse.json({ error: "Background package was not found." }, { status: 404 });

    if (
      packageRow.source !== "official_creator" ||
      packageRow.locked ||
      (action === "unpublish" && packageRow.publish_status !== "published") ||
      (action === "delete" && !["draft","published"].includes(packageRow.publish_status))
    ) {
      return NextResponse.json({ error: "This background cannot be unpublished from Creator Studio." }, { status: 403 });
    }

    const collections = await restAsUser<any[]>(
      accessToken,
      "collections?id=eq." + encodeURIComponent(packageRow.collection_id) +
        "&select=id,created_by,publish_status,flagship,legacy_assets_locked,source_type,source_config,render_profile&limit=1"
    );
    const collection = collections?.[0];
    if (!collection) return NextResponse.json({ error: "Parent project was not found." }, { status: 404 });
    if (action === "delete" && collection.created_by !== user.id) return NextResponse.json({error:"Only the project owner can delete a background."},{status:403});

    if (collection.flagship || collection.legacy_assets_locked) {
      return NextResponse.json({ error: "Legacy flagship backgrounds cannot be changed from Creator Studio." }, { status: 403 });
    }

    const collectionAddress = String(collection?.source_config?.collectionIds?.[0] || "").trim();
    const preMint=action==="delete" && collection.source_type==="demo" && collection.source_config?.preMint===true && collection.publish_status==="draft";
    if (!preMint && (collection.source_type !== "solana_collection" || !collectionAddress)) {
      return NextResponse.json({ error: "This project does not have a valid Solana collection identity." }, { status: 400 });
    }

    if(!preMint)await requireCurrentCollectionAuthority({ user, collectionAddress });

    // Reset a deleted starting choice first. If the lifecycle guard rejects the
    // archive, Original is still a safe starting choice and no files are lost.
    if(action==="delete" && collection.render_profile?.collectorDefaults?.backgroundId===packageId){
      await restAsUser<void>(accessToken,"collections?id=eq."+encodeURIComponent(collection.id),{
        method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({render_profile:{...collection.render_profile,collectorDefaults:{...collection.render_profile.collectorDefaults,backgroundId:"original"}}})
      });
    }

    // Authenticated UPDATE recurses through the existing asset policy. Only
    // deletion uses the server role, after the explicit owner/authority checks.
    // The database last-phone-background trigger still runs for this update.
    const path="background_packages?id=eq." + encodeURIComponent(packageId)+"&collection_id=eq."+encodeURIComponent(collection.id)+"&publish_status=eq."+packageRow.publish_status+"&select=id";
    const update={
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ publish_status: action==="delete"?"archived":"draft" }),
      };
    const changed=action==="delete"?await restAsAdmin<any[]>(path,update):await restAsUser<any[]>(accessToken,path,update);

    if(!changed?.length)return NextResponse.json({error:"Background change was not saved. Refresh and try again."},{status:409});
    return NextResponse.json({ ok: true, publishStatus: action==="delete"?"archived":"draft" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not change background status." },
      { status: studioSecurityErrorStatus(error) }
    );
  }
}
