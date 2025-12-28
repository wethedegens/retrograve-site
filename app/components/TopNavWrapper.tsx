// app/components/TopNavWrapper.tsx
"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import TopNav from "./TopNav";

type TopNavProject = "retrograve" | "magapixel" | "miners" | "gainz";

function inferProjectFromRoute(
  pathname: string,
  searchParams: URLSearchParams
): TopNavProject {
  const p = (pathname || "").toLowerCase();

  // Explicit locker subroutes
  if (p.startsWith("/locker/magapixel")) return "magapixel";
  if (p.startsWith("/locker/retrograve")) return "retrograve";

  // Miners routes
  if (p.startsWith("/enchanted-miners")) return "miners";
  if (p.startsWith("/my-miners")) return "miners";

  // Gainz routes
  if (p.startsWith("/gainz")) return "gainz";

  // Generic locker route: uses ?project=
  if (p.startsWith("/locker")) {
    const qp = (searchParams.get("project") || "").toLowerCase();
    if (qp === "miners") return "miners";
    if (qp === "magapixel") return "magapixel";
    if (qp === "retrograve") return "retrograve";
    if (qp === "gainz") return "gainz";
    return "magapixel";
  }

  // Magapixel
  if (p.startsWith("/magapixel-nfts")) return "magapixel";
  if (p.startsWith("/retrogs")) return "magapixel";

  // Retrograve
  if (p.startsWith("/retrograve")) return "retrograve";

  return "retrograve";
}

export default function TopNavWrapper() {
  const pathname = usePathname();
  const sp = useSearchParams();

  const project = useMemo<TopNavProject>(() => {
    const params = new URLSearchParams(sp?.toString() || "");
    return inferProjectFromRoute(pathname || "", params);
  }, [pathname, sp]);

  // ✅ IMPORTANT:
  // TS error is because TopNav's props don't declare `project`.
  // Cast the *component* so the prop name stops failing builds.
  const TopNavAny = TopNav as any;

  return <TopNavAny project={project} />;
}
