// app/lib/lockscreened/permissions.ts
//
// Central permission rules for Creator Studio.
// Keeping these rules in one place prevents a verified founder from
// accidentally replacing the hand-authored flagship assets that already ship
// with LockScreened.

import type { BackgroundSource } from "./types";

export type StudioRole =
  | "lockscreened_admin"
  | "collection_owner"
  | "collection_editor"
  | "viewer";

export type ClaimStatus =
  | "unclaimed"
  | "pending"
  | "verified"
  | "rejected"
  | "manual_review";

export function canPublishCollection(role: StudioRole, claim: ClaimStatus) {
  if (role === "lockscreened_admin") return true;
  return claim === "verified" && role === "collection_owner";
}

export function canManageCreatorAssets(
  role: StudioRole,
  claim: ClaimStatus
): boolean {
  if (role === "lockscreened_admin") return true;
  if (claim !== "verified") return false;
  return role === "collection_owner" || role === "collection_editor";
}

export function canDeleteBackground(
  role: StudioRole,
  claim: ClaimStatus,
  source: BackgroundSource
): boolean {
  // Existing LockScreened-curated/legacy assets are protected even after a
  // founder claims the collection. Founders can add new official assets
  // without destroying the original flagship treatment.
  if (source === "legacy_curated" || source === "lockscreened") {
    return role === "lockscreened_admin";
  }

  return canManageCreatorAssets(role, claim);
}

export function canReplaceBackground(
  role: StudioRole,
  claim: ClaimStatus,
  source: BackgroundSource
): boolean {
  return canDeleteBackground(role, claim, source);
}
