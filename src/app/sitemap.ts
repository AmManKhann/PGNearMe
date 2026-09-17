import type { MetadataRoute } from "next";
import { getAllPGs } from "@/lib/store";
import { houseListings } from "@/lib/houses";
import { officeListings } from "@/lib/spaces";
import { shopListings } from "@/lib/spaces";

const BASE = "https://www.pg-near-me.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/search`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/search/house`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/search/office`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/search/shop`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/owner`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/owner/listings/new`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const pgRoutes: MetadataRoute.Sitemap = getAllPGs().map((pg) => ({
    url: `${BASE}/pg/${pg.id}`,
    lastModified: new Date(pg.updatedAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const houseRoutes: MetadataRoute.Sitemap = houseListings.map((h) => ({
    url: `${BASE}/search/house/${h.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const officeRoutes: MetadataRoute.Sitemap = officeListings.map((o) => ({
    url: `${BASE}/search/office/${o.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const shopRoutes: MetadataRoute.Sitemap = shopListings.map((s) => ({
    url: `${BASE}/search/shop/${s.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...pgRoutes,
    ...houseRoutes,
    ...officeRoutes,
    ...shopRoutes,
  ];
}