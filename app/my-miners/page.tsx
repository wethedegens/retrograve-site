"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MyMinersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/enchanted-miners");
  }, [router]);

  return null;
}
