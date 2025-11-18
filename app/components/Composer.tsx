// app/components/Composer.tsx
"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

export type BgChoice =
  | { kind: "color"; value: string }
  | { kind: "image"; file: File };

export type MetaAttribute = {
  trait_type?: string;
  value?: string | number | null;
};

export type SimpleNft = {
  id: string;
  name?: string;
  image?: string;           // main RetroGrave image (1440x3200)
  attributes?: MetaAttribute[];
};

export type ExportSize = { label: string; w: number; h: number };

type Size = { w: number; h: number };

const PRESETS: Record<string, Size> = {
  master: { w: 1440, h: 3200 },
  "iphone-15pmax": { w: 1290, h: 2796 },
  "iphone-15pro": { w: 1179, h: 2556 },
  "android-20-9": { w: 1080, h: 2400 },
  "android-qhd+": { w: 1440, h: 3040 },
};

export type ComposerHandle = {
  exportAt: (size: ExportSize | keyof typeof PRESETS) => Promise<void>;
};

const isHttpUrl = (s?: string | null) => !!s && /^https?:\/\//i.test(s);
const proxyUrl = (src: string) => `/api/img?u=${encodeURIComponent(src)}`;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = () => rej(new Error("image load failed: " + src));
    img.src = src;
  });
}

const Composer = forwardRef<
  ComposerHandle,
  { nft: SimpleNft | null; bg: BgChoice | null }
>(({ nft, bg }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loadingImg, setLoadingImg] = useState(false);

  const previewScale = 0.58;
  const previewSize: Size = useMemo(
    () => ({
      w: Math.round(1440 * previewScale),
      h: Math.round(3200 * previewScale),
    }),
    []
  );

  const activeBg = useMemo<BgChoice>(
    () =>
      bg || ({
        kind: "color",
        value: "#3e2d75",
      } as BgChoice),
    [bg]
  );

  /** Core draw: background -> single NFT image (no local layer logic) */
  const draw = async (ctx: CanvasRenderingContext2D, size: Size) => {
    // Background
    if (activeBg.kind === "color") {
      ctx.fillStyle = activeBg.value || "#2b2146";
      ctx.fillRect(0, 0, size.w, size.h);
    } else if (activeBg.kind === "image" && activeBg.file) {
      const url = URL.createObjectURL(activeBg.file);
      try {
        const img = await loadImage(url);
        const scale = Math.min(size.w / img.width, size.h / img.height);
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        const dx = (size.w - drawW) / 2;
        const dy = size.h - drawH; // bottom align
        ctx.drawImage(img, dx, dy, drawW, drawH);
      } finally {
        URL.revokeObjectURL(url);
      }
    }

    // NFT image on top
    if (!nft?.image) {
      return;
    }

    setLoadingImg(true);
    try {
      const src = isHttpUrl(nft.image)
        ? proxyUrl(nft.image)
        : nft.image;

      const img = await loadImage(src);
      const scale = Math.min(size.w / img.width, size.h / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const dx = (size.w - drawW) / 2;
      const dy = size.h - drawH; // bottom align

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, dx, dy, drawW, drawH);
    } catch (err) {
      console.error("Failed to draw NFT image in Composer:", err);
    } finally {
      setLoadingImg(false);
    }
  };

  const renderPreview = async () => {
    const c = canvasRef.current;
    if (!c) return;
    c.width = previewSize.w;
    c.height = previewSize.h;

    const ctx = c.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, c.width, c.height);
    await draw(ctx, previewSize);
  };

  useEffect(() => {
    // Re-render whenever the image URL or background changes
    renderPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nft?.image, activeBg]);

  useImperativeHandle(ref, () => ({
    exportAt: async (size) => {
      const target: Size =
        typeof size === "string" ? PRESETS[size] : { w: size.w, h: size.h };

      const c = document.createElement("canvas");
      c.width = target.w;
      c.height = target.h;
      const ctx = c.getContext("2d");
      if (!ctx) return;

      await draw(ctx, target);

      const blob = await new Promise<Blob | null>((res) =>
        c.toBlob(res, "image/png")
      );
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(nft?.name || "retrograve")
        .replace(/\s+/g, "_")}_${target.w}x${target.h}.png`;
      a.click();
      URL.revokeObjectURL(url);
    },
  }));

  return (
    <div className="composer-wrap">
      <div className="phone-frame">
        <div className="phone-surface">
          <div className="phone-hint">
            {loadingImg
              ? "Loading image…"
              : "Preview is scaled; exports are full size."}
          </div>

          <canvas
            ref={canvasRef}
            className="phone-canvas"
            style={{ imageRendering: "pixelated" }}
          />
        </div>
      </div>

      <style jsx>{`
        .composer-wrap {
          display: grid;
          gap: 10px;
          justify-items: center;
        }
        .phone-frame {
          position: relative;
          width: min(360px, 78vw);
          aspect-ratio: 9 / 19.5;
          border-radius: 26px;
          overflow: hidden;
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.45);
          background: #221a33;
        }
        .phone-surface {
          position: absolute;
          inset: 0;
          display: grid;
          grid-template-rows: auto 1fr;
          align-content: end;
          justify-items: center;
          padding: 8px 8px 10px;
          gap: 4px;
        }
        .phone-hint {
          align-self: start;
          justify-self: center;
          font-size: 11px;
          color: #cfc2ff;
          background: rgba(0, 0, 0, 0.35);
          padding: 6px 8px;
          border-radius: 999px;
          backdrop-filter: blur(2px);
          pointer-events: none;
          user-select: none;
          white-space: nowrap;
        }
        .phone-canvas {
          width: 86%;
          height: auto;
        }
      `}</style>
    </div>
  );
});

Composer.displayName = "Composer";
export default Composer;
