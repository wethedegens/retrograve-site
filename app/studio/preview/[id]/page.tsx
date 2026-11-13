import { privatePilotAvailable } from "../../../lib/lockscreened/privatePilot";
import StudioWalletAuth from "../../../components/studio/StudioWalletAuth";
// app/studio/preview/[id]/page.tsx
import LockScreenedStudioShell from "../../../components/studio/LockScreenedStudioShell";
import StudioProjectPreview from "../../../components/studio/StudioProjectPreview";

export const dynamic = "force-dynamic";

export default async function StudioPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const privateCollectorHref = privatePilotAvailable(id) ? `/studio/pilot/${id}` : undefined;
  return (
    <LockScreenedStudioShell
      eyebrow="LOCKSCREENED PREVIEW LAB"
      title="Public Experience Preview"
      subtitle="See the branded collector-facing project before publishing anything publicly."
      badge="PRIVATE · NOT PUBLIC"
      backHref={"/studio/manage/" + (await params).id}
      backLabel="BACK TO PROJECT"
      maxWidth={1080}
    >
      <StudioWalletAuth />
      <StudioProjectPreview collectionId={id} privateCollectorHref={privateCollectorHref} />
    </LockScreenedStudioShell>
  );
}
