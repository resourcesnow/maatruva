"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStore, cartSubtotal } from "@/store/cart";
import { useUiStore } from "@/store/ui";
import { formatINR } from "@/lib/format";

export function CartDrawer() {
  const cartOpen = useUiStore((s) => s.cartOpen);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = cartSubtotal(items);

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your Cart ({items.length})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <ShoppingBag className="text-muted-foreground size-10" />
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button onClick={() => setCartOpen(false)} render={<Link href="/shop" />}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4">
              <ul className="flex flex-col gap-4">
                {items.map((item) => (
                  <li key={item.productId} className="flex gap-3">
                    <div className="bg-muted relative size-20 shrink-0 overflow-hidden rounded-lg">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={() => setCartOpen(false)}
                        className="line-clamp-2 text-sm font-medium"
                      >
                        {item.title}
                      </Link>
                      <p className="text-sm font-semibold">
                        {formatINR(item.salePrice ?? item.price)}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQty(item.productId, item.qty - 1)}
                          className="border-border flex size-6 items-center justify-center rounded-md border"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-6 text-center text-sm">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQty(item.productId, Math.min(item.qty + 1, item.stock))
                          }
                          className="border-border flex size-6 items-center justify-center rounded-md border"
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="text-muted-foreground hover:text-destructive ml-2"
                          aria-label="Remove item"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <SheetFooter className="border-border border-t">
              <div className="flex w-full items-center justify-between font-medium">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <Button
                size="lg"
                className="w-full"
                onClick={() => setCartOpen(false)}
                render={<Link href="/cart" />}
              >
                View Cart & Checkout
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
