"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { validateCouponAction } from "@/lib/actions/coupon";
import { useCartStore } from "@/store/cart";

export function CouponForm({
  subtotal,
  onApplied,
}: {
  subtotal: number;
  onApplied: (discount: number, code: string | null) => void;
}) {
  const [code, setCode] = useState("");
  const [pending, startTransition] = useTransition();
  const couponCode = useCartStore((s) => s.couponCode);
  const setCoupon = useCartStore((s) => s.setCoupon);

  function handleApply() {
    if (!code.trim()) return;
    startTransition(async () => {
      const res = await validateCouponAction(code.trim(), subtotal);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setCoupon(res.code);
      onApplied(res.discount, res.code);
      toast.success(`Coupon ${res.code} applied!`);
    });
  }

  function handleRemove() {
    setCoupon(null);
    onApplied(0, null);
  }

  if (couponCode) {
    return (
      <div className="border-border bg-muted flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
        <span>
          Coupon <strong>{couponCode}</strong> applied
        </span>
        <button onClick={handleRemove} className="text-muted-foreground underline">
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Coupon code"
        className="uppercase"
      />
      <Button type="button" variant="outline" disabled={pending} onClick={handleApply}>
        {pending ? "Applying..." : "Apply"}
      </Button>
    </div>
  );
}
