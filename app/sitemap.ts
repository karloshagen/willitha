import type { MetadataRoute } from "next";
import { listEntries } from "@/lib/entries";
import { listPublishedReviews } from "@/lib/reviews";
import { brandPath, entryPath, siteUrl, testedPath } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = ["", "/search", "/tested", "/submit", "/sponsor"].map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.6,
  }));

  const [entries, reviews] = await Promise.all([listEntries(), listPublishedReviews()]);
  const brands = entries ? [...new Set(entries.map((entry) => entry.brand))] : [];
  return [
    ...staticRoutes,
    ...(entries ?? []).map((entry) => ({
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
    ...(reviews ?? []).map((review) => ({
      url: `${base}${testedPath(review.slug)}`,
      lastModified: review.updated_at ? new Date(review.updated_at) : now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
