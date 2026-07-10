import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { auth } from "@/lib/auth";
import { getUserReviews } from "@/lib/data/reviews";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "My Reviews" };
export const dynamic = "force-dynamic";

export default async function AccountReviewsPage() {
  const session = await auth();
  const reviews = session?.user ? await getUserReviews(session.user.id) : [];

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-heading text-xl font-semibold">Your Reviews</h2>

      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-sm">You haven&apos;t written any reviews yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {reviews.map((review) => (
            <li key={review.id} className="border-border rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {review.product ? (
                  <Link
                    href={`/product/${review.product.slug}`}
                    className="font-medium hover:underline"
                  >
                    {review.product.title}
                  </Link>
                ) : (
                  <span className="text-muted-foreground font-medium">Product removed</span>
                )}
                <Badge variant={review.isApproved ? "secondary" : "outline"}>
                  {review.isApproved ? "Published" : "Pending approval"}
                </Badge>
              </div>
              <div className="mt-2 flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < review.rating
                        ? "size-4 fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground size-4"
                    }
                  />
                ))}
              </div>
              {review.title && <p className="mt-1 text-sm font-medium">{review.title}</p>}
              {review.comment && (
                <p className="text-muted-foreground mt-1 text-sm">{review.comment}</p>
              )}
              <p className="text-muted-foreground mt-2 text-xs">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
