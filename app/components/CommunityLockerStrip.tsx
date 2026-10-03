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

    return () => {
      active = false;
    };
  }, []);

  if (!projects.length) return null;

  return (
    <section className="creatorSection">
      <div className="eyebrow">CREATOR STUDIO</div>
      <h2>COMMUNITY LOCKERS</h2>
      <p>
        Published lockers from verified collection founders, powered by the universal LockScreened engine.
      </p>

      <div className="grid">
        {projects.map((project) => (
          <Link key={project.id} href={"/projects/" + project.slug} className="card">
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

      <style jsx>{`
        .creatorSection {
          margin-top: 32px;
          text-align: center;
          padding-top: 22px;
          border-top: 1px solid rgba(255,255,255,.1);
        }
        .eyebrow {
          color: #cdb7ff;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .2em;
        }
        h2 {
          margin: 6px 0 6px;
          font-size: 18px;
          letter-spacing: .12em;
        }
        p {
          margin: 0 auto 14px;
          max-width: 680px;
          color: rgba(255,255,255,.66);
          font-size: 11px;
          line-height: 1.5;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit,minmax(145px,1fr));
          gap: 14px;
        }
        .card {
          min-width: 0;
          border-radius: 18px;
          padding: 9px;
          background: rgba(10,8,20,.58);
          border: 1px solid rgba(255,255,255,.1);
          color: white;
          text-decoration: none;
          display: grid;
          gap: 7px;
          justify-items: center;
        }
        .phone {
          width: 100%;
          aspect-ratio: 9 / 16;
          border-radius: 13px;
          overflow: hidden;
          background: rgba(255,255,255,.035);
        }
        .phone img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .placeholder {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          color: rgba(255,255,255,.3);
          font-size: 8px;
          letter-spacing: .12em;
        }
        strong { font-size: 10px; }
        span {
          font-size: 8px;
          color: rgba(255,255,255,.5);
          text-align: center;
          line-height: 1.35;
        }
      `}</style>
    </section>
  );
}
