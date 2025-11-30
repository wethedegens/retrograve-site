// app/components/ExportButtons.tsx
"use client";

import { useState } from "react";
import type { ComposerHandle } from "./Composer";

type ExportButtonsProps = {
  composerRef: React.RefObject<ComposerHandle | null>;
};

// Device variants understood by Composer
type ExportDevice = "phone" | "ipad" | "desktop";

type ExportDefinition = {
  key: string;
  label: string;
  width: number;
  height: number;
  device: ExportDevice;
};

const EXPORTS: ExportDefinition[] = [
  {
    key: "master",
    label: "Download Master (1440×3200)",
    width: 1440,
    height: 3200,
    device: "phone",
  },
  {
    key: "iphone15pm",
    label: "Download iPhone 15/14 Pro Max (1290×2796)",
    width: 1290,
    height: 2796,
    device: "phone",
  },
  {
    key: "iphone15pro",
    label: "Download iPhone 15/14 Pro (1179×2556)",
    width: 1179,
    height: 2556,
    device: "phone",
  },
  {
    key: "android-20-9",
    label: "Download Android 20:9 (1080×2400)",
    width: 1080,
    height: 2400,
    device: "phone",
  },
  {
    key: "android-qhd-plus",
    label: "Download Android QHD+ (1440×3040)",
    width: 1440,
    height: 3040,
    device: "phone",
  },

  // iPad preset – tall portrait
  {
    key: "ipad",
    label: "Download iPad (2048×2732)",
    width: 2048,
    height: 2732,
    device: "ipad",
  },

  // Desktop preset – 16:9 wallpaper
  {
    key: "desktop",
    label: "Download Desktop (2560×1440)",
    width: 2560,
    height: 1440,
    device: "desktop",
  },
];

export default function ExportButtons({ composerRef }: ExportButtonsProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // In-app overlay with the generated image
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLabel, setPreviewLabel] = useState<string>("");

  async function handleExport(def: ExportDefinition) {
    const composer = composerRef.current;
    if (!composer) return;

    try {
      setActiveKey(def.key);

      const blob = await composer.exportImage({
        width: def.width,
        height: def.height,
        format: "png",
        device: def.device,
      });

      if (!blob) return;

      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewLabel(def.label);
    } finally {
      setActiveKey(null);
    }
  }

  function closePreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewLabel("");
  }

  return (
    <>
      <div className="export-buttons">
        {EXPORTS.map((def) => (
          <button
            key={def.key}
            type="button"
            onClick={() => handleExport(def)}
            className="export-btn"
            disabled={activeKey === def.key}
          >
            {activeKey === def.key ? "Preparing download…" : def.label}
          </button>
        ))}
      </div>

      {/* Overlay shown after export, everywhere (desktop + mobile) */}
      {previewUrl && (
        <div className="preview-overlay" onClick={closePreview}>
          <div
            className="preview-inner"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="preview-text">
              <strong>{previewLabel}</strong>
              <div style={{ marginTop: 4 }}>
                On mobile: <b>tap and hold</b> the image to save it.
              </div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>
                On desktop: right-click → “Save image as…”.
              </div>
            </div>
            <div className="preview-image-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Lock screen preview"
                className="preview-image"
              />
            </div>
            <button
              type="button"
              className="preview-close"
              onClick={closePreview}
            >
              Close
            </button>
          </div>

          <style jsx>{`
            .preview-overlay {
              position: fixed;
              inset: 0;
              background: rgba(5, 0, 20, 0.88);
              backdrop-filter: blur(4px);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 9999;
              padding: 16px;
            }
            .preview-inner {
              max-width: 480px;
              width: 100%;
              background: #161022;
              border-radius: 18px;
              border: 1px solid rgba(255, 255, 255, 0.15);
              box-shadow: 0 18px 44px rgba(0, 0, 0, 0.6);
              padding: 16px;
              display: flex;
              flex-direction: column;
              gap: 12px;
              color: #f5e8ff;
            }
            .preview-text {
              font-size: 13px;
              line-height: 1.4;
            }
            .preview-image-wrap {
              background: #05030a;
              border-radius: 14px;
              padding: 8px;
              display: flex;
              justify-content: center;
            }
            .preview-image {
              max-width: 100%;
              height: auto;
              border-radius: 12px;
            }
            .preview-close {
              align-self: flex-end;
              margin-top: 4px;
              border-radius: 999px;
              padding: 6px 14px;
              border: 1px solid rgba(255, 255, 255, 0.2);
              background: #4b2a83;
              color: #f5e8ff;
              font-size: 12px;
              cursor: pointer;
            }
            .preview-close:hover {
              background: #5a33a0;
            }

            .export-buttons {
              display: flex;
              flex-direction: column;
              gap: 8px;
            }
            .export-btn {
              width: 100%;
              text-align: left;
              border-radius: 999px;
              padding: 10px 16px;
              border: 1px solid rgba(255, 255, 255, 0.18);
              background: #4b2a83;
              color: #f5e8ff;
              font-size: 13px;
              cursor: pointer;
              transition: background 0.15s ease, transform 0.05s ease,
                box-shadow 0.15s ease, opacity 0.15s ease;
              box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
            }
            .export-btn:hover:not(:disabled) {
              background: #5a33a0;
              transform: translateY(-1px);
              box-shadow: 0 10px 22px rgba(0, 0, 0, 0.4);
            }
            .export-btn:disabled {
              opacity: 0.6;
              cursor: default;
              transform: none;
              box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
            }

            @media (max-width: 768px) {
              .export-btn {
                font-size: 12px;
                padding: 9px 14px;
              }
              .preview-inner {
                max-width: 100%;
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
