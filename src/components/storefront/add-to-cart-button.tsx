"use client";

import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { useUiStore } from "@/store/ui";
import { cn } from "@/lib/utils";
import type { ProductCard } from "@/types/catalog";

export function AddToCartButton({
  product,
  qty = 1,
  size = "default",
  className,
}: {
  product: ProductCard;
  qty?: number;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const isOutOfStock = product.stock === 0;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    addItem({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      image: product.images[0]?.url ?? "",
      price: product.price,
      salePrice: product.salePrice,
      qty,
      stock: product.stock,
    });
    setCartOpen(true);
    toast.success(`${product.title} added to cart.`);
  }

  return (
    <Button
      type="button"
      size={size}
      disabled={isOutOfStock}
      onClick={handleAdd}
      className={cn("gap-1.5", className)}
    >
      <ShoppingBag className="size-3.5" />
      {isOutOfStock ? "Sold Out" : "Add to Cart"}
    </Button>
  );
}
