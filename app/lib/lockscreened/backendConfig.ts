// app/lib/lockscreened/backendConfig.ts
//
// Centralized backend environment contract. No provider secret should ever be
// exposed through NEXT_PUBLIC_ variables.

const LOCKSCREENED_DEV_SUPABASE_URL =
  "https://vndfiqblyndnantsntnq.supabase.co";
const LOCKSCREENED_DEV_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_fVNhjI9Ox9NrD2k5ZX-KKA_wVM9HbTI";

export type BackendStatus = {
  supabaseConfigured: boolean;
  heliusConfigured: boolean;
  readyForPersistence: boolean;
  missing: string[];
};

export function getBackendStatus(): BackendStatus {
  const missing: string[] = [];

  const config = getPublicSupabaseConfig();
  const heliusKey = process.env.HELIUS_API_KEY?.trim();

  if (!config && !process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!config && !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()) {
    missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }
  if (!heliusKey) missing.push("HELIUS_API_KEY");

  const supabaseConfigured = Boolean(config);
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
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (url && publishableKey) return { url, publishableKey };

  if (process.env.NODE_ENV === "development" && !url && !publishableKey) {
    return {
      url: LOCKSCREENED_DEV_SUPABASE_URL,
      publishableKey: LOCKSCREENED_DEV_SUPABASE_PUBLISHABLE_KEY,
    };
  }

  return null;
}