// app/components/WallpaperHint.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

function getPlatform(): "ios" | "android" | "desktop" {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent || "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  if (isIOS) return "ios";
  if (isAndroid) return "android";
  return "desktop";
}

const STORAGE_KEY = "rg_wallpaper_hint_dismissed";

export default function WallpaperHint() {
  const [open, setOpen] = useState(false);
  const platform = useMemo(getPlatform, []);
  const [dontShow, setDontShow] = useState(false);

  // Listen for export success
  useEffect(() => {
    const onExported = () => {
      const dismissed = localStorage.getItem(STORAGE_KEY) === "1";
      if (!dismissed) setOpen(true);
    };
    const onManualOpen = () => setOpen(true);

    window.addEventListener("retrograve:exported", onExported as EventListener);
    window.addEventListener("retrograve:show-hint", onManualOpen as EventListener);
    return () => {
      window.removeEventListener("retrograve:exported", onExported as EventListener);
      window.removeEventListener("retrograve:show-hint", onManualOpen as EventListener);
    };
  }, []);

  const close = () => {
    if (dontShow) localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="rg-hint-overlay" role="dialog" aria-modal="true" aria-label="How to set as wallpaper">
      <div className="rg-hint-card">
        <h3>Set as Wallpaper</h3>
        {platform === "ios" && (
          <ol className="steps">
            <li>Open <b>Photos</b> and select your exported image.</li>
            <li>Tap <b>Share</b> → <b>Use as Wallpaper</b>.</li>
            <li>Choose <b>Lock Screen</b> (or Both) → <b>Set</b>.</li>
          </ol>
        )}
        {platform === "android" && (
          <ol className="steps">
            <li>Open <b>Gallery/Photos</b> and select your exported image.</li>
            <li>Tap <b>⋮</b> or <b>Set as</b> → <b>Wallpaper</b>.</li>
            <li>Choose <b>Lock screen</b> and confirm.</li>
          </ol>
        )}
        {platform === "desktop" && (
          <>
            <p className="muted">You downloaded the image on desktop.</p>
            <ol className="steps">
              <li>Send it to your phone (AirDrop, Messages, email, etc.).</li>
              <li>Then follow the quick steps on your device to set as wallpaper.</li>
            </ol>
          </>
        )}

        {/* Optional tiny GIFs (add your own assets to /public if you want) */}
        {/* <img src={`/hints/${platform}.gif`} alt="" className="demo" /> */}

        <label className="dont">
          <input
            type="checkbox"
            checked={dontShow}
            onChange={(e) => setDontShow(e.target.checked)}
          />
          Don’t show this again
        </label>

        <div className="actions">
          <button className="btn" onClick={close}>Got it</button>
        </div>
      </div>

      <style jsx>{`
        .rg-hint-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          display: grid; place-items: center;
          z-index: 9999;
        }
        .rg-hint-card {
          width: min(520px, 92vw);
          background: #141018;
          border: 1px solid rgba(183,122,255,0.45);
          border-radius: 16px;
          padding: 18px 18px 12px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.55);
          color: #eae4ff;
          text-shadow: 0 0 10px rgba(183,122,255,0.35);
        }
        h3 {
          margin: 0 0 8px;
          font-size: 22px;
          letter-spacing: .04em;
        }
        .steps {
          margin: 8px 0 12px 18px;
          line-height: 1.6;
        }
        .muted { opacity: .8; margin: 4px 0 0; }
        .dont {
          display: flex; align-items: center; gap: 8px;
          font-size: 14px; opacity: .9; margin: 6px 0 10px;
        }
        .actions { display: flex; justify-content: flex-end; }
        .btn {
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid rgba(183,122,255,0.75);
          background: radial-gradient(120% 180% at 80% 0%, rgba(183,122,255,.35), rgba(60,15,90,.25) 60%, rgba(30,0,50,.2));
          color: #fff;
          font-weight: 700;
          letter-spacing: .02em;
          cursor: pointer;
          transition: transform .15s ease, box-shadow .15s ease;
          box-shadow: 0 0 12px rgba(183,122,255,0.45);
        }
        .btn:hover { transform: scale(1.03); box-shadow: 0 0 24px rgba(183,122,255,.8); }
      `}</style>
    </div>
  );
}
