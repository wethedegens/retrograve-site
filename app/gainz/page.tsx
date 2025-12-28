// app/gainz/page.tsx
"use client";

import Link from "next/link";

export const dynamic = "force-dynamic";

export default function GainzPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "96px 18px 80px",
        color: "#fff",
      }}
    >
      <section style={{ maxWidth: 900, margin: "0 auto" }}>
        <p style={{ margin: 0, opacity: 0.8 }}>
          <Link href="/" style={{ color: "#fff", textDecoration: "none" }}>
            ← Back to LockScreened
          </Link>
        </p>

        <h1 style={{ margin: "14px 0 6px", fontSize: 34, letterSpacing: 0.5 }}>
          Gainz
        </h1>

        <p style={{ margin: 0, opacity: 0.9, maxWidth: 680, lineHeight: 1.6 }}>
          This locker is coming soon. When it goes live it’ll work like Enchanted
          Miners (full NFT import), with a desktop download panel that’s
          right-justified instead of bottom-centered.
        </p>

        <div
          style={{
            marginTop: 22,
            padding: 16,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,.16)",
            background: "rgba(0,0,0,.35)",
            maxWidth: 520,
          }}
        >
          <div style={{ fontSize: 12, letterSpacing: ".12em", opacity: 0.8 }}>
            STATUS
          </div>
          <div style={{ marginTop: 6, fontSize: 16 }}>Coming soon</div>
        </div>
      </section>
    </main>
  );
}
