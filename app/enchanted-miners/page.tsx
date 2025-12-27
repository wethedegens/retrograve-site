// app/enchanted-miners/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";

import NftGrid, { NFT } from "../components/NftGrid";

export default function EnchantedMinersPage() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();

  const owner = publicKey?.toBase58() || "";

  const [miners, setMiners] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // You can hard-code filters here later if you want only Miners.
  // For now we rely on your existing /api/nfts behavior (same pattern as other pages).
  // If your /api/nfts needs a "project" flag, we send it below.
  const body = useMemo(() => {
    return JSON.stringify({ owner, project: "miners" });
  }, [owner]);

  useEffect(() => {
    if (!connected || !owner) {
      setMiners([]);
      setError(null);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const r = await fetch("/api/nfts", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body,
          cache: "no-store",
        });

        if (!r.ok) {
          const msg = await r.text().catch(() => String(r.status));
          throw new Error(msg);
        }

        const data = (await r.json()) as NFT[];
        if (!cancelled) setMiners(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load NFTs");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [connected, owner, body]);

  // =========================
  //  NOT CONNECTED: LANDING
  // =========================
  if (!connected) {
    return (
      <main className="miners-wrapper">
        <section className="miners-hero">
          <div className="miners-left">
            <h1 className="miners-title">ENCHANTED MINERS</h1>
            <h2 className="miners-subtitle">LOCKSCREEN LOCKER</h2>

            <p className="miners-blurb">
              Download your Enchanted Miners NFT with a perfectly tuned background —
              sized for any phone.
            </p>

            <div className="miners-cta-row">
              <button
                className="miners-cta"
                onClick={() => {
                  // wallet button is in nav; this is just a helper scroll-to-top
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                CONNECT WALLET ABOVE
              </button>

              <a
                className="miners-cta ghost"
                href="https://discord.gg/mSNHRFdCkS"
                target="_blank"
                rel="noopener noreferrer"
              >
                JOIN DISCORD
              </a>
            </div>
          </div>

          <div className="miners-right">
            <div className="miners-phone">
              <div className="miners-phone-screen" />
            </div>
          </div>
        </section>

        <style jsx>{`
          .miners-wrapper {
            min-height: 100vh;
            margin-top: 64px; /* account for fixed nav */
            padding: 0;
            background: transparent;
          }

          .miners-hero {
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            gap: 40px;
            align-items: center;
            padding: 60px 24px;
            max-width: 1200px;
            margin: 0 auto;
          }

          .miners-title {
            margin: 0;
            font-size: 48px;
            letter-spacing: 0.08em;
            font-weight: 900;
          }
          .miners-subtitle {
            margin: 6px 0 0;
            font-size: 34px;
            letter-spacing: 0.06em;
            font-weight: 800;
            opacity: 0.95;
          }

          .miners-blurb {
            margin: 16px 0 0;
            max-width: 520px;
            opacity: 0.8;
            line-height: 1.5;
          }

          .miners-cta-row {
            display: flex;
            gap: 12px;
            margin-top: 18px;
            flex-wrap: wrap;
          }

          .miners-cta {
            padding: 12px 16px;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.18);
            background: rgba(0, 0, 0, 0.45);
            color: #fff;
            font-weight: 800;
            letter-spacing: 0.06em;
            cursor: pointer;
          }

          .miners-cta.ghost {
            background: transparent;
          }

          .miners-right {
            display: grid;
            place-items: center;
          }

          .miners-phone {
            width: 320px;
            height: 640px;
            border-radius: 28px;
            background: rgba(0, 0, 0, 0.25);
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
            padding: 16px;
          }

          .miners-phone-screen {
            width: 100%;
            height: 100%;
            border-radius: 22px;
            background: rgba(155, 0, 255, 0.65);
          }

          @media (max-width: 900px) {
            .miners-hero {
              grid-template-columns: 1fr;
              padding: 34px 16px;
            }
          }
        `}</style>
      </main>
    );
  }

  // =========================
  //  CONNECTED: OWNER GRID
  // =========================
  return (
    <main style={{ padding: "18px 0 80px", marginTop: 64 }}>
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 18px" }}>
        <h1 style={{ margin: "8px 0 8px", fontSize: 28, letterSpacing: "0.04em" }}>
          MY MINERS
        </h1>

        <p style={{ margin: 0, opacity: 0.75 }}>
          Showing Enchanted Miners owned by your connected wallet.
        </p>

        <div style={{ height: 16 }} />

        {loading && <p style={{ opacity: 0.8 }}>Loading…</p>}
        {error && (
          <p style={{ opacity: 0.9, color: "#ffb3b3" }}>
            {error}
          </p>
        )}

        {!loading && !error && <NftGrid nfts={miners} />}
      </section>
    </main>
  );
}
