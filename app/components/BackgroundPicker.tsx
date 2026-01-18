// app/components/BackgroundPicker.tsx
"use client";

import type { ChangeEvent } from "react";
import type { BgChoice } from "./Composer";

type Props = {
  value: BgChoice;
  onChange: (bg: BgChoice) => void;

  /**
   * Project key passed from the locker/composer:
   *  - "magapixel" (default)
   *  - "miners"
   *  - "gainz"
   *  - "midevils"
   *  - "meowga"
   *  - "zeromonkebiz"
   *  - "sagamonkes"
   *  - "retrograve"
   *  - future projects...
   */
  project?: string;
};

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

const GAINZ_IMAGE_BACKGROUNDS: string[] = [
  "/gainz/phone/bg-1.png",
  "/gainz/phone/bg-2.png",
  "/gainz/phone/bg-3.png",
  "/gainz/phone/bg-4.png",
  "/gainz/phone/bg-5.png",
  "/gainz/phone/bg-6.png",
  "/gainz/phone/bg-7.png",
  "/gainz/phone/bg-8.png",
  "/gainz/phone/bg-9.png",
  "/gainz/phone/bg-10.png",
  "/gainz/phone/bg-11.png",
  "/gainz/phone/bg-12.png",
  "/gainz/phone/bg-13.png",
  "/gainz/phone/bg-14.png",
  "/gainz/phone/bg-15.png",
];

const MIDEVILS_IMAGE_BACKGROUNDS: string[] = [
  "/midevils/phone/bg-1.png",
  "/midevils/phone/bg-2.png",
  "/midevils/phone/bg-3.png",
  "/midevils/phone/bg-4.png",
  "/midevils/phone/bg-5.png",
  "/midevils/phone/bg-6.png",
  "/midevils/phone/bg-7.png",
  "/midevils/phone/bg-8.png",
  "/midevils/phone/bg-9.png",
  "/midevils/phone/bg-10.png",
  "/midevils/phone/bg-11.png",
  "/midevils/phone/bg-12.png",
];

const MEOWGA_IMAGE_BACKGROUNDS: string[] = [
  "/meowga/phone/bedroom-plotting.png",
  "/meowga/phone/brownies.png",
  "/meowga/phone/cabinet-speaker.png",
  "/meowga/phone/dimz.png",
  "/meowga/phone/golden-museum.png",
  "/meowga/phone/greenz.png",
  "/meowga/phone/halofang.png",
  "/meowga/phone/heavenly-realm.png",
  "/meowga/phone/limey.png",
  "/meowga/phone/meowpheus.png",
  "/meowga/phone/normie.png",
  "/meowga/phone/patriots-lounge.png",
  "/meowga/phone/smuthe-blue.png",
  "/meowga/phone/touching-grass.png",
  "/meowga/phone/vengeance.png",
];

const ZEROMONKEBIZ_IMAGE_BACKGROUNDS: string[] = [
  "/zeromonkebiz/phone/bg-1.png",
  "/zeromonkebiz/phone/bg-2.png",
  "/zeromonkebiz/phone/bg-3.png",
];

// ✅ SagaMonkes (5 only)
const SAGAMONKES_IMAGE_BACKGROUNDS: string[] = [
  "/saga-monkes/phone/bg-1.png",
  "/saga-monkes/phone/bg-2.png",
  "/saga-monkes/phone/bg-3.png",
  "/saga-monkes/phone/bg-4.png",
  "/saga-monkes/phone/bg-5.png",
];

// ✅ RetroGrave (from your screenshot folder: public/Retrograve-backgrounds/phone)
const RETROGRAVE_IMAGE_BACKGROUNDS: string[] = [
  "/retrograve-backgrounds/phone/adventure.png",
  "/retrograve-backgrounds/phone/combat.png",
  "/retrograve-backgrounds/phone/dark-grey.png",
  "/retrograve-backgrounds/phone/dark-mode.png",
  "/retrograve-backgrounds/phone/dead-waters.png",
  "/retrograve-backgrounds/phone/deep-glitch.png",
  "/retrograve-backgrounds/phone/digital-jungle.png",
  "/retrograve-backgrounds/phone/doppelganger.png",
  "/retrograve-backgrounds/phone/dungeon-lanterns.png",
  "/retrograve-backgrounds/phone/easter-egg.png",
  "/retrograve-backgrounds/phone/fitpall.png",
  "/retrograve-backgrounds/phone/game-over.png",
  "/retrograve-backgrounds/phone/glitched.png",
  "/retrograve-backgrounds/phone/gloom.png",
  "/retrograve-backgrounds/phone/gradiential.png",
  "/retrograve-backgrounds/phone/graveyard.png",
  "/retrograve-backgrounds/phone/green-screened.png",
  "/retrograve-backgrounds/phone/gremlin-escape-plan.png",
  "/retrograve-backgrounds/phone/infrared.png",
  "/retrograve-backgrounds/phone/invalid.png",
  "/retrograve-backgrounds/phone/i-saw-blue.png",
  "/retrograve-backgrounds/phone/jedis-revenge.png",
  "/retrograve-backgrounds/phone/laguna-fair.png",
  "/retrograve-backgrounds/phone/lite-mode.png",
  "/retrograve-backgrounds/phone/mac-pan.png",
  "/retrograve-backgrounds/phone/moods.png",
  "/retrograve-backgrounds/phone/pew-pew.png",
  "/retrograve-backgrounds/phone/seeing-red.png",
  "/retrograve-backgrounds/phone/shalom.png",
  "/retrograve-backgrounds/phone/tenticede.png",
  "/retrograve-backgrounds/phone/triforce.png",
  "/retrograve-backgrounds/phone/wavy.png",
];

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

