// app/projects/[slug]/collection/page.tsx
import { notFound } from "next/navigation";
import NftGridByContract from "../../../components/NftGridByContract";
import { getPublishedStudioProjectBySlug } from "../../../lib/lockscreened/publicStudioData";

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
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(900px 520px at 50% 0, rgba(93,68,174,.16), transparent 70%), #08070f",
        color: "#fff",
        padding: "72px 0 90px",
      }}
    >
      <div style={{ width: "min(1180px,100%)", margin: "0 auto" }}>
        <div style={{ padding: "0 18px 18px" }}>
          <a
            href={"/projects/" + project.slug}
            style={{
              color: "#cdbbff",
              textDecoration: "none",
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: ".1em",
            }}
          >
            ← {project.name.toUpperCase()}
          </a>
        </div>

        <NftGridByContract
          contract={collectionAddress}
          title={"MY " + project.name.toUpperCase()}
          project={"studio:" + project.slug}
        />
      </div>
    </main>
  );
}
