"use client";

import { useRef } from "react";

export type BgChoice =
  | { kind: "color"; value: string }
  | { kind: "image"; file: File };

const SWATCHES = ["#2e2548", "#3e2d75", "#6a49b8", "#0e0e12", "#1b1a22"];

export default function BackgroundPicker({
  value,
  onChange,
}: {
  value: BgChoice | null;
  onChange: (bg: BgChoice) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  return (
    <div>
      <div style={{ display: "flex", gap: 8 }}>
        {SWATCHES.map((hex) => (
          <button
            key={hex}
            aria-label={`background ${hex}`}
            onClick={() => onChange({ kind: "color", value: hex })}
            style={{
              width: 22,
              height: 22,
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,.25)",
              background: hex,
              outline:
                value?.kind === "color" && value.value.toLowerCase() === hex.toLowerCase()
                  ? "2px solid rgba(189,163,255,.9)"
                  : "none",
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: "#a9a9b6" }}>
        Or upload a background
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange({ kind: "image", file: f });
        }}
        style={{ marginTop: 8 }}
      />
    </div>
  );
}
