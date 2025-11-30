// app/components/ExportButtons.tsx
"use client";

import { useState } from "react";
import type { ComposerHandle } from "./Composer";

// What we need from the parent
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

  // 🆕 iPad preset – tall 4:3-ish portrait
  {
    key: "ipad",
    label: "Download iPad (2048×2732)",
    width: 2048,
    height: 2732,
    device: "ipad",
  },

  // 🆕 Desktop preset – 16:9 wallpaper
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
      const a = document.createElement("a");
      a.href = url;
      // Simple filename that encodes size & device
      a.download = `lockscreen_${def.device}_${def.width}x${def.height}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setActiveKey(null);
    }
  }

  return (
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

      <style jsx>{`
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
        }
      `}</style>
    </div>
  );
}
