// app/components/studio/PublishedBackgroundPicker.tsx
"use client";

import type { BgChoice } from "../Composer";

type Background = {
  id: string;
  name: string;
  deviceAssets: Record<string, string>;
};

export default function PublishedBackgroundPicker({
  backgrounds,
  value,
  onChange,
}: {
  backgrounds: Background[];
  value: BgChoice;
  onChange: (value: BgChoice) => void;
}) {
  const activeId =
    value.kind === "image" ? (value as any).backgroundId : undefined;

  return (
    <section>
      <div
        style={{
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: ".14em",
          color: "rgba(255,255,255,.68)",
          marginBottom: 7,
        }}
      >
        OFFICIAL WALLPAPERS
      </div>

      {!backgrounds.length ? (
        <div
          style={{
            borderRadius: 12,
            padding: 10,
            border: "1px solid rgba(255,255,255,.07)",
            color: "rgba(255,255,255,.42)",
            fontSize: 9,
          }}
        >
          No published background packages yet.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 5,
          }}
        >
          {backgrounds.map((background) => {
            const phone = background.deviceAssets?.phone;
            if (!phone) return null;

            const active = activeId === background.id;

            return (
              <button
                key={background.id}
                type="button"
                onClick={() =>
                  onChange({
                    kind: "image",
                    image: phone,
                    deviceAssets: {
                      phone,
                      ipad: background.deviceAssets?.ipad,
                      desktop: background.deviceAssets?.desktop,
                    },
                    backgroundId: background.id,
                  })
                }
                title={background.name}
                style={{
                  padding: 0,
                  flex: "0 0 auto",
                  borderRadius: 11,
                  overflow: "hidden",
                  border: active
                    ? "2px solid #fff"
                    : "2px solid transparent",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <img
                  src={phone}
                  alt={background.name}
                  style={{
                    width: 56,
                    height: 100,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
