// app/components/CommunityLockerStrip.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CommunityProject = {
  id: string;
  slug: string;
  name: string;
  render_mode: string;
  public_profile?: { tagline?: string };
  preview?: string;
};

export default function CommunityLockerStrip() {
  const [projects, setProjects] = useState<CommunityProject[]>([]);

  useEffect(() => {
    let active = true;

    fetch("/api/public/projects", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { projects: [] }))
      .then((data) => {
        if (active) setProjects(Array.isArray(data?.projects) ? data.projects : []);
      })
      .catch(() => {
        if (active) setProjects([]);
      });

    return () => { active = false; };
  }, []);

  if (!projects.length) return null;

  const featured = projects.slice(0, 6);

  return (
    <section className="creatorSection">
      <div className="topline">
        <div>
          <div className="eyebrow">LOCKSCREENED CREATOR STUDIO</div>
          <h2>VERIFIED CREATOR LOCKERS</h2>
        </div>
        <Link href="/projects" className="browse">BROWSE ALL →</Link>
      </div>

      <p className="intro">
        Published lockers from collection creators whose wallet authority has been verified by LockScreened. Verification confirms project control — not investment quality or financial endorsement.
      </p>

      <div className="grid">
        {featured.map((project) => (
          <Link key={project.id} href={"/projects/" + project.slug} className="card">
            <div className="verified">AUTHORITY VERIFIED</div>
            <div className="phone">
              {project.preview ? (
                <img src={project.preview} alt={project.name} />
              ) : (
                <div className="placeholder">LOCKSCREENED</div>
              )}
            </div>
            <strong>{project.name}</strong>
            <span>{project.public_profile?.tagline || "Creator Studio locker"}</span>
          </Link>
        ))}
      </div>

      {projects.length > featured.length ? (
        <div className="footer">
          <Link href="/projects" className="allButton">
            VIEW ALL {projects.length} CREATOR LOCKERS
          </Link>
        </div>
      ) : null}

      <style jsx>{`
        .creatorSection {
          margin-top: 34px;
          padding: 22px 0 2px;
          border-top: 1px solid rgba(255,255,255,.1);
        }
        .topline {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          text-align: left;
        }
        .eyebrow { color: #ff8dce; font-size: 9px; font-weight: 900; letter-spacing: .2em; }
        h2 { margin: 5px 0 0; font-size: 18px; letter-spacing: .1em; }
        .intro {
          margin: 7px 0 16px;
          max-width: 760px;
          color: rgba(255,255,255,.66);
          font-size: 10px;
          line-height: 1.55;
          text-align: left;
        }
        .browse {
          color: #ff9bd8;
          text-decoration: none;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .1em;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(6,minmax(0,1fr));
          gap: 12px;
        }
        .card {
          position: relative;
          min-width: 0;
          border-radius: 18px;
          padding: 8px 8px 10px;
          background: linear-gradient(145deg,rgba(14,10,28,.72),rgba(9,8,18,.6));
          border: 1px solid rgba(255,255,255,.1);
          color: white;
          text-decoration: none;
          display: grid;
          gap: 6px;
          justify-items: center;
          box-shadow: 0 16px 34px rgba(0,0,0,.2);
          transition: transform .16s ease, border-color .16s ease;
        }
        .card:hover { transform: translateY(-2px); border-color: rgba(255,99,194,.28); }
        .verified {
          position: absolute;
          top: 13px;
          left: 13px;
          z-index: 2;
          border-radius: 999px;
          padding: 4px 6px;
          background: rgba(8,7,14,.76);
          border: 1px solid rgba(169,255,210,.22);
          color: #a9ffd2;
          backdrop-filter: blur(8px);
          font-size: 6px;
          font-weight: 900;
          letter-spacing: .07em;
        }
        .phone {
          width: 100%;
          aspect-ratio: 9 / 19.5;
          border-radius: 13px;
          overflow: hidden;
          background: rgba(255,255,255,.035);
        }
        .phone img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .placeholder { width: 100%; height: 100%; display: grid; place-items: center; color: rgba(255,255,255,.3); font-size: 7px; letter-spacing: .12em; }
        strong { font-size: 9px; text-align: center; }
        span { font-size: 7px; color: rgba(255,255,255,.5); text-align: center; line-height: 1.35; }
        .footer { display: grid; place-items: center; margin-top: 14px; }
        .allButton {
          display: inline-flex;
          min-height: 34px;
          align-items: center;
          border-radius: 999px;
          padding: 0 13px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.12);
          color: #fff;
          text-decoration: none;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .08em;
        }
        @media (max-width: 1050px) { .grid { grid-template-columns: repeat(3,minmax(0,1fr)); } }
        @media (max-width: 620px) { .grid { grid-template-columns: repeat(2,minmax(0,1fr)); } .topline { text-align: center; justify-content: center; } .intro { text-align: center; margin-left: auto; margin-right: auto; } }
      `}</style>
    </section>
  );
}
