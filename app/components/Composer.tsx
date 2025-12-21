"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getBackgroundImagePath,
  type DeviceVariant,
  type BackgroundProject,
} from "../backgroundsConfig";

/* ============================================================
   TYPES
============================================================ */

export type BgChoice =
  | { kind: "color"; value: string }
  | { kind: "image"; image: string; value?: string; file?: File | null }
  | { kind: "preset"; id: string; project?: BackgroundProject };

export type MetaAttribute = {
  trait_type?: string;
  value?: string | number | null;
};

export type SimpleNft = {
  id: string;
  name?: string;
  image?: string; // remote fallback
  attributes?: MetaAttribute[];
};

export type ExportSize = { label: string; w: number; h: number };

type Size = { w: number; h: number };

export type ExportImageOptions = {
  width: number;
  height: number;
  format?: "png";
  device?: DeviceVariant;
};

export type ComposerHandle = {
  exportImage: (opts: ExportImageOptions) => Promise<Blob | null>;
  exportAt: (size: ExportSize | keyof typeof PRESETS) => Promise<void>;
};

/* ============================================================
   CONFIG
============================================================ */

const PRESETS: Record<string, Size> = {
  master: { w: 1440, h: 3200 },
  phone: { w: 1440, h: 3200 },
  ipad: { w: 2048, h: 2048 },
  desktop: { w: 1440, h: 1440 },
};

/* ============================================================
   HELPERS
============================================================ */

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

/**
 * Draw a background image that covers the canvas and bottom-aligns
 */
async function drawBackground(
  ctx: CanvasRenderingContext2D,
  size: Size,
  src: string
) {
  const img = await loadImage(src);
  const scale = Math.max(size.w / img.width, size.h / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  const dx = (size.w - drawW) / 2;
  const dy = size.h - drawH;
  ctx.drawImage(img, dx, dy, drawW, drawH);
}

/**
 * Draw NFT image:
 * - phone / ipad → centered
 * - desktop → RIGHT-JUSTIFIED
 */
async function drawNftImage(
  ctx: CanvasRenderingContext2D,
  size: Size,
  src: string,
  device: DeviceVariant
) {
  const img = await loadImage(src);

  // IMPORTANT:
  // We do NOT assume source size (800x800, 1440x1440, etc)
  const scale = Math.min(size.w / img.width, size.h / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;

  let dx = 0;

  if (device === "desktop") {
    // RIGHT-JUSTIFIED for comp view
    dx = size.w - drawW;
  } else {
    // CENTERED for phone + ipad
    dx = (size.w - drawW) / 2;
  }

  const dy = size.h - drawH;

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, dx, dy, drawW, drawH);
}

/* ============================================================
   COMPONENT
============================================================ */

const Composer = forwardRef<
  ComposerHandle,
  { nft: SimpleNft | null; bg: BgChoice | null }
>(({ nft, bg }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loadingImg, setLoadingImg] = useState(false);

  const previewScale = 0.58;

  const activeBg = useMemo(
    () => bg || ({ kind: "color", value: "#2b2146" } as BgChoice),
    [bg]
  );

  const previewSize: Size = useMemo(
    () => ({
      w: Math.round(1440 * previewScale),
      h: Math.round(3200 * previewScale),
    }),
    []
  );

  /**
   * CORE DRAW PIPELINE
   */
  const draw = async (
    ctx: CanvasRenderingContext2D,
    size: Size,
    device: DeviceVariant
  ) => {
    /* ---------------- BACKGROUND ---------------- */

    if (activeBg.kind === "preset") {
      const project: BackgroundProject =
        (activeBg as any)?.project === "gainz" ? "gainz" : "magapixel";

      const src = getBackgroundImagePath(project, activeBg.id, device);

      if (src) {
        setLoadingImg(true);
        try {
          await drawBackground(ctx, size, src);
        } finally {
          setLoadingImg(false);
        }
      } else {
        ctx.fillStyle = "#2b2146";
        ctx.fillRect(0, 0, size.w, size.h);
      }
    } else if (activeBg.kind === "color") {
      ctx.fillStyle = activeBg.value || "#2b2146";
      ctx.fillRect(0, 0, size.w, size.h);
    } else if (activeBg.kind === "image") {
      const src = activeBg.image || activeBg.value;
      if (src) {
        setLoadingImg(true);
        try {
          await drawBackground(ctx, size, src);
        } finally {
          setLoadingImg(false);
        }
      }
    }

    /* ---------------- NFT IMAGE ---------------- */

    if (nft?.image) {
      setLoadingImg(true);
      try {
        const src = isHttpUrl(nft.image)
          ? proxyUrl(nft.image)
          : nft.image;

        await drawNftImage(ctx, size, src, device);
      } finally {
        setLoadingImg(false);
      }
    }
  };

  /* ---------------- PREVIEW ---------------- */

  const renderPreview = async () => {
    const c = canvasRef.current;
    if (!c) return;
    c.width = previewSize.w;
    c.height = previewSize.h;

    const ctx = c.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, c.width, c.height);
    await draw(ctx, previewSize, "phone");
  };

  useEffect(() => {
    renderPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nft?.image, activeBg]);

  /* ---------------- EXPORT API ---------------- */

  useImperativeHandle(ref, () => {
    const doExportImage = async (
      opts: ExportImageOptions
    ): Promise<Blob | null> => {
      const { width, height, format = "png", device = "phone" } = opts;

      const c = document.createElement("canvas");
      c.width = width;
      c.height = height;

      const ctx = c.getContext("2d");
      if (!ctx) return null;

      await draw(ctx, { w: width, h: height }, device);

      return new Promise((res) =>
        c.toBlob(res, format === "png" ? "image/png" : "image/png")
      );
    };

    return {
      exportImage: doExportImage,

      async exportAt(size: ExportSize | keyof typeof PRESETS) {
        const target =
          typeof size === "string" ? PRESETS[size] : size;

        const blob = await doExportImage({
          width: target.w,
          height: target.h,
          device:
            target.w === 2048 ? "ipad" :
            target.w === 1440 && target.h === 1440 ? "desktop" :
            "phone",
        });

        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${(nft?.name || "nft")
          .replace(/\s+/g, "_")
          .toLowerCase()}_${target.w}x${target.h}.png`;
        a.click();
        URL.revokeObjectURL(url);
      },
    };
  });

  /* ---------------- UI ---------------- */

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
          width: 340px;
          max-width: 88vw;
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
          padding: 8px;
          gap: 4px;
        }
        .phone-hint {
          font-size: 11px;
          color: #cfc2ff;
          background: rgba(0, 0, 0, 0.35);
          padding: 6px 8px;
          border-radius: 999px;
          text-align: center;
          pointer-events: none;
        }
        .phone-canvas {
          width: 92%;
          height: auto;
        }

        @media (max-width: 768px) {
          .phone-frame {
            width: min(280px, 65vw);
          }
          .phone-hint {
            display: none;
          }
        }
      `}</style>
    </div>
  );
});

Composer.displayName = "Composer";
export default Composer;
