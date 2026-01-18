// app/components/TopNavWrapper.tsx
"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import TopNav from "./TopNav";

export type TopNavProject =
  | "retrograve"
  | "magapixel"
  | "miners"
  | "gainz"
  | "midevils"
  | "meowga"
  | "zeromonkebiz"
  | "sagamonkes"
  | "dogeminers";

function inferProjectFromRoute(
  pathname: string,
  searchParams: URLSearchParams
): TopNavProject {
  const p = (pathname || "").toLowerCase();

  if (p === "/" || p.startsWith("/community") || p.startsWith("/my-retrograves"))
    return "retrograve";

  if (p.startsWith("/doge-miners")) return "dogeminers";
  if (p.startsWith("/doge-miners-nfts")) return "dogeminers";

  if (p.startsWith("/locker/magapixel")) return "magapixel";
  if (p.startsWith("/locker/retrograve")) return "retrograve";

  if (p.startsWith("/magapixel-nfts")) return "magapixel";
  if (p.startsWith("/retrogs")) return "magapixel";

  if (p.startsWith("/retrograves-nfts")) return "retrograve";
  if (p.startsWith("/retrograve")) return "retrograve";

  if (p.startsWith("/enchanted-miners")) return "miners";
  if (p.startsWith("/enchanted-miners-nfts")) return "miners";

  if (p.startsWith("/midevils")) return "midevils";
  if (p.startsWith("/midevils-nfts")) return "midevils";

  if (p.startsWith("/gainz")) return "gainz";

  if (p.startsWith("/meowga")) return "meowga";
  if (p.startsWith("/meowga-nfts")) return "meowga";

  if (p.startsWith("/zeromonkebiz")) return "zeromonkebiz";
  if (p.startsWith("/zeromonkebiz-nfts")) return "zeromonkebiz";

  if (p.startsWith("/saga-monkes")) return "sagamonkes";
  if (p.startsWith("/saga-monkes-nfts")) return "sagamonkes";

  if (p.startsWith("/locker")) {
    const qp = (searchParams.get("project") || "").toLowerCase();
    if (qp === "miners") return "miners";
    if (qp === "magapixel") return "magapixel";
    if (qp === "retrograve") return "retrograve";
    if (qp === "gainz") return "gainz";
    if (qp === "midevils") return "midevils";
    if (qp === "meowga") return "meowga";
    if (qp === "zeromonkebiz") return "zeromonkebiz";
    if (qp === "sagamonkes") return "sagamonkes";
    if (qp === "dogeminers" || qp === "doge-miners") return "dogeminers";
    return "magapixel";
  }

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
