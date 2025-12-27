// app/components/PhoneShowcase.tsx
"use client";

import { useEffect, useState } from "react";

type PhoneShowcaseProps = {
  images: string[];
  intervalMs?: number;
  bg?: any; // BgChoice-like
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

  useEffect(() => {
    if (!images || images.length === 0) return;

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [images, intervalMs]);

  const current = images && images.length > 0 ? images[index] : null;

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
    <section style={{ padding: "32px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, margin: 0 }}>{title}</h2>
        {showHint && (
          <p style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>
            Preview cycling through a few examples.
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
              alt="Lock screen preview"
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
