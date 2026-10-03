// app/components/studio/StudioBackendStatus.tsx
import { getBackendStatus } from "../../lib/lockscreened/backendConfig";

function Dot({ ok }: { ok: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 8,
        height: 8,
        borderRadius: 999,
        display: "inline-block",
        background: ok ? "#8dffc4" : "#ffd28a",
        boxShadow: ok
          ? "0 0 12px rgba(141,255,196,.45)"
          : "0 0 12px rgba(255,210,138,.28)",
      }}
    />
  );
}

export default function StudioBackendStatus() {
  const status = getBackendStatus();

  return (
    <section
      style={{
        marginBottom: 24,
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,.09)",
        background: "rgba(8,8,16,.58)",
        padding: 14,
        display: "grid",
        gap: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: ".16em",
              color: "rgba(255,255,255,.46)",
            }}
          >
            BACKEND STATUS
          </div>
          <strong style={{ fontSize: 13 }}>
            {status.readyForPersistence
              ? "Creator Studio backend is configured"
              : "Creator Studio is running in local-preview mode"}
          </strong>
        </div>

        <div
          style={{
            borderRadius: 999,
            padding: "7px 9px",
            border: "1px solid rgba(255,255,255,.09)",
            color: status.readyForPersistence ? "#a9ffd2" : "#ffd99d",
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: ".1em",
          }}
        >
          {status.readyForPersistence ? "PERSISTENCE READY" : "SAFE PREVIEW"}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 8,
        }}
      >
        <div style={rowStyle}>
          <Dot ok={status.supabaseConfigured} />
          <span>Supabase</span>
          <strong>
            {status.supabaseConfigured ? "Configured" : "Waiting for project keys"}
          </strong>
        </div>

        <div style={rowStyle}>
          <Dot ok={status.heliusConfigured} />
          <span>Helius</span>
          <strong>
            {status.heliusConfigured ? "Configured" : "Missing API key"}
          </strong>
        </div>
      </div>

      {!status.readyForPersistence ? (
        <p
          style={{
            margin: 0,
            color: "rgba(255,255,255,.42)",
            fontSize: 9,
            lineHeight: 1.5,
          }}
        >
          Until the dedicated LockScreened Supabase project is connected, trait
          folders and background packages stay local in your browser and cannot
          be published accidentally.
        </p>
      ) : null}
    </section>
  );
}

const rowStyle = {
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.06)",
  background: "rgba(255,255,255,.025)",
  padding: "9px 10px",
  display: "grid",
  gridTemplateColumns: "auto 1fr auto",
  alignItems: "center",
  gap: 8,
  fontSize: 10,
  color: "rgba(255,255,255,.66)",
} as const;
