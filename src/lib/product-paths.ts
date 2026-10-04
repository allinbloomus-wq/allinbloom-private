import type { Bouquet, CatalogType } from "@/lib/api-types";

/** Listing page of each catalog; product pages live directly under it. */
export const CATALOG_SECTIONS: Record<
  CatalogType,
  { path: string; label: string }
> = {
  FLOWERS: { path: "/catalog", label: "Bouquets" },
  BALOONS: { path: "/balloons", label: "Balloons" },
  GIFTS: { path: "/gifts", label: "Gift boxes" },
  EVENT_SPACE: { path: "/event-space", label: "Event space" },
};

export const productPath = (
  product: Pick<Bouquet, "slug" | "catalogType">
): string | null =>
  product.slug
    ? `${CATALOG_SECTIONS[product.catalogType || "FLOWERS"].path}/${product.slug}`
    : null;
