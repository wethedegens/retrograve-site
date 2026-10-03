// app/projects/[slug]/locker/page.tsx
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PublishedStudioLocker from "../../../components/studio/PublishedStudioLocker";
import { getPublishedStudioProjectBySlug } from "../../../lib/lockscreened/publicStudioData";
import LockScreenedPublicShell from "../../../components/studio/LockScreenedPublicShell";

export const dynamic = "force-dynamic";

export default async function PublishedStudioLockerPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = await getPublishedStudioProjectBySlug(params.slug);
  if (!project) notFound();

  return (
    <LockScreenedPublicShell
      projectName={project.name}
      backHref={"/projects/" + (project.route_slug || project.slug) + "/collection"}
      backLabel={"BACK TO " + project.name.toUpperCase()}
    >
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "70vh",
            display: "grid",
            placeItems: "center",
            background: "#08070f",
            color: "#cdbbff",
          }}
        >
          Loading Creator Studio locker…
        </main>
      }
    >
      <PublishedStudioLocker
        project={{
          slug: (project.route_slug || project.slug),
          name: project.name,
          render_mode: project.render_mode,
          render_profile: project.render_profile,
          backgrounds: project.backgrounds,
          layers: project.layers || [],
          publishedTraitAssets: project.publishedTraitAssets || [],
          publishedMintOverrides: project.publishedMintOverrides || [],
        }}
      />
    </Suspense>
    </LockScreenedPublicShell>
  );
}
