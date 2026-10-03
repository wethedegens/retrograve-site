// app/lib/lockscreened/authIdentity.ts
//
// Helpers for reading the verified wallet identity returned by Supabase Auth.
// Do not use user-editable metadata for authorization decisions.

const SOLANA_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function extractSolanaWalletAddress(user: any): string | null {
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
