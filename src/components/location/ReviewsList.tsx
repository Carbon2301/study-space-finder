"use client";

import { Star } from "lucide-react";
import { Review } from "@/types";
import { formatDate, purposeConfig } from "@/lib/utils";

interface ReviewsListProps {
  reviews: Review[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < rating
              ? "text-amber-400 fill-amber-400"
              : "text-slate-200 fill-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function ReviewsList({ reviews }: ReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        No reviews yet. Be the first!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const purpose = purposeConfig[review.purpose];
        return (
          <div
            key={review.id}
            className="p-4 bg-slate-50 rounded-xl border border-slate-100"
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {review.avatar}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">
                      {review.author}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-slate-400">
                        {formatDate(review.date)}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs bg-violet-50 text-violet-600 border border-violet-100 rounded-full px-2 py-0.5">
                    {purpose.icon} {purpose.label}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
