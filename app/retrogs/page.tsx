// app/retrogs/page.tsx
import type { Metadata } from "next";
import Showcase from "../components/Showcase";

/**
 * 🔧 OWNER GRID PAGE WRAPPER (MAGAPIXEL VERSION)
 *
 * This page is just a “shell” around the generic <Showcase /> grid.
 * The grid component handles wallet connect + fetching NFTs.
 *
 * 👉 When you duplicate this for a new project later:
 *    - Change the `metadata.title`
 *    - Change the <h1> text
 *    - Change the <p> subtitle text
 *    - Optionally rename the component + route folder
 */

export const metadata: Metadata = {
  // 🔧 Change this per project
  title: "My MAGAPixels • MAGAPixel Locker",
};

export default function MagapixelOwnerGridPage() {
  return (
    <main style={{ padding: "18px 0 80px" }}>
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 18px" }}>
        {/* 🔧 Change this <h1> for a new project */}
        <h1 className="page-title" style={{ margin: "0 0 8px" }}>
          MAGAPIXELS
        </h1>

        {/* 🔧 Change this subtitle line per project */}
        <p style={{ opacity: 0.8, margin: "0 0 24px" }}>
          MAGAPIXEL ·{" "}
          <span style={{ letterSpacing: ".03em" }}>owner view</span>
        </p>

        {/* ✅ Generic wallet connect + fetch + grid (reused for many projects) */}
        <Showcase />
      </section>
    </main>
  );
}
