import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// This retired endpoint copied original layers into public storage. Keep it
// unavailable even to authenticated founders; source art must remain private.
export async function POST() {
  return NextResponse.json({error: "Individual trait layers cannot be published. Private collector rendering must be configured and verified before launching a layered project."},
    {status: 410, headers: {"Cache-Control": "no-store"}});
}
