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
  const [artworkMode, setArtworkMode] = useState<
    "layered_traits" | "finished_artwork"
  >("layered_traits");
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
        artworkMode,
      });

      setCreatedId(result.collection.id);
      setMessage(
        artworkMode === "layered_traits"
          ? "Private layered pre-mint project created. Upload the original trait folder next, then confirm the layer order and build backgrounds."
          : "Private finished-artwork project created. No trait folder is required. Use representative final NFT artwork to design the phone experience, then attach the real collection after mint."
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
        No collection address yet? Start privately now. Choose the artwork path
        that matches what you actually have. Nothing can publish publicly until
        you later attach the real collection and verify current authority.
      </p>

      <div style={question}>HOW IS YOUR COLLECTION ARTWORK AVAILABLE?</div>

      <div style={modeGrid}>
        <button
          type="button"
          onClick={() => setArtworkMode("layered_traits")}
          style={{
            ...modeCard,
            ...(artworkMode === "layered_traits" ? modeCardActive : {}),
          }}
        >
          <span style={modeKicker}>BEST CONTROL</span>
          <strong style={modeTitle}>I HAVE THE ORIGINAL LAYERED TRAITS</strong>
          <span style={modeCopy}>
            Upload the same layer folders used to generate the collection.
            LockScreened can reconstruct each NFT and swap or extend backgrounds.
          </span>
          <span style={modeFoot}>PNG / WebP trait folders · LMNFT-style supported</span>
        </button>

        <button
          type="button"
          onClick={() => setArtworkMode("finished_artwork")}
          style={{
            ...modeCard,
            ...(artworkMode === "finished_artwork" ? modeCardActive : {}),
          }}
        >
          <span style={modeKicker}>FASTEST SETUP</span>
          <strong style={modeTitle}>I ONLY HAVE THE FINISHED NFT IMAGES</strong>
          <span style={modeCopy}>
            Keep the final NFT artwork exactly as it is. LockScreened uses each
            holder's minted image and builds the phone, tablet and desktop
            experience around it.
          </span>
          <span style={modeFoot}>No source layers required · ideal for finished collections</span>
        </button>
      </div>

      <div style={steps}>
        <Step n="1" text="Create private pre-mint project" />
        <Step
          n="2"
          text={
            artworkMode === "layered_traits"
              ? "Upload original traits + backgrounds"
              : "Preview finished artwork + add backgrounds"
          }
        />
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
            {busy
              ? "CREATING…"
              : artworkMode === "layered_traits"
                ? "CREATE LAYERED PRE-MINT PROJECT"
                : "CREATE FINISHED-ARTWORK PROJECT"}
          </button>
        </div>
      )}

      {message ? (
        <div style={success}>
          {message}
          {createdId ? (
            <a href={"/studio/manage/" + createdId} style={link}>
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


const question = {
  marginTop: 16,
  color: "rgba(255,255,255,.5)",
  fontSize: 8,
  fontWeight: 900,
  letterSpacing: ".14em",
} as const;

const modeGrid = {
  marginTop: 7,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
  gap: 9,
} as const;

const modeCard = {
  appearance: "none",
  textAlign: "left",
  borderRadius: 16,
  padding: 14,
  border: "1px solid rgba(255,255,255,.08)",
  background: "rgba(255,255,255,.025)",
  color: "#fff",
  display: "grid",
  gap: 6,
  cursor: "pointer",
} as const;

const modeCardActive = {
  border: "1px solid rgba(255,99,180,.42)",
  background:
    "linear-gradient(135deg,rgba(255,63,180,.08),rgba(143,107,255,.06))",
  boxShadow: "0 0 0 1px rgba(255,63,180,.04) inset",
} as const;

const modeKicker = {
  color: "#ff8dce",
  fontSize: 7,
  fontWeight: 900,
  letterSpacing: ".13em",
} as const;

const modeTitle = {
  fontSize: 11,
  letterSpacing: ".04em",
} as const;

const modeCopy = {
  color: "rgba(255,255,255,.56)",
  fontSize: 9,
  lineHeight: 1.5,
} as const;

const modeFoot = {
  color: "rgba(169,255,210,.65)",
  fontSize: 8,
  lineHeight: 1.4,
} as const;
