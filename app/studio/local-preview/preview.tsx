"use client";

import { useEffect, useRef, useState } from "react";
import PublishedFinishedArtworkComposer from "../../components/studio/PublishedFinishedArtworkComposer";
import type { ComposerHandle } from "../../components/Composer";

const sizes = [
  { label: "Phone — Master", width: 1440, height: 3200, device: "phone" },
  { label: "iPhone Pro Max", width: 1290, height: 2796, device: "phone" },
  { label: "iPhone Pro", width: 1179, height: 2556, device: "phone" },
  { label: "Android 20:9", width: 1080, height: 2400, device: "phone" },
  { label: "Android QHD+", width: 1440, height: 3040, device: "phone" },
  { label: "iPad", width: 2048, height: 2732, device: "ipad" },
  { label: "Desktop", width: 2560, height: 1440, device: "desktop" },
] as const;

export default function LocalArtworkPreview({ embedded = false }: { embedded?: boolean } = {}) {
  const composer = useRef<ComposerHandle | null>(null);
  const backgroundInput = useRef<HTMLInputElement | null>(null);
  const [background, setBackground] = useState("");
  const uploadedBackground = useRef("");
  const image = "/demo/1.png";
  const [sizeIndex, setSizeIndex] = useState(0);
  const [style, setStyle] = useState("edge_color");
  const [scale, setScale] = useState(0.92);
  const [x, setX] = useState("center");
  const [y, setY] = useState("bottom");
  const downloadUrl = useRef("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const size = sizes[sizeIndex];

  useEffect(() => () => {
    if (uploadedBackground.current) URL.revokeObjectURL(uploadedBackground.current);
    if (downloadUrl.current) URL.revokeObjectURL(downloadUrl.current);
  }, []);

  function removeBackground() {
    if (uploadedBackground.current) URL.revokeObjectURL(uploadedBackground.current);
    uploadedBackground.current = "";
    if (backgroundInput.current) backgroundInput.current.value = "";
    setBackground("");
    setError("");
  }
  async function savePng() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const blob = await composer.current?.exportImage({ ...size, format: "png" });
      if (!blob) throw new Error("The renderer did not produce an image.");
      if (downloadUrl.current) URL.revokeObjectURL(downloadUrl.current);
      downloadUrl.current = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl.current;
      link.download = `lockscreened-test-${size.width}x${size.height}.png`;
      link.click();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save artwork.");
    } finally { setBusy(false); }
  }

  return (
    <main className="local-art-preview">
      <header>
        <p>LOCKSCREENED · COLLECTOR DEMO</p>
        <h1>Try the collector experience</h1>
        {!embedded ? <a href="/studio/local-founder">← Return to founder setup</a> : null}
        <p>Customize the selected NFT with backgrounds and device layouts, then save a full-size PNG. This local preview uses a sample NFT; connected-wallet NFT selection comes in the collection flow.</p>
      </header>
      <div className="test-layout">
        <section className="controls" aria-label="Wallpaper controls">
          <p className="selected-nft">Demo artwork · not your project’s NFT</p>
          <label>Custom background (behind the NFT)<input ref={backgroundInput} type="file" accept="image/png,image/jpeg,image/webp" onChange={event => {
            const file = event.target.files?.[0];
            if (!file) return;
            if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024) {
              setError("Choose a PNG, JPEG or WebP under 8 MB."); return;
            }
            if (uploadedBackground.current) URL.revokeObjectURL(uploadedBackground.current);
            uploadedBackground.current = URL.createObjectURL(file);
            setBackground(uploadedBackground.current);
          }} /></label>
          {background ? <button type="button" onClick={removeBackground}>Remove custom background</button> : null}
          <p className="hint">Your background stays in this browser. It fills the space behind the NFT; any opaque background already in the NFT remains visible.</p>
          <label>Device<select value={sizeIndex} onChange={event => setSizeIndex(Number(event.target.value))}>
            {sizes.map((item, index) => <option key={item.label} value={index}>{item.label} · {item.width}×{item.height}</option>)}
          </select></label>
          <label>Automatic background treatment<select disabled={Boolean(background)} value={style} onChange={event => setStyle(event.target.value)}>
            <option value="edge_color">Matching edge color</option><option value="gradient">Gradient</option><option value="blur">Soft blur</option>
          </select></label>
          {background ? <p className="hint">Custom background active. Remove it to return to the automatic treatment.</p> : null}
          <button type="button" onClick={() => { removeBackground(); setStyle("edge_color"); setScale(0.92); setX("center"); setY("bottom"); }}>Reset background and placement</button>
          <label>Artwork size · {Math.round(scale * 100)}%<input type="range" min="40" max="180" value={Math.round(scale * 100)} onChange={event => setScale(Number(event.target.value) / 100)} /></label>
          <p className="hint">Up to 100% keeps the full NFT visible. Above 100% zooms in and may crop.</p>
          <label>Horizontal position<select value={x} onChange={event => setX(event.target.value)}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
          <label>Vertical position<select value={y} onChange={event => setY(event.target.value)}><option value="top">Top</option><option value="center">Center</option><option value="bottom">Bottom</option></select></label>
          <button className="save" type="button" disabled={busy} onClick={savePng}>{busy ? "Preparing PNG..." : `Save PNG - ${size.width}x${size.height}`}</button>
          {error ? <p role="alert">{error}</p> : null}
        </section>
        <section className="result" aria-label="Wallpaper result">
          <h2>{size.label}</h2>
          <PublishedFinishedArtworkComposer hideLayoutControls ref={composer} nft={{id: image, image}}
            bg={background ? {kind: "image", image: background} : {kind: "color", value: "#171717"}}
            hasOfficialBackground={Boolean(background)} previewDevice={size.device} previewSize={size}
            renderProfile={{finishedArtwork: {extensionStyle: style, artworkScale: scale, verticalAlign: y}, devicePlacement: {[size.device]: {scale, x, y}}}} />
          <p>Rendered by the actual founder finished-artwork component.</p>
        </section>
      </div>
      <style jsx>{`
        .local-art-preview { min-height:100vh; padding:32px 22px 60px; color:#eeeeee; background:#090909; font-family:Arial,sans-serif; }
        header { max-width:1000px; margin:0 auto 28px; } header>p:first-child { color:#dddddd; font-size:12px; letter-spacing:2px; }
        h1 { font-size:clamp(26px,4vw,40px); margin:12px 0; } p { line-height:1.6; color:#bbbbbb; } h2 { margin:0 0 14px; font-size:20px; }
        .test-layout { display:grid; grid-template-columns:minmax(260px,340px) minmax(0,1fr); gap:28px; max-width:1000px; margin:auto; align-items:start; }
        .controls { display:grid; gap:18px; padding:24px; border:1px solid #383838; border-radius:18px; background:#151515; }
        label { display:grid; gap:8px; font-size:14px; } select,input { width:100%; min-width:0; box-sizing:border-box; } select { color:white; background:#202020; padding:12px 8px; border:1px solid #555555; border-radius:8px; }
        button { color:#eeeeee; background:#252525; border:1px solid #555555; border-radius:8px; padding:10px; cursor:pointer; } select:disabled { opacity:.55; }
        .hint { font-size:12px; margin:-10px 0 0; } .save { display:block; padding:14px; border-radius:10px; text-align:center; background:#eeeeee; color:#111111; font-weight:bold; text-decoration:none; }
        .result { text-align:center; min-width:0; } .result img { display:block; max-width:100%; max-height:680px; width:auto; height:auto; margin:auto; border:1px solid #555555; border-radius:12px; }
        .result p { font-size:12px; } @media(max-width:700px) { .test-layout { grid-template-columns:1fr; } .local-art-preview { padding:24px 16px; } }
      `}</style>
    </main>
  );
}
