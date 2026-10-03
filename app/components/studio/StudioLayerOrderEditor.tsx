// app/components/studio/StudioLayerOrderEditor.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { LockScreenedSession } from "../../lib/lockscreened/web3AuthClient";
import { saveTraitLayerConfiguration } from "../../lib/lockscreened/studioDataClient";

type Layer = {
  id: string;
  trait_type: string;
  display_name: string;
  layer_order: number;
  is_background: boolean;
};

export default function StudioLayerOrderEditor({
  session,
  collectionId,
  layers,
  renderProfile,
}: {
  session: LockScreenedSession;
  collectionId: string;
  layers: Layer[];
  renderProfile?: any;
}) {
  const initial = useMemo(
    () =>
      [...(layers || [])].sort(
        (a, b) => Number(a.layer_order || 0) - Number(b.layer_order || 0)
      ),
    [layers]
  );

  const [items, setItems] = useState<Layer[]>(initial);
  const [omitOriginalBackgroundWhenCustom, setOmit] = useState(
    renderProfile?.backgroundHandling !== "keep_original_background"
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setItems(initial);
    setOmit(renderProfile?.backgroundHandling !== "keep_original_background");
  }, [initial, renderProfile]);

  function move(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;

    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(nextIndex, 0, moved);

    setItems(
      next.map((item, i) => ({
        ...item,
        layer_order: (i + 1) * 10,
      }))
    );
  }

  function setBackground(id: string) {
    setItems(
      items.map((item) => ({
        ...item,
        is_background: item.id === id,
      }))
    );
  }

  async function save() {
    setBusy(true);
    setMessage("");

    try {
      await saveTraitLayerConfiguration({
        session,
        collectionId,
        layers: items,
        omitOriginalBackgroundWhenCustom,
        currentRenderProfile: renderProfile,
      });
      setMessage("Layer order and background behavior saved.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save layer setup."
      );
    } finally {
      setBusy(false);
    }
  }

  if (!items.length) return null;

  return (
    <section style={panel}>
      <div style={eyebrow}>UNIVERSAL TRAIT ENGINE</div>
      <h2 style={heading}>Confirm layer order</h2>
      <p style={copy}>
        Top to bottom here means draw order from first to last. Move layers until
        the reconstruction matches the original collection, then choose the one
        layer that represents the original NFT background.
      </p>

      <div style={{ marginTop: 12, display: "grid", gap: 7 }}>
        {items.map((layer, index) => (
          <div key={layer.id} style={row}>
            <div style={orderBox}>{String(index + 1).padStart(2, "0")}</div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <strong style={{ display: "block", fontSize: 11 }}>
                {layer.display_name || layer.trait_type}
              </strong>
              <span style={muted}>{layer.trait_type}</span>
            </div>

            <label style={backgroundToggle}>
              <input
                type="radio"
                name={"background-layer-" + collectionId}
                checked={Boolean(layer.is_background)}
                onChange={() => setBackground(layer.id)}
              />
              ORIGINAL BG
            </label>

            <div style={{ display: "flex", gap: 5 }}>
              <button
                onClick={() => move(index, -1)}
                disabled={index === 0}
                style={miniButton}
                aria-label={"Move " + layer.display_name + " up"}
              >
                ↑
              </button>
              <button
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
                style={miniButton}
                aria-label={"Move " + layer.display_name + " down"}
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>

      <label style={behaviorBox}>
        <input
          type="checkbox"
          checked={omitOriginalBackgroundWhenCustom}
          onChange={(event) => setOmit(event.target.checked)}
        />
        <span>
          <strong>Remove the NFT&apos;s original background</strong>
          <small>
            When a collector chooses a custom LockScreened background, omit the
            designated original-background trait layer.
          </small>
        </span>
      </label>

      <div style={{ marginTop: 11, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={save} disabled={busy} style={button}>
          {busy ? "SAVING…" : "SAVE LAYER CONFIGURATION"}
        </button>
        {message ? <span style={status}>{message}</span> : null}
      </div>
    </section>
  );
}

const panel = {
  borderRadius: 22,
  padding: 20,
  border: "1px solid rgba(255,255,255,.09)",
  background: "rgba(10,8,20,.72)",
  boxShadow: "0 20px 60px rgba(0,0,0,.25)",
} as const;
const eyebrow = {
  color: "#9ee9ff",
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: ".17em",
} as const;
const heading = { margin: "6px 0 5px", fontSize: 19 } as const;
const copy = {
  margin: 0,
  color: "rgba(255,255,255,.55)",
  fontSize: 11,
  lineHeight: 1.55,
} as const;
const row = {
  borderRadius: 13,
  border: "1px solid rgba(255,255,255,.07)",
  background: "rgba(255,255,255,.025)",
  padding: 9,
  display: "flex",
  gap: 9,
  alignItems: "center",
} as const;
const orderBox = {
  width: 30,
  height: 30,
  borderRadius: 9,
  display: "grid",
  placeItems: "center",
  background: "rgba(142,231,255,.07)",
  color: "#aeeeff",
  fontSize: 9,
  fontWeight: 900,
} as const;
const muted = { color: "rgba(255,255,255,.4)", fontSize: 8 } as const;
const backgroundToggle = {
  display: "flex",
  gap: 5,
  alignItems: "center",
  color: "#ffd99d",
  fontSize: 8,
  fontWeight: 900,
  letterSpacing: ".05em",
} as const;
const miniButton = {
  width: 30,
  height: 30,
  borderRadius: 9,
  border: "1px solid rgba(255,255,255,.08)",
  background: "rgba(255,255,255,.04)",
  color: "#fff",
  cursor: "pointer",
} as const;
const behaviorBox = {
  marginTop: 12,
  borderRadius: 13,
  border: "1px solid rgba(255,255,255,.07)",
  background: "rgba(255,255,255,.025)",
  padding: 11,
  display: "flex",
  gap: 9,
  alignItems: "flex-start",
  color: "#fff",
} as const;
const button = {
  minHeight: 36,
  borderRadius: 999,
  padding: "0 12px",
  border: "1px solid rgba(142,231,255,.16)",
  background: "rgba(77,185,224,.09)",
  color: "#fff",
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: ".08em",
} as const;
const status = { color: "#a9ffd2", fontSize: 9 } as const;
