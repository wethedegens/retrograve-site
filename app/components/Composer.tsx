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
import {
  getBackgroundImagePath,
  type DeviceVariant,
} from "../backgroundsConfig";

export type BgChoice =
  | { kind: "color"; value: string }
  | { kind: "image"; image: string; value?: string; file?: File | null }
  | { kind: "preset"; id: string };

export type MetaAttribute = {
  trait_type?: string;
  value?: string | number | null;
};

export type SimpleNft = {
  id: string;
  name?: string;
  image?: string; // remote fallback
  attributes?: MetaAttribute[]; // used to rebuild from local layers
};

export type ExportSize = { label: string; w: number; h: number };

type Size = { w: number; h: number };

export type ExportImageOptions = {
  width: number;
  height: number;
  format?: "png";
  /**
   * Which device preset this export is for.
   * Used to pick the correct background image variant.
   * Defaults to "phone" so existing callers keep working.
   */
  device?: DeviceVariant;
};

/** --------- CONFIG: update only these if your structure changes ---------- */
const BASE_TRAITS_DIR = "/magapixel";
const LAYER_ORDER = ["Skin", "Face", "Body", "Head", "Glasses", "Hand"];
const CANDIDATE_EXTS = [".png", ".webp"];
/** ----------------------------------------------------------------------- */

const PRESETS: Record<string, Size> = {
  master: { w: 1440, h: 3200 },
  "iphone-15pmax": { w: 1290, h: 2796 },
  "iphone-15pro": { w: 1179, h: 2556 },
  "android-20-9": { w: 1080, h: 2400 },
  "android-qhd+": { w: 1440, h: 3040 },
};

export type ComposerHandle = {
  exportImage: (opts: ExportImageOptions) => Promise<Blob | null>;
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

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[+]/g, " plus ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function hasLayerTraits(attrs?: MetaAttribute[] | null): boolean {
  if (!attrs || !attrs.length) return false;
  const target = ["skin", "face", "body", "head", "glasses", "hand"];
  return attrs.some((a) => {
    const t = String(a?.trait_type || "").trim().toLowerCase();
    return target.includes(t);
  });
}

async function loadExistingLayersPerType(
  attrs?: MetaAttribute[] | null
): Promise<HTMLImageElement[]> {
  if (!attrs) return [];

  const byType = new Map<string, MetaAttribute>();
  for (const a of attrs) {
    const t = String(a?.trait_type || "").trim();
    if (!t) continue;
    byType.set(t, a);
  }

  const images: HTMLImageElement[] = [];

  for (const type of LAYER_ORDER) {
    const attr = byType.get(type);
    if (!attr || attr.value == null) continue;

    const typeSeg = slugify(type);
    const valSeg = slugify(String(attr.value));

    const candidates = CANDIDATE_EXTS.map(
      (ext) => `${BASE_TRAITS_DIR}/${typeSeg}/${valSeg}${ext}`
    );

    let loaded: HTMLImageElement | null = null;
    for (const url of candidates) {
      try {
        loaded = await loadImage(url);
        break;
      } catch {
        // try next
      }
    }
    if (loaded) images.push(loaded);
  }

  return images;
}

