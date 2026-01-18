"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const EXAMPLE_INSCRIPTION =
  "f362c61d2d77abea3fff98f86ef2c45f13710692d38f13740f74d2f7ca6063b2i0";

export default function DogeMinersPage() {
  const router = useRouter();
  const [inscription, setInscription] = useState("");

  const clean = useMemo(() => (inscription || "").trim(), [inscription]);

  const go = (id: string) => {
    const v = (id || "").trim();
    if (!v) return;
    const qs = new URLSearchParams();
    qs.set("inscription", v);

    // ✅ IMPORTANT: go to the working preview page (not /project-nft)
    router.push(`/doge-miners-nfts?${qs.toString()}`);
  };

  return (
    <main className="dm-wrap">
      <section className="dm-inner">
        <div className="left">
          <h1 className="title">DOGE MINERS</h1>
          <h2 className="subtitle">INSCRIPTION LOADER</h2>

          <p className="copy">
            Paste a Doge inscription ID and we’ll load the image from Doggy Market, then send it into
            your Locker flow.
            <br />
            <span className="muted">(No wallet connect needed for this mode.)</span>
          </p>

          <div className="row">
            <input
              className="input"
              placeholder="Paste Inscription ID…"
              value={inscription}
              onChange={(e) => setInscription(e.target.value)}
              spellCheck={false}
            />

            <button className="btn" type="button" onClick={() => go(clean)} disabled={!clean}>
              Load Inscription →
            </button>

            <button
              className="btn ghost"
              type="button"
              onClick={() => {
                setInscription(EXAMPLE_INSCRIPTION);
                go(EXAMPLE_INSCRIPTION);
              }}
            >
              Paste Example
            </button>
          </div>

          <p className="tip">
            Tip: In Doggy Market, open an item → NFT Details → copy “Inscription ID”. Paste it here.
          </p>
        </div>

        <div className="right">
          <div className="phoneMock">
            <div className="phoneMockInner">
              <div className="brandSmall">LOCKSCREENED</div>
              <div className="projSmall">Doge Miners</div>
              <div className="descSmall">Paste inscription → preview → open in locker</div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .dm-wrap {
          min-height: 100vh;
          padding: 28px 16px 60px;
          background-color: #05020a;
          background-image: url("/doge-miners-bg.png");
          background-repeat: no-repeat;
          background-position: center top;
          background-size: cover;
          background-attachment: fixed;
        }

        .dm-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 22px;
          align-items: start;
          background: rgba(10, 8, 20, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 22px;
          padding: 18px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .title {
          margin: 2px 0 6px;
          font-size: 34px;
          font-weight: 950;
          letter-spacing: 0.02em;
          color: white;
          text-transform: uppercase;
        }

        .subtitle {
          margin: 0 0 12px;
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 0.18em;
          color: rgba(255, 255, 255, 0.85);
          text-transform: uppercase;
        }

        .copy {
          margin: 0 0 14px;
          color: rgba(255, 255, 255, 0.88);
          line-height: 1.45;
          font-size: 13px;
        }

        .muted {
          opacity: 0.9;
        }

        .row {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 10px;
          align-items: center;
          margin-top: 10px;
        }

        .input {
          height: 42px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(0, 0, 0, 0.35);
          color: rgba(255, 255, 255, 0.95);
          padding: 0 12px;
          outline: none;
        }

        .btn {
          height: 42px;
          padding: 0 14px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(140, 90, 255, 0.28);
          color: white;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-size: 11px;
          cursor: pointer;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn.ghost {
          background: rgba(255, 255, 255, 0.08);
        }

        .tip {
          margin: 10px 0 0;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.78);
        }

        .right {
          display: grid;
          justify-items: center;
        }

        .phoneMock {
          width: min(360px, 92vw);
          aspect-ratio: 9 / 19.5;
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(0, 0, 0, 0.22);
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.45);
          overflow: hidden;
          display: grid;
          place-items: end center;
          padding: 18px;
        }

        .phoneMockInner {
          width: 100%;
          padding: 14px;
          border-radius: 18px;
          background: rgba(10, 8, 20, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.14);
          text-align: center;
        }

        .brandSmall {
          font-weight: 900;
          letter-spacing: 0.16em;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.75);
          text-transform: uppercase;
        }

        .projSmall {
          margin-top: 6px;
          font-weight: 950;
          letter-spacing: 0.04em;
          font-size: 16px;
          color: white;
        }

        .descSmall {
          margin-top: 6px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.78);
        }

        @media (max-width: 900px) {
          .dm-inner {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
