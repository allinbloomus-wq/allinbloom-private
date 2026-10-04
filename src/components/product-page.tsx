import Link from "next/link";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/product-detail";
import type { CatalogType } from "@/lib/api-types";
import { loadProductView, productJsonLdNodes } from "@/lib/product-page";
import { CATALOG_SECTIONS } from "@/lib/product-paths";
import { toJsonLd } from "@/lib/schema";

const linkClass =
  "underline decoration-stone-300 underline-offset-4 transition hover:text-[color:var(--brand)] hover:decoration-[color:var(--brand)]";

/** Full product page, served on direct visits and to search engines. */
export default async function ProductPage({
  catalogType,
  slug,
}: {
  catalogType: CatalogType;
  slug: string;
}) {
  const view = await loadProductView(catalogType, slug);
  if (!view) notFound();
  const section = CATALOG_SECTIONS[catalogType];

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(...productJsonLdNodes(view)) }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-stone-500">
        <ol className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <li>
            <Link href={section.path} className={linkClass}>
              {section.label}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="min-w-0 truncate text-stone-700">
            {view.product.name}
          </li>
        </ol>
      </nav>
      <ProductDetail view={view} />
      <p className="text-sm text-stone-600">
        <Link href={section.path} className={linkClass}>
          See all {section.label.toLowerCase()}
        </Link>
      </p>
    </div>
  );
}
