"use client";

import { useEffect, useState } from "react";

type PhoneShowcaseProps = {
  images: string[];
  intervalMs?: number;
  // We don't care about the exact BgChoice shape here – "any" keeps TS happy
  bg?: any;
  title?: string;
  showHint?: boolean;
};

export default function PhoneShowcase({
  images,
  intervalMs = 3000,
  bg,
  title = "How it looks",
  showHint = true,
}: PhoneShowcaseProps) {
  const [index, setIndex] = useState(0);

  // Auto-advance through the images
  useEffect(() => {
    if (!images || images.length === 0) return;

    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);

    return () => clearInterval(id);
  }, [images, intervalMs]);

  const current = images && images.length > 0 ? images[index] : null;

  // Very simple background handling
  const bgStyle =
    bg && bg.kind === "image"
      ? {
          backgroundImage: `url(${bg.value})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : bg && bg.kind === "color"
      ? { backgroundColor: bg.value }
      : {
          background:
            "radial-gradient(circle at top, #7c5cff 0%, #1d102e 60%, #05020a 100%)",
        };

  return (
    <section style={{ padding: "32px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, margin: 0 }}>{title}</h2>
        {showHint && (
          <p style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>
            Preview of RetroGrave lock screens cycling through a few examples.
          </p>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            position: "relative",
            width: "min(360px, 80vw)",
            aspectRatio: "9 / 19.5",
            borderRadius: 26,
            overflow: "hidden",
            boxShadow: "0 18px 44px rgba(0,0,0,0.45)",
            ...bgStyle,
          }}
        >
          {current ? (
            <img
              src={current}
              alt="RetroGrave lock screen preview"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                imageRendering: "pixelated",
              }}
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
      </div>
    </section>
  );
}
