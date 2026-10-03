// app/components/studio/StudioLaunchReadiness.tsx
"use client";

import { formatBytes } from "../../lib/lockscreened/costGuardrails";

export default function StudioLaunchReadiness({ data }: { data: any }) {
  const collection = data.collection || {};
  const claim = data.claim;
  const layers = data.layers || [];
  const traitAssets = data.traitAssets || [];
  const publicTraits = data.publishedTraitAssets || [];
  const backgrounds = data.backgrounds || [];
  const bgSources = data.backgroundSourceAssets || [];
  const publicBgs = data.publishedBackgroundAssets || [];
  const mintOverrides = data.mintOverrides || [];

  const privateBytes =
    traitAssets.reduce((sum: number, item: any) => sum + Number(item.bytes || 0), 0) +
    bgSources.reduce((sum: number, item: any) => sum + Number(item.bytes || 0), 0) +
    mintOverrides.reduce((sum: number, item: any) => sum + Number(item.bytes || 0), 0);

  const softTarget = 50 * 1024 * 1024;
  const hardTarget = 150 * 1024 * 1024;
  const profile = collection.public_profile || {};
  const layered = collection.render_mode === "layered_traits";
  const hasPhoneBackground = publicBgs.some((item: any) => item.device === "phone");

  const checks = [
    { label: "Collection authority verified", ok: claim?.status === "verified" },
    { label: "Project identity added", ok: Boolean(String(profile.description || profile.tagline || "").trim()) },
    { label: "At least one published phone background", ok: hasPhoneBackground },
    { label: "Trait layer order confirmed", ok: !layered || layers.length > 0 },
    { label: "Private trait library uploaded", ok: !layered || traitAssets.length > 0 },
    { label: "Public render derivatives published", ok: !layered || publicTraits.length > 0 },
    { label: "Private source storage under hard cap", ok: privateBytes <= hardTarget },
  ];

  const ready = checks.every((item) => item.ok);
  const percent = Math.min(100, Math.round((privateBytes / hardTarget) * 100));

  return (
    <section style={panel}>
      <div style={topRow}>
        <div>
          <div style={eyebrow}>LAUNCH READINESS</div>
          <h2 style={heading}>{ready ? "Ready for launch" : "Finish setup before launch"}</h2>
        </div>
        <div style={{ ...pill, color: ready ? "#a9ffd2" : "#ffd99d" }}>
          {ready ? "READY" : "NOT READY"}
        </div>
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 7 }}>
        {checks.map((item) => (
          <div key={item.label} style={row}>
            <span style={{ color: item.ok ? "#a9ffd2" : "#ffd99d", fontWeight: 900 }}>
              {item.ok ? "✓" : "○"}
            </span>
            <span style={{ flex: 1 }}>{item.label}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={meterHeader}>
          <span>PRIVATE SOURCE STORAGE</span>
          <strong>{formatBytes(privateBytes)}</strong>
        </div>
        <div style={meterTrack}>
          <div style={{ ...meterFill, width: percent + "%" }} />
        </div>
        <div style={meterFooter}>
          <span>Soft target {formatBytes(softTarget)}</span>
          <span>Hard target {formatBytes(hardTarget)}</span>
        </div>
        {privateBytes > softTarget ? (
          <div style={warning}>
            This collection is above the preferred free-tier source-art target. Consider optimizing source files before adding more.
          </div>
        ) : null}
      </div>

      <div style={miniStats}>
        <Stat label="PRIVATE TRAITS" value={String(traitAssets.length)} />
        <Stat label="PUBLIC TRAITS" value={String(publicTraits.length)} />
        <Stat label="BG PACKAGES" value={String(backgrounds.length)} />
        <Stat label="MINT OVERRIDES" value={String(mintOverrides.length)} />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ borderRadius: 11, padding: 9, border: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.02)" }}>
      <div style={{ fontSize: 7, color: "rgba(255,255,255,.38)", letterSpacing: ".09em" }}>{label}</div>
      <strong style={{ display: "block", marginTop: 2, fontSize: 13 }}>{value}</strong>
    </div>
  );
}

const panel = { borderRadius: 22, padding: 20, border: "1px solid rgba(255,255,255,.09)", background: "rgba(10,8,20,.72)" } as const;
const topRow = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" } as const;
const eyebrow = { color: "#a9ffd2", fontSize: 9, fontWeight: 900, letterSpacing: ".17em" } as const;
const heading = { margin: "6px 0 0", fontSize: 19 } as const;
const pill = { borderRadius: 999, padding: "7px 9px", border: "1px solid rgba(255,255,255,.08)", fontSize: 8, fontWeight: 900, letterSpacing: ".1em" } as const;
const row = { borderRadius: 11, padding: "8px 9px", border: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.02)", display: "flex", gap: 8, alignItems: "center", color: "rgba(255,255,255,.62)", fontSize: 9 } as const;
const meterHeader = { display: "flex", justifyContent: "space-between", gap: 10, fontSize: 8, color: "rgba(255,255,255,.48)" } as const;
const meterTrack = { marginTop: 6, height: 8, borderRadius: 999, overflow: "hidden", background: "rgba(255,255,255,.06)" } as const;
const meterFill = { height: "100%", borderRadius: 999, background: "linear-gradient(90deg, rgba(142,231,255,.7), rgba(174,255,210,.8))" } as const;
const meterFooter = { marginTop: 5, display: "flex", justifyContent: "space-between", gap: 10, color: "rgba(255,255,255,.32)", fontSize: 7 } as const;
const warning = { marginTop: 8, borderRadius: 10, padding: 8, border: "1px solid rgba(255,196,118,.12)", color: "#ffd5a2", fontSize: 8, background: "rgba(255,196,118,.05)" } as const;
const miniStats = { marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 7 } as const;
