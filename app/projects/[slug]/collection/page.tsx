// app/projects/[slug]/collection/page.tsx
import { Suspense } from "react";
import CollectorPilot from "../../../components/studio/CollectorPilot";
import { notFound } from "next/navigation";
import NftGridByContract from "../../../components/NftGridByContract";
import { getPublishedStudioProjectBySlug } from "../../../lib/lockscreened/publicStudioData";
import LockScreenedPublicShell from "../../../components/studio/LockScreenedPublicShell";

export const dynamic = "force-dynamic";

export default async function PublishedStudioCollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const project = await getPublishedStudioProjectBySlug((await params).slug);
  if (!project) notFound();

  const collectionAddress = String(
    project?.source_config?.collectionIds?.[0] || ""
  ).trim();

  if (!collectionAddress) notFound();

  return (
    <LockScreenedPublicShell
      projectName={project.name}
      appearance={project.render_profile?.pageAppearance}
      pageKind="gallery"
      backHref={"/projects/" + (project.route_slug || project.slug)}
      backLabel={project.name.toUpperCase()}
      maxWidth={1180}
    >
      {project.render_mode === "layered_traits" ? <Suspense fallback={<p>Loading your collection...</p>}><CollectorPilot projectId={project.id} publicSlug={project.route_slug}/></Suspense> : <NftGridByContract
          contract={collectionAddress}
          title={"MY " + project.name.toUpperCase()}
          project={"studio:" + (project.route_slug || project.slug)}
        />}
    </LockScreenedPublicShell>
  );
}
