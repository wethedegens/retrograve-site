// app/sitemap.ts
import type { MetadataRoute } from "next";

const SITE = "https://retrograve.tv"; // ← change if your final domain is different

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // List your public pages here. Add/remove as your site grows.
  return [
    {
      url: `${SITE}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE}/retrogs`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE}/locker`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    // If you keep an on-site /community or /collect page, include them:
    // { url: `${SITE}/community`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    // { url: `${SITE}/collect`,   lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
