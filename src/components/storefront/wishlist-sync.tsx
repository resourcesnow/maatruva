"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useWishlistStore } from "@/store/wishlist";
import { getWishlistIds } from "@/lib/actions/wishlist";

export function WishlistSync() {
  const { status } = useSession();
  const loaded = useWishlistStore((s) => s.loaded);
  const setIds = useWishlistStore((s) => s.setIds);

  useEffect(() => {
    if (status === "authenticated" && !loaded) {
      getWishlistIds().then(setIds);
    }
  }, [status, loaded, setIds]);

  return null;
}
