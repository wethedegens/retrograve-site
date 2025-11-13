// app/components/ExportButtons.tsx
"use client";

import { RefObject, useState } from "react";
import type { ComposerHandle, ExportSize } from "./Composer";

type Btn = {
  label: string;
  size: ExportSize | { w: number; h: number; label?: string };
  id: string; // for busy state key
};

export default function ExportButtons({
  composerRef,
}: {
  composerRef: RefObject<ComposerHandle>;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (btn: Btn) => {
    const c = composerRef.current;
    if (!c) return;
    try {
      setBusy(btn.id);
      // Normalize to ExportSize
      const s =
        "w" in btn.size
          ? { label: btn.size.label || btn.label, w: btn.size.w, h: btn.size.h }
          : btn.size;
      await c.exportAt(s);
    } finally {
      setBusy(null);
    }
  };

  const buttons: Btn[] = [
    { id: "master", label: "Download Master (1440×3200)", size: { w: 1440, h: 3200 } },
    { id: "ip15pm", label: "Download iPhone 15/14 Pro Max (1290×2796)", size: { w: 1290, h: 2796 } },
    { id: "ip15pro", label: "Download iPhone 15/14 Pro (1179×2556)", size: { w: 1179, h: 2556 } },
    { id: "and209", label: "Download Android 20:9 (1080×2400)", size: { w: 1080, h: 2400 } },
    { id: "qhdp", label: "Download Android QHD+ (1440×3040)", size: { w: 1440, h: 3040 } },

    // ✅ New share-friendly size — explicit object so no preset key needed
    { id: "share", label: "Share your RetroGrave (1080×1350)", size: { w: 1080, h: 1350, label: "Share" } },
  ];

  return (
    <div className="export-wrap">
      <div className="export-title">Export</div>

      {buttons.map((b) => (
        <button
          key={b.id}
          className={`btn ${busy === b.id ? "busy" : ""}`}
          disabled={busy !== null}
          onClick={() => run(b)}
        >
          <span className="btn-label">{busy === b.id ? "Preparing…" : b.label}</span>
          <span className="sp" aria-hidden />
        </button>
      ))}

      <style jsx>{`
        .export-wrap {
          display: grid;
          gap: 10px;
        }
        .export-title {
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #cfc2ff;
          margin-bottom: 6px;
          opacity: 0.9;
        }
        .btn {
          width: 100%;
          appearance: none;
          border: 1px solid rgba(183, 122, 255, 0.35);
          color: #eae6ff;
          background: rgba(34, 26, 51, 0.8);
          padding: 12px 14px;
          border-radius: 12px;
          font-size: 13px;
          text-align: left;
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 10px;
          transition: transform 0.15s ease, box-shadow 0.15s ease,
            background 0.15s ease, border-color 0.15s ease;
          box-shadow: 0 0 0 0 rgba(183, 122, 255, 0.2) inset;
        }
        .btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 0 16px rgba(183, 122, 255, 0.45);
          border-color: rgba(183, 122, 255, 0.6);
          background: rgba(34, 26, 51, 0.95);
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .btn.busy {
          box-shadow: 0 0 0 2px rgba(183, 122, 255, 0.35) inset;
          background: rgba(34, 26, 51, 0.95);
        }
        .btn-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sp {
          height: 6px;
          width: 6px;
          border-radius: 50%;
          background: radial-gradient(
            circle at 50% 50%,
            rgba(183, 122, 255, 1) 0%,
            rgba(60, 15, 90, 0.2) 60%,
            rgba(30, 0, 50, 0.1) 100%
          );
          box-shadow:
            0 0 14px rgba(183, 122, 255, 0.45),
            0 0 26px rgba(183, 122, 255, 0.35);
        }
      `}</style>
    </div>
  );
}
