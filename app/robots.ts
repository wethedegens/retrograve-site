// app/robots.ts
import type { MetadataRoute } from "next";

const SITE = "https://retrograve.tv"; // ← same domain as above

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
