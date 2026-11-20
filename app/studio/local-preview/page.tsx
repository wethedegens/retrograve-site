import { notFound } from "next/navigation";
import LocalArtworkPreview from "./preview";

export const dynamic = "force-dynamic";

export default function LocalPreviewPage() {
  // Test harness only: never expose it in a production build.
  if (process.env.NODE_ENV !== "development") notFound();
  return <LocalArtworkPreview />;
}
