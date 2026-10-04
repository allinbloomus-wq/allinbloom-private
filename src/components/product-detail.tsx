import BouquetCard from "@/components/bouquet-card";
import ProductCard from "@/components/product-card";
import type { ProductView } from "@/lib/product-page";

/** One product, laid out for its own page or for the catalog modal. */
export default function ProductDetail({
  view,
  inModal = false,
}: {
  view: ProductView;
  inModal?: boolean;
}) {
  const { product, pricing, firstOrderDiscount } = view;
  const catalogType = product.catalogType || "FLOWERS";

  if (catalogType === "GIFTS" || catalogType === "EVENT_SPACE") {
    return (
      <ProductCard
        product={product}
        kind={catalogType === "GIFTS" ? "gift" : "event"}
        pricing={pricing}
        firstOrderDiscount={firstOrderDiscount}
        titleAs={inModal ? "h2" : "h1"}
      />
    );
  }

  return (
    <BouquetCard
      bouquet={product}
      pricing={pricing}
      firstOrderDiscount={firstOrderDiscount}
      enableFlowerQuantityInput={catalogType === "FLOWERS"}
      splitPriceRows
      variant="detail"
      showTitle={!inModal}
    />
  );
}
