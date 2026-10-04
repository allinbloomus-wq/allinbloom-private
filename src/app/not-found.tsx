import type { Metadata } from "next";
import Footer from "@/components/footer";
import Header from "@/components/header";
import NotFoundBloom from "@/components/not-found-bloom";

export const metadata: Metadata = {
  title: "Page not found",
};

// Unmatched URLs render outside the (site) group, so this adds the site
// chrome itself.
export default function NotFound() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-10 lg:px-8">
        <NotFoundBloom />
      </main>
      <Footer />
    </div>
  );
}
