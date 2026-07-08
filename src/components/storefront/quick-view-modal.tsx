"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Price } from "./price";
import { AddToCartButton } from "./add-to-cart-button";
import { WishlistButton } from "./wishlist-button";
import { useUiStore } from "@/store/ui";
import type { ProductDetail } from "@/types/catalog";

export function QuickViewModal() {
  const slug = useUiStore((s) => s.quickViewSlug);
  const close = useUiStore((s) => s.closeQuickView);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slug) {
      setProduct(null);
      return;
    }
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => setProduct(data.product ?? null))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <Dialog open={!!slug} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-2xl">
        {loading || !product ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="bg-muted relative aspect-square overflow-hidden rounded-xl">
              {product.images[0] && (
                <Image
                  src={product.images[0].url}
                  alt={product.images[0].alt || product.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 320px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex flex-col gap-3">
              <DialogTitle className="font-heading text-xl">{product.title}</DialogTitle>
              <Price price={product.price} salePrice={product.salePrice} size="lg" />
              <p className="text-muted-foreground line-clamp-4 text-sm">
                {product.shortDescription}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <AddToCartButton product={product} className="flex-1" />
                <WishlistButton productId={product.id} />
              </div>
              <Link
                href={`/product/${product.slug}`}
                onClick={close}
                className="text-brand-secondary text-sm font-medium underline underline-offset-4"
              >
                View full details
              </Link>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
