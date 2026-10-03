// app/components/studio/StudioProjectPreview.tsx
"use client";

import { useEffect, useState } from "react";
import { getStudioCollection } from "../../lib/lockscreened/studioDataClient";
import { downloadStorageBlob } from "../../lib/lockscreened/studioStorageClient";
import { getFreshSession, readStoredSession } from "../../lib/lockscreened/web3AuthClient";

export default function StudioProjectPreview({ collectionId }: { collectionId: string }) {
  const [data, setData] = useState<any>(null);
  const [phonePreview, setPhonePreview] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    let objectUrl = "";

    (async () => {
      try {
        const session = (await getFreshSession()) || readStoredSession();
        if (!session) throw new Error("Sign in to Creator Studio to preview this draft.");

        const next = await getStudioCollection(session, collectionId);
        if (!active) return;
        setData(next);

        const firstPackage = next.backgrounds?.[0];
        const phoneSource = firstPackage
          ? next.backgroundSourceAssets?.find(
              (asset: any) => asset.package_id === firstPackage.id && asset.device === "phone"
            )
          : null;

        if (phoneSource) {
          const blob = await downloadStorageBlob({
            session,
            bucket: phoneSource.storage_bucket,
            path: phoneSource.storage_path,
          });
          if (!active) return;
          objectUrl = URL.createObjectURL(blob);
          setPhonePreview(objectUrl);
        }
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : "Could not load preview.");
      }
    })();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [collectionId]);

  if (!data) {
    return <div style={notice}>{message || "Loading private LockScreened preview…"}</div>;
  }

  const collection = data.collection;
  const profile = collection.public_profile || {};
  const publicSlug = collection.public_slug || collection.slug;

  return (
    <div style={{ display: "grid", gap: 13 }}>
      <section style={previewPanel}>
        <div style={previewHeader}>
          <div>
            <div style={eyebrow}>PRIVATE PREVIEW · NOT PUBLIC</div>
            <h1 style={{ margin: "7px 0 0", fontSize: "clamp(34px,6vw,58px)", lineHeight: .96, letterSpacing: "-.04em" }}>
              {collection.name}
            </h1>
            {profile.tagline ? <div style={tagline}>{profile.tagline}</div> : null}
            <p style={description}>
              {profile.description || "Add a project description in Public Project Identity to preview it here."}
            </p>

            <div style={actions}>
              <span style={pinkButton}>VIEW MY COLLECTION</span>
              {profile.marketplace ? <span style={ghostButton}>COLLECT</span> : null}
            </div>

            <div style={urlBox}>
              PUBLIC URL AFTER LAUNCH · /projects/{publicSlug}
            </div>
          </div>

          <div style={phoneFrame}>
            {phonePreview ? (
              <img src={phonePreview} alt="" style={phoneImage} />
            ) : (
              <div style={phoneEmpty}>Upload a private phone background to preview the public hero.</div>
            )}
            <div style={phoneBrand}>{collection.name.toUpperCase()} · LOCKSCREENED</div>
          </div>
        </div>
      </section>

      <section style={infoPanel}>
        <div style={eyebrow}>PREVIEW CHECK</div>
        <div style={infoGrid}>
          <Info label="PROJECT STATE" value={collection.publish_status.toUpperCase()} />
          <Info label="CLAIM" value={(data.claim?.status || "none").toUpperCase()} />
          <Info label="RENDER MODE" value={String(collection.render_mode).replace(/_/g, " ").toUpperCase()} />
          <Info label="BACKGROUNDS" value={String(data.backgrounds?.length || 0)} />
        </div>
        <p style={hint}>
          This preview is authenticated and uses private founder assets. Collectors cannot access it until the project and its public derivatives are explicitly published.
        </p>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={infoCard}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const previewPanel = { borderRadius: 24, padding: 22, background: "linear-gradient(135deg,rgba(14,10,28,.8),rgba(9,8,18,.68))", border: "1px solid rgba(255,99,194,.13)", boxShadow: "0 24px 70px rgba(0,0,0,.28)" } as const;
const previewHeader = { display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(220px,340px)", gap: 28, alignItems: "center" } as const;
const eyebrow = { color: "#ff8dce", fontSize: 9, fontWeight: 900, letterSpacing: ".18em" } as const;
const tagline = { marginTop: 10, color: "#dacfff", fontSize: 13, fontWeight: 800 } as const;
const description = { maxWidth: 620, margin: "12px 0 0", color: "rgba(255,255,255,.6)", fontSize: 11, lineHeight: 1.6 } as const;
const actions = { marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" } as const;
const pinkButton = { display: "inline-flex", minHeight: 38, alignItems: "center", borderRadius: 999, padding: "0 13px", background: "#ff3fb4", color: "#151019", fontSize: 8, fontWeight: 900, letterSpacing: ".08em" } as const;
const ghostButton = { ...pinkButton, background: "rgba(255,255,255,.05)", color: "#fff", border: "1px solid rgba(255,255,255,.1)" } as const;
const urlBox = { marginTop: 15, color: "rgba(255,255,255,.38)", fontSize: 8, letterSpacing: ".08em" } as const;
const phoneFrame = { position: "relative", width: "100%", aspectRatio: "9 / 19.5", borderRadius: 25, overflow: "hidden", background: "#15111e", border: "8px solid rgba(255,255,255,.06)", boxShadow: "0 24px 70px rgba(0,0,0,.34)" } as const;
const phoneImage = { width: "100%", height: "100%", objectFit: "cover", display: "block" } as const;
const phoneEmpty = { width: "100%", height: "100%", display: "grid", placeItems: "center", padding: 20, textAlign: "center", color: "rgba(255,255,255,.34)", fontSize: 9 } as const;
const phoneBrand = { position: "absolute", left: 10, right: 10, bottom: 10, borderRadius: 10, padding: 8, background: "rgba(0,0,0,.46)", backdropFilter: "blur(10px)", fontSize: 7, fontWeight: 900, letterSpacing: ".1em" } as const;
const infoPanel = { borderRadius: 20, padding: 16, background: "rgba(10,8,20,.7)", border: "1px solid rgba(255,255,255,.09)" } as const;
const infoGrid = { marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 7 } as const;
const infoCard = { borderRadius: 11, padding: 9, background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.06)", display: "grid", gap: 3, fontSize: 8, color: "rgba(255,255,255,.4)" } as const;
const hint = { margin: "10px 0 0", color: "rgba(255,255,255,.44)", fontSize: 8, lineHeight: 1.5 } as const;
const notice = { borderRadius: 18, padding: 18, background: "rgba(10,8,20,.72)", border: "1px solid rgba(255,99,194,.13)", color: "rgba(255,255,255,.62)", fontSize: 10 } as const;
