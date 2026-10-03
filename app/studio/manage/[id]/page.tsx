// app/studio/manage/[id]/page.tsx
import StudioDraftProjectManager from "../../../components/studio/StudioDraftProjectManager";

export const dynamic = "force-dynamic";

export default function StudioManageDraftPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(900px 520px at 50% 0, rgba(104,65,191,.2), transparent 70%), #07060d",
        color: "#fff",
        padding: "40px 18px 90px",
      }}
    >
      <div style={{ width: "min(1000px,100%)", margin: "0 auto" }}>
        <a
          href="/studio"
          style={{
            color: "#cdbbff",
            textDecoration: "none",
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: ".12em",
          }}
        >
          ← CREATOR STUDIO
        </a>

        <div style={{ marginTop: 16 }}>
          <StudioDraftProjectManager collectionId={params.id} />
        </div>
      </div>
    </main>
  );
}
