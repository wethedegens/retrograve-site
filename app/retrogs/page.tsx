// app/retrogs/page.tsx
import type { Metadata } from "next";
import Showcase from "../components/Showcase"; // ✅ relative path (no alias)

export const metadata: Metadata = {
  title: "RetroGS • RetroGrave",
};

export default function RetrogsPage() {
  return (
    <main style={{ padding: "18px 0 80px" }}>
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 18px" }}>
        <h1 className="page-title" style={{ margin: "0 0 8px" }}>RETROGS</h1>
        <p style={{ opacity: 0.8, margin: "0 0 24px" }}>
          MAGAPIXEL · <span style={{ letterSpacing: ".03em" }}>owner view</span>
        </p>

        {/* Wallet connect + fetch + grid */}
        <Showcase />
      </section>
    </main>
  );
}
