// app/components/studio/StudioRenderProfileEditor.tsx
"use client";

import { useEffect, useState } from "react";
import type { LockScreenedSession } from "../../lib/lockscreened/web3AuthClient";
import { updateCollectionRenderPlacement } from "../../lib/lockscreened/studioDataClient";

type AxisX = "left" | "center" | "right";
type AxisY = "top" | "center" | "bottom";
type Placement = { scale: number; x: AxisX; y: AxisY };
type DeviceKey = "phone" | "ipad" | "desktop";

const DEFAULTS: Record<DeviceKey, Placement> = {
  phone: { scale: 1, x: "center", y: "bottom" },
  ipad: { scale: 1, x: "center", y: "bottom" },
  desktop: { scale: 1, x: "center", y: "bottom" },
};

function normalizePlacement(value: any, fallback: Placement): Placement {
  const scale = Math.min(1.8, Math.max(0.4, Number(value?.scale || fallback.scale)));
  const x: AxisX = ["left", "center", "right"].includes(value?.x) ? value.x : fallback.x;
  const y: AxisY = ["top", "center", "bottom"].includes(value?.y) ? value.y : fallback.y;
  return { scale, x, y };
}

export default function StudioRenderProfileEditor({
  session,
  collectionId,
  renderProfile,
}: {
  session: LockScreenedSession;
  collectionId: string;
  renderProfile?: any;
}) {
  const [placements, setPlacements] = useState<Record<DeviceKey, Placement>>(DEFAULTS);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const source = renderProfile?.devicePlacement || {};
    setPlacements({
      phone: normalizePlacement(source.phone, DEFAULTS.phone),
      ipad: normalizePlacement(source.ipad, DEFAULTS.ipad),
      desktop: normalizePlacement(source.desktop, DEFAULTS.desktop),
    });
  }, [renderProfile]);

  function update(device: DeviceKey, patch: Partial<Placement>) {
    setPlacements((current) => ({
      ...current,
      [device]: { ...current[device], ...patch },
    }));
  }

  async function save() {
    setBusy(true);
    setMessage("");
    try {
      await updateCollectionRenderPlacement({
        session,
        collectionId,
        currentRenderProfile: renderProfile,
        devicePlacement: placements,
      });
      setMessage("Device render placement saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save placement.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section style={panel}>
      <div style={eyebrow}>DEVICE RENDER PROFILE</div>
      <h2 style={heading}>Art placement by device</h2>
      <p style={copy}>
        Tune the universal renderer without writing project-specific code. These settings apply only to Creator Studio projects.
      </p>

      <div className="device-grid" style={grid}>
        {(["phone", "ipad", "desktop"] as DeviceKey[]).map((device) => {
          const value = placements[device];
          return (
            <div key={device} style={card}>
              <strong style={{ fontSize: 10, textTransform: "uppercase" }}>{device}</strong>

              <label style={field}>
                <span>SCALE · {Math.round(value.scale * 100)}%</span>
                <input
                  type="range"
                  min="40"
                  max="180"
                  step="5"
                  value={Math.round(value.scale * 100)}
                  onChange={(e) => update(device, { scale: Number(e.target.value) / 100 })}
                />
              </label>

              <label style={field}>
                <span>HORIZONTAL</span>
                <select value={value.x} onChange={(e) => update(device, { x: e.target.value as AxisX })}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </label>

              <label style={field}>
                <span>VERTICAL</span>
                <select value={value.y} onChange={(e) => update(device, { y: e.target.value as AxisY })}>
                  <option value="top">Top</option>
                  <option value="center">Center</option>
                  <option value="bottom">Bottom</option>
                </select>
              </label>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 11, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={save} disabled={busy} style={button}>
          {busy ? "SAVING…" : "SAVE DEVICE PLACEMENT"}
        </button>
        {message ? <span style={status}>{message}</span> : null}
      </div>

      <style jsx>{`
        section :global(select) {
          min-height: 34px;
          border-radius: 9px;
          border: 1px solid rgba(255,255,255,.09);
          background: #11101a;
          color: white;
          padding: 0 8px;
        }
        section :global(input[type="range"]) { width: 100%; }
        @media (max-width: 720px) { .device-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

const panel = { borderRadius: 22, padding: 20, border: "1px solid rgba(255,255,255,.09)", background: "rgba(10,8,20,.72)" } as const;
const eyebrow = { color: "#b8c7ff", fontSize: 9, fontWeight: 900, letterSpacing: ".17em" } as const;
const heading = { margin: "6px 0 5px", fontSize: 19 } as const;
const copy = { margin: 0, color: "rgba(255,255,255,.55)", fontSize: 11, lineHeight: 1.55 } as const;
const grid = { marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8 } as const;
const card = { borderRadius: 13, padding: 10, border: "1px solid rgba(255,255,255,.07)", background: "rgba(255,255,255,.025)", display: "grid", gap: 10 } as const;
const field = { display: "grid", gap: 5, color: "rgba(255,255,255,.45)", fontSize: 8, fontWeight: 900, letterSpacing: ".07em" } as const;
const button = { minHeight: 36, borderRadius: 999, padding: "0 12px", border: "1px solid rgba(184,199,255,.16)", background: "rgba(114,133,219,.09)", color: "#fff", fontSize: 9, fontWeight: 900, letterSpacing: ".08em" } as const;
const status = { color: "#a9ffd2", fontSize: 9 } as const;
