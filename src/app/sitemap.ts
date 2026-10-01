import type { MetadataRoute } from "next";
import type { Bouquet, CatalogType } from "@/lib/api-types";
import { apiFetch } from "@/lib/api-server";
import { SITE_ORIGIN } from "@/lib/site";

// Latest edit among the public products of one catalog, or undefined when the
// API is unreachable or returns no dates (lastmod is then simply omitted).
async function latestUpdate(catalogType: CatalogType): Promise<Date | undefined> {
  try {
    const response = await apiFetch(`/api/bouquets?catalogType=${catalogType}`);
    if (!response.ok) return undefined;
    const items = (await response.json()) as Bouquet[];
    const times = items
      .map((item) => (item.updatedAt ? Date.parse(item.updatedAt) : NaN))
      .filter((time) => Number.isFinite(time));
    return times.length ? new Date(Math.max(...times)) : undefined;
  } catch {
    return undefined;
  }
}

const newest = (...dates: (Date | undefined)[]) => {
  const times = dates.filter((date): date is Date => Boolean(date)).map(Number);
  return times.length ? new Date(Math.max(...times)) : undefined;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_ORIGIN.replace(/\/$/, "");
  const [flowers, balloons, gifts, eventSpace] = await Promise.all([
    latestUpdate("FLOWERS"),
    latestUpdate("BALOONS"),
    latestUpdate("GIFTS"),
    latestUpdate("EVENT_SPACE"),
  ]);

  // Pages without a data source (FAQ, contact, reviews) carry no lastmod
  // rather than a made-up date.
  return [
    {
      url: `${baseUrl}/`,
      lastModified: newest(flowers, balloons, gifts),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: flowers,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/catalog?section=flowers`,
      lastModified: flowers,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/catalog?entry=1`,
      lastModified: flowers,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/balloons`,
      lastModified: balloons,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/gifts`,
      lastModified: gifts,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/event-space`,
      lastModified: eventSpace,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/reviews`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
