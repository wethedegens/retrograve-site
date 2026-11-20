import { notFound } from "next/navigation";
import LocalLayerLab from "./tester";
export const dynamic = "force-dynamic";
export default function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <LocalLayerLab />;
}
