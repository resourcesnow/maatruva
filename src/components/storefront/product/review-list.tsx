import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";

export type ReviewItem = {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  createdAt: string;
  userName: string;
};

function Stars({ rating, size = "size-4" }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            size,
            star <= Math.round(rating)
              ? "fill-brand-accent text-brand-accent"
              : "text-muted-foreground",
          )}
        />
      ))}
    </div>
  );
}

export function ReviewSummary({ avg, count }: { avg: number; count: number }) {
  return (
    <div className="flex items-center gap-3">
      <Stars rating={avg} size="size-5" />
      <span className="text-muted-foreground text-sm">
        {avg.toFixed(1)} ({count} review{count === 1 ? "" : "s"})
      </span>
    </div>
  );
}

export function ReviewList({ reviews }: { reviews: ReviewItem[] }) {
  if (reviews.length === 0) {
    return <p className="text-muted-foreground text-sm">No reviews yet. Be the first!</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {reviews.map((review) => (
        <li key={review.id} className="border-border rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <Stars rating={review.rating} />
            <span className="text-muted-foreground text-xs">{formatDate(review.createdAt)}</span>
          </div>
          {review.title && <p className="mt-2 font-medium">{review.title}</p>}
          {review.comment && <p className="text-muted-foreground mt-1 text-sm">{review.comment}</p>}
          <p className="mt-2 text-xs font-medium">{review.userName}</p>
        </li>
      ))}
    </ul>
  );
}
