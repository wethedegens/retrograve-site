// app/retrogs/page.tsx
import type { Metadata } from "next";
import dynamic from "next/dynamic";

/**
 * MAGAPIXEL OWNER GRID PAGE
 * Wraps the generic <Showcase /> with MAGApixel-specific text.
 *
 * IMPORTANT:
 * Showcase uses wallet-adapter (browser-only). During Vercel build/prerender,
 * SSR can crash. We load it client-only via dynamic import (ssr:false).
 */

const Showcase = dynamic(() => import("../components/Showcase"), {
  ssr: false,
  loading: () => (
    <p style={{ margin: "16px 0", opacity: 0.85 }}>
      Loading wallet tools…
    </p>
  ),
});

export const metadata: Metadata = {
  title: "My MAGAPixels • MAGAPixel Locker",
};

export default function MagapixelOwnerGridPage() {
  return (
    <main style={{ padding: "18px 0 80px" }}>
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 18px" }}>
        {/* 🔙 Back link to the locker */}
        <p style={{ margin: "0 0 10px" }}>
          <a
            href="/locker/magapixel"
            style={{
              fontFamily: "VT323, monospace",
              fontSize: 13,
              letterSpacing: "0.08em",
              textDecoration: "none",
              color: "#bda3ff",
              opacity: 0.8,
            }}
          >
            ← BACK TO MAGAPIXEL LOCKER
          </a>
        </p>

        <h1 className="page-title" style={{ margin: "0 0 8px" }}>
          MAGAPIXELS
        </h1>

        <p style={{ opacity: 0.8, margin: "0 0 24px" }}>
          MAGAPIXEL · <span style={{ letterSpacing: ".03em" }}>owner view</span>
        </p>

        {/* Wallet connect + fetch + grid (client-only) */}
        <Showcase />
      </section>
    </main>
  );
}
