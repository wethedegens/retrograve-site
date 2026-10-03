// app/components/studio/StudioBackendStatus.tsx
import { getBackendStatus } from "../../lib/lockscreened/backendConfig";
import { checkSupabaseHealth } from "../../lib/lockscreened/server/supabaseHealth";
import { hasSupabaseAdminKey } from "../../lib/lockscreened/server/supabaseServer";

function Dot({
  tone,
}: {
  tone: "ok" | "pending" | "warn";
}) {
  const color =
    tone === "ok" ? "#8dffc4" : tone === "pending" ? "#ffd28a" : "#ff9dad";

  return (
    <span
      aria-hidden="true"
      style={{
        width: 8,
        height: 8,
        borderRadius: 999,
        display: "inline-block",
        background: color,
        boxShadow: "0 0 12px rgba(255,255,255,.16)",
      }}
    />
  );
}

function SecurityRow({
  tone,
  label,
  value,
}: {
  tone: "ok" | "pending" | "warn";
  label: string;
  value: string;
}) {
  return (
    <div style={rowStyle}>
      <Dot tone={tone} />
      <span>{label}</span>
      <strong
        style={{
          color:
            tone === "ok"
              ? "#a9ffd2"
              : tone === "pending"
                ? "#ffd99d"
                : "#ffb8c2",
          textAlign: "right",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

export default async function StudioBackendStatus() {
  const status = getBackendStatus();
  const supabaseHealth = await checkSupabaseHealth();
  const persistenceReady =
    status.heliusConfigured && status.supabaseConfigured && supabaseHealth.ok;
  const securePublishingReady = hasSupabaseAdminKey();

  // These provider/dashboard settings cannot be reliably introspected through
  // the connected tooling, so they remain explicit launch checklist items.
  const productionFounderOnboardingReady = false;

  return (
    <section
      style={{
        marginBottom: 24,
        borderRadius: 18,
        border: "1px solid rgba(255,99,194,.13)",
        background:
          "linear-gradient(135deg, rgba(14,11,28,.78), rgba(9,8,18,.62))",
        padding: 14,
        display: "grid",
        gap: 12,
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
              color: "#ff8dce",
            }}
          >
            LOCKSCREENED SECURITY READINESS
          </div>
          <strong style={{ display: "block", marginTop: 3, fontSize: 13 }}>
            {productionFounderOnboardingReady
              ? "Public founder onboarding ready"
              : "Alpha hardened · public founder onboarding still gated"}
          </strong>
        </div>

        <div
          style={{
            borderRadius: 999,
            padding: "7px 9px",
            border: "1px solid rgba(255,255,255,.09)",
            color: productionFounderOnboardingReady ? "#a9ffd2" : "#ffd99d",
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: ".1em",
          }}
        >
          {productionFounderOnboardingReady
            ? "PRODUCTION READY"
            : "DO NOT OPEN PUBLICLY YET"}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 8,
        }}
      >
        <SecurityRow
          tone={supabaseHealth.ok ? "ok" : "warn"}
          label="Supabase / RLS"
          value={
            supabaseHealth.ok
              ? "CONNECTED + RLS"
              : status.supabaseConfigured
                ? "HEALTH CHECK FAILED"
                : "NOT CONFIGURED"
          }
        />

        <SecurityRow
          tone={status.heliusConfigured ? "ok" : "warn"}
          label="Helius authority checks"
          value={status.heliusConfigured ? "SERVER CONFIGURED" : "MISSING KEY"}
        />

        <SecurityRow
          tone="ok"
          label="Privileged API origin checks"
          value="SAME-ORIGIN ENFORCED"
        />

        <SecurityRow
          tone="ok"
          label="Privileged action throttling"
          value="PERSISTENT PER-FOUNDER"
        />

        <SecurityRow
          tone="ok"
          label="Studio caching / indexing"
          value="NO-STORE + NOINDEX"
        />

        <SecurityRow
          tone={securePublishingReady ? "ok" : "pending"}
          label="Secure publish/finalization"
          value={
            securePublishingReady
              ? "SERVER SECRET PRESENT"
              : "WAITING FOR VERCEL SECRET"
          }
        />

        <SecurityRow
          tone="pending"
          label="Web3 bot protection"
          value="ENABLE CAPTCHA + AUTH RATE LIMIT"
        />

        <SecurityRow
          tone="pending"
          label="Auth redirect pinning"
          value="CONFIRM OFFICIAL DOMAINS"
        />

        <SecurityRow
          tone="pending"
          label="Founder session architecture"
          value="PER-TAB ALPHA → HTTPONLY BEFORE LAUNCH"
        />
      </div>

      <div
        style={{
          borderRadius: 12,
          padding: 10,
          border: "1px solid rgba(169,255,210,.11)",
          background: "rgba(93,255,170,.025)",
          color: "rgba(255,255,255,.54)",
          fontSize: 8,
          lineHeight: 1.55,
        }}
      >
        <strong style={{ color: "#a9ffd2" }}>Current alpha protections:</strong>{" "}
        off-chain wallet signatures, server-side authority re-checks, RLS,
        private source buckets, explicit public derivatives, flagship claim
        reservation, persistent action throttling, same-origin privileged APIs,
        launch validation gates, and reversible unpublish/archive controls.
      </div>

      {!persistenceReady ? (
        <p
          style={{
            margin: 0,
            color: "rgba(255,255,255,.42)",
            fontSize: 9,
            lineHeight: 1.5,
          }}
        >
          Creator Studio persistence is not fully available until the dedicated
          LockScreened backend configuration is healthy.
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
  gridTemplateColumns: "auto minmax(0,1fr) auto",
  alignItems: "center",
  gap: 8,
  fontSize: 9,
  color: "rgba(255,255,255,.62)",
} as const;
