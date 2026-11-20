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
import type { StudioBgChoice } from "./PublishedBackgroundPicker";
import { edgeBackgroundColor } from "../../lib/lockscreened/edgeBackgroundColor";
import { cleanForegroundLogo, drawForegroundLogo, type ForegroundLogo } from "../../lib/lockscreened/foregroundLogo";
import { finishedArtworkLayout, FINISHED_ARTWORK_SIZES, type ArtworkDevice } from "../../lib/lockscreened/finishedArtworkLayout";

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
  return edgeBackgroundColor(pixels, 64, 64);
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
    bg: StudioBgChoice;
    hasOfficialBackground: boolean;
    renderProfile?: any;
    previewDevice?: ArtworkDevice;
    previewSize?: { width: number; height: number };
    hideLayoutControls?: boolean;
  }
>(({ nft, bg, hasOfficialBackground, renderProfile, previewDevice: requestedDevice, previewSize, hideLayoutControls=false }, ref) => {
  const [collectorDevice, setCollectorDevice] = useState<ArtworkDevice>("phone");
  const previewDevice = requestedDevice ?? collectorDevice;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const images = useRef(new Map<string, Promise<HTMLImageElement>>());
  const colors = useRef(new WeakMap<HTMLImageElement, string>());
  const [message, setMessage] = useState("");
  const [logoChoice, setLogoChoice] = useState<boolean | null>(null);
  type PersonalPlacement = { scale: number; x: "left" | "center" | "right"; y: "top" | "center" | "bottom" };
  const [personalPlacements, setPersonalPlacements] = useState<Partial<Record<ArtworkDevice, PersonalPlacement>>>({});
  useEffect(() => { setPersonalPlacements({}); }, [nft?.id]);
  function placementFor(device: ArtworkDevice): PersonalPlacement {
    const founder = renderProfile?.devicePlacement?.[device] || {};
    const finished = renderProfile?.finishedArtwork || {};
    return personalPlacements[device] || {
      scale: Math.max(0.4, Math.min(1.8, Number(founder.scale ?? finished.artworkScale) || 0.92)),
      x: ["left", "center", "right"].includes(founder.x) ? founder.x : "center",
      y: ["top", "center", "bottom"].includes(founder.y ?? finished.verticalAlign) ? (founder.y ?? finished.verticalAlign) : "bottom",
    };
  }
  function adjustPlacement(value: Partial<PersonalPlacement>) {
    const current = placementFor(previewDevice);
    setPersonalPlacements(previous => ({ ...previous, [previewDevice]: { ...current, ...value } }));
  }
  const activePlacement = placementFor(previewDevice);
  let logo: ForegroundLogo | null = null;
  try { logo = cleanForegroundLogo(renderProfile?.foregroundLogo ?? null); } catch { /* Invalid legacy logo settings are ignored. */ }
  const showLogo = logoChoice ?? logo?.defaultVisible ?? false;
  useEffect(() => { setLogoChoice(null); }, [logo?.dataUrl]);
  const previewDimensions = previewSize || FINISHED_ARTWORK_SIZES[previewDevice];

  function cachedImage(src: string) {
    let pending = images.current.get(src);
    if (!pending) {
      pending = loadImage(src).catch(error => { images.current.delete(src); throw error; });
      if (images.current.size >= 4) images.current.delete(images.current.keys().next().value!);
      images.current.set(src, pending);
    }
    return pending;
  }

  async function draw(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    device: "phone" | "ipad" | "desktop"
  ) {
    ctx.clearRect(0, 0, width, height);

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
    const artwork = await cachedImage(source);
    const sampled = colors.current.get(artwork) || sampleEdgeColor(artwork);
    colors.current.set(artwork, sampled);

    if (hasOfficialBackground && bg.kind === "image") {
      const backgroundSrc =
        bg.deviceAssets?.[device] || bg.image || bg.value || "";
      if (backgroundSrc) {
        const background = await cachedImage(backgroundSrc);
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

    const { dx, dy, drawW, drawH } = finishedArtworkLayout(
      artwork.width, artwork.height, width, height,
      placementFor(device),
    );

    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(artwork, dx, dy, drawW, drawH);
    if (logo && showLogo) {
      const logoImage = await cachedImage(logo.dataUrl);
      drawForegroundLogo(ctx, logoImage, width, height, logo);
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let active = true;
    // Keep the current frame visible until the next frame is fully painted.
    const frame = requestAnimationFrame(() => {
      const next = document.createElement("canvas");
      const factor = Math.min(1, 1280 / previewDimensions.width, 1280 / previewDimensions.height);
      next.width = Math.round(previewDimensions.width * factor);
      next.height = Math.round(previewDimensions.height * factor);
      const ctx = next.getContext("2d");
      if (!ctx) return;
      draw(ctx, next.width, next.height, previewDevice).then(() => {
        if (!active) return;
        canvas.width = next.width;
        canvas.height = next.height;
        canvas.getContext("2d")?.drawImage(next, 0, 0);
        setMessage("");
      }).catch(error => {
        if (active) setMessage(error instanceof Error ? error.message : "Could not render NFT.");
      });
    });
    return () => { active = false; cancelAnimationFrame(frame); };
  }, [nft?.id, nft?.image, nft?.uri, bg, renderProfile, hasOfficialBackground, previewDevice, previewDimensions.width, previewDimensions.height, showLogo, personalPlacements]);

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
      <fieldset hidden={hideLayoutControls} style={{ width: "100%", maxWidth: 620, boxSizing: "border-box", border: "1px solid #555", borderRadius: 14, padding: 14, display: hideLayoutControls ? "none" : "grid", gap: 12 }}>
        <legend>Your {previewDevice === "ipad" ? "iPad" : previewDevice} layout</legend>
        {!requestedDevice ? <label>Preview device <select value={collectorDevice} onChange={event => setCollectorDevice(event.target.value as ArtworkDevice)}>
          <option value="phone">Phone</option><option value="ipad">iPad</option><option value="desktop">Desktop</option>
        </select></label> : null}
        <label style={{ display: "grid", gap: 6 }}>NFT size · {Math.round(activePlacement.scale * 100)}%
          <input type="range" min="40" max="180" value={Math.round(activePlacement.scale * 100)}
            onChange={event => adjustPlacement({ scale: Number(event.target.value) / 100 })} />
        </label>
        <label>Horizontal position <select value={activePlacement.x} onChange={event => adjustPlacement({ x: event.target.value as PersonalPlacement["x"] })}>
          <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
        </select></label>
        <label>Vertical position <select value={activePlacement.y} onChange={event => adjustPlacement({ y: event.target.value as PersonalPlacement["y"] })}>
          <option value="top">Top</option><option value="center">Center</option><option value="bottom">Bottom</option>
        </select></label>
        <button type="button" onClick={() => setPersonalPlacements(previous => {
          const next = { ...previous }; delete next[previewDevice]; return next;
        })}>Reset this device to founder layout</button>
        <small>Changes apply to your preview and export for this device. They reset on refresh and never change the collection settings. Above 100% may crop traits or soften small images.</small>
      </fieldset>
      {logo ? <label><input type="checkbox" checked={showLogo} onChange={event => setLogoChoice(event.target.checked)} />Show collection logo</label> : null}
      <div
        style={{
          width: previewDevice === "desktop" ? 620 : 340,
          maxWidth: "88vw",
          aspectRatio: `${previewDimensions.width} / ${previewDimensions.height}`,
          borderRadius: 26,
          overflow: "hidden",
          background: "#221a33",
          boxShadow: "0 18px 44px rgba(0,0,0,.45)",
          padding: 8,
        }}
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Wallpaper preview"
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
