// app/lib/lockscreened/backendConfig.ts
//
// Centralized backend environment contract. No provider secret should ever be
// exposed through NEXT_PUBLIC_ variables.

export type BackendStatus = {
  supabaseConfigured: boolean;
  heliusConfigured: boolean;
  readyForPersistence: boolean;
  missing: string[];
};

export function getBackendStatus(): BackendStatus {
  const missing: string[] = [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  const heliusKey = process.env.HELIUS_API_KEY?.trim();

  if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabasePublishableKey) {
    missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }
  if (!heliusKey) missing.push("HELIUS_API_KEY");

  const supabaseConfigured = Boolean(
    supabaseUrl && supabasePublishableKey
  );
  const heliusConfigured = Boolean(heliusKey);

  return {
    supabaseConfigured,
    heliusConfigured,
    readyForPersistence: supabaseConfigured && heliusConfigured,
    missing,
  };
}

export function getPublicSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !publishableKey) return null;

  return { url, publishableKey };
}
