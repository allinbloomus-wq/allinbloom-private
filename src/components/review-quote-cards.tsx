"use client";

import { useState } from "react";
import ReviewModal from "@/components/review-modal";
import ReviewStars from "@/components/review-stars";
import type { Review } from "@/lib/api-types";

/** Home page review quotes; each opens the full review in a modal. */
export default function ReviewQuoteCards({ reviews }: { reviews: Review[] }) {
  const [openReview, setOpenReview] = useState<Review | null>(null);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {reviews.map((review) => (
          <button
            key={review.id}
            type="button"
            onClick={() => setOpenReview(review)}
            aria-label={`Read the full review by ${review.name}`}
            className="flex flex-col justify-between gap-5 rounded-[28px] border border-white/80 bg-white/70 p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[color:var(--brand)]/30 hover:shadow-[0_16px_35px_rgba(var(--brand-rgb),0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand)]"
          >
            <span className="line-clamp-6 text-sm leading-relaxed text-stone-700 sm:text-base">
              &ldquo;{review.text.trim()}&rdquo;
            </span>
            <span className="flex w-full items-center justify-between gap-3 text-sm font-semibold text-stone-900">
              {review.name}
              <ReviewStars value={review.rating} size="sm" readOnly />
            </span>
          </button>
        ))}
      </div>
      <ReviewModal review={openReview} onClose={() => setOpenReview(null)} />
    </>
  );
}
