// app/components/studio/StudioFinishedArtworkDesigner.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { LockScreenedSession } from "../../lib/lockscreened/web3AuthClient";
import { updateFinishedArtworkProfile, updateCollectionRenderPlacement } from "../../lib/lockscreened/studioDataClient";
import { cleanForegroundLogo, drawForegroundLogo, type ForegroundLogo } from "../../lib/lockscreened/foregroundLogo";
import { edgeBackgroundColor } from "../../lib/lockscreened/edgeBackgroundColor";
import { localArtworkSample } from "../../lib/lockscreened/localArtworkSample";
import { downloadStorageBlob } from "../../lib/lockscreened/studioStorageClient";
import { finishedArtworkLayout, FINISHED_ARTWORK_SIZES, type ArtworkDevice } from "../../lib/lockscreened/finishedArtworkLayout";

type ExtensionStyle = "edge_color" | "gradient" | "blur";
type VerticalAlign = "top" | "center" | "bottom";

async function loadFileImage(file: Blob) {
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

  return edgeBackgroundColor(data, size, size);
}

export default function StudioFinishedArtworkDesigner({
  session,
  collectionId,
  renderProfile,
  onLocalSave,
  sampleImageUrl,
  onLocalChange,
  privateBackgrounds = [],
  privateBackgroundAssets = [],
  onPreviewImage,
  artworkOnly = false,
}: {
  session?: LockScreenedSession;
  collectionId?: string;
  renderProfile?: any;
  onLocalSave?: (settings: { extensionStyle: ExtensionStyle; sampledColor: string; artworkScale: number; verticalAlign: VerticalAlign }) => void;
  sampleImageUrl?: string;
  onLocalChange?: () => void;
  privateBackgrounds?: { id: string; name: string }[];
  privateBackgroundAssets?: { package_id: string; device: string; storage_bucket: string; storage_path: string }[];
  onPreviewImage?: (preview:{image?:HTMLImageElement;color:string;extensionStyle:string})=>void;
  artworkOnly?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewDevice, setPreviewDevice] = useState<ArtworkDevice>("phone");
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
  useEffect(()=>{ onPreviewImage?.({image:image||undefined,color:sampledColor,extensionStyle}); },[image,sampledColor,extensionStyle,onPreviewImage]);
  const [placements, setPlacements] = useState<any>(() => renderProfile?.devicePlacement || {});
  const [logo, setLogo] = useState<ForegroundLogo | null>(() => renderProfile?.foregroundLogo || null);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  const [showLogo, setShowLogo] = useState(true);
  const [logoMessage, setLogoMessage] = useState("");
  const [savingLogo, setSavingLogo] = useState(false);
  useEffect(() => {
    let active = true;
    setLogoImage(null);
    if (!logo) return;
    const next = new Image();
    next.onload = () => { if (active) setLogoImage(next); };
    next.onerror = () => { if (active) setLogoMessage("Could not decode the PNG logo."); };
    next.src = logo.dataUrl;
    return () => { active = false; };
  }, [logo?.dataUrl]);

  function changePlacement(field: "x" | "y" | "scale", value: string | number) {
    setPlacements((previous: any) => ({ ...previous, [previewDevice]: {
      scale: previous[previewDevice]?.scale ?? artworkScale,
      x: previous[previewDevice]?.x || "center", y: previous[previewDevice]?.y || verticalAlign,
      [field]: value,
    } }));
  }

  async function saveLogo() {
    if (!session || !collectionId) return;
    setSavingLogo(true);
    try {
      const response = await fetch("/api/studio/update-render-config", { method: "POST",
        headers: { "content-type": "application/json", Authorization: "Bearer " + session.access_token },
        body: JSON.stringify({ collectionId, action: "foreground_logo", foregroundLogo: logo }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save logo.");
      setLogoMessage(logo ? "Logo saved privately. It becomes collector-visible only when the project is explicitly published. Collectors can hide it." : "Logo removed from saved settings.");
      window.dispatchEvent(new CustomEvent("lockscreened-studio-data-changed"));
    } catch (error) { setLogoMessage(error instanceof Error ? error.message : "Could not save logo."); }
    finally { setSavingLogo(false); }
  }
  const [backgroundId, setBackgroundId] = useState("");
  const [backgroundPreview, setBackgroundPreview] = useState<{ key: string; image: HTMLImageElement } | null>(null);
  const [backgroundError, setBackgroundError] = useState("");
  const backgroundAsset = privateBackgroundAssets.find(asset => asset.package_id === backgroundId && asset.device === previewDevice)
    || privateBackgroundAssets.find(asset => asset.package_id === backgroundId && asset.device === "phone");
  const backgroundKey = session && backgroundAsset
    ? JSON.stringify([session.access_token, backgroundAsset.storage_bucket, backgroundAsset.storage_path]) : "";
  const backgroundImage = backgroundPreview?.key === backgroundKey ? backgroundPreview.image : null;

  useEffect(() => {
    let active = true;
    setBackgroundPreview(null);
    setBackgroundError("");
    if (!backgroundId) return;
    if (!session || !backgroundAsset || backgroundAsset.storage_bucket !== "creator-source-private") {
      setBackgroundError("No saved private source is available for this device or phone fallback.");
      return;
    }
    void (async () => {
      try {
        const blob = await downloadStorageBlob({ session, bucket: backgroundAsset.storage_bucket, path: backgroundAsset.storage_path });
        const loaded = await loadFileImage(blob);
        if (active) setBackgroundPreview({ key: backgroundKey, image: loaded });
      } catch {
        if (active) setBackgroundError("Could not load the private background. Choose automatic treatment or select the background again to retry.");
      }
    })();
    return () => { active = false; };
  }, [backgroundKey, backgroundId]);
  const sampleKey = session?.user?.id && collectionId && !onLocalSave
    ? JSON.stringify([session.user.id, collectionId]) : null;
  const sampleGeneration = useRef(0);

  useEffect(() => {
    const generation = ++sampleGeneration.current;
    setFile(null);
    setImage(null);
    if (!sampleKey) return;
    let cancelled = false;
    void (async () => {
      try {
        const stored = await localArtworkSample(sampleKey);
        if (!stored) return;
        const loaded = await loadFileImage(stored);
        if (cancelled || generation !== sampleGeneration.current) return;
        setFile(stored);
        setImage(loaded);
        setMessage("Sample restored from this browser. It has not been uploaded.");
      } catch {
        if (!cancelled && generation === sampleGeneration.current)
          setMessage("Could not restore the local sample. Choose it again to preview; saved layout settings are unchanged.");
      }
    })();
    return () => { cancelled = true; };
  }, [sampleKey]);

  useEffect(() => {
    onLocalChange?.();
  }, [image, extensionStyle, artworkScale, verticalAlign, onLocalChange]);

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
      const generation = ++sampleGeneration.current;
      const loaded = await loadFileImage(next);
      if (generation !== sampleGeneration.current) return;
      setFile(next);
      setImage(loaded);
      setSampledColor(sampleEdgeColor(loaded));
      setMessage(
        "Representative NFT loaded locally. It has not been uploaded anywhere."
      );
      if (sampleKey) {
        try {
          await localArtworkSample(sampleKey, next);
          if (generation === sampleGeneration.current)
            setMessage("Sample kept in this browser for this project, including after refresh. Nothing was uploaded.");
        } catch {
          if (generation === sampleGeneration.current)
            setMessage("Preview loaded, but this browser could not keep the sample after refresh. Nothing was uploaded.");
        }
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not read this image."
      );
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = FINISHED_ARTWORK_SIZES[previewDevice];
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    if (extensionStyle === "gradient") {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, sampledColor);
      gradient.addColorStop(1, "#090909");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = sampledColor;
      ctx.fillRect(0, 0, width, height);
    }

    if (backgroundImage) {
      const scale = Math.max(width / backgroundImage.width, height / backgroundImage.height);
      const drawW = backgroundImage.width * scale;
      const drawH = backgroundImage.height * scale;
      ctx.drawImage(backgroundImage, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
    }

    if (!image) return;

    if (!backgroundImage && extensionStyle === "blur") {
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

    const placement = placements[previewDevice] || {};
    const { dx, dy, drawW, drawH } = finishedArtworkLayout(
      image.width, image.height, width, height,
      {
        scale: placement.scale ?? artworkScale,
        x: placement.x || "center",
        y: placement.y || verticalAlign,
      },
    );

    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(image, dx, dy, drawW, drawH);
    if (showLogo && logo && logoImage) drawForegroundLogo(ctx, logoImage, width, height, logo);
  }, [image, sampledColor, extensionStyle, artworkScale, verticalAlign, previewDevice, placements, backgroundImage, logo, logoImage, showLogo]);

  async function save() {
    setSaving(true);
    setMessage("");

    try {
      if (onLocalSave) {
        onLocalSave({ extensionStyle, sampledColor, artworkScale, verticalAlign });
        setMessage("Treatment kept in this local walkthrough. Nothing was uploaded or saved to the backend.");
        return;
      }
      if (!session || !collectionId) throw new Error("Sign in and open a project before saving.");
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
      if (Object.keys(placements).length) {
        const placementFor = (device: ArtworkDevice) => ({ scale: artworkScale, x: "center", y: verticalAlign, ...placements[device] });
        await updateCollectionRenderPlacement({ session, collectionId, devicePlacement: {
          phone: placementFor("phone"), ipad: placementFor("ipad"), desktop: placementFor("desktop"),
        } });
      }
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
        Use any representative final NFT image to preview phone, iPad and desktop layouts.
        This sample stays in your browser. After mint, LockScreened will use each
        holder&apos;s actual NFT image from collection metadata.
      </p>

      <div className="finished-layout" style={layout}>
        <div style={{ display: "grid", gap: 9, alignContent: "start" }}>
          {onLocalSave && sampleImageUrl ? <button type="button" style={smallButton} onClick={async () => {
            try {
              const response = await fetch(sampleImageUrl);
              if (!response.ok) throw new Error("Could not load demo artwork.");
              const blob = await response.blob();
              await pick(new File([blob], "demo-nft.png", { type: blob.type }));
            } catch (error) { setMessage(error instanceof Error ? error.message : "Could not load demo."); }
          }}>TRY DEMO NFT</button> : null}
          <label style={drop}>
            <input
              type="file"
              accept="image/png,image/webp,image/jpeg"
              style={{ display: "none" }}
              onChange={(event) => {
                void pick(event.target.files?.[0] || null);
                event.target.value = "";
              }}
            />
            <strong>{file ? "CHOOSE A DIFFERENT NFT" : "CHOOSE SAMPLE NFT"}</strong>
            <span style={muted}>
              PNG / WebP / JPEG · local preview only · nothing uploads
            </span>
          </label>
          {sampleKey ? <>
            <span style={muted}>Sample kept on this browser only; clearing browser data removes it. This is not an artwork backup.</span>
            {file ? <button type="button" style={smallButton} onClick={async () => {
              ++sampleGeneration.current;
              try {
                await localArtworkSample(sampleKey, null);
                setFile(null);
                setImage(null);
                setMessage("Local sample removed. Saved layout settings are unchanged.");
              } catch { setMessage("Could not remove the stored sample. Try again."); }
            }}>REMOVE LOCAL SAMPLE</button> : null}
          </> : null}

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
                      ? "1px solid rgba(220,220,220,.35)"
                      : "1px solid rgba(255,255,255,.07)",
                  background:
                    extensionStyle === value
                      ? "rgba(220,220,220,.07)"
                      : "rgba(255,255,255,.02)",
                }}
              >
                <strong style={{ fontSize: 8 }}>{title}</strong>
                <span style={optionCopy}>{detail}</span>
              </button>
            ))}
          </div>

          {session && privateBackgroundAssets.length ? <div style={control}>
            <label htmlFor="private-background-preview">Preview saved private background</label>
            <select id="private-background-preview" value={backgroundId} onChange={event => setBackgroundId(event.target.value)}>
              <option value="">Automatic artwork treatment</option>
              {privateBackgrounds.filter(background => privateBackgroundAssets.some(asset => asset.package_id === background.id)).map(background =>
                <option key={background.id} value={background.id}>{background.name}</option>)}
            </select>
            <span style={copy}>Preview only; this choice is not saved by the layout button. Device images fill the canvas and may crop; missing iPad or desktop sources use phone. Opaque NFT pixels cover the background.</span>
            {backgroundId ? <span role="status" style={copy}>{backgroundError || (backgroundImage ? `Using saved ${backgroundAsset?.device} source.` : "Loading private background…")}</span> : null}
          </div> : null}

          <div style={{...control, ...(artworkOnly ? {display:"none"} : {})}}>
            <div style={controlHead}>
              <span>ARTWORK SIZE</span>
              <strong>{Math.round((placements[previewDevice]?.scale ?? artworkScale) * 100)}%</strong>
            </div>
            <input
              type="range"
              min="60"
              max="180"
              value={Math.round((placements[previewDevice]?.scale ?? artworkScale) * 100)}
              onChange={(event) =>
                onLocalSave ? setArtworkScale(Number(event.target.value) / 100) : changePlacement("scale", Number(event.target.value) / 100)
              }
            />
            <span style={copy}>100% fits the complete NFT. Above 100% zooms in and may crop traits; smaller source images can look soft when enlarged.</span>
          </div>

          <div style={{...control, ...(artworkOnly ? {display:"none"} : {})}}>
            <div style={controlHead}>
              <span>VERTICAL POSITION</span>
              <strong>{(placements[previewDevice]?.y || verticalAlign).toUpperCase()}</strong>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {(["top", "center", "bottom"] as VerticalAlign[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onLocalSave ? setVerticalAlign(value) : changePlacement("y", value)}
                  style={{
                    ...smallButton,
                    background:
                      (placements[previewDevice]?.y || verticalAlign) === value
                        ? "#ededed"
                        : "rgba(255,255,255,.04)",
                    color: (placements[previewDevice]?.y || verticalAlign) === value ? "#111111" : "#fff",
                  }}
                >
                  {value.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {!onLocalSave && previewDevice !== "phone" ? <div style={control}>
            <span>HORIZONTAL POSITION · {previewDevice.toUpperCase()}</span>
            <div style={{ display: "flex", gap: 8 }}>{(["left", "center", "right"] as const).map(value =>
              <button key={value} type="button" aria-pressed={(placements[previewDevice]?.x || "center") === value}
                style={{ ...smallButton, background: (placements[previewDevice]?.x || "center") === value ? "#ededed" : "#30263e", color: "white" }}
                onClick={() => changePlacement("x", value)}>{value.toUpperCase()}</button>)}</div>
            <span style={copy}>Placement and size are saved separately for each device.</span>
          </div> : null}

          {session && collectionId ? <div style={control}>
            <strong>FOREGROUND LOGO (OPTIONAL)</strong>
            <label>Choose PNG logo (up to 512 KB)<input type="file" accept="image/png" onChange={async event => {
              const file = event.target.files?.[0]; event.target.value = "";
              if (!file) return;
              try {
                if (file.type !== "image/png" || file.size > 512 * 1024) throw new Error("Choose a PNG logo under 512 KB.");
                const dataUrl = await new Promise<string>((resolve,reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
                const next = cleanForegroundLogo({ dataUrl, width: 0.2, x: "right", y: "top", defaultVisible: true });
                setLogo(next); setShowLogo(true); setLogoMessage("Logo preview loaded. Save logo to keep it in your private project.");
              } catch (error) { setLogoMessage(error instanceof Error ? error.message : "Could not read logo."); }
            }} /></label>
            <span style={copy}>Use transparency to keep the artwork visible. The logo sits above the NFT. Collectors can show or hide it.</span>
            {logo ? <>
              <label>Logo width <input type="range" min="5" max="50" value={Math.round(logo.width*100)} onChange={event => setLogo({ ...logo, width: Number(event.target.value)/100 })} /></label>
              <label>Logo horizontal position <select value={logo.x} onChange={event => setLogo({ ...logo, x: event.target.value as ForegroundLogo["x"] })}>{["left","center","right"].map(value => <option key={value}>{value}</option>)}</select></label>
              <label>Logo vertical position <select value={logo.y} onChange={event => setLogo({ ...logo, y: event.target.value as ForegroundLogo["y"] })}>{["top","center","bottom"].map(value => <option key={value}>{value}</option>)}</select></label>
              <label><input type="checkbox" checked={showLogo} onChange={event => setShowLogo(event.target.checked)} />Show logo in preview</label>
              <label><input type="checkbox" checked={logo.defaultVisible} onChange={event => setLogo({ ...logo, defaultVisible: event.target.checked })} />Show logo by default for collectors</label>
              <button type="button" onClick={() => { setLogo(null); setLogoMessage("Save logo to confirm removal."); }}>Remove logo</button>
            </> : null}
            <button type="button" style={saveButton} disabled={savingLogo || (Boolean(logo) && !logoImage)} onClick={saveLogo}>{savingLogo ? "SAVING LOGO…" : "SAVE LOGO PRIVATELY"}</button>
            {logoMessage ? <span role="status" style={copy}>{logoMessage}</span> : null}
          </div> : null}

          <button
            type="button"
            onClick={save}
            disabled={saving || (Boolean(onLocalSave) && !image)}
            style={saveButton}
          >
            {saving ? "SAVING…" : onLocalSave ? "USE THIS TREATMENT IN LOCAL DRAFT" : "SAVE FINISHED-ARTWORK SETTINGS"}
          </button>

          {message ? <div style={notice}>{message}</div> : null}
        </div>

        <div style={previewWrap}>
          <label>
            Preview device{" "}
            <select value={previewDevice} onChange={event => setPreviewDevice(event.target.value as ArtworkDevice)}>
              <option value="phone">Phone</option>
              <option value="ipad">iPad</option>
              <option value="desktop">Desktop</option>
            </select>
          </label>
          <canvas ref={canvasRef} style={{ ...canvasStyle, aspectRatio: `${FINISHED_ARTWORK_SIZES[previewDevice].width} / ${FINISHED_ARTWORK_SIZES[previewDevice].height}` }} />
          <div style={previewNote}>
            Representative preview only · original NFT pixels are never edited
            <br />Saved device placement takes priority. Scales above 100% zoom and may crop.
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 760px) {
          .finished-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

const panel = {
  borderRadius: 22,
  padding: 20,
  border: "1px solid rgba(200,200,200,.12)",
  background:
    "linear-gradient(135deg,rgba(15,10,29,.76),rgba(14,14,14,.7))",
} as const;

const eyebrow = {
  color: "#cfcfcf",
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
  background: "rgba(220,220,220,.035)",
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
  background: "#ededed",
  color: "#111111",
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
