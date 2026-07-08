import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types/order";

const LABELS: Record<OrderStatus, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const VARIANTS: Record<OrderStatus, "default" | "secondary" | "destructive"> = {
  placed: "secondary",
  confirmed: "secondary",
  packed: "secondary",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
