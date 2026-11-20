import { notFound } from "next/navigation";
import LocalFounderSetup from "./setup";

export const dynamic = "force-dynamic";

export default function LocalFounderPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <LocalFounderSetup />;
}
