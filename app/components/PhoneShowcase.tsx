// app/components/PhoneShowcase.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Slides: put 1.png ... 6.png in /public/demo/
 *   public/demo/1.png ... public/demo/6.png
 * Best size: 1440x3200 (but any aspect will be contained & bottom-aligned)
 */
const SLIDES = [1, 2, 3, 4, 5, 6].map((n) => `/demo/${n}.png`);

export default function PhoneShowcase() {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Preload once so the loop is smooth
  useEffect(() => {
    SLIDES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Autoplay: 3s per slide
  useEffect(() => {
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIdx((i) => (i + 1) % SLIDES.length);
    }, 3000);
    return () => {
      timerRef.current && clearInterval(timerRef.current);
    };
  }, []);

  const goTo = (n: number) => setIdx(n);

  const current = useMemo(() => SLIDES[idx], [idx]);

  return (
    <section className="show-wrap" aria-label="Phone demo">
      <div className="phone">
        {/* Bezel */}
        <div className="bezel">
          {/* Screen area */}
          <div className="screen">
            {/* The image is strictly contained & bottom aligned */}
            <img src={current} alt="" />
          </div>
        </div>

        {/* Dots */}
        <div className="dots" role="tablist" aria-label="Slides">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === idx ? "active" : ""}`}
              aria-label={`Go to slide ${i + 1}`}
              aria-selected={i === idx}
              role="tab"
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .show-wrap {
          display: grid;
          place-items: center;
          gap: 16px;
        }

        /* Phone shell */
        .phone {
          display: grid;
          gap: 10px;
          justify-items: center;
        }

        /* Outer frame with glow */
        .bezel {
          position: relative;
          width: min(220px, 42vw);
          aspect-ratio: 9 / 19.5;           /* keeps a realistic phone ratio */
          border-radius: 22px;
          background: #261c34;
          box-shadow: 0 14px 36px rgba(0, 0, 0, 0.55);
          padding: 8px;                      /* bezel thickness */
          display: grid;
        }

        /* Phone screen zone */
        .screen {
          position: relative;
          border-radius: 16px;
          background: #2f2450;
          overflow: hidden;
          display: grid;
          align-items: end;                  /* bottom-align the content */
          justify-items: center;
        }

        /* The image is strictly contained & bottom aligned */
        .screen img {
          width: 100%;
          height: 100%;
          object-fit: contain;               /* downscale when needed */
          object-position: bottom center;    /* sit on the bottom "chin" */
          image-rendering: pixelated;        /* crisp pixels for NFT look */
          display: block;
        }

        /* Pager dots */
        .dots {
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: center;
          margin-top: 2px;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          border: 1px solid #7f64d6;
          background: #000;
          opacity: 0.7;
          box-shadow: 0 0 4px rgba(127, 100, 214, 0.5);
          transition: transform 0.15s ease, opacity 0.15s ease,
            box-shadow 0.15s ease, background 0.15s ease;
        }
        .dot:hover {
          transform: scale(1.15);
          opacity: 1;
          box-shadow: 0 0 8px rgba(183, 122, 255, 0.8);
        }
        .dot.active {
          background: #bda3ff;
          opacity: 1;
          box-shadow: 0 0 10px rgba(183, 122, 255, 0.9);
        }

        @media (min-width: 1024px) {
          .bezel {
            width: 260px; /* a little bigger on desktop */
          }
        }
      `}</style>
    </section>
  );
}
