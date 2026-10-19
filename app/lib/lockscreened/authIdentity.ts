// app/lib/lockscreened/authIdentity.ts
//
// Helpers for reading the verified wallet identity returned by Supabase Auth.
// Do not use user-editable metadata for authorization decisions.

const SOLANA_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function extractSolanaWalletAddress(user: any): string | null {
  // Supabase Web3 users expose the verified address as the top-level `email`-like
  // identity value in some GoTrue versions, while others also populate identities.
  // Only accept provider-issued auth fields; never user_metadata.
  const topLevelCandidates = [
    user?.web3_address,
    user?.address,
    user?.phone,
    user?.email,
  ];

  for (const candidate of topLevelCandidates) {
    const value = String(candidate || "").trim();
    if (SOLANA_ADDRESS.test(value)) return value;
  }

  // Supabase GoTrue Web3 currently returns the verified Solana identity in
  // user_metadata.custom_claims, paired with a web3:solana:<address> subject.
  // Never trust this shape by itself: require the server-controlled app_metadata
  // provider plus matching chain, subject and address before accepting it.
  const provider = String(user?.app_metadata?.provider || "").toLowerCase();
  const claims = user?.user_metadata?.custom_claims;
  const claimChain = String(claims?.chain || "").toLowerCase();
  const claimAddress = String(claims?.address || "").trim();
  const subject = String(user?.user_metadata?.sub || "").trim();
  if (
    provider === "web3" &&
    claimChain === "solana" &&
    SOLANA_ADDRESS.test(claimAddress) &&
    subject === "web3:solana:" + claimAddress
  ) {
    return claimAddress;
  }

  const identities = Array.isArray(user?.identities) ? user.identities : [];

  for (const identity of identities) {
    const candidates = [
      identity?.identity_data?.address,
      identity?.identity_data?.wallet_address,
      identity?.identity_data?.sub,
      identity?.provider_id,
    ];

    for (const candidate of candidates) {
      const value = String(candidate || "").trim();
      if (SOLANA_ADDRESS.test(value)) return value;
    }
  }

  return null;
}
