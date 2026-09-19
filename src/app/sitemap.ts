import type { MetadataRoute } from "next";
import { getAllPGs } from "@/lib/store";

const BASE = "https://www.pg-near-me.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/search`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/owner`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/owner/listings/new`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const pgRoutes: MetadataRoute.Sitemap = getAllPGs().map((pg) => ({
    url: `${BASE}/pg/${pg.id}`,
    lastModified: new Date(pg.updatedAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...pgRoutes];
}