import { NextResponse } from "next/server";
import { restAsUser } from "./supabaseServer";

export async function studioFounderMfaBlock(accessToken: string) {
  const allowed = await restAsUser<boolean>(accessToken, "rpc/studio_founder_mfa_allowed", {
    method: "POST",
    body: "{}",
  });
  if (allowed === true) return null;
  return NextResponse.json(
    { error: "Verify your authenticator code in Founder two-step verification, then try again." },
    { status: 403 }
  );
}
