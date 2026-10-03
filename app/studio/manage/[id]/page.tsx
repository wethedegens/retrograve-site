// app/studio/manage/[id]/page.tsx
import StudioDraftProjectManager from "../../../components/studio/StudioDraftProjectManager";
import LockScreenedStudioShell from "../../../components/studio/LockScreenedStudioShell";

export const dynamic = "force-dynamic";

export default function StudioManageDraftPage({ params }: { params: { id: string } }) {
  return (
    <LockScreenedStudioShell
      title="Founder Project"
      subtitle="Configure, validate and publish this collection from one protected LockScreened workspace."
      badge="CREATOR CONTROL"
      backHref="/studio"
      backLabel="CREATOR STUDIO"
      maxWidth={1040}
    >
      <StudioDraftProjectManager collectionId={params.id} />
    </LockScreenedStudioShell>
  );
}
