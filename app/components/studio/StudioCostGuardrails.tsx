// app/components/studio/StudioCostGuardrails.tsx
import {
  COST_GUARDRAILS,
  formatBytes,
} from "../../lib/lockscreened/costGuardrails";

export default function StudioCostGuardrails() {
  const rows = [
    [
      "Trait file",
      formatBytes(COST_GUARDRAILS.traitImport.maxFileBytes),
      "Reject oversized source assets before upload",
    ],
    [
      "Trait import",
      formatBytes(COST_GUARDRAILS.traitImport.maxBatchBytes),
      `Up to ${COST_GUARDRAILS.traitImport.maxFiles.toLocaleString()} files`,
    ],
    [
      "Background file",
      formatBytes(COST_GUARDRAILS.background.maxFileBytes),
      "Original source; previews will be smaller",
    ],
    [
      "Background package",
      formatBytes(COST_GUARDRAILS.background.maxPackageBytes),
      "Phone + optional iPad + desktop combined",
    ],
    [
      "Collection soft target",
      formatBytes(COST_GUARDRAILS.project.softSourceStorageBytes),
      "Studio warns before this point",
    ],
    [
      "Free beta global stop",
      formatBytes(COST_GUARDRAILS.freeTier.globalSourceStorageStopBytes),
      "Leave headroom before provider quota",
    ],
  ];

  return (
    <section
      style={{
        marginTop: 28,
        borderRadius: 24,
        padding: 22,
        border: "1px solid rgba(129,255,191,.13)",
        background: "rgba(9,18,15,.64)",
        boxShadow: "0 24px 70px rgba(0,0,0,.25)",
      }}
    >
      <div
        style={{
          color: "#9fffd0",
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: ".2em",
        }}
      >
        COST GUARDRAILS · FREE-TIER FIRST
      </div>
      <h2 style={{ margin: "7px 0 6px", fontSize: 23 }}>
        Cheap by construction
      </h2>
      <p
        style={{
          margin: 0,
          maxWidth: 760,
          color: "rgba(255,255,255,.6)",
          fontSize: 12,
          lineHeight: 1.6,
        }}
      >
        Studio rejects unreasonable source uploads before they reach storage.
        The beta also keeps private source art separate from public previews so
        collectors never need to repeatedly download giant original files.
      </p>

      <div
        style={{
          marginTop: 15,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 9,
        }}
      >
        {rows.map(([label, value, note]) => (
          <div
            key={label}
            style={{
              borderRadius: 14,
              padding: 12,
              border: "1px solid rgba(255,255,255,.07)",
              background: "rgba(255,255,255,.025)",
              display: "grid",
              gap: 3,
            }}
          >
            <span
              style={{
                color: "rgba(255,255,255,.44)",
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: ".13em",
              }}
            >
              {label.toUpperCase()}
            </span>
            <strong style={{ fontSize: 16 }}>{value}</strong>
            <small style={{ color: "rgba(255,255,255,.46)", fontSize: 9 }}>
              {note}
            </small>
          </div>
        ))}
      </div>
    </section>
  );
}
