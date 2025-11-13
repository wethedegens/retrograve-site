// app/components/ShareActions.tsx
"use client";

import { useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function ShareActions() {
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();
  const search = useSearchParams();

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const mint = (search.get("mint") || "").trim();
    const url = new URL(window.location.origin);
    url.pathname = pathname || "/locker";
    if (mint) url.searchParams.set("mint", mint);
    return url.toString();
  }, [pathname, search]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // fallback: open a prompt
      window.prompt("Copy this link:", shareUrl);
    }
  };

  const shareX = () => {
    const text = encodeURIComponent(
      "My RetroGrave lockscreen — sized perfectly for my phone 🔥"
    );
    const url = encodeURIComponent(shareUrl);
    const intent = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    window.open(intent, "_blank", "noopener,noreferrer");
  };

  if (!shareUrl) return null;

  return (
    <div className="share-wrap">
      <div className="share-title">Share</div>

      <div className="row">
        <button className="btn" onClick={copyLink}>
          <span>{copied ? "Link copied!" : "Copy link to this NFT"}</span>
          <span className="dot" aria-hidden />
        </button>

        <button className="btn" onClick={shareX}>
          <span>Share on X</span>
          <span className="dot" aria-hidden />
        </button>
      </div>

      <style jsx>{`
        .share-wrap {
          display: grid;
          gap: 10px;
          margin-top: 10px;
        }
        .share-title {
          color: #cfc2ff;
          font-weight: 700;
          letter-spacing: 0.04em;
          opacity: 0.9;
        }
        .row {
          display: grid;
          gap: 8px;
        }
        .btn {
          appearance: none;
          border: 1px solid rgba(183, 122, 255, 0.35);
          color: #eae6ff;
          background: rgba(34, 26, 51, 0.8);
          padding: 12px 14px;
          border-radius: 12px;
          font-size: 13px;
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 10px;
          text-align: left;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease,
            background 0.15s ease;
        }
        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 16px rgba(183, 122, 255, 0.45);
          border-color: rgba(183, 122, 255, 0.6);
          background: rgba(34, 26, 51, 0.95);
        }
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: radial-gradient(
            circle at 50% 50%,
            rgba(183, 122, 255, 1) 0%,
            rgba(60, 15, 90, 0.25) 60%,
            rgba(30, 0, 50, 0.12) 100%
          );
          box-shadow:
            0 0 14px rgba(183, 122, 255, 0.45),
            0 0 26px rgba(183, 122, 255, 0.35);
        }
      `}</style>
    </div>
  );
}
