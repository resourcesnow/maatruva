import type { Metadata } from "next";
import { Star } from "lucide-react";
import { getAdminReviews } from "@/lib/data/admin/reviews";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  approveReviewAction,
  deleteReviewAction,
  rejectReviewAction,
} from "@/lib/actions/admin/reviews";

export const metadata: Metadata = { title: "Reviews" };
export const dynamic = "force-dynamic";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const reviews = await getAdminReviews({ status: status as "pending" | "approved" | undefined });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">Reviews</h1>

      <div className="flex gap-2">
        <Button
          variant={!status ? "default" : "outline"}
          size="sm"
          render={<a href="/admin/reviews" />}
        >
          All
        </Button>
        <Button
          variant={status === "pending" ? "default" : "outline"}
          size="sm"
          render={<a href="/admin/reviews?status=pending" />}
        >
          Pending
        </Button>
        <Button
          variant={status === "approved" ? "default" : "outline"}
          size="sm"
          render={<a href="/admin/reviews?status=approved" />}
        >
          Approved
        </Button>
      </div>

      {reviews.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-xl border border-dashed p-12 text-center text-sm">
          No reviews found.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {reviews.map((review) => (
            <li key={review.id} className="border-border rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{review.productTitle}</p>
                  <p className="text-muted-foreground text-xs">by {review.userName}</p>
                </div>
                <Badge variant={review.isApproved ? "default" : "secondary"}>
                  {review.isApproved ? "Approved" : "Pending"}
                </Badge>
              </div>
              <div className="mt-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`size-4 ${s <= review.rating ? "fill-brand-accent text-brand-accent" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
              {review.title && <p className="mt-2 font-medium">{review.title}</p>}
              {review.comment && <p className="text-muted-foreground text-sm">{review.comment}</p>}
              <div className="mt-3 flex gap-2">
                {!review.isApproved && (
                  <form action={approveReviewAction.bind(null, review.id)}>
                    <Button type="submit" size="sm" variant="outline">
                      Approve
                    </Button>
                  </form>
                )}
                {review.isApproved && (
                  <form action={rejectReviewAction.bind(null, review.id)}>
                    <Button type="submit" size="sm" variant="outline">
                      Unapprove
                    </Button>
                  </form>
                )}
                <form action={deleteReviewAction.bind(null, review.id)}>
                  <Button type="submit" size="sm" variant="destructive">
                    Delete
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
