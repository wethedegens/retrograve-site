// app/components/ExportButtons.tsx
// MOBILE_EXPORT_OVERLAY_V1 + MOBILE_TIP_HINT_V2
"use client";

import { useEffect, useState } from "react";
import type { ComposerHandle } from "./Composer";

type ExportButtonsProps = {
  composerRef: React.RefObject<ComposerHandle | null>;
};

// Helper: detect iOS-ish environments
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

// Generic mobile-ish detection (for the floating tip)
function isMobileLike() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    ua
  );
}

// Desktop-only download helper using a blob URL
function downloadBlobDesktop(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showMobileTip, setShowMobileTip] = useState(false);

  // Decide if we should show the bottom-left mobile hint
  useEffect(() => {
    if (typeof navigator === "undefined") return;

    if (isMobileLike() || isPhantomInApp() || isIOSLike()) {
      setShowMobileTip(true);
    }
  }, []);

  async function handleExport(
    width: number,
    height: number,
    filename: string
  ) {
    if (!composerRef.current) return;

    try {
      setBusy(true);

      // Uses the exportImage API from ComposerHandle (returns a Blob)
      const blob = await composerRef.current.exportImage({
        width,
        height,
        format: "png",
      });

      if (!blob) return;

      const ios = isIOSLike();
      const phantom = isPhantomInApp();

      if (ios || phantom) {
        // 🔹 On iOS / Phantom: show the image in-page so user can long-press & save
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          setPreviewUrl(dataUrl);
        };
        reader.readAsDataURL(blob);
      } else {
        // 🔹 Normal desktop behavior
        downloadBlobDesktop(blob, filename);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
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
      </div>

      {/* 🔹 Mobile overlay preview for iOS / Phantom */}
      {previewUrl && (
        <div
          className="download-overlay"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="overlay-inner"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top-right back button */}
            <button
              type="button"
              className="overlay-close"
              onClick={() => setPreviewUrl(null)}
              aria-label="Back to wardrobe"
            >
              ✕
            </button>

            <p className="overlay-text">
              Tap &amp; hold the image below to save it to your phone.
            </p>
            <div className="overlay-image-wrap">
              <img src={previewUrl} alt="Exported lockscreen" />
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Small floating hint on mobile / Phantom */}
      {showMobileTip && (
        <div className="mobile-download-tip">
          <span>
            Tip:{" "}
            <strong>Tap &amp; hold</strong> the image to download on
            mobile.
          </span>
          <button
            type="button"
            className="mobile-tip-close"
            onClick={() => setShowMobileTip(false)}
            aria-label="Dismiss download tip"
          >
            ×
          </button>
        </div>
      )}

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

        /* Overlay styles */
        .download-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.78);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 18px;
        }

        .overlay-inner {
          position: relative;
          background: #11091f;
          border-radius: 18px;
          padding: 20px 16px 16px;
          max-width: 480px;
          width: 100%;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(189, 169, 255, 0.4);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .overlay-text {
          font-size: 13px;
          color: #f7f0ff;
          text-align: center;
          margin: 0 24px 4px;
        }

        .overlay-image-wrap {
          background: #040008;
          border-radius: 18px;
          padding: 8px;
          display: flex;
          justify-content: center;
        }

        .overlay-image-wrap img {
          max-width: 100%;
          height: auto;
          border-radius: 14px;
        }

        .overlay-close {
          position: absolute;
          top: 8px;
          right: 8px;
          border: none;
          background: rgba(0, 0, 0, 0.75);
          color: #fdfbff;
          width: 26px;
          height: 26px;
          border-radius: 999px;
          font-size: 14px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        /* Floating mobile tip (bottom-left) */
        .mobile-download-tip {
          position: fixed;
          left: 12px;
          bottom: 12px;
          z-index: 9000;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.8);
          color: #fdfbff;
          font-size: 11px;
          line-height: 1.3;
          backdrop-filter: blur(6px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
        }

        .mobile-tip-close {
          border: none;
          background: transparent;
          color: inherit;
          font-size: 14px;
          cursor: pointer;
          padding: 0;
          margin: 0;
          line-height: 1;
        }
      `}</style>
    </>
  );
}
