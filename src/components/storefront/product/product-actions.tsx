"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "../wishlist-button";
import { useCartStore } from "@/store/cart";
import { useUiStore } from "@/store/ui";
import type { ProductDetail } from "@/types/catalog";

export function ProductActions({ product }: { product: ProductDetail }) {
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const router = useRouter();
  const isOutOfStock = product.stock === 0;

  function buildItem() {
    return {
      productId: product.id,
      slug: product.slug,
      title: product.title,
      image: product.images[0]?.url ?? "",
      price: product.price,
      salePrice: product.salePrice,
      qty,
      stock: product.stock,
    };
  }

  function handleAddToCart() {
    addItem(buildItem());
    setCartOpen(true);
    toast.success(`${product.title} added to cart.`);
  }

  function handleBuyNow() {
    addItem(buildItem());
    router.push("/checkout");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Quantity</span>
        <div className="border-border flex items-center rounded-lg border">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex size-9 items-center justify-center"
            aria-label="Decrease quantity"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="w-8 text-center text-sm">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            className="flex size-9 items-center justify-center"
            aria-label="Increase quantity"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button size="lg" className="flex-1" disabled={isOutOfStock} onClick={handleAddToCart}>
          {isOutOfStock ? "Sold Out" : "Add to Cart"}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="flex-1"
          disabled={isOutOfStock}
          onClick={handleBuyNow}
        >
          Buy Now
        </Button>
        <WishlistButton productId={product.id} />
      </div>
    </div>
  );
}
