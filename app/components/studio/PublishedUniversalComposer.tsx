// app/components/studio/PublishedUniversalComposer.tsx
"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import type {
  BgChoice,
  ComposerHandle,
  ExportImageOptions,
  MetaAttribute,
} from "../Composer";

type Layer = {
  id: string;
  trait_type: string;
  display_name: string;
  layer_order: number;
  is_background?: boolean;
};

type PublishedTraitAsset = {
  layer_id: string;
  trait_value: string;
  url: string;
};

function normalize(value: string) {
  return String(value || "").trim().toLowerCase();
}

function slug(value: string) {
  return normalize(value)
    .replace(/&/g, " and ")
    .replace(/[+]/g, " plus ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load render asset."));
    image.src = src;
  });
}

async function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bg: BgChoice,
  device: "phone" | "ipad" | "desktop"
) {
  if (bg.kind === "color") {
    ctx.fillStyle = bg.value || "#241c38";
    ctx.fillRect(0, 0, width, height);
    return;
  }

  if (bg.kind !== "image") return;

  const src =
    bg.deviceAssets?.[device] ||
    bg.image ||
    bg.value;

  if (!src) return;

  const image = await loadImage(src);
  const scale = Math.max(width / image.width, height / image.height);
  const drawW = image.width * scale;
  const drawH = image.height * scale;
  ctx.drawImage(image, (width - drawW) / 2, height - drawH, drawW, drawH);
}

const PublishedUniversalComposer = forwardRef<
  ComposerHandle,
  {
    attributes: MetaAttribute[];
    layers: Layer[];
    assets: PublishedTraitAsset[];
    bg: BgChoice;
    nftName?: string;
    renderProfile?: any;
  }
>(({ attributes, layers, assets, bg, nftName, renderProfile }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const matchedUrls = useMemo(() => {
    const ordered = [...layers].sort(
      (a, b) => Number(a.layer_order || 0) - Number(b.layer_order || 0)
    );

    const results: string[] = [];

    for (const layer of ordered) {
      const customBackgroundSelected = bg.kind === "image";
      const omitOriginalBackground =
        customBackgroundSelected &&
        renderProfile?.backgroundHandling === "omit_original_when_custom";

      if (omitOriginalBackground && layer.is_background) {
        continue;
      }

      const attr = attributes.find(
        (item) =>
          slug(String(item?.trait_type || "")) === slug(layer.trait_type)
      );
      if (!attr || attr.value == null) continue;

      const asset = assets.find(
        (item) =>
          item.layer_id === layer.id &&
          slug(item.trait_value) === slug(String(attr.value))
      );

      if (asset?.url) results.push(asset.url);
    }

    return results;
  }, [attributes, layers, assets, bg, renderProfile]);

  async function draw(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    device: "phone" | "ipad" | "desktop"
  ) {
    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = false;

    await drawBackground(ctx, width, height, bg, device);

    const images = await Promise.all(matchedUrls.map(loadImage));
    if (!images.length) return;

    const base = images[0];
    const scale = Math.min(width / base.width, height / base.height);
    const drawW = base.width * scale;
    const drawH = base.height * scale;
    const dx = (width - drawW) / 2;
    const dy = height - drawH;

    for (const image of images) {
      ctx.drawImage(image, dx, dy, drawW, drawH);
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 835;
    canvas.height = 1856;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    draw(ctx, canvas.width, canvas.height, "phone");
  }, [matchedUrls, bg]);

  useImperativeHandle(ref, () => ({
    async exportImage(opts: ExportImageOptions) {
      const canvas = document.createElement("canvas");
      canvas.width = opts.width;
      canvas.height = opts.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      await draw(
        ctx,
        opts.width,
        opts.height,
        opts.device || "phone"
      );

      return await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
    },

    async exportAt(size: any) {
      const presets: Record<string, { w: number; h: number }> = {
        master: { w: 1440, h: 3200 },
        "iphone-15pmax": { w: 1290, h: 2796 },
        "iphone-15pro": { w: 1179, h: 2556 },
        "android-20-9": { w: 1080, h: 2400 },
        "android-qhd+": { w: 1440, h: 3040 },
      };

      const target =
        typeof size === "string"
          ? presets[size]
          : { w: size.w, h: size.h };

      if (!target) return;

      const blob = await (async () => {
        const canvas = document.createElement("canvas");
        canvas.width = target.w;
        canvas.height = target.h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        await draw(ctx, target.w, target.h, "phone");
        return await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );
      })();

      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download =
        String(nftName || "lockscreened")
          .replace(/\s+/g, "_") +
        "_" +
        target.w +
        "x" +
        target.h +
        ".png";
      anchor.click();
      URL.revokeObjectURL(url);
    },
  }));

  return (
    <div
      style={{
        width: 340,
        maxWidth: "88vw",
        aspectRatio: "9 / 19.5",
        borderRadius: 26,
        overflow: "hidden",
        background: "#221a33",
        boxShadow: "0 18px 44px rgba(0,0,0,.45)",
        padding: 8,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          imageRendering: "pixelated",
          display: "block",
        }}
      />
    </div>
  );
});

PublishedUniversalComposer.displayName = "PublishedUniversalComposer";
export default PublishedUniversalComposer;
