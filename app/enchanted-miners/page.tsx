"use client";

import Link from "next/link";
import PhoneShowcase from "../components/PhoneShowcase";

const ENCHANTED_MINERS_BG_IMAGE = "/enchanted-miners-bg.png";

/**
 * ==========================
 * ENCHANTED MINERS — LANDING
 * ==========================
 * This is the "project home" page (like your MAGApixel entry page),
 * NOT the NFT grid.
 *
 * Flow:
 * / (home phones) -> /enchanted-miners (THIS page)
 * -> /enchanted-miners-nfts (grid)
 * -> /locker?project=miners&mint=... (composer)
 */

export default function EnchantedMinersLandingPage() {
  // ✅ Use whatever preview images you have in /public
  // These do NOT need to be real NFTs — just nice sample screenshots.
  const previewImages = [
    "/lockscreened-previews/miners.png",
    "/lockscreened-previews/miners.png",
    "/lockscreened-previews/miners.png",
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "0 0 90px",
        paddingTop: 64, // fixed nav height
        backgroundImage: `url(${ENCHANTED_MINERS_BG_IMAGE})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 18px 0" }}>
        <div style={{ display: "grid", gap: 14 }}>
          <h1 style={{ margin: 0, fontSize: 34, letterSpacing: "0.04em" }}>
            ENCHANTED MINERS
          </h1>

          <p style={{ margin: 0, opacity: 0.85, maxWidth: 720 }}>
            Phone-native wallpapers for Enchanted Miners holders. Connect your wallet on the next page
            to view your Miners, pick one, swap backgrounds, and export.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
            <Link
              href="/enchanted-miners-nfts"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: 44,
                padding: "0 16px",
                borderRadius: 999,
                textDecoration: "none",
                color: "#fff",
                background: "rgba(0,0,0,0.75)",
                border: "1px solid rgba(255,255,255,0.18)",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                fontSize: 12,
              }}
            >
              Enter (view my miners)
            </Link>

            <a
              href="https://discord.gg/mSNHRFdCkS"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: 44,
                padding: "0 16px",
                borderRadius: 999,
                textDecoration: "none",
                color: "#fff",
                background: "rgba(0,0,0,0.45)",
                border: "1px solid rgba(255,255,255,0.12)",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                fontSize: 12,
              }}
            >
              Community
            </a>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "6px 18px 0" }}>
        <PhoneShowcase
          title="How it looks"
          showHint={false}
          images={previewImages}
        />
      </section>
    </main>
  );
}
