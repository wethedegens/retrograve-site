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

const SUPABASE_TIMEOUT_MS = 12_000;

async function fetchSupabase(url: string, init: RequestInit) {
  const timeout = AbortSignal.timeout(SUPABASE_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      cache: "no-store",
      redirect: "error",
      signal: init.signal ? AbortSignal.any([init.signal, timeout]) : timeout,
    });
  } catch {
    throw new Error("Creator Studio could not reach its data service.");
  }
}

function supabaseRequestError(response: Response) {
  void response.body?.cancel().catch(() => {});
  return new Error("Creator Studio data service request failed (" + response.status + ").");
}

async function readSupabaseJson<T>(response: Response, allowEmpty = false): Promise<T> {
  try {
    const body = await response.text();
    if (allowEmpty && !body.trim()) return undefined as T;
    return JSON.parse(body) as T;
  } catch {
    throw new Error("Creator Studio received an unreadable data service response.");
  }
}

export async function getAuthenticatedUser(accessToken: string) {
  const { url, publishableKey } = publicConfig();

  const response = await fetchSupabase(url + "/auth/v1/user", {
    headers: {
      apikey: publishableKey,
      Authorization: "Bearer " + accessToken,
    },
  });

  if (response.status === 401 || response.status === 403) {
    void response.body?.cancel().catch(() => {});
    return null;
  }
  if (!response.ok) throw supabaseRequestError(response);
  const user = await readSupabaseJson<{ id?: string }>(response);
  try {
    // The Auth service above validated this same token before we inspect claims.
    const claims = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64url").toString("utf8"));
    return user?.id && claims.sub === user.id && Array.isArray(claims.amr) &&
      claims.amr.some((entry: { method?: string }) => entry?.method === "web3") ? user as any : null;
  } catch {
    return null;
  }
}

export async function restAsUser<T>(
  accessToken: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const { url, publishableKey } = publicConfig();

  const headers = new Headers(init?.headers);
  headers.set("apikey", publishableKey);
  headers.set("authorization", "Bearer " + accessToken);
  if (!headers.has("content-type")) headers.set("content-type", "application/json");

  const response = await fetchSupabase(url + "/rest/v1/" + path, {
    ...init,
    headers,
  });

  if (!response.ok) throw supabaseRequestError(response);
  if (response.status === 204) return undefined as T;
  // PostgREST can return 201 with no body for Prefer: return=minimal.
  return readSupabaseJson<T>(response, true);
}

export async function restAsAdmin<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const { url } = publicConfig();
  const headers = new Headers(init?.headers);
  headers.delete("authorization");
  for (const [name, value] of Object.entries(adminHeaders())) {
    headers.set(name, value);
  }

  const response = await fetchSupabase(url + "/rest/v1/" + path, {
    ...init,
    headers,
  });

  if (!response.ok) throw supabaseRequestError(response);
  if (response.status === 204) return undefined as T;
  return readSupabaseJson<T>(response, true);
}


function adminHeaders() {
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
  const response = await fetchSupabase(
    `${url}/storage/v1/object/${encodeURIComponent(args.bucket)}`,
    {
      method: "DELETE",
      headers: adminHeaders(),
      body: JSON.stringify({ prefixes: args.paths }),
    }
  );

  if (!response.ok) throw supabaseRequestError(response);
}

export async function copyStorageObjectAsAdmin(args: {
  sourceBucket: string;
  sourcePath: string;
  destinationBucket: string;
  destinationPath: string;
}) {
  const { url } = publicConfig();

  const response = await fetchSupabase(url + "/storage/v1/object/copy", {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify({
      bucketId: args.sourceBucket,
      sourceKey: args.sourcePath,
      destinationKey: args.destinationPath,
      destinationBucket: args.destinationBucket,
    }),
  });

  if (!response.ok) throw supabaseRequestError(response);
  return readSupabaseJson<any>(response);
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

  const response = await fetchSupabase(url + "/rest/v1/rpc/consume_studio_action", {
    method: "POST",
    headers: {
      apikey: publishableKey,
      Authorization: "Bearer " + accessToken,
      "content-type": "application/json",
    },
    body: JSON.stringify({ action_name: action }),
  });

  if (!response.ok) throw supabaseRequestError(response);

  const allowed = await readSupabaseJson<unknown>(response);
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

// Server-only bounded reads. No caller-supplied URL or signed source URL is returned.
export async function readStudioRenderObject(bucket: "creator-source-private" | "published-public", path: string, maxBytes: number): Promise<Buffer> {
  if (!["creator-source-private", "published-public"].includes(bucket) || !path || path.includes("\\") || path.split("/").some(part => !part || part === "." || part === "..")) throw new Error("Invalid render source.");
  const { url } = publicConfig();
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  const response = await fetchSupabase(`${url}/storage/v1/object/authenticated/${bucket}/${encoded}`, {
    headers: adminHeaders(),
  });
  if (!response.ok || !response.body) throw new Error("Saved artwork is unavailable.");
  if (Number(response.headers.get("content-length") || 0) > maxBytes) { await response.body.cancel(); throw new Error("Render source is too large."); }
  const reader = response.body.getReader(); const chunks: Uint8Array[] = []; let bytes = 0;
  try {
    while (true) {
      const item = await reader.read(); if (item.done) break;
      bytes += item.value.byteLength;
      if (bytes > maxBytes) { await reader.cancel(); throw new Error("Render source is too large."); }
      chunks.push(item.value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks);
}
