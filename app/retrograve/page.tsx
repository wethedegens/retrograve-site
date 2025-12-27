// app/retrograve/page.tsx
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
          top: 110px;
          transform: scale(0.82);
          transform-origin: left top;
          background: rgba(22, 14, 35, 0.55);
          backdrop-filter: blur(4px);
          border-radius: 12px;
          padding: 8px 10px;
          box-shadow:
            inset 0 0 0 1px rgba(183, 122, 255, 0.14),
            0 10px 24px rgba(0, 0, 0, 0.35);
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
        .cd-pills {
          display: flex;
          gap: 8px;
        }

        @media (max-width: 760px) {
          .cd {
            top: 96px;
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
      <div className="pill">
        <div className="num">{vv}</div>
        <div className="txt">{label}</div>
      </div>

      <style jsx>{`
        .pill {
          min-width: 56px;
          padding: 7px 9px;
          border-radius: 10px;
          background: rgba(32, 18, 48, 0.5);
          box-shadow:
            inset 0 0 0 1px rgba(183, 122, 255, 0.22),
            0 6px 14px rgba(0, 0, 0, 0.33);
          display: grid;
          justify-items: center;
          gap: 2px;
        }
        .num {
          font-family: "VT323", monospace;
          font-size: 20px;
          color: #fff;
        }
        .txt {
          font-size: 9px;
          letter-spacing: 0.06em;
          color: #cdb8ff;
        }
      `}</style>
    </>
  );
}

export default function HomePage() {
  const demoImages = [
    "/demo/1.png",
    "/demo/2.png",
    "/demo/3.png",
    "/demo/4.png",
    "/demo/5.png",
    "/demo/6.png",
  ];

  const bg: BgChoice = { kind: "color", value: "#3e2d75" };
  const TARGET_PST = "2026-01-01T12:00:00-08:00";

  return (
    <main className="home-wrap">
      <OgWLBanner />

      {/* HERO */}
      <section className="hero">
        <h1 className="title">RETROGRAVE LOCKSCREEN LOCKER</h1>
        <p className="subtitle">
          Download your NFT with the perfect background—sized for any phone.
        </p>
        <CountdownSmall targetIso={TARGET_PST} />
      </section>

      {/* SHOWCASE (collapsed height) */}
      <div className="showcase-wrap">
        <div className="phone-shell">
          <PhoneShowcase
            images={demoImages}
            intervalMs={3000}
            bg={bg}
            title="How it looks"
            showHint={false}
            fit="cover"
          />
        </div>
      </div>

      {/* ROADMAP */}
      <section id="roadmap" className="roadmap-wrap">
        <Roadmap />
      </section>

      <FAQ />

      <style jsx>{`
        .home-wrap {
          display: grid;
          justify-items: center;
          gap: 0px;
          padding: 40px 12px 48px;
        }

        .hero {
          position: relative;
          display: grid;
          gap: 2px;
          justify-items: center;
          width: 100%;
        }

        .title {
          margin: 0;
          text-align: center;
          font-weight: 800;
          font-size: clamp(28px, 4.2vw, 56px);
          color: #fff;
          text-shadow:
            0 0 8px rgba(183, 122, 255, 0.6),
            0 0 18px rgba(183, 122, 255, 0.35);
        }

        .subtitle {
          margin: 0;
          text-align: center;
          color: #bda3ff;
          font-size: 15px;
        }

        /* ✅ KEY FIX:
           PhoneShowcase likely reserves extra vertical space.
           We "collapse" the container by controlling height and absolutely positioning the phone. */
        .showcase-wrap {
          position: relative;
          width: 100%;
          display: flex;
          justify-content: center;

          /* roughly the visible phone height area after scale(0.7)
             (tweakable, but this removes the giant dead space) */
          height: 520px;

          margin-top: 6px;
        }

        .phone-shell {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%) translateY(-6px) scale(0.7);
          transform-origin: top center;
          filter: drop-shadow(0 22px 36px rgba(0, 0, 0, 0.35));
        }

        /* ✅ Now roadmap can sit right under the collapsed phone area */
        .roadmap-wrap {
          width: 100%;
          display: flex;
          justify-content: center;

          margin-top: -10px;
          padding-top: 0;
        }

        @media (max-width: 900px) {
          .showcase-wrap {
            height: 560px;
          }
          .phone-shell {
            transform: translateX(-50%) translateY(-4px) scale(0.78);
          }
        }

        @media (max-width: 520px) {
          .showcase-wrap {
            height: 520px;
          }
        }
      `}</style>
    </main>
  );
}
