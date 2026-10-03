// app/projects/page.tsx
import { listPublishedStudioProjects } from "../lib/lockscreened/publicStudioData";
import LockScreenedPublicShell from "../components/studio/LockScreenedPublicShell";
import CreatorLockerDirectoryClient from "../components/CreatorLockerDirectoryClient";

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
          Explore published LockScreened experiences from collection creators
          whose project authority has been verified before publishing.
          Authority verification confirms control of the collection; it is not
          an endorsement of value, investment quality or marketplace safety.
        </p>
      </section>

      {!projects.length ? (
        <div style={empty}>
          No Creator Studio lockers have been published yet.
        </div>
      ) : (
        <CreatorLockerDirectoryClient projects={projects} />
      )}
    </LockScreenedPublicShell>
  );
}

const hero = {
  marginBottom: 18,
  padding: "18px 0 4px",
} as const;

const eyebrow = {
  color: "#ff8dce",
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: ".2em",
} as const;

const title = {
  margin: "7px 0 0",
  fontSize: "clamp(34px,6vw,60px)",
  lineHeight: 1,
  letterSpacing: "-.035em",
} as const;

const intro = {
  maxWidth: 760,
  margin: "12px 0 0",
  color: "rgba(255,255,255,.62)",
  fontSize: 11,
  lineHeight: 1.6,
} as const;

const empty = {
  borderRadius: 20,
  padding: 22,
  border: "1px solid rgba(255,255,255,.09)",
  background: "rgba(10,8,20,.66)",
  color: "rgba(255,255,255,.58)",
  fontSize: 11,
} as const;
