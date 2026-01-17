// app/page.tsx
"use client";

import Link from "next/link";
import LockscreenedFAQ from "./components/LockscreenedFAQ";

type LockerProject = {
  name: string;
  status: "live" | "coming";
  label: string;
  lockerPath: string;
  glow: string;
  preview?: string;
};

const PROJECTS: LockerProject[] = [
  {
    name: "RetroGrave Locker",
    status: "live",
    label: "Live",
    lockerPath: "/retrograve",
    glow: "retrograve",
    preview: "/lockscreened-previews/retrograve.png",
  },
  {
    name: "Gainz",
    status: "live",
    label: "Live",
    lockerPath: "/gainz",
    glow: "gainz",
    preview: "/lockscreened-previews/gainz.png",
  },
  {
    name: "MidEvils",
    status: "live",
    label: "Live",
    lockerPath: "/midevils",
    glow: "midevils",
    preview: "/lockscreened-previews/midevils.png",
  },
  {
    name: "Enchanted Miners",
    status: "live",
    label: "Live",
    lockerPath: "/enchanted-miners",
    glow: "miners",
    preview: "/lockscreened-previews/miners.png",
  },

  // 🟡 NEW — DOGE MINERS (INSCRIPTION MODE)
  {
    name: "Doge Miners",
    status: "live",
    label: "Live",
    lockerPath: "/doge-miners",
    glow: "dogeminers",
    preview: "/lockscreened-previews/doge-miners.png",
  },

  {
    name: "ZeroMonkeBiz",
    status: "live",
    label: "Live",
    lockerPath: "/zeromonkebiz",
    glow: "zeromonkebiz",
    preview: "/lockscreened-previews/zeromonkebiz-1.png",
  },

  {
    name: "SagaMonkes",
    status: "live",
    label: "Live",
    lockerPath: "/saga-monkes",
    glow: "sagamonkes",
    preview: "/lockscreened-previews/saga-monkes.png",
  },

  {
    name: "MAGApixel Locker",
    status: "live",
    label: "Live",
    lockerPath: "/locker/magapixel",
    glow: "magapixel",
    preview: "/lockscreened-previews/magapixel.png",
  },
  {
    name: "MEOWGA",
    status: "live",
    label: "Live",
    lockerPath: "/meowga",
    glow: "meowga",
    preview: "/lockscreened-previews/meowga.png",
  },
];

const BG = "/lockscreened-main-bg-2.png";

export default function HomePage() {
  const live = PROJECTS.filter((p) => p.status === "live");
  const coming = PROJECTS.filter((p) => p.status === "coming");

  return (
    <main className="home">
      <div className="bg" />
      <div className="scrim" />

      <section className="wrap">
        <header className="hero">
          <div className="logoRow">
            <img
              src="/lockscreened-wordmark-1.png"
              alt="LockScreened"
              className="logoImage"
              draggable={false}
            />
          </div>

          <p className="tagline">
            Lock screens and wallpapers for Web3-native collectors.
            <br />
            A simple hub for partner projects, holders, and phone-first art.
          </p>

          <div className="ctaRow">
            <a href="#partner-lockers" className="ctaPrimary">
              VIEW PARTNER LOCKERS
            </a>
            <a href="#how-it-works" className="ctaGhost">
              LEARN HOW IT WORKS
            </a>
          </div>
        </header>

        <section id="partner-lockers" className="section">
          <h2 className="sectionTitle">PARTNER LOCKERS</h2>
          <p className="sectionSub">
            Each project below has (or will have) its own dedicated locker on
            LockScreened. Tap a phone to open that project’s experience.
          </p>

          <div className="cardsRow">
            {live.slice(0, 5).map((p) => (
              <ProjectCard key={p.name} p={p} />
            ))}
          </div>

          {live.length > 5 && (
            <div className="cardsRowComing">
              {live.slice(5).map((p) => (
                <ProjectCard key={p.name} p={p} />
              ))}
              {coming.map((p) => (
                <ProjectCard key={p.name} p={p} />
              ))}
            </div>
          )}
        </section>

        <section id="how-it-works" className="faq">
          <LockscreenedFAQ />
        </section>
      </section>

      {/* styles unchanged */}
    </main>
  );
}

function ProjectCard({ p }: { p: LockerProject }) {
  const CardInner = (
    <div className="card">
      <div className="pill">{p.label.toUpperCase()}</div>

      <div className="phone">
        {p.preview ? (
          <img src={p.preview} alt={p.name} className="img" draggable={false} />
        ) : (
          <div className="img placeholder" />
        )}
      </div>

      <div className="name">{p.name}</div>
      <div className="sub">{p.status === "live" ? "Live" : "Coming soon"}</div>
    </div>
  );

  if (p.status === "live" && p.lockerPath && p.lockerPath !== "#") {
    return (
      <Link href={p.lockerPath} style={{ textDecoration: "none" }}>
        {CardInner}
      </Link>
    );
  }

  return <div style={{ opacity: 0.9 }}>{CardInner}</div>;
}
