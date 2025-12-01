// app/enchanted-miners/page.tsx
"use client";

import { useEffect, useState } from "react";

import PhoneShowcase from "../components/PhoneShowcase";
import type { BgChoice } from "../components/Composer";
import Roadmap from "../components/Roadmap";
import FAQ from "../components/FAQ";
import OgWLBanner from "../components/OgWLBanner";

/** ===== Tiny, self-contained countdown (fixed-left, compact, below header) ===== */
function CountdownSmall({ targetIso }: { targetIso: string }) {
  const target = new Date(targetIso);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  let diff = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(diff / 86400000);
  diff -= days * 86400000;
  const hours = Math.floor(diff / 3600000);
  diff -= hours * 3600000;
  const minutes = Math.floor(diff / 60000);
  diff -= minutes * 60000;
  const seconds = Math.floor(diff / 1000);

  return (
    <div className="cd">
      <div className="cd-title">ENCHANTED MINERS COLLECTION LAUNCH</div>
      <div className="cd-pills">
        <Pill v={days} label="DAYS" />
        <Pill v={hours} label="HOURS" />
        <Pill v={minutes} label="MINUTES" />
        <Pill v={seconds} label="SECONDS" />
      </div>

      <style jsx>{`
        .cd {
          position: absolute;
          left: clamp(12px, 7vw, 140px);
          top: 96px;
          transform: scale(0.82);
          transform-origin: left top;
          background: rgba(22, 25, 40, 0.6);
          backdrop-filter: blur(4px);
          border-radius: 12px;
          padding: 8px 10px;
          box-shadow:
            inset 0 0 0 1px rgba(145, 205, 255, 0.18),
            0 10px 24px rgba(0, 0, 0, 0.35);
          z-index: 4;
        }
        .cd-title {
          font-family: "VT323", monospace;
          color: #cfe8ff;
          font-size: 11px;
          letter-spacing: 0.06em;
          margin-bottom: 6px;
          white-space: nowrap;
        }
        .cd-pills {
          display: flex;
          gap: 8px;
        }

        @media (max-width: 1200px) {
          .cd {
            top: 90px;
            transform: scale(0.8);
          }
        }
        @media (max-width: 980px) {
          .cd {
            top: 84px;
            transform: scale(0.78);
          }
        }
        @media (max-width: 760px) {
          .cd {
            left: 12px;
            top: 76px;
            transform: scale(0.76);
          }
        }
        @media (max-width: 560px) {
          .cd {
            top: 68px;
            transform: scale(0.74);
          }
        }
        @media (max-width: 420px) {
          .cd {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

function Pill({ v, label }: { v: number; label: string }) {
  const vv = String(v).padStart(2, "0");
  return (
    <>
      <div className="pill" role="group" aria-label={label.toLowerCase()}>
        <div className="num">{vv}</div>
        <div className="txt">{label}</div>
      </div>

      <style jsx>{`
        .pill {
          min-width: 56px;
          padding: 7px 9px;
          border-radius: 10px;
          background:
            radial-gradient(
              120% 200% at 80% 0%,
              rgba(145, 205, 255, 0.24),
              rgba(16, 40, 66, 0.18) 60%,
              rgba(16, 40, 66, 0.1) 100%
            ),
            rgba(17, 32, 54, 0.5);
          box-shadow:
            inset 0 0 0 1px rgba(145, 205, 255, 0.22),
            0 6px 14px rgba(0, 0, 0, 0.33);
          display: grid;
          justify-items: center;
          gap: 2px;
        }
        .num {
          font-family: "VT323", monospace;
          font-size: 20px;
          color: #ffffff;
          line-height: 1;
          text-shadow: 0 0 8px rgba(145, 205, 255, 0.7);
        }
        .txt {
          font-size: 9px;
          letter-spacing: 0.06em;
          color: #cfe8ff;
          opacity: 0.9;
        }
      `}</style>
    </>
  );
}
/** ===== End countdown ===== */

export default function HomePage() {
  const SHOW_COUNTDOWN = false;

  const demoImages = [
    "/demo/enchanted-1.png",
    "/demo/enchanted-2.png",
    "/demo/enchanted-3.png",
    "/demo/enchanted-4.png",
  ];

  const bg: BgChoice = { kind: "color", value: "#152333" };

  const TARGET_PST = "2026-01-01T12:00:00-08:00";

  return (
    <main className="home-wrap">
      <OgWLBanner />

      <section className="hero">
        <h1 className="title">ENCHANTED MINERS LOCKSCREEN LOCKER</h1>
        <p className="subtitle">
          Download your Enchanted Miners NFT with a perfectly tuned background—
          sized for any phone.
        </p>
        {SHOW_COUNTDOWN && <CountdownSmall targetIso={TARGET_PST} />}
      </section>

      <div className="showcase-wrap">
        <PhoneShowcase
          images={demoImages}
          intervalMs={3000}
          bg={bg}
          title="How it looks"
          showHint={false}
        />
      </div>

      <ScrollHint targetId="roadmap" />

      <section id="roadmap" className="roadmap-wrap">
        <Roadmap />
      </section>

      <FAQ />

      <style jsx>{`
        .home-wrap {
          display: grid;
          gap: 20px;
          justify-items: center;
          padding: 2px 12px 48px;
          position: relative;
        }

        /* BACKGROUND IMAGE – brings your enchanted-miners-bg.png back */
        .home-wrap::before {
          content: "";
          position: fixed;
          inset: 0;
          background-image: url("/enchanted-miners-bg.png");
          background-size: cover;
          background-position: center bottom;
          background-repeat: no-repeat;
          z-index: -1;
        }

        .hero {
          position: relative;
          display: grid;
          gap: 8px;
          justify-items: center;
          margin-top: 0;
          width: 100%;
        }

        .title {
          margin: 6px 0 0;
          text-align: center;
          font-family: "Oswald", system-ui, -apple-system, Segoe UI, Roboto,
            Ubuntu, Cantarell, "Helvetica Neue", Arial;
          font-weight: 800;
          font-size: clamp(28px, 4.2vw, 56px);
          letter-spacing: 1px;
          color: #ff5ba8;
          text-shadow:
            0 0 6px rgba(255, 91, 168, 0.7),
            0 0 16px rgba(214, 62, 136, 0.6);
          line-height: 1.05;
          white-space: nowrap;
        }

        .subtitle {
          margin: 0;
          text-align: center;
          color: #e34792;
          font-size: 15px;
          letter-spacing: 0.3px;
          text-shadow: 0 0 4px rgba(227, 71, 146, 0.4);
        }

        .showcase-wrap {
          margin-top: 10px;
        }

        @media (max-width: 420px) {
          .title {
            white-space: normal;
            line-height: 1.1;
            font-size: clamp(22px, 7vw, 34px);
          }
        }

        .roadmap-wrap {
          margin-top: -6px;
        }
      `}</style>
    </main>
  );
}

function ScrollHint({ targetId }: { targetId: string }) {
  return (
    <>
      <button
        className="scroll-hint"
        aria-label="Scroll to roadmap"
        onClick={() => {
          const el = document.getElementById(targetId);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      >
        <span className="chev" aria-hidden>
          ▼
        </span>
      </button>

      <style jsx>{`
        .scroll-hint {
          position: sticky;
          top: 8px;
          margin-top: -4px;
          border: 0;
          background: transparent;
          cursor: pointer;
          display: grid;
          place-items: center;
          width: 42px;
          height: 28px;
          opacity: 0.8;
          transition: opacity 0.2s ease, transform 0.2s ease;
          z-index: 5;
        }
        .scroll-hint:hover {
          opacity: 1;
          transform: translateY(-1px);
        }
        .chev {
          font-family: "VT323", monospace;
          font-size: 18px;
          line-height: 1;
          color: #ff5ba8;
          text-shadow:
            0 0 8px rgba(255, 91, 168, 0.65),
            0 0 14px rgba(214, 62, 136, 0.45);
          animation: pulse 1.8s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.85;
          }
          50% {
            transform: translateY(4px);
            opacity: 1;
          }
        }
        @media (max-width: 420px) {
          .scroll-hint {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
