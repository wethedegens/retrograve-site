// app/enchanted-miners/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

export default function EnchantedMinersLandingPage() {
  const demoImages = useMemo(
    () => [
      "/demo/enchanted-1.png",
      "/demo/enchanted-2.png",
      "/demo/enchanted-3.png",
      "/demo/enchanted-4.png",
    ],
    []
  );

  const [idx, setIdx] = useState(0);

  // rotate every 3 seconds
  useEffect(() => {
    if (!demoImages.length) return;

    const t = window.setInterval(() => {
      setIdx((p) => (p + 1) % demoImages.length);
    }, 3000);

    return () => window.clearInterval(t);
  }, [demoImages]);

  const activeSrc = demoImages[idx] || "";

  // ✅ Hard override for THIS route:
  // 1) Force body/html background to miners bg
  // 2) Hide any global "mountains / bottom art" overlay that layout might be injecting
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const prevHtmlBg = html.style.backgroundImage;
    const prevHtmlBgColor = html.style.backgroundColor;

    const prevBodyBg = body.style.backgroundImage;
    const prevBodyBgColor = body.style.backgroundColor;
    const prevBodyBgSize = body.style.backgroundSize;
    const prevBodyBgPos = body.style.backgroundPosition;
    const prevBodyBgRep = body.style.backgroundRepeat;
    const prevBodyBgAttach = body.style.backgroundAttachment;

    // force html/body background (beats most normal CSS)
    html.style.backgroundColor = "#05020A";
    html.style.backgroundImage = "none";

    body.style.backgroundColor = "#05020A";
    body.style.backgroundImage = "url('/enchanted-miners-bg.png?v=999')";
    body.style.backgroundRepeat = "no-repeat";
    body.style.backgroundPosition = "center";
    body.style.backgroundSize = "cover";
    body.style.backgroundAttachment = "fixed";

    return () => {
      html.style.backgroundImage = prevHtmlBg;
      html.style.backgroundColor = prevHtmlBgColor;

      body.style.backgroundImage = prevBodyBg;
      body.style.backgroundColor = prevBodyBgColor;
      body.style.backgroundSize = prevBodyBgSize;
      body.style.backgroundPosition = prevBodyBgPos;
      body.style.backgroundRepeat = prevBodyBgRep;
      body.style.backgroundAttachment = prevBodyBgAttach;
    };
  }, []);

  return (
    <main className="miners-wrapper">
      {/* ✅ GLOBAL OVERRIDES (kills the retrograve mountains/logo overlay if layout injects it) */}
      <style jsx global>{`
        /* Force background (in case inline styles lose to something weird) */
        html,
        body {
          background-color: #05020a !important;
          background-image: url("/enchanted-miners-bg.png?v=999") !important;
          background-repeat: no-repeat !important;
          background-position: center !important;
          background-size: cover !important;
          background-attachment: fixed !important;
        }

        /*
          Hide common "bottom art / mountains" wrappers.
          One of these is almost certainly what you’re seeing.
        */
        .bg-mountains,
        .bottom-art,
        .bottomArt,
        .retrograve-bottom,
        .retrograve-footer,
        .footer-art,
        .mountains,
        .mountain-wrap,
        .mountains-wrap,
        .parallax-mountains,
        #bg-mountains,
        #mountains {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>

      <section className="intro">
        <h1 className="miners-title">ENCHANTED MINERS LOCKSCREEN LOCKER</h1>
        <p className="miners-sub">
          Download your Enchanted Miners NFT with a perfectly tuned background—
          sized for any phone.
        </p>
      </section>

      <section className="demo-wrap">
        <div className="phone-shell">
          <div className="phone-screen">
            <img
              key={activeSrc}
              src={activeSrc}
              alt="Enchanted Miners lockscreen preview"
              className="demo-img"
              draggable={false}
            />
          </div>
        </div>
      </section>

      <style jsx>{`
        .miners-wrapper {
          min-height: 100vh;
          padding-bottom: 80px;
        }

        .intro {
          text-align: center;
          margin-top: 40px;
          padding: 0 16px;
        }

        .miners-title {
          font-size: 38px;
          font-weight: 800;
          letter-spacing: 0.06em;
          margin-bottom: 8px;
          color: #ffffff;
          text-transform: uppercase;
        }

        .miners-sub {
          font-size: 15px;
          opacity: 0.85;
          margin-bottom: 32px;
          color: #ffffff;
        }

        .demo-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 8px 16px 40px;
        }

        .phone-shell {
          width: 360px;
          max-width: 92vw;
          border-radius: 34px;
          padding: 14px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 18px 55px rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(6px);
        }

        .phone-screen {
          width: 100%;
          aspect-ratio: 9 / 19.5;
          border-radius: 26px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .demo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          user-select: none;
        }

        /* ~25% smaller on small screens */
        @media (max-width: 520px) {
          .miners-title {
            font-size: 30px;
          }

          .phone-shell {
            width: 270px;
            padding: 12px;
            border-radius: 30px;
          }

          .phone-screen {
            border-radius: 22px;
          }
        }
      `}</style>
    </main>
  );
}
