// app/page.tsx
"use client";

import { useEffect, useState } from "react";

import PhoneShowcase from "./components/PhoneShowcase";
import type { BgChoice } from "./components/Composer";
import Roadmap from "./components/Roadmap";
import FAQ from "./components/FAQ";
import OgWLBanner from "./components/OgWLBanner";

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
      <div className="cd-title">RETROGRAVE COLLECTION LAUNCH</div>
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
          top: 96px;               /* Keep this; still clears the header nicely */
          transform: scale(0.82);
          transform-origin: left top;
          background: rgba(22, 14, 35, 0.55);
          backdrop-filter: blur(4px);
          border-radius: 12px;
          padding: 8px 10px;
          box-shadow:
            inset 0 0 0 1px rgba(183,122,255,0.14),
            0 10px 24px rgba(0,0,0,0.35);
          z-index: 4;
        }
        .cd-title {
          font-family: "VT323", monospace;
          color: #cdb8ff;
          font-size: 11px;
          letter-spacing: 0.06em;
          margin-bottom: 6px;
          white-space: nowrap;
        }
        .cd-pills { display: flex; gap: 8px; }

        @media (max-width: 1200px) {
          .cd { top: 90px; transform: scale(0.80); }
        }
        @media (max-width: 980px) {
          .cd { top: 84px; transform: scale(0.78); }
        }
        @media (max-width: 760px) {
          .cd { left: 12px; top: 76px; transform: scale(0.76); }
        }
        @media (max-width: 560px) {
          .cd { top: 68px; transform: scale(0.74); }
        }
        @media (max-width: 420px) {
          .cd { display: none; }
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
            radial-gradient(120% 200% at 80% 0%,
              rgba(183,122,255,0.24),
              rgba(30,12,60,0.18) 60%,
              rgba(30,12,60,0.1) 100%),
            rgba(32,18,48,0.5);
          box-shadow:
            inset 0 0 0 1px rgba(183,122,255,0.22),
            0 6px 14px rgba(0,0,0,0.33);
          display: grid;
          justify-items: center;
          gap: 2px;
        }
        .num {
          font-family: "VT323", monospace;
          font-size: 20px;
          color: #fff;
          line-height: 1;
          text-shadow: 0 0 8px rgba(183,122,255,0.7);
        }
        .txt {
          font-size: 9px;
          letter-spacing: 0.06em;
          color: #cdb8ff;
          opacity: 0.85;
        }
      `}</style>
    </>
  );
}
/** ===== End countdown ===== */

export default function HomePage() {
  const SHOW_COUNTDOWN = true;

  // Demo images: put these in /public/demo/ (or replace with remote URLs)
  const demoImages = [
    "/demo/1.png",
    "/demo/2.png",
    "/demo/3.png",
    "/demo/4.png",
    "/demo/5.png",
    "/demo/6.png",
  ];

  const bg: BgChoice = { kind: "color", value: "#3e2d75" };

  // Jan 1, 2026 12:00 PM PST (-08:00 on that date)
  const TARGET_PST = "2026-01-01T12:00:00-08:00";

  return (
    <main className="home-wrap">
      <OgWLBanner />

      {/* Hero is tight to the top now */}
      <section className="hero">
        <h1 className="title">RETROGRAVE LOCKSCREEN LOCKER</h1>
        <p className="subtitle">
          Download your NFT with the perfect background—sized for any phone.
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
          padding: 2px 12px 48px; /* ⬅ tighter top padding */
        }

        .hero {
          position: relative;
          display: grid;
          gap: 8px;               /* slightly tighter vertical rhythm */
          justify-items: center;
          margin-top: 0;          /* ⬅ remove extra top margin */
          width: 100%;
        }

        .title {
          margin: 6px 0 0;        /* ⬅ was 12px; pulls headline up */
          text-align: center;
          font-family: "Oswald", system-ui, -apple-system, Segoe UI, Roboto, Ubuntu,
            Cantarell, "Helvetica Neue", Arial;
          font-weight: 800;
          font-size: clamp(28px, 4.2vw, 56px);
          letter-spacing: 1px;
          color: #ffffff;
          text-shadow:
            0 0 8px rgba(183, 122, 255, 0.6),
            0 0 18px rgba(183, 122, 255, 0.35);
          line-height: 1.05;
          white-space: nowrap;
        }

        .subtitle {
          margin: 0;
          text-align: center;
          color: #bda3ff;
          font-size: 15px;
          letter-spacing: 0.3px;
        }

        .showcase-wrap { margin-top: 10px; } /* ⬅ a bit tighter under subtitle */

        @media (max-width: 420px) {
          .title {
            white-space: normal;
            line-height: 1.1;
            font-size: clamp(22px, 7vw, 34px);
          }
        }

        .roadmap-wrap { margin-top: -6px; }
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
        .scroll-hint:hover { opacity: 1; transform: translateY(-1px); }
        .chev {
          font-family: "VT323", monospace;
          font-size: 18px;
          line-height: 1;
          color: #ffffff;
          text-shadow:
            0 0 8px rgba(183,122,255,.65),
            0 0 14px rgba(183,122,255,.45);
          animation: pulse 1.8s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: translateY(0); opacity: .85; }
          50%      { transform: translateY(4px); opacity: 1; }
        }
        @media (max-width: 420px) {
          .scroll-hint { display: none; }
        }
      `}</style>
    </>
  );
}
