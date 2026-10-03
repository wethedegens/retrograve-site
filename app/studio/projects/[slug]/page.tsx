// app/studio/projects/[slug]/page.tsx
import { notFound } from "next/navigation";
import LockScreenedStudioShell from "../../../components/studio/LockScreenedStudioShell";
import { FLAGSHIP_PROJECTS, getFlagshipProjectBySlug } from "../../../lib/lockscreened/flagshipProjects";

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

export default function StudioProjectPage({ params }: { params: { slug: string } }) {
  const project = getFlagshipProjectBySlug(params.slug);
  if (!project) notFound();

  const collectionIds = project.source.kind === "solana_collection" ? project.source.collectionIds || [] : [];
  const creators = project.source.kind === "solana_collection" ? project.source.creatorAddresses || [] : [];
  const traitLayers = project.render.traitProfile?.layerOrder || [];

  return (
    <LockScreenedStudioShell
      eyebrow="LOCKSCREENED FLAGSHIP"
      title={project.name}
      subtitle={sourceText(project) + " · " + project.render.mode}
      badge="LEGACY CURATED · LOCKED"
      backHref="/studio"
      backLabel="CREATOR STUDIO"
      maxWidth={1080}
    >
      <div style={grid}>
        <section style={panelStyle}>
          <div style={labelStyle}>PROJECT SOURCE</div>
          <h2 style={headingStyle}>{sourceText(project)}</h2>
          <p style={copyStyle}>Locker key: <strong>{project.routes.lockerProjectKey}</strong></p>
          {collectionIds.map((id) => <code key={id} style={codeStyle}>{id}</code>)}
          {creators.length ? <p style={copyStyle}>{creators.length} creator fallback address{creators.length === 1 ? "" : "es"} preserved.</p> : null}
        </section>

        <section style={panelStyle}>
          <div style={labelStyle}>RENDER PROFILE</div>
          <h2 style={headingStyle}>{project.render.mode}</h2>
          <p style={copyStyle}>Pixel rendering: <strong>{project.render.pixelated ? "ON" : "OFF"}</strong></p>
          {traitLayers.length ? (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {traitLayers.map((layer) => <span key={layer.traitType} style={chipStyle}>{layer.traitType}</span>)}
            </div>
          ) : <p style={copyStyle}>This flagship keeps its existing composite/custom renderer.</p>}
        </section>

        <section style={panelStyle}>
          <div style={labelStyle}>FLAGSHIP PROTECTION</div>
          <h2 style={headingStyle}>Preserve what works</h2>
          <p style={copyStyle}>Original LockScreened backgrounds, routes and special project behavior remain protected. Creator Studio is additive, never destructive.</p>
        </section>

        <section style={panelStyle}>
          <div style={labelStyle}>CREATOR ADDITIONS</div>
          <h2 style={headingStyle}>Additive by design</h2>
          <p style={copyStyle}>Future official backgrounds and project content can be layered alongside the curated flagship experience without replacing it.</p>
        </section>
      </div>

      <div style={actions}>
        <a href={project.routes.landing} style={primaryButton}>OPEN CURRENT PROJECT</a>
        <a href="/studio#trait-import" style={buttonStyle}>TEST TRAIT IMPORT</a>
        <a href="/studio#background-builder" style={buttonStyle}>TEST BACKGROUND BUILDER</a>
      </div>
    </LockScreenedStudioShell>
  );
}

const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 } as const;
const panelStyle = { borderRadius: 20, padding: 18, border: "1px solid rgba(255,255,255,.09)", background: "rgba(10,8,20,.72)", boxShadow: "0 18px 50px rgba(0,0,0,.22)" } as const;
const labelStyle = { color: "#ff8dce", fontSize: 9, fontWeight: 900, letterSpacing: ".16em" } as const;
const headingStyle = { margin: "7px 0", fontSize: 19 } as const;
const copyStyle = { margin: "5px 0", color: "rgba(255,255,255,.58)", fontSize: 11, lineHeight: 1.55 } as const;
const codeStyle = { display: "block", marginTop: 7, padding: "8px 9px", borderRadius: 10, background: "rgba(0,0,0,.22)", color: "rgba(255,255,255,.72)", fontSize: 9, wordBreak: "break-all" } as const;
const chipStyle = { display: "inline-flex", borderRadius: 999, padding: "5px 7px", border: "1px solid rgba(255,63,180,.15)", background: "rgba(255,63,180,.06)", color: "#ffb4de", fontSize: 9 } as const;
const actions = { marginTop: 14, display: "flex", gap: 9, flexWrap: "wrap" } as const;
const buttonStyle = { display: "inline-flex", minHeight: 36, alignItems: "center", justifyContent: "center", borderRadius: 999, padding: "0 12px", border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.045)", color: "#fff", textDecoration: "none", fontSize: 9, fontWeight: 900, letterSpacing: ".1em" } as const;
const primaryButton = { ...buttonStyle, background: "#ff3fb4", color: "#171019", border: "1px solid rgba(255,255,255,.12)" } as const;
