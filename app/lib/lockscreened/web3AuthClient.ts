// app/lib/lockscreened/web3AuthClient.ts
//
// Minimal browser client for Supabase Sign in with Solana.
// We intentionally keep this small instead of adding another large SDK to the
// legacy site during the Creator Studio alpha.

import { getPublicSupabaseConfig } from "./backendConfig";
import { extractSolanaWalletAddress } from "./authIdentity";

const SESSION_KEY = "lockscreened.web3.session.v2";
const LEGACY_SESSION_KEY = "lockscreened.web3.session.v1";

export type LockScreenedSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type?: string;
  user: any;
};

export type SolanaAuthWallet = {
  publicKey?: { toBase58(): string } | null;
  signMessage?: (
    message: Uint8Array,
    encoding?: string
  ) => Promise<Uint8Array>;
};

function config() {
  const value = getPublicSupabaseConfig();
  if (!value) throw new Error("LockScreened Supabase is not configured.");
  return value;
}

function encodeBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function normalizeSession(data: any): LockScreenedSession {
  if (!data?.access_token || !data?.refresh_token || !data?.expires_in || !data?.user) {
    throw new Error("Supabase did not return a complete session.");
  }

  return {
    ...data,
    expires_at:
      Number(data.expires_at) ||
      Math.floor(Date.now() / 1000) + Number(data.expires_in),
  };
}

function saveSession(session: LockScreenedSession | null) {
  if (typeof window === "undefined") return;

  if (!session) {
    window.sessionStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(LEGACY_SESSION_KEY);
  } else {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    window.localStorage.removeItem(LEGACY_SESSION_KEY);
  }

  window.dispatchEvent(new CustomEvent("lockscreened-auth-changed"));
}

export function readStoredSession(): LockScreenedSession | null {
  if (typeof window === "undefined") return null;

  try {
    let raw = window.sessionStorage.getItem(SESSION_KEY);

    // One-time alpha migration: move any older persistent session into
    // per-tab sessionStorage, then remove the localStorage copy.
    if (!raw) {
      const legacy = window.localStorage.getItem(LEGACY_SESSION_KEY);
      if (legacy) {
        raw = legacy;
        window.sessionStorage.setItem(SESSION_KEY, legacy);
        window.localStorage.removeItem(LEGACY_SESSION_KEY);
      }
    }

    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.access_token || !parsed?.refresh_token) return null;
    return parsed as LockScreenedSession;
  } catch {
    return null;
  }
}

async function parseError(response: Response) {
  try {
    const data = await response.json();
    return (
      data?.msg ||
      data?.message ||
      data?.error_description ||
      data?.error ||
      `Request failed (${response.status}).`
    );
  } catch {
    return `Request failed (${response.status}).`;
  }
}

export async function signInWithSolana(
  wallet: SolanaAuthWallet,
  purpose: "studio" | "collector" = "studio"
): Promise<LockScreenedSession> {
  if (typeof window === "undefined") {
    throw new Error("Solana sign-in must run in the browser.");
  }

  const publicKey = wallet.publicKey?.toBase58?.();
  if (!publicKey) throw new Error("Connect a Solana wallet first.");
  if (typeof wallet.signMessage !== "function") {
    throw new Error("This wallet does not support message signing.");
  }

  const currentUrl = new URL(window.location.href);
  // GoTrue's SIWS domain validator accepts localhost, but not IP literals.
  // Never rewrite the signed domain to a different origin to work around it.
  if (currentUrl.hostname === "127.0.0.1" || currentUrl.hostname === "[::1]") {
    const localUrl = new URL(currentUrl.href);
    localUrl.hostname = "localhost";
    throw new Error(`Local wallet sign-in requires ${localUrl.origin}${localUrl.pathname}. Keep this tab open to preserve your current setup, and open that address in your wallet browser.`);
  }
  currentUrl.hash = "";
  const statement =
    purpose === "collector"
      ? "Sign in to LockScreened to verify NFT ownership and make a wallpaper. This does not authorize a transaction, transfer, sale, or token approval."
      : "Sign in to LockScreened Creator Studio. This does not authorize a transaction, transfer, sale, or token approval.";

  const message = [
    `${currentUrl.host} wants you to sign in with your Solana account:`,
    publicKey,
    "",
    statement,
    "",
    `URI: ${currentUrl.href.endsWith("/") ? currentUrl.href : `${currentUrl.href}/`}`,
    "Version: 1",
    `Nonce: ${Array.from(crypto.getRandomValues(new Uint8Array(12)), (byte) => (byte % 36).toString(36)).join("")}`,
    `Issued At: ${new Date().toISOString()}`,
  ].join("\n");

  const signature = await wallet.signMessage(
    new TextEncoder().encode(message),
    "utf8"
  );

  const { url, publishableKey } = config();
  const response = await fetch(
    `${url}/auth/v1/token?grant_type=web3`,
    {
      method: "POST",
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        chain: "solana",
        message,
        signature: encodeBase64Url(signature),
      }),
    }
  );

  if (!response.ok) throw new Error(await parseError(response));

  const session = normalizeSession(await response.json());
  const verifiedWallet = extractSolanaWalletAddress(session.user);

  if (!verifiedWallet || verifiedWallet !== publicKey) {
    throw new Error("Authenticated wallet does not match the connected wallet.");
  }

  saveSession(session);
  return session;
}

