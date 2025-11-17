"use client";

import { useCallback, useState, type MutableRefObject } from "react";
import type { ComposerHandle } from "./Composer";

type ShareActionsProps = {
  composerRef?: MutableRefObject<ComposerHandle | null>;
  nftName?: string;
  onUsing?: (msg: string) => void;
};

export default function ShareActions({
  composerRef, // accepted so types are happy, even if we don’t use it yet
  nftName = "RetroGrave",
  onUsing,
}: ShareActionsProps) {
  const [copied, setCopied] = useState(false);

  const notify = useCallback(
    (msg: string) => {
      onUsing?.(msg);
    },
    [onUsing]
  );

  const handleCopyLink = useCallback(async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      notify("Link copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      notify("Unable to copy link (clipboard blocked)");
    }
  }, [notify]);

  const handleHowToUse = useCallback(() => {
    notify("Export the image, then set it as your lock screen in your phone settings.");
  }, [notify]);

  return (
    <div
      style={{
        display: "grid",
        gap: 8,
        fontSize: 12,
      }}
    >
      <div style={{ opacity: 0.8 }}>
        Share your <strong>{nftName}</strong> or save it as your lock screen:
      </div>

      <button
        type="button"
        onClick={handleCopyLink}
        style={{
          border: "1px solid rgba(255,255,255,.16)",
          borderRadius: 999,
          padding: "8px 10px",
          background: "rgba(0,0,0,.45)",
          color: "white",
          fontSize: 12,
          cursor: "pointer",
        }}
      >
        {copied ? "✅ Link copied" : "Copy link to this locker"}
      </button>

      <button
        type="button"
        onClick={handleHowToUse}
        style={{
          border: "1px solid rgba(255,255,255,.12)",
          borderRadius: 999,
          padding: "8px 10px",
          background: "rgba(0,0,0,.25)",
          color: "white",
          fontSize: 12,
          cursor: "pointer",
        }}
      >
        How to use as a lock screen
      </button>
    </div>
  );
}
