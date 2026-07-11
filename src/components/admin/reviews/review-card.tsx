"use client";

import { useTransition } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/admin/confirm-action-dialog";
import {
  approveReviewAction,
  deleteReviewAction,
  rejectReviewAction,
} from "@/lib/actions/admin/reviews";

export type ReviewRow = {
  id: string;
  productTitle: string;
  userName: string;
  isApproved: boolean;
  rating: number;
  title?: string;
  comment?: string;
};

export function ReviewCard({ review }: { review: ReviewRow }) {
  const [pending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      const res = await approveReviewAction(review.id);
      if (!res.ok) toast.error(res.error ?? "Could not approve review.");
      else toast.success("Review approved.");
    });
  }

  function handleReject() {
    startTransition(async () => {
      const res = await rejectReviewAction(review.id);
      if (!res.ok) toast.error(res.error ?? "Could not unapprove review.");
      else toast.success("Review unapproved.");
    });
  }

  async function handleDelete() {
    const res = await deleteReviewAction(review.id);
    if (!res.ok) toast.error(res.error ?? "Could not delete review.");
    else toast.success("Review deleted.");
  }

  return (
    <li className="border-border rounded-xl border p-4">
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
          <Button size="sm" variant="outline" onClick={handleApprove} disabled={pending}>
            Approve
          </Button>
        )}
        {review.isApproved && (
          <Button size="sm" variant="outline" onClick={handleReject} disabled={pending}>
            Unapprove
          </Button>
        )}
        <ConfirmActionDialog
          triggerRender={<Button size="sm" variant="destructive" disabled={pending} />}
          triggerLabel="Delete"
          title={`Delete this review by "${review.userName}"?`}
          description="This action cannot be undone and will recalculate the product's rating."
          confirmLabel="Delete"
          onConfirm={handleDelete}
        />
      </div>
    </li>
  );
}
