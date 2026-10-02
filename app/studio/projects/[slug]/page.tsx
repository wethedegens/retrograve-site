// app/studio/projects/[slug]/page.tsx
import { notFound } from "next/navigation";
import {
  FLAGSHIP_PROJECTS,
  getFlagshipProjectBySlug,
} from "../../../lib/lockscreened/flagshipProjects";

export function generateStaticParams() {
  return FLAGSHIP_PROJECTS.map((project) => ({ slug: project.slug }));
}

function sourceText(project: ReturnType<typeof getFlagshipProjectBySlug>) {
  if (!project) return "";
  if (project.source.kind === "solana_collection") return "Solana collection";
  if (project.source.kind === "doge_inscription") return "Doge inscription";
  if (project.source.kind === "uploaded_art") return "Uploaded art";
  return "Demo / pre-mint";
}

export default function StudioProjectPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = getFlagshipProjectBySlug(params.slug);
  if (!project) notFound();

  const collectionIds =
    project.source.kind === "solana_collection"
      ? project.source.collectionIds || []
      : [];

  const creators =
    project.source.kind === "solana_collection"
      ? project.source.creatorAddresses || []
      : [];

  const traitLayers = project.render.traitProfile?.layerOrder || [];

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(900px 520px at 50% 0, rgba(104,65,191,.2), transparent 70%), #07060d",
        padding: "42px 18px 90px",
        color: "#fff",
      }}
    >
      <div style={{ width: "min(1050px, 100%)", margin: "0 auto" }}>
        <a
          href="/studio"
          style={{
            color: "#cdbbff",
            textDecoration: "none",
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: ".14em",
          }}
        >
          ← CREATOR STUDIO
        </a>

        <div
          style={{
            marginTop: 18,
            borderRadius: 24,
            padding: 24,
            border: "1px solid rgba(255,255,255,.1)",
            background: "rgba(10,8,20,.72)",
            boxShadow: "0 24px 70px rgba(0,0,0,.3)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  color: "#cbb9ff",
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: ".18em",
                }}
              >
                LOCKSCREENED FLAGSHIP
              </div>
              <h1 style={{ margin: "7px 0 4px", fontSize: 40 }}>
                {project.name}
              </h1>
              <p
                style={{
                  margin: 0,
                  color: "rgba(255,255,255,.58)",
                  fontSize: 12,
                }}
              >
                {sourceText(project)} · {project.render.mode}
              </p>
            </div>
            <div
              style={{
                alignSelf: "flex-start",
                borderRadius: 999,
                border: "1px solid rgba(255,204,120,.2)",
                background: "rgba(255,180,72,.06)",
                color: "#ffd99d",
                padding: "8px 10px",
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: ".12em",
              }}
            >
              LEGACY CURATED ASSETS LOCKED
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 12,
          }}
        >
          <section style={panelStyle}>
            <div style={labelStyle}>PROJECT SOURCE</div>
            <h2 style={headingStyle}>{sourceText(project)}</h2>
            <p style={copyStyle}>
              Locker key: <strong>{project.routes.lockerProjectKey}</strong>
            </p>
            {collectionIds.map((id) => (
              <code key={id} style={codeStyle}>
                {id}
              </code>
            ))}
            {creators.length > 0 ? (
              <p style={copyStyle}>
                {creators.length} creator fallback address
                {creators.length === 1 ? "" : "es"} preserved.
              </p>
            ) : null}
          </section>

          <section style={panelStyle}>
            <div style={labelStyle}>RENDER PROFILE</div>
            <h2 style={headingStyle}>{project.render.mode}</h2>
            <p style={copyStyle}>
              Pixel rendering: <strong>{project.render.pixelated ? "ON" : "OFF"}</strong>
            </p>
            {traitLayers.length ? (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {traitLayers.map((layer) => (
                  <span key={layer.traitType} style={chipStyle}>
                    {layer.traitType}
                  </span>
                ))}
              </div>
            ) : (
              <p style={copyStyle}>
                This flagship currently uses its original/composite artwork
                rather than universal trait reconstruction.
              </p>
            )}
          </section>

          <section style={panelStyle}>
            <div style={labelStyle}>LEGACY PROTECTION</div>
            <h2 style={headingStyle}>Preserve what works</h2>
            <p style={copyStyle}>
              Original LockScreened backgrounds and special project behavior
              remain protected. A verified founder will be able to add official
              creator backgrounds without deleting the curated set.
            </p>
          </section>

          <section style={panelStyle}>
            <div style={labelStyle}>CREATOR ADDITIONS</div>
            <h2 style={headingStyle}>Additive by design</h2>
            <p style={copyStyle}>
              Future owner controls will live here: uploaded traits, official
              backgrounds, project-page content, 1/1 overrides and publish
              status.
            </p>
          </section>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "flex",
            gap: 9,
            flexWrap: "wrap",
          }}
        >
          <a href={project.routes.landing} style={buttonStyle}>
            OPEN CURRENT PROJECT
          </a>
          <a href="/studio#trait-import" style={buttonStyle}>
            TEST TRAIT IMPORT
          </a>
          <a href="/studio#background-builder" style={buttonStyle}>
            TEST BACKGROUND BUILDER
          </a>
        </div>
      </div>
    </main>
  );
}

const panelStyle = {
  borderRadius: 20,
  padding: 18,
  border: "1px solid rgba(255,255,255,.09)",
  background: "rgba(10,8,20,.68)",
} as const;

const labelStyle = {
  color: "#cbb9ff",
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: ".16em",
} as const;

const headingStyle = {
  margin: "7px 0 7px",
  fontSize: 19,
} as const;

const copyStyle = {
  margin: "5px 0",
  color: "rgba(255,255,255,.58)",
  fontSize: 11,
  lineHeight: 1.55,
} as const;

const codeStyle = {
  display: "block",
  marginTop: 7,
  padding: "8px 9px",
  borderRadius: 10,
  background: "rgba(0,0,0,.22)",
  color: "rgba(255,255,255,.72)",
  fontSize: 9,
  wordBreak: "break-all",
} as const;

const chipStyle = {
  display: "inline-flex",
  borderRadius: 999,
  padding: "5px 7px",
  border: "1px solid rgba(205,183,255,.14)",
  background: "rgba(205,183,255,.06)",
  color: "#d5c8ff",
  fontSize: 9,
} as const;

const buttonStyle = {
  display: "inline-flex",
  minHeight: 36,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  padding: "0 12px",
  border: "1px solid rgba(255,255,255,.12)",
  background: "rgba(255,255,255,.045)",
  color: "#fff",
  textDecoration: "none",
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: ".1em",
} as const;
