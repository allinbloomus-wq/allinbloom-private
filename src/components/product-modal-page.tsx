import ProductDetail from "@/components/product-detail";
import ProductModal from "@/components/product-modal";
import type { CatalogType } from "@/lib/api-types";
import { loadProductView } from "@/lib/product-page";

/** Content of the @modal slot when a product link is followed in-app. */
export default async function ProductModalPage({
  catalogType,
  slug,
}: {
  catalogType: CatalogType;
  slug: string;
}) {
  const view = await loadProductView(catalogType, slug);
  if (!view) return null;
  return (
    <ProductModal title={view.product.name}>
      <ProductDetail view={view} inModal />
    </ProductModal>
  );
}