const STATIC_PROJECT_STRIPS: Record<
  string,
  { label: string; images: string[]; filenamePrefix: string }
> = {
  miners: {
    label: "MINER WALLPAPERS",
    images: MINER_IMAGE_BACKGROUNDS,
    filenamePrefix: "miner-wallpaper",
  },
  gainz: {
    label: "GAINZ WALLPAPERS",
    images: GAINZ_IMAGE_BACKGROUNDS,
    filenamePrefix: "gainz-wallpaper",
  },
  midevils: {
    label: "MIDEVILS WALLPAPERS",
    images: MIDEVILS_IMAGE_BACKGROUNDS,
    filenamePrefix: "midevils-wallpaper",
  },
  meowga: {
    label: "MEOWGA WALLPAPERS",
    images: MEOWGA_IMAGE_BACKGROUNDS,
    filenamePrefix: "meowga-wallpaper",
  },
  zeromonkebiz: {
    label: "ZEROMONKEBIZ WALLPAPERS",
    images: ZEROMONKEBIZ_IMAGE_BACKGROUNDS,
    filenamePrefix: "zeromonkebiz-wallpaper",
  },
  sagamonkes: {
    label: "SAGAMONKES WALLPAPERS",
    images: SAGAMONKES_IMAGE_BACKGROUNDS,
    filenamePrefix: "sagamonkes-wallpaper",
  },

  // ✅ NEW: RetroGrave
  retrograve: {
    label: "RETROGRAVE WALLPAPERS",
    images: RETROGRAVE_IMAGE_BACKGROUNDS,
    filenamePrefix: "retrograve-wallpaper",
  },
};

export default function BackgroundPicker({ value, onChange, project }: Props) {
  const current = value as any;
  const key = (project || "magapixel").toLowerCase();

  const staticStrip = STATIC_PROJECT_STRIPS[key];
  const isStaticProject = !!staticStrip;
  const isMagapixel = !isStaticProject;

  const isImageActive = (src: string) =>
    current?.kind === "image" && current?.image === src;

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

  const handleStaticProjectImageClick = (
    src: string,
    index: number,
    filenamePrefix: string
  ) => {
    let file: File | undefined;
    try {
      file = new File([], `${filenamePrefix}-${index + 1}.png`, {
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
      {isStaticProject && staticStrip ? (
        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              opacity: 0.8,
              marginBottom: 4,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            {staticStrip.label}
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
            {staticStrip.images.map((src, idx) => {
              const active = isImageActive(src);
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() =>
                    handleStaticProjectImageClick(
                      src,
                      idx,
                      staticStrip.filenamePrefix
                    )
                  }
                  style={{
                    borderRadius: 10,
                    border: active ? "2px solid #ffffff" : "2px solid transparent",
                    padding: 0,
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    flex: "0 0 auto",
                  }}
                >
                  <img
                    src={src}
                    alt={`${staticStrip.label} ${idx + 1}`}
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
      ) : null}

      {isMagapixel && (
        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              opacity: 0.8,
              marginBottom: 4,
              color: "rgba(255,255,255,0.9)",
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
                    border: active ? "2px solid #ffffff" : "2px solid transparent",
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

      <div style={{ marginTop: 12 }}>
        <div
          style={{
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            opacity: 0.8,
            marginBottom: 4,
            color: "rgba(255,255,255,0.9)",
          }}
        >
          Or upload a background
        </div>
        <input type="file" accept="image/*" onChange={handleUpload} />
      </div>
    </section>
  );
}
