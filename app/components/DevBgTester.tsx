"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * DevBgTester
 * - Visible only when URL has ?devbg=1
 * - Lets you pick a local image; broadcasts an Object URL via window "devbg:change"
 * - Also sets a CSS var --dev-bg-url (optional visual helpers)
 * - No uploads or persistence; reload clears it
 */

function useSearchParamFlag(name: string) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      setOn(sp.get(name) === "1");
    }
  }, [name]);
  return on;
}

export default function DevBgTester() {
  const enabled = useSearchParamFlag("devbg");
  const [file, setFile] = useState<File | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const objectUrl = useMemo(() => {
    if (!file) return null;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    return url;
  }, [file]);

  // Apply CSS var and dispatch event to page
  useEffect(() => {
    const root = document.documentElement;
    if (objectUrl) {
      root.style.setProperty("--dev-bg-url", `url("${objectUrl}")`);
    } else {
      root.style.removeProperty("--dev-bg-url");
    }
    window.dispatchEvent(new CustomEvent("devbg:change", { detail: objectUrl }));
    return () => {
      root.style.removeProperty("--dev-bg-url");
    };
  }, [objectUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      window.dispatchEvent(new CustomEvent("devbg:change", { detail: null }));
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 9999,
        padding: 12,
        borderRadius: 12,
        background:
          "linear-gradient(180deg, rgba(30,30,50,.95), rgba(20,20,35,.95))",
        boxShadow: "0 8px 24px rgba(0,0,0,.35)",
        border: "1px solid rgba(255,255,255,.12)",
        minWidth: 280,
        color: "white",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Dev BG Tester</div>
      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 10 }}>
        Local-only. Add <code>?devbg=1</code> to show.
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <button
        onClick={() => setFile(null)}
        style={{
          width: "100%",
          padding: "8px 10px",
          borderRadius: 10,
          background: "rgba(255,255,255,.12)",
          border: "1px solid rgba(255,255,255,.18)",
          color: "white",
          cursor: "pointer",
        }}
      >
        Clear background
      </button>

      <style>{`
        /* Optional helper: apply CSS var to any element with .dev-bg */
        .dev-bg {
          background-image: var(--dev-bg-url, none) !important;
          background-size: cover !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
        }
      `}</style>
    </div>
  );
}
