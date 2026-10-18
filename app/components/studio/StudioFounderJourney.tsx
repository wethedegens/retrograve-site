// app/components/studio/StudioFounderJourney.tsx
"use client";

type Step = {
  number: number;
  title: string;
  detail: string;
  done: boolean;
  href: string;
  action: string;
};

export default function StudioFounderJourney({
  data,
  collectionId,
}: {
  data: any;
  collectionId: string;
}) {
  const collection = data.collection || {};
  const layered = collection.render_mode === "layered_traits";
  const profile = collection.public_profile || {};
  const publicBgs = data.publishedBackgroundAssets || [];

  const steps: Step[] = [
    {
      number: 1,
      title: "Verify your collection",
      detail:
        "Confirm that the connected wallet currently controls this collection.",
      done: data.claim?.status === "verified",
      href: "/studio#claim",
      action: "VERIFY COLLECTION",
    },
    {
      number: 2,
      title: "Upload original trait artwork",
      detail:
        "Choose the same source-art folders used to build the collection. Files stay private.",
      done: Boolean(data.traitAssets?.length),
      href: "/studio#trait-import",
      action: "UPLOAD TRAITS",
    },
    {
      number: 3,
      title: "Confirm the layer order",
      detail:
        "Make sure LockScreened rebuilds the NFT in the same order as the original art.",
      done:
        !layered ||
        Boolean(collection.render_profile?.layerOrderConfirmedAt),
      href: "#layer-order",
      action: "REVIEW LAYERS",
    },
    {
      number: 4,
      title: "Validate real NFTs",
      detail:
        "LockScreened compares the saved trait library against real minted NFTs before launch.",
      done: !layered || data.validationRun?.status === "passed",
      href: "#validation",
      action: "RUN VALIDATION",
    },
    {
      number: 5,
      title: "Add an official phone background",
      detail:
        "A phone background is required. iPad and desktop versions are optional.",
      done: publicBgs.some((item: any) => item.device === "phone"),
      href: "/studio#background-builder",
      action: "ADD BACKGROUND",
    },
    {
      number: 6,
      title: "Finish your public project details",
      detail:
        "Add the name, short description, links and public Locker URL collectors will see.",
      done: Boolean(
        String(profile.tagline || profile.description || "").trim()
      ),
      href: "#project-details",
      action: "ADD PROJECT DETAILS",
    },
  ];

  const next = steps.find((step) => !step.done);
  const complete = steps.filter((step) => step.done).length;
  const ready = !next;

  return (
    <section style={panel}>
      <div style={top}>
        <div>
          <div style={eyebrow}>FOUNDER SETUP</div>
          <h2 style={heading}>
            {ready ? "Your Locker setup is complete" : "One clear step at a time"}
          </h2>
          <p style={copy}>
            {ready
              ? "Preview the collector experience, then publish when you are happy with it."
              : "You do not need to learn the LockScreened system. Complete the highlighted step and we will move you forward."}
          </p>
        </div>
        <div style={progress}>{complete} / {steps.length} COMPLETE</div>
      </div>

      {next ? (
        <a href={next.href} style={nextCard}>
          <div style={nextNumber}>{String(next.number).padStart(2, "0")}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={nextLabel}>NEXT STEP</div>
            <strong style={{ display: "block", marginTop: 2, fontSize: 15 }}>
              {next.title}
            </strong>
            <span style={nextDetail}>{next.detail}</span>
          </div>
          <span style={nextAction}>{next.action} →</span>
        </a>
      ) : (
        <a href={"/studio/preview/" + collectionId} style={nextCard}>
          <div style={nextNumber}>✓</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={nextLabel}>FINAL CHECK</div>
            <strong style={{ display: "block", marginTop: 2, fontSize: 15 }}>
              Preview the collector experience
            </strong>
            <span style={nextDetail}>
              Review the public-facing Locker before you publish it.
            </span>
          </div>
          <span style={nextAction}>OPEN PREVIEW →</span>
        </a>
      )}

      <div style={stepGrid}>
        {steps.map((step) => (
          <a
            key={step.number}
            href={step.href}
            style={{
              ...stepCard,
              opacity: step.done ? 0.62 : step === next ? 1 : 0.82,
              border:
                step === next
                  ? "1px solid rgba(255,63,180,.3)"
                  : "1px solid rgba(255,255,255,.07)",
            }}
          >
            <span
              style={{
                ...smallNumber,
                color: step.done ? "#a9ffd2" : "#ff9bd8",
              }}
            >
              {step.done ? "✓" : String(step.number).padStart(2, "0")}
            </span>
            <span style={{ flex: 1 }}>{step.title}</span>
            <strong
              style={{
                fontSize: 7,
                letterSpacing: ".08em",
                color: step.done ? "#a9ffd2" : "rgba(255,255,255,.42)",
              }}
            >
              {step.done ? "DONE" : "TO DO"}
            </strong>
          </a>
        ))}
      </div>

      <div style={safety}>
        PRIVATE SOURCE ART · NOTHING GOES PUBLIC UNTIL YOU EXPLICITLY PUBLISH ·
        CURRENT COLLECTION AUTHORITY IS RE-CHECKED AT PUBLISH TIME
      </div>
    </section>
  );
}

