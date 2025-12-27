"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import TopNav from "./TopNav";

type TopNavProject = "retrograve" | "magapixel" | "miners";

function inferProjectFromRoute(
  pathname: string,
  searchParams: URLSearchParams
): TopNavProject {
  const p = (pathname || "").toLowerCase();

  // Explicit locker subroutes
  if (p.startsWith("/locker/magapixel")) return "magapixel";
  if (p.startsWith("/locker/retrograve")) return "retrograve";

  // Miners routes (landing + grid)
  if (p.startsWith("/enchanted-miners")) return "miners";
  if (p.startsWith("/enchanted-miners-nfts")) return "miners";
  if (p.startsWith("/my-miners")) return "miners";

  // Generic locker route: uses ?project=
  if (p.startsWith("/locker")) {
    const qp = (searchParams.get("project") || "").toLowerCase();
    if (qp === "miners") return "miners";
    if (qp === "magapixel") return "magapixel";
    if (qp === "retrograve") return "retrograve";
    return "magapixel";
  }

  // Magapixel
  if (p.startsWith("/magapixel-nfts")) return "magapixel";

  // Retrograve
  if (p.startsWith("/retrograve")) return "retrograve";
  if (p.startsWith("/retrogs")) return "magapixel"; // your MAGApixel grid path

  return "retrograve";
}

export default function TopNavWrapper() {
  const pathname = usePathname();
  const sp = useSearchParams();

  const project = useMemo<TopNavProject>(() => {
    const params = new URLSearchParams(sp?.toString() || "");
    return inferProjectFromRoute(pathname || "", params);
  }, [pathname, sp]);

  return <TopNav project={project} />;
}
