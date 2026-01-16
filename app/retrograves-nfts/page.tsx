// app/retrograves-nfts/page.tsx
"use client";

export const dynamic = "force-dynamic";

/**
 * =========================
 *  RETROGRAVE OWNER GRID
 * =========================
 *
 * For now: DEMO grid (collection not live yet).
 * Later: we can replace the demo grid with real wallet fetching (Showcase/NftGrid workflow),
 * without touching other projects.
 */

const RETROGRAVE_BG_IMAGE = "/bg-retrograve.png"; // change if you have a specific bg image

const DEMO_ITEMS = [
  { name: "RETROGRAVE DEMO #1", image: "/demo/1.png" },
  { name: "RETROGRAVE DEMO #2", image: "/demo/2.png" },
  { name: "RETROGRAVE DEMO #3", image: "/demo/3.png" },
  { name: "RETROGRAVE DEMO #4", image: "/demo/4.png" },
  { name: "RETROGRAVE DEMO #5", image: "/demo/5.png" },
  { name: "RETROGRAVE DEMO #6", image: "/demo/6.png" },
];

export default function RetrogravesOwnerGridPage() {
  return (
    <main className="retrograve-grid-page">
      <div className="inner">
        <p className="back-row">
          <a href="/retrograve" className="back-link">
            ← BACK TO RETROGRAVE
          </a>
        </p>

        <header className="page-header">
          <h1 className="page-title">MY RETROGRAVES</h1>
          <p className="page-subtitle">
            Collection is not live yet — using demo items for testing.
          </p>
        </header>

        <div className="demo-grid" aria-label="RetroGrave demo grid">
          {DEMO_ITEMS.map((it) => (
            <button
              key={it.name}
              type="button"
              className="card"
              onClick={() => {
                // For now we just keep you on the project ecosystem.
                // Later: this will route into the locker with the selected NFT.
                alert(
                  `Selected: ${it.name}\n\nNext step:\nOnce collection is live, this click will open the locker with your NFT.`
                );
              }}
            >
              <div className="imgWrap">
                <img src={it.image} alt={it.name} />
              </div>
              <div className="meta">
                <div className="name">{it.name}</div>
                <div className="hint">DEMO</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .retrograve-grid-page {
          min-height: 100vh;

          /* cancel TopNav spacer safely (same pattern as magapixel page) */
          margin-top: -64px;
          padding: 0 18px 48px;

          background-image: url(${RETROGRAVE_BG_IMAGE});
          background-size: cover;
          background-position: center top;
          background-repeat: no-repeat;

          /* fallback if bg missing */
          background-color: #0a0714;
        }

        .inner {
          max-width: 1200px;
          margin: 0 auto;
          padding-top: 32px;
        }

        .back-row {
          margin: 0 0 16px;
        }

        .back-link {
          font-family: "VT323", monospace;
          font-size: 14px;
          letter-spacing: 0.08em;
          text-decoration: none;
          color: rgba(255, 255, 255, 0.85);
          opacity: 0.85;
        }

        .back-link:hover {
          opacity: 1;
        }

        .page-header {
          margin-bottom: 22px;
        }

        .page-title {
          margin: 0;
          font-size: 32px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #ffffff;
          text-shadow: 0 2px 18px rgba(0, 0, 0, 0.35);
        }

        .page-subtitle {
          margin: 6px 0 0;
          max-width: 680px;
          opacity: 0.92;
          color: rgba(255, 255, 255, 0.92);
          text-shadow: 0 2px 18px rgba(0, 0, 0, 0.35);
        }

        .demo-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .card {
          border: 0;
          background: rgba(15, 10, 28, 0.55);
          backdrop-filter: blur(6px);
          border-radius: 16px;
          padding: 10px;
          cursor: pointer;
          text-align: left;

          box-shadow:
            inset 0 0 0 1px rgba(183, 122, 255, 0.18),
            0 18px 34px rgba(0, 0, 0, 0.35);

          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow:
            inset 0 0 0 1px rgba(183, 122, 255, 0.28),
            0 22px 40px rgba(0, 0, 0, 0.45);
        }

        .imgWrap {
          border-radius: 12px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.25);
          aspect-ratio: 9 / 16;
          display: grid;
          place-items: center;
        }

        .imgWrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .meta {
          margin-top: 10px;
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: baseline;
        }

        .name {
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.2;
        }

        .hint {
          font-size: 11px;
          letter-spacing: 0.14em;
          opacity: 0.7;
          color: rgba(205, 184, 255, 0.95);
          text-transform: uppercase;
          white-space: nowrap;
        }

        @media (max-width: 1100px) {
          .demo-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .demo-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 420px) {
          .demo-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Optional: RetroGrave-only topnav tint, if you ever want it.
         Leaving default for now to reduce moving parts. */}
    </main>
  );
}
