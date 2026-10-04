import type { Bouquet } from "@/lib/api-types";
import { productPath } from "@/lib/product-paths";

/** Read-only public URL of a product; it is fixed when the product is created. */
export default function AdminProductUrl({ product }: { product?: Bouquet | null }) {
  const path = product ? productPath(product) : null;
  return (
    <div className="flex flex-col gap-2 text-sm font-medium text-stone-700">
      Page URL
      {path ? (
        <a
          href={path}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 font-normal text-stone-600 underline decoration-stone-300 underline-offset-4 hover:text-stone-900"
        >
          {path}
        </a>
      ) : (
        <p className="rounded-2xl border border-dashed border-stone-200 px-4 py-3 font-normal text-stone-500">
          Created from the name when you save. It stays the same if you rename
          the product later.
        </p>
      )}
    </div>
  );
}
