"use client";

import React from "react";
import type { BgChoice } from "./Composer";

type Props = {
  value: BgChoice;
  onChange: (bg: BgChoice) => void;

  // "magapixel" (default), "miners", "gainz"
  project?: string;
};

/**
 * BackgroundPicker
 * - Project-scoped preset backgrounds
 * - SAFE for MAGApixel (no presets applied)
 */

// ✅ Stable ID helper (Composer expects `id`)
function makePresetId(projectKey: string, idx1Based: number) {
  return `${projectKey}-bg-${idx1Based}`;
}

/* ---------------------------
   ENCHANTED MINERS
--------------------------- */

const MINER_IMAGE_BACKGROUNDS: string[] = [
  "/enchanted-miners/phone/bg-1.png",
  "/enchanted-miners/phone/bg-2.png",
  "/enchanted-miners/phone/bg-3.png",
  "/enchanted-miners/phone/bg-4.png",
  "/enchanted-miners/phone/bg-5.png",
  "/enchanted-miners/phone/bg-6.png",
  "/enchanted-miners/phone/bg-7.png",
  "/enchanted-miners/phone/bg-8.png",
  "/enchanted-miners/phone/bg-9.png",
  "/enchanted-miners/phone/bg-10.png",
  "/enchanted-miners/phone/bg-11.png",
  "/enchanted-miners/phone/bg-12.png",
  "/enchanted-miners/phone/bg-13.png",
  "/enchanted-miners/phone/bg-14.png",
  "/enchanted-miners/phone/bg-15.png",
  "/enchanted-miners/phone/bg-16.png",
  "/enchanted-miners/phone/bg-17.png",
  "/enchanted-miners/phone/bg-18.png",
  "/enchanted-miners/phone/bg-19.png",
  "/enchanted-miners/phone/bg-20.png",
  "/enchanted-miners/phone/bg-21.png",
  "/enchanted-miners/phone/bg-22.png",
  "/enchanted-miners/phone/bg-23.png",
  "/enchanted-miners/phone/bg-24.png",
  "/enchanted-miners/phone/bg-25.png",
  "/enchanted-miners/phone/bg-26.png",
  "/enchanted-miners/phone/bg-27.png",
  "/enchanted-miners/phone/bg-28.png",
];

/* ---------------------------
   GAINZ
--------------------------- */

const GAINZ_BG_COUNT = 20;

const GAINZ_IMAGE_BACKGROUNDS = Array.from(
  { length: GAINZ_BG_COUNT },
  (_, i) => `/gainz/phone/bg-${i + 1}.png`
);

/* ---------------------------
   Project switch
--------------------------- */

function getBgList(project?: string): { key: string; urls: string[] } {
  const p = (project || "magapixel").toLowerCase();

  if (p === "miners" || p === "enchanted-miners") {
    return { key: "miners", urls: MINER_IMAGE_BACKGROUNDS };
  }

  if (p === "gainz") {
    return { key: "gainz", urls: GAINZ_IMAGE_BACKGROUNDS };
  }

  // MAGApixel (no presets)
  return { key: "magapixel", urls: [] };
}

export default function BackgroundPicker({
  value,
  onChange,
  project,
}: Props) {
  const { key: projectKey, urls } = getBgList(project);

  const isUsingPreset =
    value?.kind === "preset" && value.id.startsWith(projectKey);

  const selectedId = isUsingPreset ? value.id : "";

  return (
    <div className="bg-picker">
      {!urls.length ? (
        <div className="bg-empty">
          <p className="bg-empty-title">Backgrounds</p>
          <p className="bg-empty-text">
            No preset backgrounds configured for <b>{projectKey}</b>.
          </p>
        </div>
      ) : (
        <>
          <label className="bg-label">Backgrounds</label>

          <select
            className="bg-select"
            value={selectedId}
            onChange={(e) => {
              const id = e.target.value;
              if (!id) return;

              const idxStr = id.split("-bg-")[1];
              const idx = Math.max(1, parseInt(idxStr || "1", 10));
              const url = urls[idx - 1];

              if (!url) return;

              onChange({
                kind: "preset",
                id,
                project: projectKey as any,
              });
            }}
          >
            <option value="">Choose a background…</option>
            {urls.map((_, i) => {
              const id = makePresetId(projectKey, i + 1);
              return (
                <option key={id} value={id}>
                  {projectKey.toUpperCase()} BG {i + 1}
                </option>
              );
            })}
          </select>
        </>
      )}

      <style jsx>{`
        .bg-picker {
          width: 100%;
        }

        .bg-label {
          display: block;
          font-family: "VT323", monospace;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-size: 12px;
          margin-bottom: 8px;
          opacity: 0.9;
        }

        .bg-select {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(0, 0, 0, 0.45);
          color: #fff;
          padding: 10px 12px;
        }

        .bg-empty {
          border: 1px dashed rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 12px;
          background: rgba(0, 0, 0, 0.25);
        }

        .bg-empty-title {
          margin: 0 0 6px;
          font-family: "VT323", monospace;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-size: 12px;
        }

        .bg-empty-text {
          margin: 0;
          font-size: 13px;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}
