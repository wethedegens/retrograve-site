// app/projects/page.tsx
import Link from "next/link";
import { listPublishedStudioProjects } from "../lib/lockscreened/publicStudioData";
import LockScreenedPublicShell from "../components/studio/LockScreenedPublicShell";

export const dynamic = "force-dynamic";

export default async function CreatorLockerDirectory() {
  const projects = await listPublishedStudioProjects();

  return (
    <LockScreenedPublicShell
      projectName="Creator Lockers"
      backHref="/"
      backLabel="LOCKSCREENED HOME"
      maxWidth={1180}
    >
      <section style={hero}>
        <div style={eyebrow}>LOCKSCREENED CREATOR STUDIO</div>
        <h1 style={title}>Verified Creator Lockers</h1>
        <p style={intro}>
          Explore published LockScreened experiences from collection creators whose project authority has been verified before publishing. Authority verification confirms control of the collection; it is not an endorsement of value, investment quality or marketplace safety.
        </p>
      </section>

      {!projects.length ? (
        <div style={empty}>No Creator Studio lockers have been published yet.</div>
      ) : (
        <section style={grid}>
          {projects.map((project: any) => (
            <Link key={project.id} href={"/projects/" + project.slug} style={card}>
              <div style={phone}>
                {project.preview ? (
                  <img src={project.preview} alt={project.name} style={image} />
                ) : (
                  <div style={placeholder}>LOCKSCREENED</div>
                )}
                <div style={verified}>AUTHORITY VERIFIED</div>
              </div>
              <div style={cardText}>
                <strong style={{ fontSize: 12 }}>{project.name}</strong>
                <span style={tagline}>
                  {project.public_profile?.tagline || "Creator Studio locker"}
                </span>
                <span style={mode}>
                  {String(project.render_mode || "").replace(/_/g, " ").toUpperCase()}
                </span>
              </div>
            </Link>
          ))}
        </section>
      )}
    </LockScreenedPublicShell>
  );
}

const hero = { marginBottom: 18, padding: "18px 0 4px" } as const;
const eyebrow = { color: "#ff8dce", fontSize: 9, fontWeight: 900, letterSpacing: ".2em" } as const;
const title = { margin: "7px 0 0", fontSize: "clamp(34px,6vw,60px)", lineHeight: 1, letterSpacing: "-.035em" } as const;
const intro = { maxWidth: 760, margin: "12px 0 0", color: "rgba(255,255,255,.62)", fontSize: 11, lineHeight: 1.6 } as const;
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 14 } as const;
const card = { minWidth: 0, borderRadius: 20, padding: 9, background: "linear-gradient(145deg,rgba(14,10,28,.72),rgba(9,8,18,.62))", border: "1px solid rgba(255,255,255,.1)", color: "#fff", textDecoration: "none", boxShadow: "0 18px 42px rgba(0,0,0,.22)" } as const;
const phone = { position: "relative", width: "100%", aspectRatio: "9 / 19.5", overflow: "hidden", borderRadius: 14, background: "rgba(255,255,255,.035)" } as const;
const image = { width: "100%", height: "100%", objectFit: "cover", display: "block" } as const;
const placeholder = { width: "100%", height: "100%", display: "grid", placeItems: "center", color: "rgba(255,255,255,.28)", fontSize: 8, letterSpacing: ".12em" } as const;
const verified = { position: "absolute", left: 9, top: 9, borderRadius: 999, padding: "4px 6px", background: "rgba(7,6,13,.78)", border: "1px solid rgba(169,255,210,.2)", color: "#a9ffd2", fontSize: 6, fontWeight: 900, letterSpacing: ".07em" } as const;
const cardText = { padding: "9px 3px 3px", display: "grid", gap: 4 } as const;
const tagline = { color: "rgba(255,255,255,.52)", fontSize: 8, lineHeight: 1.4 } as const;
const mode = { color: "#ff8dce", fontSize: 7, fontWeight: 900, letterSpacing: ".07em" } as const;
const empty = { borderRadius: 20, padding: 22, border: "1px solid rgba(255,255,255,.09)", background: "rgba(10,8,20,.66)", color: "rgba(255,255,255,.58)", fontSize: 11 } as const;
