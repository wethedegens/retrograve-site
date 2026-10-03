// app/projects/[slug]/locker/page.tsx
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PublishedStudioLocker from "../../../components/studio/PublishedStudioLocker";
import { getPublishedStudioProjectBySlug } from "../../../lib/lockscreened/publicStudioData";

export const dynamic = "force-dynamic";

export default async function PublishedStudioLockerPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = await getPublishedStudioProjectBySlug(params.slug);
  if (!project) notFound();

  return (
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
          slug: project.slug,
          name: project.name,
          render_mode: project.render_mode,
          backgrounds: project.backgrounds,
          layers: project.layers || [],
          publishedTraitAssets: project.publishedTraitAssets || [],
        }}
      />
    </Suspense>
  );
}
