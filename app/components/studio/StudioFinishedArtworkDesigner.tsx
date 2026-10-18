// app/components/studio/StudioFinishedArtworkDesigner.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { LockScreenedSession } from "../../lib/lockscreened/web3AuthClient";
import { updateFinishedArtworkProfile } from "../../lib/lockscreened/studioDataClient";

type ExtensionStyle = "edge_color" | "gradient" | "blur";
type VerticalAlign = "top" | "center" | "bottom";

function clampByte(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [clampByte(r), clampByte(g), clampByte(b)]
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("")
  );
}

async function loadFileImage(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const next = new Image();
      next.onload = () => resolve(next);
      next.onerror = () => reject(new Error("Could not read this image."));
      next.src = url;
    });
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function sampleEdgeColor(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  const size = 64;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "#241c38";

  ctx.drawImage(image, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;

  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  const edge = 7;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (x >= edge && x < size - edge && y >= edge && y < size - edge) {
        continue;
      }

      const index = (y * size + x) * 4;
      const alpha = data[index + 3] / 255;
      if (alpha < 0.25) continue;

      r += data[index];
      g += data[index + 1];
      b += data[index + 2];
      count += 1;
    }
  }

  if (!count) return "#241c38";
  return rgbToHex(r / count, g / count, b / count);
}

