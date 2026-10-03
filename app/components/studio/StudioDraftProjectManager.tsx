// app/components/studio/StudioDraftProjectManager.tsx
"use client";

import { useEffect, useState } from "react";
import {
  getFreshSession,
  readStoredSession,
  type LockScreenedSession,
} from "../../lib/lockscreened/web3AuthClient";
import {
  archiveStudioCollection,
  getStudioCollection,
  publishStudioCollection,
  restoreStudioCollection,
  unpublishBackgroundPackage,
  unpublishStudioCollection,
} from "../../lib/lockscreened/studioDataClient";
import StudioTraitValidation from "./StudioTraitValidation";
import StudioPublicProfileEditor from "./StudioPublicProfileEditor";
import StudioLayerOrderEditor from "./StudioLayerOrderEditor";
import StudioMintOverrides from "./StudioMintOverrides";
import StudioLaunchReadiness from "./StudioLaunchReadiness";
import StudioRenderProfileEditor from "./StudioRenderProfileEditor";
import StudioPublicLinkControls from "./StudioPublicLinkControls";
import StudioActivityLog from "./StudioActivityLog";

export default function StudioDraftProjectManager({
  collectionId,
}: {
  collectionId: string;
}) {
  const [session, setSession] = useState<LockScreenedSession | null>(null);
  const [data, setData] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const current = (await getFreshSession()) || readStoredSession();
    setSession(current);

    if (!current) {
      setData(null);
      return;
    }

    try {
      const next = await getStudioCollection(current, collectionId);
      setData(next);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load project."
      );
    }
  }

  useEffect(() => {
    load();
    const listener = () => load();
    window.addEventListener("lockscreened-auth-changed", listener);
    window.addEventListener("lockscreened-studio-data-changed", listener);

    return () => {
      window.removeEventListener("lockscreened-auth-changed", listener);
      window.removeEventListener("lockscreened-studio-data-changed", listener);
    };
  }, [collectionId]);

  async function archiveProject() {
    if (!session) return;

    const confirmed = window.confirm(
      "Archive this Creator Studio project? It will disappear from your active workflow, but its source art, mappings and settings will be preserved."
    );

    if (!confirmed) return;

    setBusy(true);
    setMessage("");

    try {
      await archiveStudioCollection({ session, collectionId });
      setMessage("Project archived. Nothing was deleted.");
      await load();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not archive project."
      );
    } finally {
      setBusy(false);
    }
  }

  async function restoreProject() {
    if (!session) return;

    setBusy(true);
    setMessage("");

    try {
      await restoreStudioCollection({ session, collectionId });
      setMessage("Project restored to draft.");
      await load();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not restore project."
      );
    } finally {
      setBusy(false);
    }
  }

  async function publishRenderAssets() {
    if (!session) return;
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/studio/publish-trait-renders", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + session.access_token,
        },
        body: JSON.stringify({ collectionId }),
      });

      const result = await response.json();
      if (!response.ok) {
        if (result?.needsServerSecret) {
          setMessage(
            "Trait library is ready, but secure render publishing is waiting for the server-only Supabase secret."
          );
          return;
        }
        throw new Error(result?.error || "Render publishing was blocked.");
      }

      setMessage(
        String(result.publishedCount || 0) +
          " public render derivative assets published."
      );
      await load();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not publish render assets."
      );
    } finally {
      setBusy(false);
    }
  }

  async function publishProject() {
    if (!session) return;
    setBusy(true);
    setMessage("");

    try {
      await publishStudioCollection({
        session,
        collectionId,
      });
      setMessage("Project published.");
      await load();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Publishing was blocked."
      );
    } finally {
      setBusy(false);
    }
  }

  async function unpublishProject() {
    if (!session) return;

    const confirmed = window.confirm(
      "Unpublish this LockScreened project? Its public Creator Studio page will become unavailable, but all Studio data and private source files will remain."
    );

    if (!confirmed) return;

    setBusy(true);
    setMessage("");

    try {
      await unpublishStudioCollection({
        session,
        collectionId,
      });
      setMessage("Project unpublished. Studio data and source assets were preserved.");
      await load();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not unpublish project."
      );
    } finally {
      setBusy(false);
    }
  }

  async function unpublishBackground(packageId: string) {
    if (!session) return;

    const confirmed = window.confirm(
      "Unpublish this background package? Public render files stay stored, but collectors will no longer see this package."
    );

    if (!confirmed) return;

    setBusy(true);
    setMessage("");

    try {
      await unpublishBackgroundPackage({
        session,
        packageId,
      });
      setMessage("Background package unpublished.");
      await load();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Background unpublishing was blocked."
      );
    } finally {
      setBusy(false);
    }
  }

  async function publishBackground(packageId: string) {
    if (!session) return;
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/studio/publish-background", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + session.access_token,
        },
        body: JSON.stringify({ packageId }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result?.needsServerSecret) {
          setMessage(
            "Background is ready, but secure server publishing is waiting for the server-only Supabase secret."
          );
          return;
        }

        throw new Error(result?.error || "Background publishing was blocked.");
      }

      setMessage(
        `Background package published with ${result.assets?.length || 0} device asset${result.assets?.length === 1 ? "" : "s"}.`
      );
      await load();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Background publishing was blocked."
      );
    } finally {
      setBusy(false);
    }
  }

  if (!session) {
    return (
      <div style={panel}>
        <h2 style={{ margin: 0 }}>Sign in required</h2>
        <p style={copy}>
          Return to Creator Studio and sign in with the wallet that owns this
          draft.
        </p>
        <a href="/studio" style={button}>BACK TO STUDIO</a>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={panel}>
        <h2 style={{ margin: 0 }}>Loading project…</h2>
        {message ? <p style={copy}>{message}</p> : null}
      </div>
    );
  }

  const {
    collection,
    claim,
    layers,
    traitAssets,
    publishedTraitAssets,
    backgrounds,
    mintOverrides,
    publishedMintOverrides,
  } = data;
  const verified = claim?.status === "verified";
  const layered = collection.render_mode === "layered_traits";
  const profile = collection.public_profile || {};
  const hasProjectIdentity = Boolean(
    String(profile.description || profile.tagline || "").trim()
  );
  const hasPublishedPhoneBackground = (data.publishedBackgroundAssets || []).some(
    (item: any) => item.device === "phone"
  );
  const hasPublishedRenderAssets =
    !layered || Boolean(publishedTraitAssets?.length);
  const validationPassed =
    !layered || data.validationRun?.status === "passed";

  const launchReady =
    verified &&
    hasProjectIdentity &&
    hasPublishedPhoneBackground &&
    hasPublishedRenderAssets &&
    validationPassed;

  return (
    <div style={{ display: "grid", gap: 13 }}>
      <section style={panel}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div style={eyebrow}>FOUNDER PROJECT</div>
            <h1 style={{ margin: "6px 0 3px", fontSize: 36 }}>
              {collection.name}
            </h1>
            <p style={copy}>
              {collection.source_type} · {collection.render_mode}
            </p>
          </div>

          <div
            style={{
              borderRadius: 999,
              padding: "8px 10px",
              border: verified
                ? "1px solid rgba(110,255,183,.22)"
                : "1px solid rgba(255,207,140,.18)",
              color: verified ? "#a9ffd2" : "#ffd99d",
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: ".11em",
            }}
          >
            CLAIM {(claim?.status || "NONE").toUpperCase()}
          </div>
        </div>

        <div style={stats}>
          <Stat label="PROJECT" value={collection.publish_status.toUpperCase()} />
          <Stat label="TRAIT LAYERS" value={String(layers.length)} />
          <Stat
            label="PUBLIC RENDER ASSETS"
            value={String(publishedTraitAssets?.length || 0)}
          />
          <Stat label="BACKGROUND DRAFTS" value={String(backgrounds.length)} />
          <Stat
            label="PUBLISH GATE"
            value={verified ? "UNLOCKED" : "LOCKED"}
          />
        </div>

        <div style={{ marginTop: 13, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {collection.publish_status === "archived" ? (
            <button
              style={primaryButton}
              onClick={restoreProject}
              disabled={busy}
            >
              RESTORE PROJECT
            </button>
          ) : null}

          {collection.render_mode === "layered_traits" &&
          collection.publish_status !== "archived" ? (
            <button
              style={button}
              onClick={publishRenderAssets}
              disabled={busy || !verified || !traitAssets?.length}
            >
              {publishedTraitAssets?.length
                ? "REFRESH PUBLIC RENDER ASSETS"
                : "PUBLISH RENDER ASSETS"}
            </button>
          ) : null}

          {collection.publish_status === "published" ? (
            <button
              style={dangerButton}
              onClick={unpublishProject}
              disabled={busy}
            >
              UNPUBLISH PROJECT
            </button>
          ) : collection.publish_status === "draft" ? (
            <>
              <button
                style={primaryButton}
                onClick={publishProject}
                disabled={busy || !launchReady}
                title={
                  launchReady
                    ? "Publish this LockScreened project"
                    : "Complete the Launch Readiness checklist first"
                }
              >
                {launchReady
                  ? "PUBLISH PROJECT"
                  : verified
                    ? "FINISH LAUNCH CHECKLIST"
                    : "VERIFY CLAIM TO PUBLISH"}
              </button>
              <button
                style={secondaryDangerButton}
                onClick={archiveProject}
                disabled={busy}
              >
                ARCHIVE DRAFT
              </button>
            </>
          ) : null}
          <a href="/studio#trait-import" style={button}>EDIT TRAITS</a>
          <a href="/studio#background-builder" style={button}>ADD BACKGROUND</a>
          <a href={"/studio/preview/" + collectionId} style={button}>PREVIEW PUBLIC EXPERIENCE</a>
        </div>

        {message ? <div style={notice}>{message}</div> : null}
      </section>

      <StudioPublicLinkControls
        slug={collection.public_slug || collection.slug}
        published={collection.publish_status === "published"}
      />

      <StudioActivityLog events={data.auditEvents || []} />

      <StudioLaunchReadiness data={data} />

      <StudioPublicProfileEditor
        session={session}
        collectionId={collectionId}
        name={collection.name}
        profile={collection.public_profile}
        publicSlug={collection.public_slug}
      />

      <StudioLayerOrderEditor
        session={session}
        collectionId={collectionId}
        layers={layers}
        renderProfile={collection.render_profile}
      />

      <StudioRenderProfileEditor
        session={session}
        collectionId={collectionId}
        renderProfile={collection.render_profile}
      />

      <section style={panel}>
        <div style={eyebrow}>TRAIT ENGINE</div>
        <h2 style={heading}>Saved layer map</h2>

        {!layers.length ? (
          <p style={copy}>No persistent trait layer map yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 7 }}>
            {layers.map((layer: any, index: number) => (
              <div key={layer.id} style={row}>
                <span style={indexBox}>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong style={{ fontSize: 11 }}>{layer.display_name}</strong>
                  <div style={{ color: "rgba(255,255,255,.42)", fontSize: 9 }}>
                    {layer.trait_type}
                    {layer.is_background ? " · BACKGROUND LAYER" : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <StudioTraitValidation
        session={session}
        collectionId={collectionId}
        verified={verified}
        layers={layers}
        traitAssets={traitAssets || []}
        validationRun={data.validationRun}
      />

      <StudioMintOverrides
        session={session}
        collection={collection}
        verified={verified}
        overrides={mintOverrides || []}
        publishedOverrides={publishedMintOverrides || []}
        onChanged={load}
      />

      <section style={panel}>
        <div style={eyebrow}>OFFICIAL BACKGROUNDS</div>
        <h2 style={heading}>Background package drafts</h2>

        {!backgrounds.length ? (
          <p style={copy}>No creator background packages saved yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 7 }}>
            {backgrounds.map((background: any) => (
              <div key={background.id} style={row}>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: 11 }}>{background.name}</strong>
                  <div style={{ color: "rgba(255,255,255,.42)", fontSize: 9 }}>
                    {background.source} · {background.publish_status}
                  </div>
                </div>

                {background.publish_status === "published" ? (
                  <button
                    style={{ ...dangerButton, minHeight: 30 }}
                    disabled={busy || !verified}
                    onClick={() => unpublishBackground(background.id)}
                  >
                    UNPUBLISH
                  </button>
                ) : (
                  <button
                    style={{ ...primaryButton, minHeight: 30 }}
                    disabled={busy || !verified}
                    onClick={() => publishBackground(background.id)}
                  >
                    {verified ? "PUBLISH" : "LOCKED"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
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
        display: "grid",
        gap: 3,
      }}
    >
      <span style={{ fontSize: 8, letterSpacing: ".12em", color: "rgba(255,255,255,.4)" }}>
        {label}
      </span>
      <strong style={{ fontSize: 13 }}>{value}</strong>
    </div>
  );
}

const panel = {
  borderRadius: 22,
  padding: 20,
  border: "1px solid rgba(255,255,255,.09)",
  background: "rgba(10,8,20,.72)",
  boxShadow: "0 20px 60px rgba(0,0,0,.25)",
} as const;

const eyebrow = {
  color: "#cbb9ff",
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: ".17em",
} as const;

const copy = {
  margin: "5px 0",
  color: "rgba(255,255,255,.55)",
  fontSize: 11,
  lineHeight: 1.55,
} as const;

const heading = {
  margin: "6px 0 10px",
  fontSize: 19,
} as const;

const stats = {
  marginTop: 15,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))",
  gap: 8,
} as const;

const row = {
  borderRadius: 13,
  border: "1px solid rgba(255,255,255,.07)",
  background: "rgba(255,255,255,.025)",
  padding: 10,
  display: "flex",
  gap: 9,
  alignItems: "center",
} as const;

const indexBox = {
  width: 30,
  height: 30,
  borderRadius: 9,
  display: "grid",
  placeItems: "center",
  background: "rgba(203,185,255,.08)",
  color: "#cfbfff",
  fontSize: 9,
  fontWeight: 900,
} as const;

const button = {
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
  letterSpacing: ".08em",
  cursor: "pointer",
} as const;

const primaryButton = {
  ...button,
  background: "#ff3fb4",
  color: "#151019",
} as const;

const dangerButton = {
  ...button,
  border: "1px solid rgba(255,118,118,.18)",
  background: "rgba(255,88,88,.07)",
  color: "#ffc2c2",
} as const;

const secondaryDangerButton = {
  ...button,
  border: "1px solid rgba(255,202,122,.16)",
  background: "rgba(255,184,78,.05)",
  color: "#ffd5a2",
} as const;

const notice = {
  marginTop: 10,
  borderRadius: 12,
  padding: 9,
  border: "1px solid rgba(255,255,255,.07)",
  background: "rgba(255,255,255,.025)",
  color: "rgba(255,255,255,.6)",
  fontSize: 10,
} as const;
