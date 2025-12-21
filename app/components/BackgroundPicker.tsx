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
 * - Supports different projects with separate folders.
 *
 * Folder conventions (recommended):
 *  - Enchanted Miners: /public/enchanted-miners/phone/bg-1.png ... bg-28.png
 *  - GAINZ:            /public/gainz/phone/bg-1.png ... bg-N.png
 *  - MAGApixel:        (optional) wire later if you want presets
 */

// ✅ Helper: create stable IDs for each project
function makePresetId(projectKey: string, idx1Based: number) {
  return `${projectKey}-bg-${idx1Based}`;
}

// ✅ Enchanted Miners backgrounds (static list)
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

// ✅ GAINZ backgrounds (generated list)
// Change GAINZ_BG_COUNT to however many you have.
const GAINZ_BG_COUNT = 20;
const GAINZ_IMAGE_BACKGROUNDS: string[] = Array.from(
  { length: GAINZ_BG_COUNT },
  (_, i) => `/gainz/phone/bg-${i + 1}.png`
);

// ✅ Decide which list to use
function getBgList(project?: string): { key: string; urls: string[] } {
  const p = (project || "magapixel").toLowerCase();

  if (p === "miners" || p === "enchanted-miners") {
    return { key: "miners", urls: MINER_IMAGE_BACKGROUNDS };
  }

  if (p === "gainz") {
    return { key: "gainz", urls: GAINZ_IMAGE_BACKGROUNDS };
  }

  // Default: MAGApixel (you can wire in its folder later if needed)
  return { key: "magapixel", urls: [] };
}

export default function BackgroundPicker({ value, onChange, project }: Props) {
  const { key: projectKey, urls } = getBgList(project);

  const isUsingPreset =
    value?.kind === "preset" && value?.presetId?.startsWith(projectKey);

  const selectedId = isUsingPreset ? value.presetId : "";

  return (
    <div className="bg-picker">
      {/* If a project has no preset backgrounds yet, show a helpful note */}
      {!urls.length ? (
        <div className="bg-empty">
          <p className="bg-empty-title">Backgrounds</p>
          <p className="bg-empty-text">
            No preset backgrounds configured for <b>{projectKey}</b> yet.
          </p>
        </div>
      ) : (
        <>
          <label className="bg-label">Backgrounds</label>

          <select
            className="bg-select"
            value={selectedId}
            onChange={(e) => {
              const presetId = e.target.value;

              // If user chooses blank, do nothing (or switch to "none")
              if (!presetId) return;

              const idxStr = presetId.split("-bg-")[1] || "1";
              const idx = Math.max(1, parseInt(idxStr, 10) || 1);

              const url = urls[idx - 1] || urls[0];

              onChange({
                kind: "preset",
                presetId,
                url,
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
          opacity: 0.9;
          margin-bottom: 8px;
        }

        .bg-select {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(0, 0, 0, 0.45);
          color: #fff;
          padding: 10px 12px;
          outline: none;
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
          opacity: 0.9;
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
