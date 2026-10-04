"use client";

import Image from "next/image";
import Modal from "@/components/modal";
import ReviewStars from "@/components/review-stars";
import type { Review } from "@/lib/api-types";
import { formatDate } from "@/lib/format";

/** A single review shown in full, opened from a clamped review card. */
export default function ReviewModal({
  review,
  onClose,
}: {
  review: Review | null;
  onClose: () => void;
}) {
  return (
    <Modal
      open={Boolean(review)}
      onClose={onClose}
      title={review?.name ?? ""}
      description={review ? formatDate(review.createdAt) : undefined}
      closeLabel="Close review"
    >
      {review ? (
        <div className="space-y-5 pt-5">
          <ReviewStars value={review.rating} size="md" readOnly />
          <p className="whitespace-pre-line break-words text-base leading-relaxed text-stone-700">
            {review.text.trim()}
          </p>
          {review.image ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[18px] border border-white/80 bg-white">
              <Image
                src={review.image}
                alt={`${review.name} review photo`}
                fill
                sizes="(max-width: 672px) 100vw, 640px"
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