async function drawBackgroundImageFromSrc(
  ctx: CanvasRenderingContext2D,
  size: Size,
  src: string
) {
  const img = await loadImage(src);
  const scale = Math.max(size.w / img.width, size.h / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  const dx = (size.w - drawW) / 2;
  const dy = size.h - drawH; // bottom align
  ctx.drawImage(img, dx, dy, drawW, drawH);
}

const Composer = forwardRef<
  ComposerHandle,
  { nft: SimpleNft | null; bg: BgChoice | null }
>(({ nft, bg }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loadingImg, setLoadingImg] = useState(false);

  const previewScale = 0.58;
  const activeBg = useMemo(
    () => bg || ({ kind: "color", value: "#3e2d75" } as BgChoice),
    [bg]
  );
  const previewSize: Size = useMemo(
    () => ({
      w: Math.round(1440 * previewScale),
      h: Math.round(3200 * previewScale),
    }),
    []
  );

  const draw = async (
    ctx: CanvasRenderingContext2D,
    size: Size,
    device: DeviceVariant
  ) => {
    // 1) Background
    if (activeBg.kind === "preset") {
      const src = getBackgroundImagePath(activeBg.id, device);
      if (src) {
        setLoadingImg(true);
        try {
          await drawBackgroundImageFromSrc(ctx, size, src);
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
      const anyBg = activeBg as any;
      const src: string | undefined = anyBg.image || anyBg.value;

      setLoadingImg(true);
      try {
        if (src) {
          await drawBackgroundImageFromSrc(ctx, size, src);
        } else if (anyBg.file instanceof File) {
          const url = URL.createObjectURL(anyBg.file);
          try {
            await drawBackgroundImageFromSrc(ctx, size, url);
          } finally {
            URL.revokeObjectURL(url);
          }
        } else {
          ctx.fillStyle = "#2b2146";
          ctx.fillRect(0, 0, size.w, size.h);
        }
      } finally {
        setLoadingImg(false);
      }
    }

    // 2) NFT layers / remote image
    const layeredMode = hasLayerTraits(nft?.attributes);
    let drewLayers = false;

    if (layeredMode) {
      setLoadingImg(true);
      try {
        const imgs = await loadExistingLayersPerType(nft?.attributes);
        if (imgs.length) {
          const base = imgs[0];
          const scale = Math.min(size.w / base.width, size.h / base.height);
          const drawW = base.width * scale;
          const drawH = base.height * scale;
          const dx = (size.w - drawW) / 2;
          const dy = size.h - drawH;
          ctx.imageSmoothingEnabled = false;
          for (const li of imgs) {
            ctx.drawImage(li, dx, dy, drawW, drawH);
          }
          drewLayers = true;
        }
      } finally {
        setLoadingImg(false);
      }
    }

    if (!drewLayers && nft?.image && !layeredMode) {
      setLoadingImg(true);
      try {
        const src = isHttpUrl(nft.image) ? proxyUrl(nft.image!) : nft.image!;
        const img = await loadImage(src);
        const scale = Math.min(size.w / img.width, size.h / img.height);
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        const dx = (size.w - drawW) / 2;
        const dy = size.h - drawH;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, dx, dy, drawW, drawH);
      } finally {
        setLoadingImg(false);
      }
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
    await draw(ctx, previewSize, "phone");
  };

  useEffect(() => {
    renderPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nft?.image, (nft?.attributes || []).length, activeBg]);

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

      const mime = format === "png" ? "image/png" : "image/png";
      const blob = await new Promise<Blob | null>((res) =>
        c.toBlob(res, mime)
      );
      return blob;
    };

    return {
      exportImage: doExportImage,

      async exportAt(size: ExportSize | keyof typeof PRESETS) {
        const target: Size =
          typeof size === "string"
            ? PRESETS[size]
            : { w: size.w, h: size.h };

        const blob = await doExportImage({
          width: target.w,
          height: target.h,
          format: "png",
          device: "phone",
        });
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${(nft?.name || "nft").replace(
          /\s+/g,
          "_"
        )}_${target.w}x${target.h}.png`;
        a.click();
        URL.revokeObjectURL(url);
      },
    };
  });

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
          align-content: end;
          justify-items: center;
          padding: 8px 8px 10px;
          gap: 4px;
        }

        .phone-frame button {
          display: none !important;
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
          width: 92%;
          height: auto;
        }

        @media (max-width: 768px) {
          .composer-wrap {
            margin-bottom: 8px;
          }
          .phone-frame {
            width: min(280px, 65vw);
            box-shadow: 0 14px 32px rgba(0, 0, 0, 0.5);
          }
          .phone-surface {
            padding: 4px 4px 6px;
            gap: 3px;
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
