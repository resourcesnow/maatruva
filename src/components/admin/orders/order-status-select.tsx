"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { updateOrderStatusAction } from "@/lib/actions/admin/orders";
import type { OrderStatus } from "@/types/order";

const STATUSES: OrderStatus[] = [
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
];

export function OrderStatusSelect({
  orderId,
  orderNo,
  status,
}: {
  orderId: string;
  orderNo: string;
  status: OrderStatus;
}) {
  const [pending, startTransition] = useTransition();
  const [confirmCancel, setConfirmCancel] = useState(false);

  function applyStatus(value: OrderStatus) {
    startTransition(async () => {
      await updateOrderStatusAction(orderId, value);
      toast.success(`Order #${orderNo} marked as ${value}.`);
    });
  }

  function handleChange(value: string | null) {
    if (!value) return;
    if (value === "cancelled") {
      setConfirmCancel(true);
      return;
    }
    applyStatus(value as OrderStatus);
  }

  return (
    <>
      <Select value={status} onValueChange={handleChange} disabled={pending}>
        <SelectTrigger className="w-40 capitalize">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s} className="capitalize">
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel order #{orderNo}?</AlertDialogTitle>
            <AlertDialogDescription>
              This restocks all items in the order. This action cannot be undone from here.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Keep order</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() => {
                applyStatus("cancelled");
                setConfirmCancel(false);
              }}
            >
              {pending ? "Working..." : "Cancel order"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