export default function StudioFinishedArtworkDesigner({
  session,
  collectionId,
  renderProfile,
}: {
  session: LockScreenedSession;
  collectionId: string;
  renderProfile?: any;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [sampledColor, setSampledColor] = useState(
    renderProfile?.finishedArtwork?.sampledColor || "#241c38"
  );
  const [extensionStyle, setExtensionStyle] = useState<ExtensionStyle>(
    renderProfile?.finishedArtwork?.extensionStyle || "edge_color"
  );
  const [artworkScale, setArtworkScale] = useState(
    Number(renderProfile?.finishedArtwork?.artworkScale || 0.92)
  );
  const [verticalAlign, setVerticalAlign] = useState<VerticalAlign>(
    renderProfile?.finishedArtwork?.verticalAlign || "bottom"
  );
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function pick(next: File | null) {
    if (!next) return;
    if (!["image/png", "image/webp", "image/jpeg"].includes(next.type)) {
      setMessage("Choose a PNG, WebP or JPEG finished NFT image.");
      return;
    }
    if (next.size > 8 * 1024 * 1024) {
      setMessage("Choose an image under 8 MB for the local preview.");
      return;
    }

    try {
      const loaded = await loadFileImage(next);
      setFile(next);
      setImage(loaded);
      setSampledColor(sampleEdgeColor(loaded));
      setMessage(
        "Representative NFT loaded locally. It has not been uploaded anywhere."
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not read this image."
      );
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = 360;
    const height = 780;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    if (extensionStyle === "gradient") {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, sampledColor);
      gradient.addColorStop(1, "#07060d");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = sampledColor;
      ctx.fillRect(0, 0, width, height);
    }

    if (!image) return;

    if (extensionStyle === "blur") {
      const coverScale = Math.max(width / image.width, height / image.height);
      const coverW = image.width * coverScale;
      const coverH = image.height * coverScale;

      ctx.save();
      ctx.filter = "blur(28px)";
      ctx.globalAlpha = 0.72;
      ctx.drawImage(
        image,
        (width - coverW) / 2,
        (height - coverH) / 2,
        coverW,
        coverH
      );
      ctx.restore();

      ctx.fillStyle = "rgba(0,0,0,.16)";
      ctx.fillRect(0, 0, width, height);
    }

    const targetW = width * Math.max(0.6, Math.min(1, artworkScale));
    const scale = targetW / image.width;
    const drawW = targetW;
    const drawH = image.height * scale;
    const dx = (width - drawW) / 2;
    const dy =
      verticalAlign === "top"
        ? 22
        : verticalAlign === "center"
          ? (height - drawH) / 2
          : height - drawH - 22;

    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(image, dx, dy, drawW, drawH);
  }, [image, sampledColor, extensionStyle, artworkScale, verticalAlign]);

  async function save() {
    setSaving(true);
    setMessage("");

    try {
      await updateFinishedArtworkProfile({
        session,
        collectionId,
        currentRenderProfile: renderProfile,
        finishedArtwork: {
          extensionStyle,
          sampledColor,
          artworkScale,
          verticalAlign,
        },
      });
      setMessage(
        "Finished-artwork layout saved. Your representative image stayed local and was not uploaded."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not save finished-artwork settings."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section id="finished-artwork" style={panel}>
      <div style={eyebrow}>FINISHED NFT ARTWORK</div>
      <h2 style={heading}>Try one finished NFT</h2>
      <p style={copy}>
        Use any representative final NFT image to design the phone treatment.
        This sample stays in your browser. After mint, LockScreened will use each
        holder&apos;s actual NFT image from collection metadata.
      </p>

      <div style={layout}>
        <div style={{ display: "grid", gap: 9, alignContent: "start" }}>
          <label style={drop}>
            <input
              type="file"
              accept="image/png,image/webp,image/jpeg"
              style={{ display: "none" }}
              onChange={(event) => pick(event.target.files?.[0] || null)}
            />
            <strong>{file ? "CHOOSE A DIFFERENT NFT" : "CHOOSE SAMPLE NFT"}</strong>
            <span style={muted}>
              PNG / WebP / JPEG · local preview only · nothing uploads
            </span>
          </label>

          <div style={optionGrid}>
            {[
              ["edge_color", "EDGE COLOR", "Extend the artwork's sampled edge color."],
              ["gradient", "GRADIENT", "Blend the sampled color into the LockScreened canvas."],
              ["blur", "SOFT BLUR", "Use a soft enlarged version of the NFT behind the original."],
            ].map(([value, title, detail]) => (
              <button
                key={value}
                type="button"
                onClick={() => setExtensionStyle(value as ExtensionStyle)}
                style={{
                  ...option,
                  border:
                    extensionStyle === value
                      ? "1px solid rgba(255,63,180,.35)"
                      : "1px solid rgba(255,255,255,.07)",
                  background:
                    extensionStyle === value
                      ? "rgba(255,63,180,.07)"
                      : "rgba(255,255,255,.02)",
                }}
              >
                <strong style={{ fontSize: 8 }}>{title}</strong>
                <span style={optionCopy}>{detail}</span>
              </button>
            ))}
          </div>

          <div style={control}>
            <div style={controlHead}>
              <span>ARTWORK SIZE</span>
              <strong>{Math.round(artworkScale * 100)}%</strong>
            </div>
            <input
              type="range"
              min="60"
              max="100"
              value={Math.round(artworkScale * 100)}
              onChange={(event) =>
                setArtworkScale(Number(event.target.value) / 100)
              }
            />
          </div>

          <div style={control}>
            <div style={controlHead}>
              <span>VERTICAL POSITION</span>
              <strong>{verticalAlign.toUpperCase()}</strong>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {(["top", "center", "bottom"] as VerticalAlign[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setVerticalAlign(value)}
                  style={{
                    ...smallButton,
                    background:
                      verticalAlign === value
                        ? "#ff3fb4"
                        : "rgba(255,255,255,.04)",
                    color: verticalAlign === value ? "#151019" : "#fff",
                  }}
                >
                  {value.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            style={saveButton}
          >
            {saving ? "SAVING…" : "SAVE FINISHED-ARTWORK SETTINGS"}
          </button>

          {message ? <div style={notice}>{message}</div> : null}
        </div>

        <div style={previewWrap}>
          <canvas ref={canvasRef} style={canvasStyle} />
          <div style={previewNote}>
            Representative preview only · original NFT pixels are never edited
          </div>
        </div>
      </div>
    </section>
  );
}

const panel = {
  borderRadius: 22,
  padding: 20,
  border: "1px solid rgba(255,99,194,.12)",
  background:
    "linear-gradient(135deg,rgba(15,10,29,.76),rgba(9,8,18,.7))",
} as const;

const eyebrow = {
  color: "#ff8dce",
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: ".17em",
} as const;

const heading = { margin: "6px 0 5px", fontSize: 20 } as const;
const copy = {
  margin: 0,
  maxWidth: 760,
  color: "rgba(255,255,255,.56)",
  fontSize: 10,
  lineHeight: 1.55,
} as const;

const layout = {
  marginTop: 14,
  display: "grid",
  gridTemplateColumns: "minmax(0,1fr) minmax(250px,330px)",
  gap: 16,
  alignItems: "start",
} as const;

const drop = {
  minHeight: 72,
  borderRadius: 14,
  border: "1px dashed rgba(255,99,180,.28)",
  background: "rgba(255,63,180,.035)",
  display: "grid",
  placeItems: "center",
  alignContent: "center",
  gap: 4,
  cursor: "pointer",
  textAlign: "center",
} as const;

const muted = {
  color: "rgba(255,255,255,.4)",
  fontSize: 8,
} as const;

const optionGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3,minmax(0,1fr))",
  gap: 6,
} as const;

const option = {
  minWidth: 0,
  borderRadius: 12,
  padding: 9,
  color: "#fff",
  display: "grid",
  gap: 4,
  textAlign: "left",
  cursor: "pointer",
} as const;

const optionCopy = {
  color: "rgba(255,255,255,.46)",
  fontSize: 7,
  lineHeight: 1.4,
} as const;

const control = {
  borderRadius: 12,
  padding: 10,
  border: "1px solid rgba(255,255,255,.06)",
  background: "rgba(255,255,255,.02)",
  display: "grid",
  gap: 8,
} as const;

const controlHead = {
  display: "flex",
  justifyContent: "space-between",
  gap: 8,
  color: "rgba(255,255,255,.5)",
  fontSize: 8,
  letterSpacing: ".08em",
} as const;

const smallButton = {
  minHeight: 30,
  borderRadius: 999,
  padding: "0 9px",
  border: "1px solid rgba(255,255,255,.1)",
  fontSize: 8,
  fontWeight: 900,
  cursor: "pointer",
} as const;

const saveButton = {
  minHeight: 39,
  borderRadius: 999,
  padding: "0 13px",
  border: "1px solid rgba(255,255,255,.12)",
  background: "#ff3fb4",
  color: "#151019",
  fontSize: 8,
  fontWeight: 900,
  letterSpacing: ".08em",
  cursor: "pointer",
} as const;

const notice = {
  borderRadius: 11,
  padding: 9,
  border: "1px solid rgba(169,255,210,.12)",
  background: "rgba(93,255,170,.03)",
  color: "#a9ffd2",
  fontSize: 8,
  lineHeight: 1.45,
} as const;

const previewWrap = {
  display: "grid",
  gap: 7,
  justifyItems: "center",
} as const;

const canvasStyle = {
  width: "100%",
  maxWidth: 300,
  aspectRatio: "9 / 19.5",
  borderRadius: 24,
  border: "7px solid rgba(255,255,255,.07)",
  background: "#241c38",
  boxShadow: "0 16px 36px rgba(0,0,0,.35)",
} as const;

const previewNote = {
  color: "rgba(255,255,255,.33)",
  fontSize: 7,
  textAlign: "center",
  lineHeight: 1.4,
} as const;
