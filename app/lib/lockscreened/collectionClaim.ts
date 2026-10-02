// app/lib/lockscreened/collectionClaim.ts
//
// Shared contracts for collection ownership/authority verification.
// Actual chain lookups live behind a server implementation later; these helpers
// keep the client flow deterministic and make it impossible to treat "owns an
// NFT" as equivalent to "controls this collection".

export type CollectionAuthorityEvidence =
  | "verified_creator"
  | "update_authority"
  | "collection_authority"
  | "manual_review";

export type CollectionClaimChallenge = {
  collectionId: string;
  walletAddress: string;
  nonce: string;
  issuedAtIso: string;
};

export type CollectionClaimResult = {
  verified: boolean;
  collectionId: string;
  walletAddress: string;
  evidence?: CollectionAuthorityEvidence;
  reason?: string;
};

export function buildCollectionClaimMessage(
  challenge: CollectionClaimChallenge
) {
  const collectionId = challenge.collectionId.trim();
  const walletAddress = challenge.walletAddress.trim();
  const nonce = challenge.nonce.trim();
  const issuedAtIso = challenge.issuedAtIso.trim();

  if (!collectionId || !walletAddress || !nonce || !issuedAtIso) {
    throw new Error("Incomplete collection claim challenge.");
  }

  return [
    "LockScreened Collection Verification",
    "",
    `Collection: ${collectionId}`,
    `Wallet: ${walletAddress}`,
    `Issued: ${issuedAtIso}`,
    `Nonce: ${nonce}`,
    "",
    "This signature verifies collection authority only.",
    "It does not authorize a transaction, transfer, sale, or token approval.",
  ].join("\n");
}
