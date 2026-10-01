import type { Metadata } from "next";
import ReviewForm from "@/components/review-form";
import ReviewStars from "@/components/review-stars";
import ReviewsGallery from "@/components/reviews-gallery";
import { getActiveReviews } from "@/lib/data/reviews";
import { SITE_GOOGLE_REVIEW_URL, SITE_YELP } from "@/lib/site";

const REVIEW_PLATFORMS = [
  { label: "Review us on Google", href: SITE_GOOGLE_REVIEW_URL },
  { label: "Find us on Yelp", href: SITE_YELP },
];

export const metadata: Metadata = {
  title: "Flower Delivery Reviews: Wheeling, IL",
  description:
    "Flower delivery reviews from customers of All in Bloom Floral Studio in Wheeling, IL. Read what people say about our bouquets and leave your own.",
  alternates: {
    canonical: "/reviews",
  },
  openGraph: {
    title: "Flower Delivery Reviews | All in Bloom Floral Studio",
    description:
      "Customer reviews of flower delivery from All in Bloom Floral Studio in Wheeling, IL.",
    url: "/reviews",
  },
};

export default async function ReviewsPage() {
  const reviews = await getActiveReviews();
  const reviewsCount = reviews.length;
  const averageRating = reviewsCount
    ? (
        reviews.reduce((sum, review) => sum + review.rating, 0) / reviewsCount
      ).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold text-stone-900 sm:text-5xl">
          What our customers say
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-stone-600">
          Reviews from people who ordered flowers from our studio.
        </p>
        {reviewsCount > 0 ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2">
            <p className="text-4xl font-semibold tabular-nums text-stone-900">
              {averageRating}
              <span className="ml-1 text-lg text-stone-500">/ 5</span>
            </p>
            <ReviewStars value={Number(averageRating)} size="lg" />
            <p className="text-sm text-stone-600">
              from {reviewsCount} review{reviewsCount === 1 ? "" : "s"}
            </p>
          </div>
        ) : null}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
          {REVIEW_PLATFORMS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--brand)]/30 bg-white/70 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--brand)] transition hover:border-[color:var(--brand)]/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand)]"
            >
              {label}
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 10h12M11 5l5 5-5 5" />
              </svg>
            </a>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-stone-900 sm:text-3xl">
          Customer highlights
        </h2>
        <ReviewsGallery reviews={reviews} />
      </section>

      <section>
        <ReviewForm />
      </section>
    </div>
  );
}
