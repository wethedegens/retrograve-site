// app/components/studio/StudioFlagshipProtection.tsx
import { FLAGSHIP_PROJECTS } from "../../lib/lockscreened/flagshipProjects";

export default function StudioFlagshipProtection() {
  return (
    <section
      style={{
        marginBottom: 24,
        borderRadius: 20,
        border: "1px solid rgba(255,197,103,.12)",
        background: "rgba(35,25,8,.34)",
        padding: 16,
      }}
    >
      <div
        style={{
          color: "#ffd99d",
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: ".17em",
        }}
      >
        FLAGSHIP PROTECTION
      </div>

      <h2 style={{ margin: "5px 0 5px", fontSize: 19 }}>
        Legacy curated projects stay locked
      </h2>

      <p
        style={{
          margin: 0,
          maxWidth: 760,
          color: "rgba(255,255,255,.54)",
          fontSize: 10,
          lineHeight: 1.55,
        }}
      >
        Creator Studio runs beside the existing LockScreened projects. Their
        routes, curated device backgrounds, special compositor behavior, and
        legacy assets are not replaced by founder uploads. Known flagship
        collection IDs are reserved from normal claims.
      </p>

      <div
        style={{
          marginTop: 11,
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        {FLAGSHIP_PROJECTS.map((project) => (
          <span
            key={project.slug}
            style={{
              borderRadius: 999,
              padding: "5px 7px",
              border: "1px solid rgba(255,255,255,.07)",
              background: "rgba(255,255,255,.025)",
              color: "rgba(255,255,255,.58)",
              fontSize: 8,
              fontWeight: 800,
            }}
          >
            {project.name} · LOCKED
          </span>
        ))}
      </div>
    </section>
  );
}
