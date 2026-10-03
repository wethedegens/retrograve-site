// app/components/studio/StudioPublicProfileEditor.tsx
"use client";

import { useEffect, useState } from "react";
import type { LockScreenedSession } from "../../lib/lockscreened/web3AuthClient";
import { updateStudioPublicProfile } from "../../lib/lockscreened/studioDataClient";

type Profile = {
  tagline?: string;
  description?: string;
  website?: string;
  marketplace?: string;
  discord?: string;
  x?: string;
};

export default function StudioPublicProfileEditor({
  session,
  collectionId,
  name: initialName,
  profile,
}: {
  session: LockScreenedSession;
  collectionId: string;
  name: string;
  profile?: Profile | null;
}) {
  const [name, setName] = useState(initialName || "");
  const [tagline, setTagline] = useState(profile?.tagline || "");
  const [description, setDescription] = useState(profile?.description || "");
  const [website, setWebsite] = useState(profile?.website || "");
  const [marketplace, setMarketplace] = useState(profile?.marketplace || "");
  const [discord, setDiscord] = useState(profile?.discord || "");
  const [x, setX] = useState(profile?.x || "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setName(initialName || "");
    setTagline(profile?.tagline || "");
    setDescription(profile?.description || "");
    setWebsite(profile?.website || "");
    setMarketplace(profile?.marketplace || "");
    setDiscord(profile?.discord || "");
    setX(profile?.x || "");
  }, [initialName, profile]);

  async function save() {
    setBusy(true);
    setMessage("");
    try {
      await updateStudioPublicProfile({
        session,
        collectionId,
        name,
        profile: { tagline, description, website, marketplace, discord, x },
      });
      setMessage("Public project profile saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save profile.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section style={panel}>
      <div style={eyebrow}>PUBLIC PROJECT IDENTITY</div>
      <h2 style={heading}>Brand this locker</h2>
      <p style={copy}>
        These fields power the public Creator Studio project page. They do not alter any flagship page or legacy asset.
      </p>

      <div style={grid}>
        <Field label="PROJECT NAME">
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="TAGLINE">
          <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Phone-native art for collectors" />
        </Field>
        <Field label="DESCRIPTION" wide>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Tell collectors what this project is and why the locker matters." />
        </Field>
        <Field label="WEBSITE">
          <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
        </Field>
        <Field label="MARKETPLACE">
          <input value={marketplace} onChange={(e) => setMarketplace(e.target.value)} placeholder="https://..." />
        </Field>
        <Field label="DISCORD">
          <input value={discord} onChange={(e) => setDiscord(e.target.value)} placeholder="https://..." />
        </Field>
        <Field label="X / TWITTER">
          <input value={x} onChange={(e) => setX(e.target.value)} placeholder="https://x.com/..." />
        </Field>
      </div>

      <div style={{ marginTop: 11, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={save} disabled={busy || !name.trim()} style={button}>
          {busy ? "SAVING…" : "SAVE PUBLIC PROFILE"}
        </button>
        {message ? <span style={status}>{message}</span> : null}
      </div>

      <style jsx>{`
        section :global(input),
        section :global(textarea) {
          width: 100%;
          box-sizing: border-box;
          border-radius: 11px;
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(0,0,0,.18);
          color: #fff;
          padding: 10px 11px;
          outline: none;
          font: inherit;
          font-size: 10px;
        }
        section :global(textarea) { resize: vertical; min-height: 92px; }
        @media (max-width: 680px) { .profile-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

function Field({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <label style={{ display: "grid", gap: 5, gridColumn: wide ? "1 / -1" : undefined }}>
      <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: ".1em", color: "rgba(255,255,255,.42)" }}>{label}</span>
      {children}
    </label>
  );
}

const panel = { borderRadius: 22, padding: 20, border: "1px solid rgba(255,255,255,.09)", background: "rgba(10,8,20,.72)", boxShadow: "0 20px 60px rgba(0,0,0,.25)" } as const;
const eyebrow = { color: "#f6c989", fontSize: 9, fontWeight: 900, letterSpacing: ".17em" } as const;
const heading = { margin: "6px 0 5px", fontSize: 19 } as const;
const copy = { margin: 0, color: "rgba(255,255,255,.55)", fontSize: 11, lineHeight: 1.55 } as const;
const grid = { marginTop: 13, display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 9 } as const;
const button = { minHeight: 36, borderRadius: 999, padding: "0 12px", border: "1px solid rgba(246,201,137,.2)", background: "rgba(246,201,137,.08)", color: "#fff", fontSize: 9, fontWeight: 900, letterSpacing: ".08em" } as const;
const status = { color: "#a9ffd2", fontSize: 9 } as const;
