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
  wallet: SolanaAuthWallet
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
  const statement =
    "Sign in to LockScreened Creator Studio. This does not authorize a transaction, transfer, sale, or token approval.";

  const message = [
    `${currentUrl.host} wants you to sign in with your Solana account:`,
    publicKey,
    "",
    statement,
    "",
    "Version: 1",
    `URI: ${currentUrl.href}`,
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

  if (verifiedWallet && verifiedWallet !== publicKey) {
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
