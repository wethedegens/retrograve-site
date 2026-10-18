// app/components/studio/StudioCollectionClaim.tsx
"use client";

import { useEffect, useState } from "react";
import {
  getFreshSession,
  readStoredSession,
  type LockScreenedSession,
} from "../../lib/lockscreened/web3AuthClient";
import {
  listMyStudioCollections,
  type StudioCollectionRow,
} from "../../lib/lockscreened/studioDataClient";

type Inspection = {
  allowed: boolean;
  manualReviewEligible?: boolean;
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
  const [preMintProjects, setPreMintProjects] = useState<StudioCollectionRow[]>([]);
  const [attachToProjectId, setAttachToProjectId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function sync() {
      const current = await getFreshSession();
      const next = current || readStoredSession();
      if (!active) return;

      setSession(next);

      if (!next) {
        setPreMintProjects([]);
        setAttachToProjectId("");
        return;
      }

      try {
        const rows = await listMyStudioCollections(next);
        if (!active) return;

        const preMint = rows.filter(
          (row: any) =>
            row.source_type === "demo" &&
            row.source_config?.preMint === true &&
            row.publish_status === "draft"
        );

        setPreMintProjects(preMint);

        if (!attachToProjectId && preMint[0]?.id) {
          setAttachToProjectId(preMint[0].id);
        }
      } catch {
        if (active) setPreMintProjects([]);
      }
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
          ? "Current collection authority found for this authenticated wallet."
          : data.manualReviewEligible
            ? "Verified-creator evidence found. This wallet can submit a claim for manual review, but cannot unlock publishing automatically."
            : "The authenticated wallet was not found as the current collection authority."
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Inspection failed.");
    } finally {
      setBusy(false);
    }
  }


  async function saveClaim() {
    if (!inspection?.allowed && !inspection?.manualReviewEligible) return;

    setBusy(true);
    setMessage("");

    try {
      const current = await getFreshSession();
      if (!current) throw new Error("Your Studio session expired.");

      const prepareResponse = await fetch("/api/studio/claim-prepare", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + current.access_token,
        },
        body: JSON.stringify({
          collectionId: attachToProjectId || undefined,
          collectionAddress: inspection.collection.assetId,
          collectionName: inspection.collection.name,
        }),
      });
      const result = await prepareResponse.json();
      if (!prepareResponse.ok) {
        throw new Error(result?.error || "Could not prepare this collection claim.");
      }

      setSaved(result);

      if (inspection.manualReviewEligible && !inspection.allowed) {
        setMessage(
          "Claim submitted for manual review. Nothing is unlocked until LockScreened confirms authority."
        );
        return;
      }

      const response = await fetch("/api/studio/claim-finalize", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + current.access_token,
        },
        body: JSON.stringify({ claimId: result.claim.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data?.authorityConfirmed && data?.needsServerSecret) {
          setMessage(
            "Authority confirmed. Secure project activation is waiting for the server-only LockScreened credential."
          );
          return;
        }

        if (data?.manualReviewRequired) {
          setMessage(
            "This claim is safely staying pending for manual review."
          );
          return;
        }

        throw new Error(data?.error || "Could not verify this collection.");
      }

      const verifiedResult = {
        ...result,
        claim: {
          ...result.claim,
          ...(data.claim || {}),
          status: "verified",
        },
      };

      setSaved(verifiedResult);
      window.dispatchEvent(
        new CustomEvent("lockscreened-studio-data-changed")
      );
      setMessage(
        attachToProjectId
          ? "Collection verified and attached to your existing pre-mint project. All of your private setup work was preserved."
          : "Collection verified. Your LockScreened project is ready to set up."
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not create this project."
      );
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

      {preMintProjects.length ? (
        <div
          style={{
            marginTop: 12,
            borderRadius: 14,
            padding: 11,
            border: "1px solid rgba(255,99,180,.12)",
            background: "rgba(255,63,180,.035)",
            display: "grid",
            gap: 6,
          }}
        >
          <strong
            style={{
              color: "#ff9bd8",
              fontSize: 9,
              letterSpacing: ".08em",
            }}
          >
            ALREADY BUILT A PRE-MINT PROJECT?
          </strong>
          <span style={rowText}>
            Attach the real collection to your existing private project so your
            traits, backgrounds and settings carry forward.
          </span>
          <select
            value={attachToProjectId}
            onChange={(event) => setAttachToProjectId(event.target.value)}
            style={{
              minHeight: 38,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,.1)",
              background: "#11101a",
              color: "#fff",
              padding: "0 9px",
            }}
          >
            {preMintProjects.map((project) => (
              <option key={project.id} value={project.id}>
                Attach to {project.name} · PRE-MINT PRIVATE
              </option>
            ))}
            <option value="">Create a new LockScreened project instead</option>
          </select>
        </div>
      ) : null}

      {inspection ? (
        <div
          style={{
            marginTop: 13,
            borderRadius: 16,
            border: inspection.allowed
              ? "1px solid rgba(88,224,148,.2)"
              : inspection.manualReviewEligible
                ? "1px solid rgba(255,210,138,.18)"
                : "1px solid rgba(255,151,110,.2)",
            background: inspection.allowed
              ? "rgba(88,224,148,.06)"
              : inspection.manualReviewEligible
                ? "rgba(255,210,138,.05)"
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
            Result: {inspection.allowed
              ? "CURRENT AUTHORITY · AUTO PATH"
              : inspection.manualReviewEligible
                ? "VERIFIED CREATOR · MANUAL REVIEW REQUIRED"
                : "NO CLAIM AUTHORITY FOUND"}
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

          {inspection.allowed || inspection.manualReviewEligible ? (
            <button
              onClick={saveClaim}
              disabled={busy || Boolean(saved)}
              style={{ ...buttonStyle, justifySelf: "start", marginTop: 3 }}
            >
              {busy
                ? "CREATING…"
                : saved
                  ? "PROJECT CREATED"
                  : inspection.allowed
                    ? attachToProjectId
                    ? "ATTACH + VERIFY THIS COLLECTION"
                    : "CREATE LOCKSCREENED PROJECT"
                    : "SUBMIT FOR MANUAL REVIEW"}
            </button>
          ) : null}
        </div>
      ) : null}

      {message ? <div style={noticeStyle}>{message}</div> : null}

      {saved ? (
        <div style={{ ...noticeStyle, color: "#a9ffd2" }}>
          <strong style={{ display: "block", marginBottom: 4 }}>
            {saved.claim.status === "verified"
              ? "Collection verified"
              : "Claim saved"}
          </strong>
          <span>
            {saved.claim.status === "verified"
              ? "Your project is protected and ready for setup."
              : "This project will remain locked until authority review is complete."}
          </span>
          {saved.claim.status === "verified" ? (
            <div style={{ marginTop: 9 }}>
              <a
                href={"/studio/manage/" + saved.collection.id}
                style={{ ...buttonStyle, display: "inline-flex", alignItems: "center", textDecoration: "none" }}
              >
                OPEN PROJECT →
              </a>
            </div>
          ) : null}
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
