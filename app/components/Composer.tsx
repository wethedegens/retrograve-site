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

export type MetaAttribute = { trait_type?: string; value?: string | number | null };

export type SimpleNft = {
  id: string;
  name?: string;
  image?: string;                  // remote fallback
  attributes?: MetaAttribute[];    // used to rebuild from local layers
};

export type ExportSize = { label: string; w: number; h: number };

type Size = { w: number; h: number };

/** --------- CONFIG: update only these if your structure changes ---------- */
const BASE_TRAITS_DIR = "/collections/magapixel/layers"; // under /public
const LAYER_ORDER = ["Skin", "Face", "Body", "Head", "Glasses", "Hand"]; // draw order, BG is skipped
const CANDIDATE_EXTS = [".png", ".webp"]; // try both if you mix formats
/** ----------------------------------------------------------------------- */

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

/** Normalize folder/file segments */
function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[+]/g, " plus ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Build candidate public URLs for each attribute layer, skipping Background.
 * We try both .png and .webp (in that order) for resiliency.
 */
function layerPathsFromAttributes(attrs?: MetaAttribute[] | null): string[] {
  if (!attrs || !Array.isArray(attrs)) return [];
  const byType = new Map<string, MetaAttribute>();
  for (const a of attrs) {
    const t = String(a?.trait_type || "").trim();
    if (!t) continue;
    byType.set(t, a);
  }

  const candidates: string[] = [];
  for (const type of LAYER_ORDER) {
    if (type.toLowerCase() === "background") continue;
    const attr = byType.get(type);
    if (!attr) continue;

    const valRaw = String(attr.value ?? "").trim();
    if (!valRaw) continue;

    const typeSeg = slugify(type);     // e.g. "head"
    const valSeg = slugify(valRaw);    // e.g. "red-maga-hat"
    for (const ext of CANDIDATE_EXTS) {
      candidates.push(`${BASE_TRAITS_DIR}/${typeSeg}/${valSeg}${ext}`);
    }
  }
  return candidates;
}

/** Load the FIRST existing image for each layer (from its candidate list) */
async function loadExistingLayersPerType(
  attrs?: MetaAttribute[] | null
): Promise<HTMLImageElement[]> {
  if (!attrs) return [];
  // Build mapping type -> candidate urls (png/webp)
  const byType: Record<string, string[]> = {};
  for (const type of LAYER_ORDER) {
    if (type.toLowerCase() === "background") continue;
    const a = (attrs || []).find((x) => (x.trait_type || "").trim() === type);
    if (!a || !a.value) continue;
    const typeSeg = slugify(type);
    const valSeg = slugify(String(a.value));
    byType[type] = CANDIDATE_EXTS.map(
      (ext) => `${BASE_TRAITS_DIR}/${typeSeg}/${valSeg}${ext}`
    );
  }

  const images: HTMLImageElement[] = [];
  for (const type of LAYER_ORDER) {
    const list = byType[type];
    if (!list || !list.length) continue;
    let loaded: HTMLImageElement | null = null;
    for (const url of list) {
      try {
        loaded = await loadImage(url);
        break;
      } catch {
        // try next extension
      }
    }
    if (loaded) images.push(loaded);
  }
  return images;
}

const Composer = forwardRef<ComposerHandle, { nft: SimpleNft | null; bg: BgChoice | null }>(
  ({ nft, bg }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [loadingImg, setLoadingImg] = useState(false);

    const previewScale = 0.58;
    const activeBg = useMemo(
      () => bg || ({ kind: "color", value: "#3e2d75" } as BgChoice),
      [bg]
    );
    const previewSize: Size = useMemo(
      () => ({ w: Math.round(1440 * previewScale), h: Math.round(3200 * previewScale) }),
      []
    );

    /** Core draw: background -> local layers (if any) -> fallback remote image */
    const draw = async (ctx: CanvasRenderingContext2D, size: Size) => {
      // BG
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

      // Attempt local trait layers first
      let drewLayers = false;
      setLoadingImg(true);
      try {
        const imgs = await loadExistingLayersPerType(nft?.attributes);
        if (imgs.length) {
          // Assume all layers share the same natural size (exported master)
          const base = imgs[0];
          const scale = Math.min(size.w / base.width, size.h / base.height);
          const drawW = base.width * scale;
          const drawH = base.height * scale;
          const dx = (size.w - drawW) / 2;
          const dy = size.h - drawH; // bottom align
          ctx.imageSmoothingEnabled = false;
          for (const li of imgs) {
            ctx.drawImage(li, dx, dy, drawW, drawH);
          }
          drewLayers = true;
        }
      } finally {
        setLoadingImg(false);
      }

      // Fallback: draw the remote NFT image if no local layers were drawn
      if (!drewLayers && nft?.image) {
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
      await draw(ctx, previewSize);
    };

    useEffect(() => {
      renderPreview();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nft?.image, (nft?.attributes || []).length, activeBg]);

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
        a.download = `${(nft?.name || "nft").replace(/\s+/g, "_")}_${target.w}x${target.h}.png`;
        a.click();
        URL.revokeObjectURL(url);
      },
    }));

    return (
      <div className="composer-wrap">
        <div className="phone-frame">
          <div className="phone-surface">
            <div className="phone-hint">
              {loadingImg ? "Loading image…" : "Preview is scaled; exports are full size."}
            </div>
            <canvas ref={canvasRef} className="phone-canvas" style={{ imageRendering: "pixelated" }} />
          </div>
        </div>

        <style jsx>{`
          .composer-wrap { display: grid; gap: 10px; justify-items: center; }
          .phone-frame { position: relative; width: min(360px, 78vw); aspect-ratio: 9/19.5;
            border-radius: 26px; overflow: hidden; box-shadow: 0 18px 44px rgba(0,0,0,.45); background:#221a33; }
          .phone-surface { position: absolute; inset: 0; display: grid; grid-template-rows: auto 1fr;
            align-content: end; justify-items: center; padding: 8px 8px 10px; gap: 4px; }
          .phone-hint { align-self: start; justify-self: center; font-size: 11px; color:#cfc2ff;
            background: rgba(0,0,0,.35); padding: 6px 8px; border-radius: 999px; backdrop-filter: blur(2px);
            pointer-events: none; user-select: none; }
          .phone-canvas { width: 86%; height: auto; }
        `}</style>
      </div>
    );
  }
);

Composer.displayName = "Composer";
export default Composer;
