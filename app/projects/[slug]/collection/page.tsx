// app/projects/[slug]/collection/page.tsx
import { notFound } from "next/navigation";
import NftGridByContract from "../../../components/NftGridByContract";
import { getPublishedStudioProjectBySlug } from "../../../lib/lockscreened/publicStudioData";
import LockScreenedPublicShell from "../../../components/studio/LockScreenedPublicShell";

export const dynamic = "force-dynamic";

export default async function PublishedStudioCollectionPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = await getPublishedStudioProjectBySlug(params.slug);
  if (!project) notFound();

  const collectionAddress = String(
    project?.source_config?.collectionIds?.[0] || ""
  ).trim();

  if (!collectionAddress) notFound();

  return (
    <LockScreenedPublicShell
      projectName={project.name}
      backHref={"/projects/" + project.slug}
      backLabel={project.name.toUpperCase()}
      maxWidth={1180}
    >
      <NftGridByContract
          contract={collectionAddress}
          title={"MY " + project.name.toUpperCase()}
          project={"studio:" + project.slug}
        />
    </LockScreenedPublicShell>
  );
}
