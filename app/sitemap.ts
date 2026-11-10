import type { MetadataRoute } from "next";
import { listEntries } from "@/lib/entries";
import { brandPath, entryPath, siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = ["", "/search", "/submit", "/sponsor"].map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.6,
  }));

  const entries = await listEntries();
  if (!entries) return staticRoutes;

  const brands = [...new Set(entries.map((entry) => entry.brand))];
  return [
    ...staticRoutes,
    ...entries.map((entry) => ({
      url: `${base}${entryPath(entry.slug)}`,
      lastModified: entry.last_verified ? new Date(`${entry.last_verified}T00:00:00.000Z`) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...brands.map((brand) => ({
      url: `${base}${brandPath(brand)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
