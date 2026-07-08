"use client";

import { useTransition } from "react";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useWishlistStore } from "@/store/wishlist";
import { toggleWishlistAction } from "@/lib/actions/wishlist";
import { cn } from "@/lib/utils";

export function WishlistButton({ productId }: { productId: string }) {
  const { status } = useSession();
  const isWishlisted = useWishlistStore((s) => s.ids.has(productId));
  const toggle = useWishlistStore((s) => s.toggle);
  const [, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (status !== "authenticated") {
      toast.error("Login to save items to your wishlist.");
      return;
    }

    toggle(productId);
    startTransition(async () => {
      const res = await toggleWishlistAction(productId);
      if (!res.ok) {
        toggle(productId);
        toast.error("Something went wrong. Try again.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isWishlisted}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className="bg-background/90 flex size-8 items-center justify-center rounded-full shadow-sm backdrop-blur transition-transform hover:scale-110"
    >
      <Heart
        className={cn(
          "size-4 transition-colors",
          isWishlisted ? "fill-brand-secondary text-brand-secondary" : "text-foreground",
        )}
      />
    </button>
  );
}
