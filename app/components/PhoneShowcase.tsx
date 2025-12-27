// app/components/PhoneShowcase.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type FitMode = "contain" | "cover";

type PhoneShowcaseProps = {
  images: string[];
  intervalMs?: number;
  bg?: any; // BgChoice-like
  title?: string;
  showHint?: boolean;

  /** how the preview image fits inside the phone screen */
  fit?: FitMode;

  /** show a phone-like frame (bezel + notch) */
  frame?: boolean;

  /**
   * Base phone width in px.
   * We set this to 450px (25% bigger than 360px) to match your request.
   */
  widthPx?: number;
};

export default function PhoneShowcase({
  images,
  intervalMs = 3000,
  bg,
  title = "How it looks",
  showHint = true,
  fit = "cover",
  frame = true,
  widthPx = 450, // ✅ 25% larger (360 -> 450)
}: PhoneShowcaseProps) {
  const safeImages = useMemo(() => images?.filter(Boolean) ?? [], [images]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!safeImages.length) return;

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % safeImages.length);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [safeImages.length, intervalMs]);

  const current = safeImages.length ? safeImages[index] : null;

  // ✅ Correct BgChoice handling:
  // - image backgrounds use bg.image
  // - color backgrounds use bg.value
  const bgStyle =
    bg && bg.kind === "image" && bg.image
      ? {
          backgroundImage: `url(${bg.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : bg && bg.kind === "color" && bg.value
      ? { backgroundColor: bg.value }
      : {
          background:
            "radial-gradient(circle at top, #7c5cff 0%, #1d102e 60%, #05020a 100%)",
        };

  return (
    <section style={{ padding: title || showHint ? "32px 0" : "0" }}>
      {(title || showHint) && (
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          {title ? <h2 style={{ fontSize: 20, margin: 0 }}>{title}</h2> : null}
          {showHint ? (
            <p style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>
              Preview cycling through a few examples.
            </p>
          ) : null}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center" }}>
        {/* OUTER PHONE (frame lives here) */}
        <div
          style={{
            position: "relative",
            width: `min(${widthPx}px, 80vw)`,
            aspectRatio: "9 / 19.5",
            borderRadius: 34,
            overflow: "visible",
            filter: "drop-shadow(0 22px 44px rgba(0,0,0,0.35))",
          }}
        >
          {/* INNER SCREEN */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 30,
              overflow: "hidden",
              boxShadow: "0 18px 44px rgba(0,0,0,0.30)",
              ...bgStyle,
            }}
          >
            {current ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current}
                alt="Lock screen preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: fit,
                  imageRendering: "pixelated",
                  display: "block",
                }}
                draggable={false}
              />
            ) : (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 12,
                  opacity: 0.7,
                }}
              >
                No images configured
              </div>
            )}
          </div>

          {/* PHONE FRAME OVERLAY */}
          {frame ? (
            <>
              {/* bezel */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: -10,
                  borderRadius: 42,
                  border: "10px solid rgba(255,255,255,0.12)",
                  boxShadow:
                    "inset 0 0 0 1px rgba(0,0,0,0.25), 0 12px 30px rgba(0,0,0,0.25)",
                  pointerEvents: "none",
                }}
              />

              {/* glass highlight */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 30,
                  boxShadow:
                    "inset 0 0 0 1px rgba(255,255,255,0.10), inset 0 12px 40px rgba(255,255,255,0.10)",
                  pointerEvents: "none",
                }}
              />

              {/* notch */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "42%",
                  height: 18,
                  borderRadius: 999,
                  background: "rgba(0,0,0,0.35)",
                  boxShadow:
                    "inset 0 0 0 1px rgba(255,255,255,0.10), 0 6px 14px rgba(0,0,0,0.25)",
                  pointerEvents: "none",
                }}
              />

              {/* speaker dot */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 14,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 34,
                  height: 6,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.10)",
                  pointerEvents: "none",
                }}
              />
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
