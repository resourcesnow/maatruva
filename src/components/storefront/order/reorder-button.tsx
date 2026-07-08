"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { getReorderItemsAction } from "@/lib/actions/order";

export function ReorderButton({ orderId }: { orderId: string }) {
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleReorder() {
    startTransition(async () => {
      const res = await getReorderItemsAction(orderId);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      res.items.forEach((item) => addItem(item));
      toast.success("Items added to cart.");
      router.push("/cart");
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={handleReorder} disabled={pending}>
      {pending ? "Adding..." : "Reorder"}
    </Button>
  );
}
