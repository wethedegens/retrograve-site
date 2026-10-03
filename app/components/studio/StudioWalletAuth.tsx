// app/components/studio/StudioWalletAuth.tsx
"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  getFreshSession,
  readStoredSession,
  signInWithSolana,
  signOutStudio,
  type LockScreenedSession,
} from "../../lib/lockscreened/web3AuthClient";
import { extractSolanaWalletAddress } from "../../lib/lockscreened/authIdentity";

function short(value?: string | null) {
  if (!value) return "";
  return value.length > 12
    ? value.slice(0, 5) + "…" + value.slice(-5)
    : value;
}

export default function StudioWalletAuth() {
  const wallet = useWallet();
  const [session, setSession] = useState<LockScreenedSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function sync() {
      const current = await getFreshSession();
      if (active) setSession(current || readStoredSession());
    }

    sync();
    const listener = () => sync();
    window.addEventListener("lockscreened-auth-changed", listener);
    return () => {
      active = false;
      window.removeEventListener("lockscreened-auth-changed", listener);
    };
  }, []);

  const connectedAddress = wallet.publicKey?.toBase58() || null;
  const authenticatedAddress = extractSolanaWalletAddress(session?.user);
  const mismatch =
    Boolean(connectedAddress) &&
    Boolean(authenticatedAddress) &&
    connectedAddress !== authenticatedAddress;

  async function signIn() {
    setBusy(true);
    setMessage("");

    try {
      if (!wallet.connected || !wallet.publicKey) {
        throw new Error("Connect your Solana wallet using the button above first.");
      }

      if (!wallet.signMessage) {
        throw new Error("This wallet does not support message signing.");
      }

      const next = await signInWithSolana({
        publicKey: wallet.publicKey,
        signMessage: wallet.signMessage,
      });
      setSession(next);
      setMessage("Studio sign-in verified.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    try {
      await signOutStudio();
      setSession(null);
      setMessage("Signed out of Creator Studio.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      style={{
        marginBottom: 24,
        borderRadius: 20,
        border: "1px solid rgba(205,183,255,.15)",
        background: "rgba(14,10,28,.7)",
        padding: 18,
        display: "grid",
        gap: 13,
      }}
    >
      <div>
        <div
          style={{
            color: "#cfbfff",
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: ".18em",
          }}
        >
          FOUNDER IDENTITY
        </div>
        <h2 style={{ margin: "6px 0 5px", fontSize: 22 }}>
          Sign in with Solana
        </h2>
        <p
          style={{
            margin: 0,
            color: "rgba(255,255,255,.58)",
            fontSize: 11,
            lineHeight: 1.55,
            maxWidth: 720,
          }}
        >
          Your wallet signs a standard off-chain login message. No transaction,
          token approval, SOL, or NFT transfer is requested.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
          gap: 8,
        }}
      >
        <div style={cardStyle}>
          <span style={labelStyle}>CONNECTED WALLET</span>
          <strong>{connectedAddress ? short(connectedAddress) : "Not connected"}</strong>
        </div>
        <div style={cardStyle}>
          <span style={labelStyle}>STUDIO SESSION</span>
          <strong>
            {session
              ? authenticatedAddress
                ? short(authenticatedAddress)
                : "Authenticated"
              : "Signed out"}
          </strong>
        </div>
      </div>

      {mismatch ? (
        <div style={warningStyle}>
          The connected wallet is different from the wallet that signed into
          Studio. Sign out and authenticate the wallet you intend to use.
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {!session ? (
          <button
            onClick={signIn}
            disabled={busy || !wallet.connected}
            style={primaryButton}
          >
            {busy ? "SIGNING…" : "SIGN IN TO STUDIO"}
          </button>
        ) : (
          <button onClick={signOut} disabled={busy} style={secondaryButton}>
            SIGN OUT OF STUDIO
          </button>
        )}
        <span style={safePill}>OFF-CHAIN SIGNATURE ONLY</span>
      </div>

      {message ? (
        <div style={{ color: "rgba(255,255,255,.7)", fontSize: 10 }}>
          {message}
        </div>
      ) : null}
    </section>
  );
}

const cardStyle = {
  borderRadius: 13,
  border: "1px solid rgba(255,255,255,.07)",
  background: "rgba(255,255,255,.03)",
  padding: 11,
  display: "grid",
  gap: 4,
} as const;

const labelStyle = {
  color: "rgba(255,255,255,.42)",
  fontSize: 8,
  fontWeight: 900,
  letterSpacing: ".13em",
} as const;

const primaryButton = {
  minHeight: 38,
  padding: "0 14px",
  borderRadius: 999,
  border: "1px solid rgba(194,170,255,.35)",
  background: "linear-gradient(180deg,#b595ff,#7c5ce7)",
  color: "#120e18",
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: ".11em",
  cursor: "pointer",
} as const;

const secondaryButton = {
  ...primaryButton,
  background: "rgba(255,255,255,.05)",
  color: "#fff",
} as const;

const safePill = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 38,
  borderRadius: 999,
  padding: "0 10px",
  border: "1px solid rgba(113,255,182,.16)",
  color: "#a9ffd2",
  fontSize: 8,
  fontWeight: 900,
  letterSpacing: ".1em",
} as const;

const warningStyle = {
  borderRadius: 12,
  border: "1px solid rgba(255,188,108,.18)",
  background: "rgba(255,188,108,.07)",
  color: "#ffd5a2",
  padding: 10,
  fontSize: 10,
} as const;
