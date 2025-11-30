"use client";

import { useRef } from "react";
import {
  BACKGROUNDS,
  type BackgroundConfig,
} from "../backgroundsConfig";

export type BgChoice =
  | { kind: "color"; value: string }
  | { kind: "image"; file: File } // user-uploaded
  | { kind: "preset"; id: string }; // new: one of your configured backgrounds

const COLOR_SWATCHES = ["#2e2548", "#3e2d75", "#6a49b8", "#0e0e12", "#1b1a22"];

export default function BackgroundPicker({
  value,
  onChange,
}: {
  value: BgChoice | null;
  onChange: (bg: BgChoice) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const selectedPresetId =
    value && value.kind === "preset" ? value.id : null;
  const selectedColor =
    value && value.kind === "color" ? value.value.toLowerCase() : null;

  const handlePresetClick = (bg: BackgroundConfig) => {
    onChange({ kind: "preset", id: bg.id });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* PRESET IMAGE BACKGROUNDS */}
      <div>
        <div
          style={{
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            color: "#a9a9b6",
            marginBottom: 6,
          }}
        >
          Preset backgrounds
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          {BACKGROUNDS.map((bg) => {
            const isSelected = selectedPresetId === bg.id;
            return (
              <button
                key={bg.id}
                type="button"
                aria-label={bg.label}
                onClick={() => handlePresetClick(bg)}
                style={{
                  position: "relative",
                  width: 30,
                  height: 30,
                  borderRadius: 9999,
                  border: isSelected
                    ? "2px solid rgba(129, 199, 255, 0.9)"
                    : "1px solid rgba(255,255,255,.25)",
                  padding: 0,
                  background: "transparent",
                  cursor: "pointer",
                  outline: "none",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 2,
                    top: 2,
                    right: 2,
                    bottom: 2,
                    borderRadius: 9999,
                    overflow: "hidden",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bg.thumb}
                    alt={bg.label}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                    loading="lazy"
                  />
                </div>
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 11, color: "#8a8aa0", minHeight: 16 }}>
          {selectedPresetId && (
            <span>
              Selected:{" "}
              {BACKGROUNDS.find((b) => b.id === selectedPresetId)?.label ??
                selectedPresetId}
            </span>
          )}
        </div>
      </div>

      {/* SIMPLE COLOR SWATCHES (what you already had) */}
      <div>
        <div
          style={{
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            color: "#a9a9b6",
            marginBottom: 6,
          }}
        >
          Solid colors
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {COLOR_SWATCHES.map((hex) => (
            <button
              key={hex}
              aria-label={`background ${hex}`}
              onClick={() => onChange({ kind: "color", value: hex })}
              style={{
                width: 22,
                height: 22,
                borderRadius: 9999,
                border: "1px solid rgba(255,255,255,.25)",
                background: hex,
                outline:
                  selectedColor === hex.toLowerCase()
                    ? "2px solid rgba(189,163,255,.9)"
                    : "none",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>

      {/* UPLOAD AREA */}
      <div>
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            color: "#a9a9b6",
          }}
        >
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
          style={{ marginTop: 8, fontSize: 12 }}
        />
      </div>
    </div>
  );
}
