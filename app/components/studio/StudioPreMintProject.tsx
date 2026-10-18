// app/components/studio/StudioPreMintProject.tsx
"use client";

import { useEffect, useState } from "react";
import {
  getFreshSession,
  readStoredSession,
  type LockScreenedSession,
} from "../../lib/lockscreened/web3AuthClient";
import { createPreMintProject } from "../../lib/lockscreened/studioDataClient";

export default function StudioPreMintProject() {
  const [session, setSession] = useState<LockScreenedSession | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [createdId, setCreatedId] = useState("");

  useEffect(() => {
    let active = true;

    async function sync() {
      const current = (await getFreshSession()) || readStoredSession();
      if (active) setSession(current);
    }

    sync();
    const listener = () => sync();
    window.addEventListener("lockscreened-auth-changed", listener);
    return () => {
      active = false;
      window.removeEventListener("lockscreened-auth-changed", listener);
    };
  }, []);

  async function createProject() {
    if (!session || !name.trim()) return;

    setBusy(true);
    setMessage("");

    try {
      const result = await createPreMintProject({
        session,
        name,
      });

      setCreatedId(result.collection.id);
      setMessage(
        "Private pre-mint project created. You can upload original traits and backgrounds now. Public launch stays locked until a real collection is attached and authority is verified."
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not create pre-mint project."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="premint" style={panel}>
      <div style={eyebrow}>UPCOMING / PRE-MINT COLLECTION</div>
      <h2 style={heading}>Build before your collection launches</h2>
      <p style={copy}>
        No collection address yet? Create a private project now, upload your
        original layered art, configure backgrounds, and preview the experience.
        Nothing can publish publicly until you later attach the real collection
        and verify current authority.
      </p>

      <div style={steps}>
        <Step n="1" text="Create private pre-mint project" />
        <Step n="2" text="Upload original traits + backgrounds" />
        <Step n="3" text="Preview and refine privately" />
        <Step n="4" text="Attach collection after mint + verify authority" />
        <Step n="5" text="Publish Creator Locker" />
      </div>

      {!session ? (
        <div style={notice}>
          Sign in to Creator Studio above first. This only uses the safe
          off-chain wallet signature.
        </div>
      ) : (
        <div style={createRow}>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Project name — e.g. RetroGrave"
            style={input}
            maxLength={120}
          />
          <button
            onClick={createProject}
            disabled={busy || !name.trim()}
            style={button}
          >
            {busy ? "CREATING…" : "CREATE PRIVATE PRE-MINT PROJECT"}
          </button>
        </div>
      )}

      {message ? (
        <div style={success}>
          {message}
          {createdId ? (
            <a href={"/studio/project/" + createdId} style={link}>
              OPEN PROJECT →
            </a>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <div style={step}>
      <span style={stepNum}>{n}</span>
      <span>{text}</span>
    </div>
  );
}

const panel = {
  marginBottom: 24,
  borderRadius: 22,
  padding: 20,
  border: "1px solid rgba(255,99,194,.15)",
  background:
    "linear-gradient(135deg,rgba(15,10,29,.8),rgba(9,8,18,.7))",
} as const;

const eyebrow = {
  color: "#ff8dce",
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: ".18em",
} as const;

const heading = { margin: "6px 0", fontSize: 22 } as const;

const copy = {
  margin: 0,
  maxWidth: 780,
  color: "rgba(255,255,255,.6)",
  fontSize: 11,
  lineHeight: 1.6,
} as const;

const steps = {
  marginTop: 14,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 7,
} as const;

const step = {
  borderRadius: 12,
  padding: 9,
  border: "1px solid rgba(255,255,255,.06)",
  background: "rgba(255,255,255,.025)",
  display: "flex",
  gap: 8,
  alignItems: "center",
  color: "rgba(255,255,255,.62)",
  fontSize: 9,
} as const;

const stepNum = {
  width: 23,
  height: 23,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  background: "rgba(255,63,180,.12)",
  color: "#ff9bd8",
  fontWeight: 900,
  flex: "0 0 auto",
} as const;

const createRow = {
  marginTop: 14,
  display: "grid",
  gridTemplateColumns: "minmax(0,1fr) auto",
  gap: 8,
} as const;

const input = {
  minWidth: 0,
  height: 42,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.12)",
  background: "rgba(0,0,0,.22)",
  color: "#fff",
  padding: "0 12px",
  outline: "none",
} as const;

const button = {
  minHeight: 42,
  borderRadius: 999,
  padding: "0 14px",
  border: "1px solid rgba(255,255,255,.12)",
  background: "#ff3fb4",
  color: "#151019",
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: ".09em",
  cursor: "pointer",
} as const;

const notice = {
  marginTop: 14,
  borderRadius: 12,
  padding: 10,
  border: "1px solid rgba(255,210,138,.14)",
  background: "rgba(255,210,138,.05)",
  color: "#ffd99d",
  fontSize: 9,
} as const;

const success = {
  marginTop: 10,
  borderRadius: 12,
  padding: 10,
  border: "1px solid rgba(169,255,210,.14)",
  background: "rgba(93,255,170,.035)",
  color: "#a9ffd2",
  fontSize: 9,
  lineHeight: 1.5,
} as const;

const link = {
  display: "inline-block",
  marginLeft: 8,
  color: "#ff9bd8",
  fontWeight: 900,
  textDecoration: "none",
} as const;
