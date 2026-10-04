import type { Metadata } from "next";
import { cache } from "react";
import type { Bouquet, CatalogType } from "@/lib/api-types";
import { getAuthSession } from "@/lib/auth-session";
import { getVisibleBouquetGalleryImages } from "@/lib/bouquet-images";
import { getBouquetBySlug } from "@/lib/data/bouquets";
import { getOrdersByEmail } from "@/lib/data/orders";
import { getStoreSettings } from "@/lib/data/settings";
import { isFirstOrderEligibleForKnownHistory } from "@/lib/first-order-discount";
import { getBouquetPricing } from "@/lib/pricing";
import { CATALOG_SECTIONS, productPath } from "@/lib/product-paths";
import { BUSINESS_ID, absoluteUrl, breadcrumbSchema } from "@/lib/schema";
import { SITE_CITY, SITE_REGION } from "@/lib/site";

// Shared by generateMetadata and the page itself; cache() dedupes the fetch
// within one request.
export const getProduct = cache(
  (catalogType: CatalogType, slug: string): Promise<Bouquet | null> =>
    getBouquetBySlug(slug, catalogType)
);

/** Everything a product view needs: the product, its price and any discount. */
export async function loadProductView(catalogType: CatalogType, slug: string) {
  const [product, settings, session] = await Promise.all([
    getProduct(catalogType, slug),
    getStoreSettings(),
    catalogType === "EVENT_SPACE"
      ? Promise.resolve({ user: null })
      : getAuthSession(),
  ]);
  if (!product) return null;

  const email = session.user?.email || null;
  const orders = email ? await getOrdersByEmail(email) : [];
  // Mirrors the catalog listings: the one-time offer is shown only to a
  // verified account that checkout will actually grant it to.
  const firstOrderDiscount =
    email &&
    isFirstOrderEligibleForKnownHistory(orders) &&
    settings.firstOrderDiscountPercent > 0
      ? {
          percent: settings.firstOrderDiscountPercent,
          note: settings.firstOrderDiscountNote || "10% off your first order",
        }
      : null;

  return {
    product,
    pricing: getBouquetPricing(product, settings),
    firstOrderDiscount,
  };
}

export type ProductView = NonNullable<Awaited<ReturnType<typeof loadProductView>>>;

const plainDescription = (product: Bouquet) =>
  product.description.replace(/\s+/g, " ").trim();

const metaDescription = (product: Bouquet) => {
  const text = plainDescription(product);
  const local =
    product.catalogType === "EVENT_SPACE"
      ? `Book it at our studio in ${SITE_CITY}, ${SITE_REGION}.`
      : `Same-day delivery in ${SITE_CITY}, ${SITE_REGION} and nearby suburbs.`;
  const combined = text ? `${text} ${local}` : local;
  return combined.length > 160 ? `${combined.slice(0, 157).trimEnd()}...` : combined;
};

const titleSuffix: Record<CatalogType, string> = {
  FLOWERS: "Flower Delivery in Wheeling, IL",
  BALOONS: "Balloon Delivery in Wheeling, IL",
  GIFTS: "Gift Box Delivery in Wheeling, IL",
  EVENT_SPACE: "Event Space in Wheeling, IL",
};

export async function productMetadata(
  catalogType: CatalogType,
  slug: string
): Promise<Metadata> {
  const product = await getProduct(catalogType, slug);
  if (!product) return { title: "Not found", robots: { index: false } };

  const path = productPath(product) || `${CATALOG_SECTIONS[catalogType].path}/${slug}`;
  const title = `${product.name} | ${titleSuffix[catalogType]}`;
  const description = metaDescription(product);
  const image = getVisibleBouquetGalleryImages(product)[0];

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
  };
}

const usd = (cents: number) => (cents / 100).toFixed(2);

/** Product (or Service for the event space) plus breadcrumbs, as JSON-LD nodes. */
export function productJsonLdNodes({ product, pricing }: ProductView) {
  const catalogType = product.catalogType || "FLOWERS";
  const section = CATALOG_SECTIONS[catalogType];
  const url = absoluteUrl(productPath(product) || section.path);
  const images = getVisibleBouquetGalleryImages(product).map((src) => absoluteUrl(src));
  const breadcrumbs = breadcrumbSchema([
    { name: section.label, path: section.path },
    { name: product.name, path: productPath(product) || section.path },
  ]);

  if (catalogType === "EVENT_SPACE") {
    return [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: product.name,
        description: plainDescription(product),
        url,
        image: images,
        provider: { "@id": BUSINESS_ID },
        areaServed: `${SITE_CITY}, ${SITE_REGION}`,
        offers: (product.tiers || []).map((tier) => ({
          "@type": "Offer",
          name: tier.title || product.name,
          price: usd(tier.priceCents),
          priceCurrency: "USD",
        })),
      },
      breadcrumbs,
    ];
  }

  return [
    {
      "@type": "Product",
      "@id": `${url}#product`,
      name: product.name,
      description: plainDescription(product),
      url,
      image: images,
      brand: { "@id": BUSINESS_ID },
      offers: {
        "@type": "Offer",
        url,
        price: usd(pricing.finalPriceCents),
        priceCurrency: "USD",
        availability: product.isSoldOut
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@id": BUSINESS_ID },
      },
    },
    breadcrumbs,
  ];
}
