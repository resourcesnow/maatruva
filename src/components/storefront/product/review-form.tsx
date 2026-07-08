"use client";

import { useActionState, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { submitReviewAction } from "@/lib/actions/review";
import { cn } from "@/lib/utils";

const initialState = { ok: false, error: null as string | null };

export function ReviewForm({ productId }: { productId: string }) {
  const { status } = useSession();
  const [rating, setRating] = useState(5);
  const [state, formAction, pending] = useActionState(submitReviewAction, initialState);

  useEffect(() => {
    if (state.ok) toast.success("Thanks! Your review will appear after moderation.");
    else if (state.error) toast.error(state.error);
  }, [state]);

  if (status !== "authenticated") {
    return <p className="text-muted-foreground text-sm">Login to write a review.</p>;
  }

  return (
    <form action={formAction} className="border-border flex flex-col gap-3 rounded-xl border p-4">
      <input type="hidden" name="product" value={productId} />
      <input type="hidden" name="rating" value={rating} />

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            aria-label={`Rate ${star} stars`}
          >
            <Star
              className={cn(
                "size-5",
                star <= rating ? "fill-brand-accent text-brand-accent" : "text-muted-foreground",
              )}
            />
          </button>
        ))}
      </div>

      <Input name="title" placeholder="Review title (optional)" maxLength={120} />
      <Textarea name="comment" placeholder="Share your experience..." rows={3} maxLength={2000} />

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
