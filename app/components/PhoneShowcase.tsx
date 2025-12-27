// app/components/PhoneShowcase.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type PhoneShowcaseProps = {
  images: string[];
  intervalMs?: number;
  bg?: any; // BgChoice-like
  title?: string;
  showHint?: boolean;

  // ✅ NEW: cover fills the phone, contain letterboxes
  fit?: "cover" | "contain";
};

export default function PhoneShowcase({
  images,
  intervalMs = 3000,
  bg,
  title = "How it looks",
  showHint = true,
  fit = "cover",
}: PhoneShowcaseProps) {
  const safeImages = useMemo(() => (Array.isArray(images) ? images : []), [images]);
  const [index, setIndex] = useState(0);

  // Reset index if images change
  useEffect(() => {
    setIndex(0);
  }, [safeImages.length]);

  // ✅ Auto-cycle only when there are 2+ images
  useEffect(() => {
    if (!safeImages || safeImages.length <= 1) return;

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % safeImages.length);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [safeImages, intervalMs]);

  const current = safeImages.length > 0 ? safeImages[index] : null;

  // ✅ BgChoice handling
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
    <section style={{ padding: 0 }}>
      {title ? (
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, margin: 0 }}>{title}</h2>
          {showHint && safeImages.length > 1 ? (
            <p style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>
              Preview cycling through a few examples.
            </p>
          ) : null}
        </div>
      ) : null}

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
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={current}
              alt="Lock screen preview"
              style={{
                width: "100%",
                height: "100%",
                objectFit: fit, // ✅ cover fills the phone
                imageRendering: "pixelated",
                display: "block",
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
