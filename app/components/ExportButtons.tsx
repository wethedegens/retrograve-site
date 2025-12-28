// app/components/ExportButtons.tsx
"use client";

import { useState } from "react";
import type { ComposerHandle } from "./Composer";

type ExportButtonsProps = {
  composerRef: React.RefObject<ComposerHandle | null>;
};

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
  {
    key: "ipad",
    label: "Download iPad (2048×2732)",
    width: 2048,
    height: 2732,
    device: "ipad",
  },
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

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLabel, setPreviewLabel] = useState<string>("");

  async function handleExport(def: ExportDefinition) {
    const composer = composerRef.current;
    if (!composer) return;

    try {
      setActiveKey(def.key);

      // ✅ detect current project from URL (keeps all other code untouched)
      let project = "";
      try {
        project = new URLSearchParams(window.location.search).get("project") || "";
      } catch {
        project = "";
      }

      const justify =
        def.device === "desktop" && project.toLowerCase() === "gainz"
          ? "right"
          : "center";

      const blob = await composer.exportImage({
        width: def.width,
        height: def.height,
        format: "png",
        device: def.device,
        justify,
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

      {previewUrl && (
        <div className="preview-overlay" onClick={closePreview}>
          <div className="preview-inner" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <button
                type="button"
                className="preview-back"
                onClick={(e) => {
                  e.stopPropagation();
                  closePreview();
                }}
              >
                ← Go back
              </button>
            </div>

            <div className="preview-text">
              <strong>{previewLabel}</strong>
              <div style={{ marginTop: 4 }}>
                On mobile (including Phantom): <b>tap and hold</b> the image to
                save it.
              </div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>
                On desktop: right-click → “Save image as…”.
              </div>
            </div>

            <div className="preview-image-wrap">
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
        </div>
      )}

      <style jsx>{`
        .export-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 10px;
        }

        .export-btn {
          width: 100%;
          text-align: left;
          padding: 12px 20px;
          border-radius: 30px;

          background: linear-gradient(180deg, #4b2a83 0%, #3a2068 100%);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #e9d7ff;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;

          box-shadow: 0 8px 22px rgba(0, 0, 0, 0.35);
          transition: background 0.2s ease, transform 0.1s ease,
            box-shadow 0.2s ease, opacity 0.15s ease;
        }

        .export-btn:hover:not(:disabled) {
          background: linear-gradient(180deg, #5a33a0 0%, #44287e 100%);
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
        }

        .export-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
        }

        .export-btn:disabled {
          opacity: 0.65;
          cursor: default;
          background: linear-gradient(180deg, #38245b 0%, #2f1d4d 100%);
          box-shadow: none;
        }

        .preview-overlay {
          position: fixed;
          inset: 0;
          background: rgba(5, 0, 20, 0.88);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: flex-start;
          z-index: 9999;
          padding: 16px 16px 24px;
          overflow-y: auto;
        }

        .preview-inner {
          position: relative;
          max-width: 480px;
          width: 100%;
          margin-top: 16px;
          background: #161022;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.6);
          padding: 12px 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          color: #f5e8ff;
          max-height: calc(100vh - 48px);
          overflow-y: auto;
        }

        .preview-header {
          position: sticky;
          top: 0;
          padding-bottom: 8px;
          margin-bottom: 8px;
          display: flex;
          justify-content: flex-start;
          background: #161022;
          z-index: 1;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .preview-back {
          font-size: 13px;
          padding: 6px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(0, 0, 0, 0.65);
          color: #f5e8ff;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          backdrop-filter: blur(3px);
          transition: background 0.15s ease, transform 0.08s ease,
            box-shadow 0.15s ease;
        }

        .preview-back:hover {
          background: rgba(0, 0, 0, 0.85);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45);
        }

        .preview-back:active {
          transform: translateY(0);
          box-shadow: none;
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
          transition: background 0.15s ease, box-shadow 0.15s ease;
        }

        .preview-close:hover {
          background: #5a33a0;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.45);
        }

        @media (max-width: 768px) {
          .export-btn {
            font-size: 13px;
            padding: 10px 18px;
          }
          .preview-inner {
            margin-top: 12px;
            max-width: 100%;
            max-height: calc(100vh - 40px);
          }
          .preview-back {
            font-size: 12px;
            padding: 5px 11px;
          }
        }
      `}</style>
    </>
  );
}
