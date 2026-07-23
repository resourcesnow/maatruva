"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/admin/confirm-action-dialog";
import { markPayAtStorePaidAction } from "@/lib/actions/admin/orders";

export function MarkPaidButton({ orderId, orderNo }: { orderId: string; orderNo: string }) {
  async function handleConfirm() {
    const res = await markPayAtStorePaidAction(orderId);
    if (!res.ok) toast.error(res.error ?? "Could not mark this order as paid.");
    else toast.success(`Order #${orderNo} marked as paid.`);
  }

  return (
    <ConfirmActionDialog
      triggerRender={<Button size="sm" />}
      triggerLabel="Mark as paid"
      title={`Mark order #${orderNo} as paid?`}
      description="Only confirm this once you've actually collected cash or UPI payment from the customer at pickup. This cannot be undone from here."
      confirmLabel="Yes, payment collected"
      destructive={false}
      onConfirm={handleConfirm}
    />
  );
}
