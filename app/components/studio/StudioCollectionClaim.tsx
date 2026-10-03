// app/components/studio/StudioCollectionClaim.tsx
"use client";

import { useEffect, useState } from "react";
import {
  getFreshSession,
  readStoredSession,
  type LockScreenedSession,
} from "../../lib/lockscreened/web3AuthClient";
import { createPendingCollectionClaim } from "../../lib/lockscreened/studioDataClient";

type Inspection = {
  allowed: boolean;
  walletAddress: string;
  evidence: string[];
  collection: {
    assetId: string;
    name: string;
    authorities: Array<{ address: string; scopes: string[] }>;
    verifiedCreators: Array<{ address: string; verified: boolean }>;
    mutable?: boolean;
  };
};

function short(value: string) {
  return value.length > 14
    ? value.slice(0, 6) + "…" + value.slice(-6)
    : value;
}

export default function StudioCollectionClaim() {
  const [session, setSession] = useState<LockScreenedSession | null>(null);
  const [collectionAddress, setCollectionAddress] = useState("");
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [saved, setSaved] = useState<any>(null);
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

  async function inspect() {
    setBusy(true);
    setMessage("");
    setInspection(null);
    setSaved(null);

    try {
      const current = await getFreshSession();
      if (!current) throw new Error("Sign in to Creator Studio first.");
      setSession(current);

      const response = await fetch("/api/studio/claim-inspect", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + current.access_token,
        },
        body: JSON.stringify({ collectionAddress }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Inspection failed.");

      setInspection(data);
      setMessage(
        data.allowed
          ? "Authority evidence found for this authenticated wallet."
          : "The authenticated wallet was not found as a current authority or verified creator."
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Inspection failed.");
    } finally {
      setBusy(false);
    }
  }

  async function finalizeClaim() {
    const claimId = saved?.claim?.id;
    if (!claimId) return;

    setBusy(true);
    setMessage("");

    try {
      const current = await getFreshSession();
      if (!current) throw new Error("Your Studio session expired.");

      const response = await fetch("/api/studio/claim-finalize", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + current.access_token,
        },
        body: JSON.stringify({ claimId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data?.authorityConfirmed && data?.needsServerSecret) {
          setMessage(
            "Authority is confirmed. Secure database finalization is waiting for the server-only Supabase secret."
          );
          return;
        }

        throw new Error(data?.error || "Final verification failed.");
      }

      setSaved((current: any) => ({
        ...current,
        claim: {
          ...current.claim,
          ...(data.claim || {}),
          status: "verified",
        },
      }));

      window.dispatchEvent(
        new CustomEvent("lockscreened-studio-data-changed")
      );
      setMessage("Collection claim verified and unlocked for publishing.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Final verification failed."
      );
    } finally {
      setBusy(false);
    }
  }

  async function saveClaim() {
    if (!inspection?.allowed) return;

    setBusy(true);
    setMessage("");

    try {
      const current = await getFreshSession();
      if (!current) throw new Error("Your Studio session expired.");

      const result = await createPendingCollectionClaim({
        session: current,
        collectionAddress: inspection.collection.assetId,
        collectionName: inspection.collection.name,
        walletAddress: inspection.walletAddress,
      });

      setSaved(result);
      setMessage(
        result.created
          ? "Draft collection and claim request saved."
          : "Your existing claim request was found."
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save claim.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      id="claim-live"
      style={{
        marginTop: 28,
        borderRadius: 24,
        padding: 22,
        border: "1px solid rgba(255,255,255,.1)",
        background: "linear-gradient(135deg, rgba(14,10,28,.78), rgba(9,8,18,.68))",
        boxShadow: "0 24px 70px rgba(0,0,0,.3)",
      }}
    >
      <div
        style={{
          color: "#ff8dce",
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: ".2em",
        }}
      >
        LIVE COLLECTION CLAIM
      </div>
      <h2 style={{ margin: "7px 0 6px", fontSize: 23 }}>
        Verify collection authority
      </h2>
      <p
        style={{
          margin: 0,
          color: "rgba(255,255,255,.6)",
          fontSize: 12,
          lineHeight: 1.6,
          maxWidth: 760,
        }}
      >
        Paste a Solana collection address. LockScreened checks Helius against
        the wallet that authenticated your Studio session—not merely a wallet
        that owns one NFT.
      </p>

      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 8,
        }}
      >
        <input
          value={collectionAddress}
          onChange={(event) => setCollectionAddress(event.target.value)}
          placeholder="Solana collection address"
          style={{
            minWidth: 0,
            height: 42,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(0,0,0,.22)",
            color: "#fff",
            padding: "0 12px",
            outline: "none",
          }}
        />
        <button
          onClick={inspect}
          disabled={busy || !session || !collectionAddress.trim()}
          style={buttonStyle}
        >
          {busy ? "CHECKING…" : "CHECK AUTHORITY"}
        </button>
      </div>

      {!session ? (
        <div style={noticeStyle}>
          Sign into Creator Studio with your Solana wallet above to enable
          collection verification.
        </div>
      ) : null}

      {inspection ? (
        <div
          style={{
            marginTop: 13,
            borderRadius: 16,
            border: inspection.allowed
              ? "1px solid rgba(88,224,148,.2)"
              : "1px solid rgba(255,151,110,.2)",
            background: inspection.allowed
              ? "rgba(88,224,148,.06)"
              : "rgba(255,151,110,.06)",
            padding: 13,
            display: "grid",
            gap: 7,
          }}
        >
          <strong style={{ fontSize: 13 }}>
            {inspection.collection.name || "Collection"}
          </strong>
          <span style={rowText}>
            Authenticated wallet: {short(inspection.walletAddress)}
          </span>
          <span style={rowText}>
            Result: {inspection.allowed ? "AUTHORITY FOUND" : "NO AUTHORITY FOUND"}
          </span>
          <span style={rowText}>
            Evidence: {inspection.evidence.length
              ? inspection.evidence.join(", ")
              : "none"}
          </span>
          <span style={rowText}>
            Authorities returned: {inspection.collection.authorities.length} ·
            verified creators: {inspection.collection.verifiedCreators.length}
          </span>

          {inspection.allowed ? (
            <button
              onClick={saveClaim}
              disabled={busy || Boolean(saved)}
              style={{ ...buttonStyle, justifySelf: "start", marginTop: 3 }}
            >
              {saved ? "CLAIM DRAFT SAVED" : "START CLAIM"}
            </button>
          ) : null}
        </div>
      ) : null}

      {message ? <div style={noticeStyle}>{message}</div> : null}

      {saved ? (
        <div style={{ ...noticeStyle, color: "#a9ffd2" }}>
          Draft project created in {saved.studio.name}. Database claim status:
          {" "}{saved.claim.status}.
          {saved.claim.status !== "verified" ? (
            <div style={{ marginTop: 8 }}>
              <button
                onClick={finalizeClaim}
                disabled={busy}
                style={buttonStyle}
              >
                {busy ? "VERIFYING…" : "FINALIZE VERIFIED CLAIM"}
              </button>
            </div>
          ) : (
            <span> Publishing permission is now unlocked by RLS.</span>
          )}
        </div>
      ) : null}
    </section>
  );
}

const buttonStyle = {
  minHeight: 42,
  borderRadius: 999,
  padding: "0 14px",
  border: "1px solid rgba(255,255,255,.12)",
  background: "#ff3fb4",
  color: "#151019",
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: ".1em",
  cursor: "pointer",
} as const;

const noticeStyle = {
  marginTop: 10,
  borderRadius: 12,
  padding: "9px 11px",
  border: "1px solid rgba(255,255,255,.07)",
  background: "rgba(255,255,255,.025)",
  color: "rgba(255,255,255,.58)",
  fontSize: 10,
  lineHeight: 1.5,
} as const;

const rowText = {
  color: "rgba(255,255,255,.58)",
  fontSize: 10,
} as const;
