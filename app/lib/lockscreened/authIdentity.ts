// Read only provider-issued identities returned by Supabase Auth's user API.
// Never infer wallet ownership from editable user_metadata or profile fields.
const SOLANA_SUBJECT = /^web3:solana:([1-9A-HJ-NP-Za-km-z]{32,44})$/;

export function extractSolanaWalletAddress(user: any): string | null {
  if (!user?.id || !Array.isArray(user.identities)) return null;

  const wallets = new Set<string>();
  for (const identity of user.identities) {
    if (identity?.provider !== "web3") continue;
    if (identity.user_id !== user.id) return null;

    // GoTrue serializes its provider identifier as `id`. Some client shapes
    // expose `provider_id` instead. Neither is the identity row's UUID.
    const subject = identity.provider_id ?? identity.id;
    if (typeof subject !== "string") return null;
    if (identity.provider_id != null && identity.id != null &&
        identity.provider_id !== identity.id) return null;

    const match = SOLANA_SUBJECT.exec(subject);
    if (!match) continue; // Other chains are not Solana wallets.

    const identitySubject = identity.identity_data?.sub;
    if (identitySubject != null && identitySubject !== subject) return null;
    wallets.add(match[1]);
  }

  // Multiple distinct wallets need an explicit authenticated selection.
  return wallets.size === 1 ? Array.from(wallets)[0] : null;
}
