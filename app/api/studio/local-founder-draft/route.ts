import { NextResponse } from "next/server";
import { founderDraftSettings } from "../../../lib/lockscreened/founderDraft";
import { extractSolanaWalletAddress } from "../../../lib/lockscreened/authIdentity";
import { getPublicSupabaseConfig } from "../../../lib/lockscreened/backendConfig";
import { consumeStudioActionRateLimit, getAuthenticatedUser, isTrustedStudioRequestOrigin, restAsUser } from "../../../lib/lockscreened/server/supabaseServer";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // This bridge is confined to the dedicated development backend.
  if (process.env.NODE_ENV !== "development" ||
      getPublicSupabaseConfig()?.url !== "https://vndfiqblyndnantsntnq.supabase.co") {
    return NextResponse.json({ error: "Development draft saving is unavailable." }, { status: 404 });
  }
  if (!isTrustedStudioRequestOrigin(request)) return NextResponse.json({ error: "Cross-site request blocked." }, { status: 403 });
  const token = (request.headers.get("authorization") || "").replace(/^Bearer /, "");
  if (!token) return NextResponse.json({ error: "Sign in with your founder wallet first." }, { status: 401 });
  try {
    const user = await getAuthenticatedUser(token);
    if (!user?.id || !extractSolanaWalletAddress(user)) {
      return NextResponse.json({ error: "A verified founder wallet session is required." }, { status: 401 });
    }
    if (Number(request.headers.get("content-length") || 0) > 100000) {
      return NextResponse.json({ error: "Setup settings are too large." }, { status: 413 });
    }
    const raw = await request.text();
    if (raw.length > 100000) return NextResponse.json({ error: "Setup settings are too large." }, { status: 413 });
    const body = JSON.parse(raw);
    const id = String(body.draftId || "");
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json({ error: "A valid draft identifier is required." }, { status: 400 });
    }
    let draft;
    try { draft = founderDraftSettings(body.settings); }
    catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid setup." }, { status: 400 }); }
    if (!await consumeStudioActionRateLimit(token, "create_local_founder_draft")) {
      return NextResponse.json({ error: "Too many draft saves. Please wait a few minutes." }, { status: 429 });
    }
    const existing = await restAsUser<any[]>(token, `collections?id=eq.${id}&select=id,created_by,publish_status,flagship,legacy_assets_locked,source_config`);
    if (existing.length) {
      const row = existing[0];
      if (row.created_by !== user.id || row.flagship || row.legacy_assets_locked ||
          row.publish_status !== "draft" || row.source_config?.setupDraftId !== id) {
        return NextResponse.json({ error: "This identifier cannot be used for a new setup draft." }, { status: 409 });
      }
      return NextResponse.json({ id: row.id, alreadySaved: true });
    }
    const studioSlug = "studio-" + user.id.replace(/-/g, "").slice(0, 20).toLowerCase();
    let studios = await restAsUser<any[]>(token, `studios?owner_user_id=eq.${encodeURIComponent(user.id)}&select=id&limit=1`);
    if (!studios.length) {
      try {
        studios = await restAsUser<any[]>(token, "studios?select=id", {
          method: "POST", headers: { Prefer: "return=representation" },
          body: JSON.stringify({ owner_user_id: user.id, name: "My LockScreened Studio", slug: studioSlug }),
        });
      } catch (error) {
        // A second tab may have created the same personal studio concurrently.
        studios = await restAsUser<any[]>(token, `studios?owner_user_id=eq.${encodeURIComponent(user.id)}&select=id&limit=1`);
        if (!studios.length) throw error;
      }
    }
    if (!studios[0]?.id) throw new Error("Your private Studio could not be loaded.");
    await restAsUser(token, "collections", {
      method: "POST", headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        id, studio_id: studios[0].id, slug: "setup-" + id, name: draft.name,
        source_type: "demo", source_config: { ...draft.sourceConfig, setupDraftId: id },
        render_mode: draft.renderMode, render_profile: draft.renderProfile,
        public_profile: draft.publicProfile, publish_status: "draft", created_by: user.id,
        flagship: false, legacy_assets_locked: false,
      }),
    });
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: "Private saving could not finish. Your local setup is still here. Retry when the development backend is ready." }, { status: 503 });
  }
}
