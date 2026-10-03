// app/lib/lockscreened/server/supabaseHealth.ts
import { getPublicSupabaseConfig } from "../backendConfig";

export type SupabaseHealth = {
  ok: boolean;
  status?: number;
  error?: string;
};

export async function checkSupabaseHealth(): Promise<SupabaseHealth> {
  const config = getPublicSupabaseConfig();
  if (!config) return { ok: false, error: "Supabase is not configured." };

  try {
    const response = await fetch(
      config.url + "/rest/v1/collections?select=id&limit=1",
      {
        method: "GET",
        headers: {
          apikey: config.publishableKey,
          Authorization: "Bearer " + config.publishableKey,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: "Supabase Data API health check failed.",
      };
    }

    return { ok: true, status: response.status };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown Supabase error",
    };
  }
}