export async function refreshSession(
  session: LockScreenedSession
): Promise<LockScreenedSession> {
  const { url, publishableKey } = config();
  const response = await fetch(
    `${url}/auth/v1/token?grant_type=refresh_token`,
    {
      method: "POST",
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    }
  );

  if (!response.ok) {
    saveSession(null);
    throw new Error(await parseError(response));
  }

  const next = normalizeSession(await response.json());
  saveSession(next);
  return next;
}

export async function getFreshSession(): Promise<LockScreenedSession | null> {
  const session = readStoredSession();
  if (!session) return null;

  const now = Math.floor(Date.now() / 1000);
  if (session.expires_at > now + 60) return session;

  try {
    return await refreshSession(session);
  } catch {
    return null;
  }
}

export async function signOutStudio() {
  const session = readStoredSession();

  try {
    if (session?.access_token) {
      const { url, publishableKey } = config();
      await fetch(`${url}/auth/v1/logout`, {
        method: "POST",
        headers: {
          apikey: publishableKey,
          Authorization: `Bearer ${session.access_token}`,
        },
      });
    }
  } finally {
    saveSession(null);
  }
}

type StudioTotpFactor = { id: string; friendly_name?: string; factor_type: string; status: string };
export type StudioTotpEnrollment = { id: string; qr: string; secret: string };
export type StudioTotpState = { verified: boolean; confirmedEmail: boolean; factors: StudioTotpFactor[] };

function studioTokenClaims(accessToken: string): { sub?: string; aal?: string; amr?: { method?: string }[] } {
  try {
    const encoded = accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(encoded));
  } catch {
    return {};
  }
}

// This browser check is for presentation. Protected writes check the
// verified request's assurance level via Supabase in the server and database.
export async function getStudioTotpState(session: LockScreenedSession): Promise<StudioTotpState> {
  const data = await studioTotpRequest<{ email?: string; email_confirmed_at?: string; factors?: StudioTotpFactor[] }>(session, "user");
  return {
    verified: studioTokenClaims(session.access_token).aal === "aal2" && Boolean(data.email && data.email_confirmed_at),
    confirmedEmail: Boolean(data.email && data.email_confirmed_at),
    factors: (data.factors ?? []).filter((factor) => factor.factor_type === "totp" && factor.status === "verified"),
  };
}

async function studioTotpRequest<T>(
  session: LockScreenedSession,
  path: string,
  method = "GET",
  body?: Record<string, string>
): Promise<T> {
  const { url, publishableKey } = config();
  const response = await fetch(`${url}/auth/v1/${path}`, {
    method,
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(12_000),
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${session.access_token}`,
      "content-type": "application/json",
    },
    ...(body && { body: JSON.stringify(body) }),
  });
  if (!response.ok) throw new Error("Authenticator request failed.");
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function requestStudioVerificationEmail(session: LockScreenedSession, value: string) {
  const email = value.trim();
  if (!email || email.length > 254) throw new Error("Enter a valid email address.");
  const redirect = new URL("/studio/", window.location.origin);
  const params = new URLSearchParams({ redirect_to: redirect.href });
  await studioTotpRequest(session, "user?" + params, "PUT", { email });
}

export async function beginStudioTotp(session: LockScreenedSession): Promise<StudioTotpEnrollment> {
  if (!(await getStudioTotpState(session)).confirmedEmail) throw new Error("Verify your email first.");
  const result = await studioTotpRequest<{ id: string; totp: { qr_code: string; secret: string } }>(
    session, "factors", "POST", { factor_type: "totp", issuer: "LockScreened Studio" }
  );
  const svg = result?.totp?.qr_code;
  if (!result?.id || typeof svg !== "string" || !result.totp.secret) {
    throw new Error("Authenticator setup is unavailable.");
  }
  return { id: result.id, qr: "data:image/svg+xml," + encodeURIComponent(svg), secret: result.totp.secret };
}

export async function cancelStudioTotp(session: LockScreenedSession, factorId: string) {
  await studioTotpRequest(session, "factors/" + encodeURIComponent(factorId), "DELETE");
}

export async function verifyStudioTotp(session: LockScreenedSession, factorId: string, code: string) {
  if (!/^\d{6}$/.test(code)) throw new Error("Enter a six-digit authenticator code.");
  const path = "factors/" + encodeURIComponent(factorId);
  const { id: challengeId } = await studioTotpRequest<{ id: string }>(session, path + "/challenge", "POST", {});
  if (!challengeId) throw new Error("Authenticator challenge is unavailable.");
  const result = await studioTotpRequest<LockScreenedSession>(session, path + "/verify", "POST", { challenge_id: challengeId, code });
  const claims = studioTokenClaims(result.access_token);
  if (claims.aal !== "aal2" || !Array.isArray(claims.amr) ||
      !claims.amr.some((entry) => entry?.method === "web3") || !claims.sub || claims.sub !== session.user?.id ||
      readStoredSession()?.access_token !== session.access_token) {
    throw new Error("Reload Studio and verify your authenticator again.");
  }
  if (result.user && result.user.id !== session.user.id) throw new Error("Authenticator account mismatch.");
  saveSession(normalizeSession({ ...result, user: result.user ?? session.user }));
}
