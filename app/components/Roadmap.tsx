// app/components/Roadmap.tsx
// Static / SSR-safe roadmap timeline with three phases.

export default function Roadmap() {
  const phases = [
    {
      phase: "Phase 1",
      title: "Foundation • Community • Craft",
      points: [
        "Stand up core site experience and wallet-safe flows",
        "Iterate on collection design; trait naming, rarity review, and QA",
        "Public previews and progress logs; feedback loops with early supporters",
        "Community building across X and Discord: AMAs/Spaces, collab outreach, WL swaps",
        "Press kit + share assets (banners, device mockups) to help organic promotion",
      ],
    },
    {
      phase: "Phase 2",
      title: "Collection Release • Product Expansion",
      points: [
        "Public mint goes live (OG free mints and WL pricing honored)",
        "Open the site’s wallpaper saver for all major screens (mobile, tablet, desktop)",
        "Add themed background packs and seasonal drops",
        "Guides for ‘set as wallpaper’ on iOS/Android and desktop OSs",
        "Post-launch marketing: creator spotlights, collabs, and holder showcases",
      ],
    },
    {
      phase: "Phase 3",
      title: "Holder Perks • Engagement • Next Collections",
      points: [
        "Role-gated channels, quests, and a public leaderboard for active users",
        "Periodic 1/1 lotteries and surprise rewards for holders",
        "First access to new lockscreen collections and partner collabs",
        "Feature voting: holders help prioritize packs, presets, and site features",
        "Ongoing performance + UX improvements informed by analytics and community feedback",
      ],
    },
  ];

  return (
    <section className="rg-roadmap" aria-labelledby="roadmap-h">
      <h2 id="roadmap-h" className="title">ROADMAP</h2>

      <ol className="timeline" role="list">
        {phases.map((p, i) => (
          <li key={i} className="item">
            <div className="dot" aria-hidden />
            <div className="card">
              <div className="phase">{p.phase}</div>
              <h3 className="cardTitle">{p.title}</h3>
              <ul className="bullets">
                {p.points.map((pt, j) => (
                  <li key={j}>{pt}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>

      <style jsx>{`
        .rg-roadmap {
          max-width: 980px;
          margin: 0 auto;
          padding: 24px 18px 72px;
        }
        .title {
          text-align: center;
          font-size: 28px;
          margin: 8px 0 24px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-shadow:
            0 0 12px rgba(183,122,255,0.9),
            0 0 22px rgba(183,122,255,0.6);
        }

        .timeline {
          position: relative;
          list-style: none;
          margin: 0;
          padding: 0 0 0 18px; /* space for the spine dots */
        }
        .timeline:before {
          content: "";
          position: absolute;
          left: 9px;
          top: 18px;
          bottom: 18px;
          width: 2px;
          background: linear-gradient(
            to bottom,
            rgba(183,122,255,0.45),
            rgba(183,122,255,0.15)
          );
          border-radius: 2px;
        }

        .item {
          position: relative;
          margin: 18px 0 28px;
        }
        .dot {
          position: absolute;
          left: -2px;
          top: 10px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(183,122,255,1) 0%,
            rgba(183,122,255,0.25) 60%,
            rgba(183,122,255,0) 70%
          );
          box-shadow:
            0 0 16px rgba(183,122,255,0.9),
            0 0 28px rgba(183,122,255,0.7);
        }

        .card {
          margin-left: 22px;
          background: rgba(20,16,28,0.6);
          border: 1px solid rgba(183,122,255,0.25);
          border-radius: 14px;
          padding: 16px 18px 14px;
          box-shadow: 0 0 12px rgba(183,122,255,0.12) inset;
        }
        .phase {
          font-size: 12px;
          opacity: 0.8;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .cardTitle {
          margin: 0 0 8px;
          font-size: 18px;
          letter-spacing: 0.02em;
        }
        .bullets {
          margin: 0;
          padding-left: 18px;
          display: grid;
          gap: 6px;
          opacity: 0.95;
        }
        .bullets li {
          line-height: 1.5;
        }

        @media (max-width: 640px) {
          .title { font-size: 24px; }
          .card { padding: 14px 14px 12px; }
          .cardTitle { font-size: 16px; }
        }
      `}</style>
    </section>
  );
}
