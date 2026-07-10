import Link from "next/link";
import { Package, Star, Truck } from "lucide-react";
import { OrderStatusBadge } from "@/components/storefront/order/order-status-badge";
import type { OrderSummary } from "@/types/order";

export function AccountSummaryCards({
  orderCount,
  reviewCount,
  latestOrder,
}: {
  orderCount: number;
  reviewCount: number;
  latestOrder: OrderSummary | null;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Link
        href="/account/orders"
        className="border-border hover:bg-muted flex flex-col gap-2 rounded-xl border p-4"
      >
        <Package className="text-muted-foreground size-5" />
        <span className="font-semibold">{orderCount}</span>
        <span className="text-muted-foreground text-sm">Order History</span>
      </Link>

      <Link
        href="/account/reviews"
        className="border-border hover:bg-muted flex flex-col gap-2 rounded-xl border p-4"
      >
        <Star className="text-muted-foreground size-5" />
        <span className="font-semibold">{reviewCount}</span>
        <span className="text-muted-foreground text-sm">Your Reviews</span>
      </Link>

      <Link
        href={latestOrder ? `/order/${latestOrder._id}` : "/account/orders"}
        className="border-border hover:bg-muted flex flex-col gap-2 rounded-xl border p-4"
      >
        <Truck className="text-muted-foreground size-5" />
        {latestOrder ? (
          <OrderStatusBadge status={latestOrder.status} />
        ) : (
          <span className="font-semibold">–</span>
        )}
        <span className="text-muted-foreground text-sm">Track Your Order</span>
      </Link>
    </div>
  );
}