const panel = {
  borderRadius: 22,
  padding: 20,
  border: "1px solid rgba(255,99,194,.13)",
  background:
    "linear-gradient(135deg,rgba(16,10,29,.82),rgba(9,8,18,.7))",
  boxShadow: "0 20px 60px rgba(0,0,0,.24)",
} as const;

const top = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "flex-start",
  flexWrap: "wrap",
} as const;

const eyebrow = {
  color: "#ff8dce",
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: ".17em",
} as const;

const heading = { margin: "6px 0 4px", fontSize: 21 } as const;

const copy = {
  margin: 0,
  maxWidth: 650,
  color: "rgba(255,255,255,.55)",
  fontSize: 10,
  lineHeight: 1.55,
} as const;

const progress = {
  borderRadius: 999,
  padding: "7px 9px",
  border: "1px solid rgba(255,255,255,.09)",
  color: "#ff9bd8",
  fontSize: 8,
  fontWeight: 900,
  letterSpacing: ".08em",
} as const;

const nextCard = {
  marginTop: 14,
  borderRadius: 17,
  padding: 13,
  display: "flex",
  gap: 11,
  alignItems: "center",
  flexWrap: "wrap",
  border: "1px solid rgba(255,63,180,.28)",
  background:
    "linear-gradient(135deg,rgba(255,63,180,.08),rgba(143,107,255,.07))",
  color: "#fff",
  textDecoration: "none",
} as const;

const nextNumber = {
  width: 38,
  height: 38,
  borderRadius: 12,
  display: "grid",
  placeItems: "center",
  background: "#ff3fb4",
  color: "#151019",
  fontSize: 10,
  fontWeight: 900,
} as const;

const nextLabel = {
  color: "#ff9bd8",
  fontSize: 7,
  fontWeight: 900,
  letterSpacing: ".13em",
} as const;

const nextDetail = {
  display: "block",
  marginTop: 3,
  color: "rgba(255,255,255,.54)",
  fontSize: 9,
  lineHeight: 1.45,
} as const;

const nextAction = {
  color: "#fff",
  fontSize: 8,
  fontWeight: 900,
  letterSpacing: ".08em",
} as const;

const stepGrid = {
  marginTop: 10,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
  gap: 6,
} as const;

const stepCard = {
  borderRadius: 11,
  padding: "8px 9px",
  background: "rgba(255,255,255,.02)",
  display: "flex",
  gap: 7,
  alignItems: "center",
  color: "rgba(255,255,255,.7)",
  textDecoration: "none",
  fontSize: 8,
} as const;

const smallNumber = {
  minWidth: 22,
  fontWeight: 900,
  fontSize: 8,
} as const;

const safety = {
  marginTop: 10,
  paddingTop: 9,
  borderTop: "1px solid rgba(255,255,255,.06)",
  color: "rgba(255,255,255,.32)",
  fontSize: 7,
  lineHeight: 1.5,
  letterSpacing: ".06em",
} as const;
