// app/projects/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getPublishedStudioProjectBySlug } from "../../lib/lockscreened/publicStudioData";
import LockScreenedPublicShell from "../../components/studio/LockScreenedPublicShell";

export const dynamic = "force-dynamic";

export default async function PublishedStudioProjectPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = await getPublishedStudioProjectBySlug(params.slug);
  if (!project) notFound();

  const profile = project.public_profile || {};
  const phoneBackgrounds = project.backgrounds
    .map((item: any) => item.deviceAssets?.phone)
    .filter(Boolean);

  return (
    <LockScreenedPublicShell projectName={project.name}>
      <section
        style={{
          width: "min(1120px,100%)",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) minmax(280px,420px)",
          gap: 34,
          alignItems: "center",
        }}
      >
        <div>
          <div style={eyebrow}>CREATOR STUDIO LOCKER</div>
          <h1
            style={{
              margin: "8px 0 0",
              fontSize: "clamp(38px,7vw,74px)",
              lineHeight: 0.95,
              letterSpacing: "-.04em",
            }}
          >
            {project.name}
          </h1>

          {profile.tagline ? (
            <div
              style={{
                marginTop: 10,
                color: "#d9ceff",
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              {profile.tagline}
            </div>
          ) : null}

          <p style={copy}>
            {profile.description ||
              "Phone-native collectible wallpapers powered by LockScreened Creator Studio. Connect your wallet, choose an NFT you own, and build a device-ready lockscreen."}
          </p>

          <div style={{ marginTop: 18, display: "flex", gap: 9, flexWrap: "wrap" }}>
            <a href={"/projects/" + (project.route_slug || project.slug) + "/collection"} style={primary}>
              VIEW MY COLLECTION
            </a>
            {profile.marketplace ? (
              <a
                href={profile.marketplace}
                target="_blank"
                rel="noreferrer"
                style={secondary}
              >
                COLLECT
              </a>
            ) : null}
            <a href="/studio" style={secondary}>
              CREATOR STUDIO
            </a>
          </div>

          {profile.website || profile.discord || profile.x ? (
            <div
              style={{
                marginTop: 14,
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              {profile.website ? (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                  style={textLink}
                >
                  WEBSITE
                </a>
              ) : null}
              {profile.discord ? (
                <a
                  href={profile.discord}
                  target="_blank"
                  rel="noreferrer"
                  style={textLink}
                >
                  DISCORD
                </a>
              ) : null}
              {profile.x ? (
                <a
                  href={profile.x}
                  target="_blank"
                  rel="noreferrer"
                  style={textLink}
                >
                  FOLLOW ON X
                </a>
              ) : null}
            </div>
          ) : null}

          <div style={stats}>
            <Stat label="RENDER MODE" value={String(project.render_mode).replace(/_/g, " ")} />
            <Stat label="BACKGROUNDS" value={String(project.backgrounds.length)} />
            <Stat label="STATUS" value="LIVE" />
          </div>
        </div>

        <div
          style={{
            borderRadius: 30,
            padding: 14,
            border: "1px solid rgba(255,255,255,.09)",
            background: "rgba(255,255,255,.025)",
            boxShadow: "0 30px 90px rgba(0,0,0,.35)",
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "9 / 19.5",
              borderRadius: 22,
              overflow: "hidden",
              background: "#16121f",
              position: "relative",
            }}
          >
            {phoneBackgrounds[0] ? (
              <img
                src={phoneBackgrounds[0]}
                alt={project.name + " wallpaper preview"}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  padding: 22,
                  textAlign: "center",
                  color: "rgba(255,255,255,.35)",
                  fontSize: 11,
                }}
              >
                Published background preview will appear here.
              </div>
            )}

            <div
              style={{
                position: "absolute",
                left: 12,
                bottom: 12,
                right: 12,
                borderRadius: 12,
                padding: 10,
                background: "rgba(0,0,0,.45)",
                backdropFilter: "blur(10px)",
                fontSize: 9,
                letterSpacing: ".12em",
                fontWeight: 900,
              }}
            >
              {project.name.toUpperCase()} · LOCKSCREENED
            </div>
          </div>
        </div>
      </section>
    </LockScreenedPublicShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        borderRadius: 13,
        padding: 10,
        border: "1px solid rgba(255,255,255,.07)",
        background: "rgba(255,255,255,.025)",
      }}
    >
      <div style={{ fontSize: 7, color: "rgba(255,255,255,.38)", letterSpacing: ".12em" }}>
        {label}
      </div>
      <strong style={{ display: "block", marginTop: 3, fontSize: 11, textTransform: "uppercase" }}>
        {value}
      </strong>
    </div>
  );
}

const eyebrow = {
  color: "#ff8dce",
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: ".18em",
} as const;

const copy = {
  maxWidth: 620,
  margin: "16px 0 0",
  color: "rgba(255,255,255,.6)",
  fontSize: 13,
  lineHeight: 1.65,
} as const;

const primary = {
  display: "inline-flex",
  minHeight: 42,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  padding: "0 15px",
  textDecoration: "none",
  background: "#ff3fb4",
  color: "#151019",
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: ".1em",
} as const;

const secondary = {
  ...primary,
  background: "rgba(255,255,255,.05)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,.1)",
} as const;

const stats = {
  marginTop: 20,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
  gap: 8,
  maxWidth: 520,
} as const;


const textLink = {
  color: "#d5c7ff",
  textDecoration: "none",
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: ".08em",
  borderBottom: "1px solid rgba(213,199,255,.22)",
} as const;
