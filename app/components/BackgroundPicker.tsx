// app/components/BackgroundPicker.tsx
"use client";

import React, { ChangeEvent } from "react";
import type { BgChoice } from "./Composer";

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
  "#fef3c7",
  "#bfdbfe",
  "#bbf7d0",
  "#fecaca",
  "#e9d5ff",
  "#fde68a",
  "#a5f3fc",
  "#fbcfe8",
];

// Static miner wallpaper images (phone-sized) living in /public/miners-bgs
// ➜ Make sure these files exist: public/miners-bgs/bg-1.png ... bg-28.png
const MINER_IMAGE_BACKGROUNDS: string[] = [
  "/miners-bgs/bg-1.png",
  "/miners-bgs/bg-2.png",
  "/miners-bgs/bg-3.png",
  "/miners-bgs/bg-4.png",
  "/miners-bgs/bg-5.png",
  "/miners-bgs/bg-6.png",
  "/miners-bgs/bg-7.png",
  "/miners-bgs/bg-8.png",
  "/miners-bgs/bg-9.png",
  "/miners-bgs/bg-10.png",
  "/miners-bgs/bg-11.png",
  "/miners-bgs/bg-12.png",
  "/miners-bgs/bg-13.png",
  "/miners-bgs/bg-14.png",
  "/miners-bgs/bg-15.png",
  "/miners-bgs/bg-16.png",
  "/miners-bgs/bg-17.png",
  "/miners-bgs/bg-18.png",
  "/miners-bgs/bg-19.png",
  "/miners-bgs/bg-20.png",
  "/miners-bgs/bg-21.png",
  "/miners-bgs/bg-22.png",
  "/miners-bgs/bg-23.png",
  "/miners-bgs/bg-24.png",
  "/miners-bgs/bg-25.png",
  "/miners-bgs/bg-26.png",
  "/miners-bgs/bg-27.png",
  "/miners-bgs/bg-28.png",
];

const SOLID_COLORS = ["#000000", "#111827", "#4b5563", "#9ca3af", "#f9fafb"];

function BackgroundPicker({ value, onChange, project }: Props) {
  const isColor = value.kind === "color";
  const currentColor = isColor ? value.value : "";

  const palette = project === "miners" ? PRESET_MINERS : PRESET_MAGAPIXEL;

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

    // image-variant wants `image`, not `value`
    onChange({ kind: "image", image: url, file });
  };

  // Static PNGs from /public — we only really need the URL,
  // but the "image" BgChoice variant also allows an optional File.
  const handleMinerImageClick = (src: string, index: number) => {
    let file: File | undefined;

    try {
      file = new File([], `miner-wallpaper-${index + 1}.png`, {
        type: "image/png",
      });
    } catch {
      // Older / odd environments: ignore File creation, URL is enough.
      file = undefined;
    }

    onChange({
      kind: "image",
      image: src,
      file,
    });
  };

  return (
    <section>
      {/* PRESET BACKGROUNDS (COLOR PALETTE) */}
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

      {/* MINER WALLPAPERS (PNG BACKGROUNDS FROM /public/miners-bgs) */}
      {project === "miners" && (
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
            MINER WALLPAPERS
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            {MINER_IMAGE_BACKGROUNDS.map((src, idx) => {
              const active =
                value.kind === "image" && value.image === src;

              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => handleMinerImageClick(src, idx)}
                  style={{
                    borderRadius: 10,
                    border: active
                      ? "2px solid #ffffff"
                      : "2px solid transparent",
                    padding: 0,
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    flex: "0 0 auto",
                  }}
                >
                  <img
                    src={src}
                    alt={`Miner wallpaper ${idx + 1}`}
                    style={{
                      display: "block",
                      width: 52,
                      height: 92,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SOLID COLORS */}
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

      {/* UPLOAD */}
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
