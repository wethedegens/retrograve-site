// app/components/PhoneShowcase.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type ProjectKey = "magapixel" | "retrograve" | "miners";

type PhoneShowcaseProps = {
  /**
   * ✅ Backward compatible:
   * - Old mode: pass images directly
   * - New mode: pass project / projectKey and we pick defaults
   */
  images?: string[];

  /** ✅ New mode (preferred) */
  projectKey?: ProjectKey;

  /** ✅ Alias for older landing pages you may have */
  project?: ProjectKey;

  intervalMs?: number;

  /** Optional background config (kept as-is) */
  bg?: any; // BgChoice-like

  title?: string;
  showHint?: boolean;

  /** Optional sizing tweaks (lets you do "30% smaller" safely) */
  maxWidthPx?: number; // default 360
  widthVw?: number; // default 80
};

export default function PhoneShowcase({
  images,
  projectKey,
  project,
  intervalMs = 3000,
  bg,
  title = "How it looks",
  showHint = true,
  maxWidthPx = 360,
  widthVw = 80,
}: PhoneShowcaseProps) {
  const [index, setIndex] = useState(0);

  // ✅ Resolve project key (supports either prop)
  const resolvedProject: ProjectKey | null = useMemo(() => {
    const p = (projectKey || project || "").toLowerCase();
    if (p === "magapixel") return "magapixel";
    if (p === "retrograve") return "retrograve";
    if (p === "miners") return "miners";
    return null;
  }, [projectKey, project]);

  // ✅ Default images per project (uses files you already have in /public)
  const resolvedImages: string[] = useMemo(() => {
    if (Array.isArray(images) && images.length > 0) return images;

    if (resolvedProject === "magapixel") {
      return ["/lockscreened-previews/magapixel.png"];
    }

    if (resolvedProject === "retrograve") {
      return ["/lockscreened-previews/retrograve.png"];
    }

    if (resolvedProject === "miners") {
      return ["/lockscreened-previews/miners.png"];
    }

    return [];
  }, [images, resolvedProject]);

  useEffect(() => {
    // reset index when images change
    setIndex(0);
  }, [resolvedImages.join("|")]);

  useEffect(() => {
    if (!resolvedImages || resolvedImages.length === 0) return;

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % resolvedImages.length);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [resolvedImages, intervalMs]);

  const current =
    resolvedImages && resolvedImages.length > 0 ? resolvedImages[index] : null;

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
            width: `min(${maxWidthPx}px, ${widthVw}vw)`,
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
