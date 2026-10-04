import type { MetadataRoute } from "next";
import type { Bouquet, CatalogType } from "@/lib/api-types";
import { getPublicProducts } from "@/lib/data/bouquets";
import { productPath } from "@/lib/product-paths";
import { SITE_ORIGIN } from "@/lib/site";

const CATALOG_TYPES: CatalogType[] = ["FLOWERS", "BALOONS", "GIFTS", "EVENT_SPACE"];

// Public products of one catalog; an unreachable API yields an empty list so
// the static pages are still listed.
const loadProducts = (catalogType: CatalogType) =>
  getPublicProducts(catalogType).catch((): Bouquet[] => []);

const updatedAt = (product: Bouquet) => {
  const time = product.updatedAt ? Date.parse(product.updatedAt) : NaN;
  return Number.isFinite(time) ? new Date(time) : undefined;
};

// Latest edit in a catalog, or undefined (lastmod is then simply omitted).
const latestUpdate = (products: Bouquet[]) => newest(...products.map(updatedAt));

const newest = (...dates: (Date | undefined)[]) => {
  const times = dates.filter((date): date is Date => Boolean(date)).map(Number);
  return times.length ? new Date(Math.max(...times)) : undefined;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_ORIGIN.replace(/\/$/, "");
  const catalogs = await Promise.all(CATALOG_TYPES.map(loadProducts));
  const [flowers, balloons, gifts, eventSpace] = catalogs.map(latestUpdate);
  const productEntries: MetadataRoute.Sitemap = catalogs.flat().flatMap((product) => {
    const path = productPath(product);
    return path
      ? [
          {
            url: `${baseUrl}${path}`,
            lastModified: updatedAt(product),
            changeFrequency: "weekly" as const,
            priority: 0.7,
          },
        ]
      : [];
  });

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
    ...productEntries,
  ];
}
