// app/lib/lockscreened/server/supabaseServer.ts
import { getPublicSupabaseConfig } from "../backendConfig";

function publicConfig() {
  const config = getPublicSupabaseConfig();
  if (!config) throw new Error("Supabase is not configured.");
  return config;
}

export function hasSupabaseAdminKey() {
  return Boolean(
    process.env.SUPABASE_SECRET_KEY?.trim() ||
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}

function adminKey() {
  const key =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!key) {
    throw new Error("SUPABASE_SECRET_KEY is not configured.");
  }

  return key;
}

async function parseError(response: Response) {
  try {
    const data = await response.json();
    return data?.message || data?.hint || data?.error || `Supabase request failed (${response.status}).`;
  } catch {
    return `Supabase request failed (${response.status}).`;
  }
}

export async function getAuthenticatedUser(accessToken: string) {
  const { url, publishableKey } = publicConfig();

  const response = await fetch(url + "/auth/v1/user", {
    headers: {
      apikey: publishableKey,
      Authorization: "Bearer " + accessToken,
    },
    cache: "no-store",
  });

  if (!response.ok) return null;
  return await response.json();
}

export async function restAsUser<T>(
  accessToken: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const { url, publishableKey } = publicConfig();

  const response = await fetch(url + "/rest/v1/" + path, {
    ...init,
    headers: {
      apikey: publishableKey,
      Authorization: "Bearer " + accessToken,
      "content-type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) throw new Error(await parseError(response));
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function restAsAdmin<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const { url } = publicConfig();
  const key = adminKey();

  const headers: Record<string, string> = {
    apikey: key,
    "content-type": "application/json",
  };

  // Legacy service_role keys are JWTs and expect an Authorization header.
  // New sb_secret_* keys are translated by the Supabase gateway from apikey.
  if (!key.startsWith("sb_secret_")) {
    headers.Authorization = "Bearer " + key;
  }

  const response = await fetch(url + "/rest/v1/" + path, {
    ...init,
    headers: {
      ...headers,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) throw new Error(await parseError(response));
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}


function adminStorageHeaders() {
  const key = adminKey();
  const headers: Record<string, string> = {
    apikey: key,
    "content-type": "application/json",
  };

  if (!key.startsWith("sb_secret_")) {
    headers.Authorization = "Bearer " + key;
  }

  return headers;
}

export async function deleteStorageObjectsAsAdmin(args: {
  bucket: string;
  paths: string[];
}) {
  if (!args.paths.length) return;

  const { url } = publicConfig();
  const response = await fetch(
    `${url}/storage/v1/object/${encodeURIComponent(args.bucket)}`,
    {
      method: "DELETE",
      headers: adminStorageHeaders(),
      body: JSON.stringify({ prefixes: args.paths }),
      cache: "no-store",
    }
  );

  if (!response.ok) throw new Error(await parseError(response));
}

export async function copyStorageObjectAsAdmin(args: {
  sourceBucket: string;
  sourcePath: string;
  destinationBucket: string;
  destinationPath: string;
}) {
  const { url } = publicConfig();

  const response = await fetch(url + "/storage/v1/object/copy", {
    method: "POST",
    headers: adminStorageHeaders(),
    body: JSON.stringify({
      bucketId: args.sourceBucket,
      sourceKey: args.sourcePath,
      destinationKey: args.destinationPath,
      destinationBucket: args.destinationBucket,
    }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(await parseError(response));
  return await response.json();
}

export function publicStorageUrl(bucket: string, path: string) {
  const { url } = publicConfig();
  const encoded = String(path || "")
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${url}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encoded}`;
}


export async function consumeStudioActionRateLimit(
  accessToken: string,
  action: string
) {
  const { url, publishableKey } = publicConfig();

  const response = await fetch(url + "/rest/v1/rpc/consume_studio_action", {
    method: "POST",
    headers: {
      apikey: publishableKey,
      Authorization: "Bearer " + accessToken,
      "content-type": "application/json",
    },
    body: JSON.stringify({ action_name: action }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(await parseError(response));

  const allowed = await response.json();
  return allowed === true;
}


export function isTrustedStudioRequestOrigin(request: Request) {
  const origin = request.headers.get("origin");

  // Same-origin browser requests carry Origin. Server-to-server/internal
  // requests may omit it, so absence alone is not treated as hostile.
  if (!origin) return true;

  try {
    const requestUrl = new URL(request.url);
    const requestOrigin = requestUrl.origin;
    return origin === requestOrigin;
  } catch {
    return false;
  }
}
