"use client";

import Link from "next/link";

export default function GainzPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "40px 18px 80px" }}>
      <section style={{ maxWidth: 980, margin: "0 auto" }}>
        <p style={{ margin: "0 0 18px" }}>
          <Link
            href="/"
            style={{
              color: "white",
              textDecoration: "none",
              opacity: 0.9,
              borderBottom: "1px solid rgba(255,255,255,.25)",
              paddingBottom: 2,
            }}
          >
            ← Back to Home
          </Link>
        </p>

        <h1 style={{ margin: 0, fontSize: 34 }}>Gainz</h1>
        <p style={{ marginTop: 10, opacity: 0.85, maxWidth: 640 }}>
          Placeholder page for the Gainz locker. We’ll wire this up when the
          collection / flow is ready.
        </p>

        <div
          style={{
            marginTop: 18,
            padding: 16,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,.14)",
            background: "rgba(0,0,0,.35)",
            maxWidth: 680,
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.85, letterSpacing: ".14em" }}>
            PREVIEW IMAGE CHECK
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 14, alignItems: "center" }}>
            <div
              style={{
                width: 120,
                height: 220,
                borderRadius: 22,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,.14)",
                background: "rgba(0,0,0,.25)",
              }}
            >
              <img
                src="/lockscreened-previews/gainz.png"
                alt="Gainz preview"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>

            <div style={{ fontSize: 13, opacity: 0.85 }}>
              If you can see the phone preview image here, then the file path is correct:
              <div style={{ marginTop: 6, fontFamily: "monospace", fontSize: 12, opacity: 0.9 }}>
                /public/lockscreened-previews/gainz.png
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
