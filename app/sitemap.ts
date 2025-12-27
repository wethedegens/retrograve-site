// app/sitemap.ts
import type { MetadataRoute } from "next";

const SITE = "https://retrograve.xyz"; // change if your final domain is different

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: `${SITE}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },

    // ✅ Canonical MAGApixel grid page (replaces legacy /retrogs)
    {
      url: `${SITE}/magapixel-nfts`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },

    // ✅ Project landings
    {
      url: `${SITE}/locker/magapixel`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE}/enchanted-miners`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE}/retrograve`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },

    // ✅ Miners grid page
    {
      url: `${SITE}/enchanted-miners-nfts`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },

    // ✅ Generic locker (kept lower priority)
    {
      url: `${SITE}/locker`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },

    // Optional legacy route:
    // If you keep /retrogs as a redirect, you can omit it from sitemap.
    // Google will discover it via redirects if needed.
  ];
}
