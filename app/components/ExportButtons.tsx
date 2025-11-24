// app/components/ExportButtons.tsx
"use client";

import { useState } from "react";
import type { ComposerHandle } from "./Composer";

type ExportButtonsProps = {
  composerRef: React.RefObject<ComposerHandle | null>;
};

// Helper: detect iOS-ish
function isIOSLike() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

// Helper: detect Phantom in-app browser (rough but fine)
function isPhantomInApp() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes("phantom");
}

// Single, correct helper
async function downloadBlobSmart(
  blob: Blob,
  filename: string
): Promise<void> {
  const url = URL.createObjectURL(blob);

  const ios = isIOSLike();
  const phantom = isPhantomInApp();

  if (ios || phantom) {
    // Keep the blob alive long enough for user to save
    setTimeout(() => URL.revokeObjectURL(url), 60_000);

    // Stay in SAME TAB so Phantom/iOS don't kill the blob
    window.location.href = url;
    return;
  }

  // Normal desktop behavior
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export default function ExportButtons({ composerRef }: ExportButtonsProps) {
  const [busy, setBusy] = useState(false);

  async function handleExport(
    width: number,
    height: number,
    filename: string
  ) {
    if (!composerRef.current) return;
    try {
      setBusy(true);

      const blob = await composerRef.current.exportImage({
        width,
        height,
        format: "image/png",
      });

      if (!blob) return;

      await downloadBlobSmart(blob, filename);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="export-buttons">
      <h3>Export</h3>

      <button
        disabled={busy}
        onClick={() =>
          handleExport(1440, 3200, "lockscreen-master-1440x3200.png")
        }
      >
        Download Master (1440×3200)
      </button>

      <button
        disabled={busy}
        onClick={() =>
          handleExport(1290, 2796, "iphone-15-pro-max-1290x2796.png")
        }
      >
        Download iPhone 15/14 Pro Max (1290×2796)
      </button>

      <button
        disabled={busy}
        onClick={() =>
          handleExport(1179, 2556, "iphone-15-14-pro-1179x2556.png")
        }
      >
        Download iPhone 15/14 Pro (1179×2556)
      </button>

      <button
        disabled={busy}
        onClick={() =>
          handleExport(1080, 2400, "android-20-9-1080x2400.png")
        }
      >
        Download Android 20:9 (1080×2400)
      </button>

      <button
        disabled={busy}
        onClick={() =>
          handleExport(1440, 3040, "android-qhd-plus-1440x3040.png")
        }
      >
        Download Android QHD+ (1440×3040)
      </button>

      <style jsx>{`
        .export-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        h3 {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #cfc2ff;
          margin: 0 0 6px;
        }

        button {
          width: 100%;
          padding: 10px 12px;
          border-radius: 999px;
          border: 1px solid rgba(189, 169, 255, 0.4);
          background: radial-gradient(
            circle at top left,
            rgba(189, 169, 255, 0.25),
            rgba(40, 20, 80, 0.95)
          );
          color: #fdfbff;
          font-size: 13px;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          transition:
            transform 0.12s ease,
            box-shadow 0.12s ease,
            border-color 0.12s ease,
            background 0.12s ease;
        }

        button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          border-color: rgba(255, 255, 255, 0.7);
        }

        button:disabled {
          opacity: 0.6;
          cursor: default;
        }
      `}</style>
    </div>
  );
}
