// app/studio/preview/[id]/page.tsx
import LockScreenedStudioShell from "../../../components/studio/LockScreenedStudioShell";
import StudioProjectPreview from "../../../components/studio/StudioProjectPreview";

export const dynamic = "force-dynamic";

export default function StudioPreviewPage({ params }: { params: { id: string } }) {
  return (
    <LockScreenedStudioShell
      eyebrow="LOCKSCREENED PREVIEW LAB"
      title="Public Experience Preview"
      subtitle="See the branded collector-facing project before publishing anything publicly."
      badge="PRIVATE · NOT PUBLIC"
      backHref={"/studio/manage/" + params.id}
      backLabel="BACK TO PROJECT"
      maxWidth={1080}
    >
      <StudioProjectPreview collectionId={params.id} />
    </LockScreenedStudioShell>
  );
}
