import type { Metadata } from "next";
import ProductPage from "@/components/product-page";
import { productMetadata } from "@/lib/product-page";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return productMetadata("GIFTS", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <ProductPage catalogType="GIFTS" slug={slug} />;
}
