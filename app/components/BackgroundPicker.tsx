// app/components/BackgroundPicker.tsx
"use client";

import React, { ChangeEvent } from "react";

export type BgChoice =
  | { kind: "color"; value: string }
  | { kind: "image"; value: string };

type Props = {
  value: BgChoice;
  onChange: (bg: BgChoice) => void;
  // "magapixel" (default), "miners", or future projects
  project?: string;
};

// Darker / neon palette for MAGApixel / RetroGrave style
const PRESET_MAGAPIXEL = [
  "#3e2d75",
  "#241b3e",
  "#4b256d",
  "#1f1f3a",
  "#ff6b6b",
  "#f7c948",
  "#3b82f6",
  "#10b981",
];

// Softer, enchanted palette for ENCHANTED MINERS
const PRESET_MINERS = [
  "#fef3c7", // soft cream
  "#bfdbfe", // light blue
  "#bbf7d0", // mint
  "#fecaca", // soft pink
  "#e9d5ff", // lavender
  "#fde68a", // yellow
  "#a5f3fc", // aqua
  "#fbcfe8", // rose
];

const SOLID_COLORS = ["#000000", "#111827", "#4b5563", "#9ca3af", "#f9fafb"];

function BackgroundPicker({ value, onChange, project }: Props) {
  const isColor = value.kind === "color";
  const currentColor = isColor ? value.value : "";

  const palette =
    project === "miners"
      ? PRESET_MINERS
      : PRESET_MAGAPIXEL;

  const handlePresetClick = (color: string) => {
    onChange({ kind: "color", value: color });
  };

  const handleSolidClick = (color: string) => {
    onChange({ kind: "color", value: color });
  };

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange({ kind: "image", value: url });
  };

  return (
    <section>
      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            opacity: 0.8,
            marginBottom: 4,
          }}
        >
          PRESET BACKGROUNDS
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {palette.map((color) => {
            const active = isColor && currentColor === color;
            return (
              <button
                key={color}
                type="button"
                onClick={() => handlePresetClick(color)}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "999px",
                  border: active ? "2px solid #ffffff" : "2px solid transparent",
                  padding: 0,
                  backgroundColor: "#111827",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "999px",
                    background: color,
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 12, marginBottom: 8 }}>
        <div
          style={{
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            opacity: 0.8,
            marginBottom: 4,
          }}
        >
          SOLID COLORS
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {SOLID_COLORS.map((color) => {
            const active = isColor && currentColor === color;
            return (
              <button
                key={color}
                type="button"
                onClick={() => handleSolidClick(color)}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "999px",
                  border: active ? "2px solid #ffffff" : "2px solid transparent",
                  padding: 0,
                  backgroundColor: "#111827",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "999px",
                    background: color,
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div
          style={{
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            opacity: 0.8,
            marginBottom: 4,
          }}
        >
          Or upload a background
        </div>
        <input type="file" accept="image/*" onChange={handleUpload} />
      </div>
    </section>
  );
}

export default BackgroundPicker;
