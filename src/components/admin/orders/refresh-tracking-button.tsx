"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { refreshShipmentTrackingAction } from "@/lib/actions/admin/orders";

export function RefreshTrackingButton({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const res = await refreshShipmentTrackingAction(orderId);
      if (!res.ok) toast.error(res.error ?? "Could not refresh tracking.");
      else toast.success("Tracking refreshed.");
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={pending}>
      {pending ? "Refreshing..." : "Refresh tracking"}
    </Button>
  );
}
