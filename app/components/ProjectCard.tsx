"use client";
import Link from "next/link";
import type {LockerProject} from "../lib/lockscreened/legacyProjects";
export default function ProjectCard({ p }: { p: LockerProject }) {
  const CardInner = (
    <div className="card">
      <div className="pill">{p.label.toUpperCase()}</div>

      <div className="phone">
        {p.preview ? (
          <img src={p.preview} alt={p.name} className="img" loading="lazy" draggable={false} />
        ) : (
          <div className="img placeholder" />
        )}
      </div>

      <div className="name">{p.name}</div>
      <div className="sub">{p.status === "live" ? "Live" : "Coming soon"}</div>

      <style jsx>{`
        .card {
          width: min(170px,100%);
          border-radius: 20px;
          background: rgba(10, 8, 20, 0.58);
          box-shadow: 0 18px 36px rgba(0, 0, 0, 0.22);
          padding: 10px 10px 12px;
          position: relative;
          display: grid;
          justify-items: center;
          gap: 8px;
          user-select: none;
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(10px);
        }

        .pill {
          position: absolute;
          top: 10px;
          left: 10px;
          font-size: 10px;
          font-weight: 900;
          color: rgba(0, 0, 0, 0.88);
          background: rgba(255, 255, 255, 0.85);
          padding: 3px 8px;
          border-radius: 999px;
          letter-spacing: 0.06em;
        }

        .phone {
          width: 100%;
          aspect-ratio: 9 / 19.5;
          border-radius: 18px;
          background: rgba(30, 30, 34, 0.22);
          display: grid;
          place-items: center;
          overflow: hidden;
          margin-top: 8px;
        }

        .img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .name {
          font-size: 11px;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.92);
        }

        .sub {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: -6px;
        }
      `}</style>
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
