// app/components/studio/PublishedFinishedArtworkComposer.tsx
"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type {
  BgChoice,
  ComposerHandle,
  ExportImageOptions,
  SimpleNft,
} from "../Composer";

function isIpfs(value?: string | null) {
  return Boolean(value && String(value).startsWith("ipfs://"));
}

function normalizeIpfs(value: string) {
  const path = String(value || "")
    .replace("ipfs://", "")
    .replace(/^ipfs\//, "");
  return "https://gateway.pinata.cloud/ipfs/" + path;
}

async function resolveNftImage(nft: SimpleNft | null) {
  if (!nft) return null;
  if (nft.image) {
    return isIpfs(nft.image) ? normalizeIpfs(nft.image) : nft.image;
  }

  if (!nft.uri) return null;
  const meta = isIpfs(nft.uri) ? normalizeIpfs(nft.uri) : nft.uri;
  const response = await fetch("/api/meta?u=" + encodeURIComponent(meta), {
    cache: "no-store",
  });
  if (!response.ok) return null;
  const json = await response.json().catch(() => null);
  const image = json?.image || json?.image_url || "";
  return image
    ? isIpfs(image)
      ? normalizeIpfs(image)
      : String(image)
    : null;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load NFT artwork."));
    image.src = src;
  });
}

function sampleEdgeColor(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "#241c38";

  ctx.drawImage(image, 0, 0, 64, 64);
  const pixels = ctx.getImageData(0, 0, 64, 64).data;
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;

  for (let y = 0; y < 64; y += 1) {
    for (let x = 0; x < 64; x += 1) {
      if (x > 7 && x < 56 && y > 7 && y < 56) continue;
      const i = (y * 64 + x) * 4;
      if (pixels[i + 3] < 64) continue;
      r += pixels[i];
      g += pixels[i + 1];
      b += pixels[i + 2];
      count += 1;
    }
  }

  if (!count) return "#241c38";

  const hex = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value / count)))
      .toString(16)
      .padStart(2, "0");

  return "#" + hex(r) + hex(g) + hex(b);
}

async function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number
) {
  const scale = Math.max(width / image.width, height / image.height);
  const drawW = image.width * scale;
  const drawH = image.height * scale;
  ctx.drawImage(image, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
}

const PublishedFinishedArtworkComposer = forwardRef<
  ComposerHandle,
  {
    nft: SimpleNft | null;
    bg: BgChoice;
    hasOfficialBackground: boolean;
    renderProfile?: any;
  }
>(({ nft, bg, hasOfficialBackground, renderProfile }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [message, setMessage] = useState("");

  async function draw(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    device: "phone" | "ipad" | "desktop"
  ) {
    ctx.clearRect(0, 0, width, height);
    setMessage("");

    const raw = await resolveNftImage(nft);
    if (!raw) {
      ctx.fillStyle = "#241c38";
      ctx.fillRect(0, 0, width, height);
      return;
    }

    const source =
      /^https?:\/\//i.test(raw)
        ? "/api/img?u=" + encodeURIComponent(raw)
        : raw;
    const artwork = await loadImage(source);
    const sampled = sampleEdgeColor(artwork);

    if (hasOfficialBackground && bg.kind === "image") {
      const backgroundSrc =
        bg.deviceAssets?.[device] || bg.image || bg.value || "";
      if (backgroundSrc) {
        const background = await loadImage(backgroundSrc);
        await drawCover(ctx, background, width, height);
      } else {
        ctx.fillStyle = sampled;
        ctx.fillRect(0, 0, width, height);
      }
    } else {
      const style =
        renderProfile?.finishedArtwork?.extensionStyle || "edge_color";

      if (style === "gradient") {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, sampled);
        gradient.addColorStop(1, "#07060d");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = sampled;
        ctx.fillRect(0, 0, width, height);
      }

      if (style === "blur") {
        ctx.save();
        ctx.filter = "blur(34px)";
        ctx.globalAlpha = 0.72;
        await drawCover(ctx, artwork, width, height);
        ctx.restore();
        ctx.fillStyle = "rgba(0,0,0,.16)";
        ctx.fillRect(0, 0, width, height);
      }
    }

    const devicePlacement =
      renderProfile?.devicePlacement?.[device] || {};
    const finished = renderProfile?.finishedArtwork || {};
    const profileScale = Number(
      devicePlacement.scale || finished.artworkScale || 0.92
    );
    const artworkWidth =
      width * Math.max(0.4, Math.min(1.8, profileScale));
    const scale = artworkWidth / artwork.width;
    const drawW = artworkWidth;
    const drawH = artwork.height * scale;

    const x = devicePlacement.x || "center";
    const y = devicePlacement.y || finished.verticalAlign || "bottom";

    const dx =
      x === "left"
        ? 0
        : x === "right"
          ? width - drawW
          : (width - drawW) / 2;
    const dy =
      y === "top"
        ? 0
        : y === "center"
          ? (height - drawH) / 2
          : height - drawH;

    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(artwork, dx, dy, drawW, drawH);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 835;
    canvas.height = 1856;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    draw(ctx, canvas.width, canvas.height, "phone").catch((error) => {
      setMessage(
        error instanceof Error ? error.message : "Could not render NFT."
      );
    });
  }, [nft?.id, nft?.image, nft?.uri, bg, renderProfile, hasOfficialBackground]);

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
      const presets: Record<string, { w: number; h: number; device: "phone" | "ipad" | "desktop" }> = {
        master: { w: 1440, h: 3200, device: "phone" },
        "iphone-15pmax": { w: 1290, h: 2796, device: "phone" },
        "iphone-15pro": { w: 1179, h: 2556, device: "phone" },
        "android-20-9": { w: 1080, h: 2400, device: "phone" },
        "android-qhd+": { w: 1440, h: 3040, device: "phone" },
      };

      const target =
        typeof size === "string"
          ? presets[size]
          : { w: size.w, h: size.h, device: size.device || "phone" };

      if (!target) return;

      const canvas = document.createElement("canvas");
      canvas.width = target.w;
      canvas.height = target.h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      await draw(ctx, target.w, target.h, target.device);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download =
        String(nft?.name || "lockscreened")
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
    <div style={{ display: "grid", gap: 7, justifyItems: "center" }}>
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
            display: "block",
          }}
        />
      </div>
      {message ? (
        <div style={{ color: "#ffb6c8", fontSize: 8 }}>{message}</div>
      ) : null}
    </div>
  );
});

PublishedFinishedArtworkComposer.displayName =
  "PublishedFinishedArtworkComposer";

export default PublishedFinishedArtworkComposer;
