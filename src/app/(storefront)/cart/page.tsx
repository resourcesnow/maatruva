"use client";

import { useState } from "react";
import { SmartImage as Image } from "@/components/ui/smart-image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CouponForm } from "@/components/storefront/coupon-form";
import { useCartStore, cartSubtotal } from "@/store/cart";
import { formatINR } from "@/lib/format";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = cartSubtotal(items);
  const [discount, setDiscount] = useState(0);

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <ShoppingBag className="text-muted-foreground size-12" />
        <h1 className="font-heading text-2xl font-semibold">Your cart is empty</h1>
        <Button render={<Link href="/shop" />}>Continue Shopping</Button>
      </div>
    );
  }

  const total = Math.max(0, subtotal - discount);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-8">
      <h1 className="font-heading mb-8 text-3xl font-semibold">Your Cart</h1>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <ul className="divide-border flex flex-col divide-y">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-4 py-5">
              <div className="bg-muted relative size-24 shrink-0 overflow-hidden rounded-lg">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <Link href={`/product/${item.slug}`} className="font-medium">
                  {item.title}
                </Link>
                <p className="text-sm font-semibold">{formatINR(item.salePrice ?? item.price)}</p>
                <div className="mt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQty(item.productId, item.qty - 1)}
                    className="border-border flex size-7 items-center justify-center rounded-md border"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-7 text-center text-sm">{item.qty}</span>
                  <button
                    type="button"
                    onClick={() => updateQty(item.productId, Math.min(item.qty + 1, item.stock))}
                    className="border-border flex size-7 items-center justify-center rounded-md border"
                    aria-label="Increase quantity"
                  >
                    <Plus className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="text-muted-foreground hover:text-destructive ml-3 flex items-center gap-1 text-sm"
                  >
                    <Trash2 className="size-4" /> Remove
                  </button>
                </div>
              </div>
              <p className="font-semibold">
                {formatINR((item.salePrice ?? item.price) * item.qty)}
              </p>
            </li>
          ))}
        </ul>

        <div className="border-border flex h-fit flex-col gap-4 rounded-2xl border p-5">
          <h2 className="font-heading text-lg font-semibold">Order Summary</h2>
          <CouponForm subtotal={subtotal} onApplied={(d) => setDiscount(d)} />
          <div className="border-border flex flex-col gap-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="text-brand-secondary flex justify-between">
                <span>Discount</span>
                <span>-{formatINR(discount)}</span>
              </div>
            )}
            <div className="border-border flex justify-between border-t pt-2 font-semibold">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>
          <Button size="lg" render={<Link href="/checkout" />}>
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
