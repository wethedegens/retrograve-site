// app/components/studio/StudioPublicLinkControls.tsx
"use client";

import { useState } from "react";

export default function StudioPublicLinkControls({
  slug,
  published,
}: {
  slug: string;
  published: boolean;
}) {
  const [message, setMessage] = useState("");
  const path = "/projects/" + slug;

  async function copy() {
    try {
      const url = window.location.origin + path;
      await navigator.clipboard.writeText(url);
      setMessage("Public URL copied.");
    } catch {
      setMessage("Could not copy automatically.");
    }
  }

  return (
    <section style={panel}>
      <div>
        <div style={eyebrow}>LOCKSCREENED PUBLIC URL</div>
        <strong style={{ display: "block", marginTop: 5, fontSize: 12 }}>
          {path}
        </strong>
        <span style={copyText}>
          {published
            ? "This branded Creator Studio locker is live for collectors."
            : "This URL is reserved for the project and becomes public after launch."}
        </span>
      </div>

      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
        {published ? (
          <a href={path} target="_blank" rel="noreferrer" style={primary}>
            OPEN LIVE LOCKER
          </a>
        ) : (
          <span style={draftPill}>DRAFT · NOT PUBLIC</span>
        )}
        <button onClick={copy} style={secondary}>COPY PUBLIC URL</button>
        {message ? <span style={messageStyle}>{message}</span> : null}
      </div>
    </section>
  );
}

const panel = { borderRadius: 18, padding: 13, border: "1px solid rgba(255,99,194,.13)", background: "linear-gradient(135deg,rgba(255,63,180,.04),rgba(130,93,255,.04))", display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center", flexWrap: "wrap" } as const;
const eyebrow = { color: "#ff8dce", fontSize: 8, fontWeight: 900, letterSpacing: ".15em" } as const;
const copyText = { display: "block", marginTop: 3, color: "rgba(255,255,255,.45)", fontSize: 8 } as const;
const primary = { display: "inline-flex", minHeight: 34, alignItems: "center", justifyContent: "center", borderRadius: 999, padding: "0 11px", background: "#ff3fb4", color: "#151019", textDecoration: "none", border: "1px solid rgba(255,255,255,.12)", fontSize: 8, fontWeight: 900, letterSpacing: ".08em" } as const;
const secondary = { ...primary, background: "rgba(255,255,255,.05)", color: "#fff", cursor: "pointer" } as const;
const draftPill = { display: "inline-flex", minHeight: 34, alignItems: "center", borderRadius: 999, padding: "0 10px", border: "1px solid rgba(255,211,153,.13)", color: "#ffd99d", fontSize: 8, fontWeight: 900, letterSpacing: ".08em" } as const;
const messageStyle = { color: "#a9ffd2", fontSize: 8 } as const;
