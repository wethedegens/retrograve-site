// app/components/BackgroundPicker.tsx
"use client";

import type { ChangeEvent } from "react";
import type { BgChoice } from "./Composer";

type Props = {
  value: BgChoice;
  onChange: (bg: BgChoice) => void;
  // "magapixel" (default), "miners", or future projects
  project?: string;
};

/**
 * ENCHANTED MINERS: static phone-sized PNGs
 * Folder: /public/enchanted-miners/phone/bg-1.png ... bg-28.png
 */
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
  "/enchanted-miners/phone/bg-12.png",
  "/enchanted-miners/phone/bg-13.png",
  "/enchanted-miners/phone/bg-14.png",
  "/enchanted-miners/phone/bg-15.png",
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

/**
 * MAGAPIXEL: background packs with phone / ipad / desktop / thumb
 * Folder structure:
 *   /public/backgrounds/<slug>/thumb.png
 *   /public/backgrounds/<slug>/phone.png
 */
const MAGAPIXEL_BACKGROUND_SLUGS: string[] = [
  "austere-grey",
  "bitcoined",
  "black",
  "bookcase-brown",
  "in-the-vault",
  "make-art-great-again",
  "military-green",
  "navy-blue",
  "north-american-sky",
  "out-at-night",
  "patriotic",
  "republican-red",
  "sea-to-shining-sea",
  "trump-international-golf-club",
  "whitehouse-hallway",
];

export default function BackgroundPicker({ value, onChange, project }: Props) {
  const current = value as any;
  const isMiners = project === "miners";

  // IMPORTANT: image variant uses `.image`, not `.value`
  const isImageActive = (src: string) =>
    current?.kind === "image" && current?.image === src;

  /** Upload handler (works for both projects) */
  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);

    onChange({
      kind: "image",
      image: url,
      file,
    } as any as BgChoice);
  };

  /** Enchanted Miners: click one of the phone PNGs */
  const handleMinerImageClick = (src: string, index: number) => {
    let file: File | undefined;
    try {
      file = new File([], `miner-wallpaper-${index + 1}.png`, {
        type: "image/png",
      });
    } catch {
      file = undefined;
    }

    onChange({
      kind: "image",
      image: src,
      file: file as any,
    } as any as BgChoice);
  };

  /** MAGAPIXEL: use /backgrounds/<slug>/phone.png as wallpaper */
  const handleMagapixelClick = (slug: string, index: number) => {
    const phoneSrc = `/backgrounds/${slug}/phone.png`;

    let file: File | undefined;
    try {
      file = new File([], `magapixel-bg-${slug}-${index + 1}.png`, {
        type: "image/png",
      });
    } catch {
      file = undefined;
    }

    onChange({
      kind: "image",
      image: phoneSrc,
      file: file as any,
    } as any as BgChoice);
  };

  return (
    <section>
      {/* MINERS STRIP */}
      {isMiners && (
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
              const active = isImageActive(src);
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

      {/* MAGAPIXEL STRIP (default when not miners) */}
      {!isMiners && (
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
            MAGAPIXEL BACKGROUNDS
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
            {MAGAPIXEL_BACKGROUND_SLUGS.map((slug, idx) => {
              const phoneSrc = `/backgrounds/${slug}/phone.png`;
              const thumbSrc = `/backgrounds/${slug}/thumb.png`;
              const active = isImageActive(phoneSrc);

              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => handleMagapixelClick(slug, idx)}
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
                    src={thumbSrc}
                    alt={slug}
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

      {/* UPLOAD (shared) */}
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
