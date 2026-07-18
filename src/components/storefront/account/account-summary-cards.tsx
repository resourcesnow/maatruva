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
        className="border-cream-dark hover:bg-cream hover:border-gold/40 flex flex-col gap-2 rounded-xl border p-4 transition-colors"
      >
        <Package className="text-gold size-5" />
        <span className="text-maroon font-semibold">{orderCount}</span>
        <span className="text-maroon/60 text-sm">Order History</span>
      </Link>

      <Link
        href="/account/reviews"
        className="border-cream-dark hover:bg-cream hover:border-gold/40 flex flex-col gap-2 rounded-xl border p-4 transition-colors"
      >
        <Star className="text-gold size-5" />
        <span className="text-maroon font-semibold">{reviewCount}</span>
        <span className="text-maroon/60 text-sm">Your Reviews</span>
      </Link>

      <Link
        href={latestOrder ? `/order/${latestOrder._id}` : "/account/orders"}
        className="border-cream-dark hover:bg-cream hover:border-gold/40 flex flex-col gap-2 rounded-xl border p-4 transition-colors"
      >
        <Truck className="text-gold size-5" />
        {latestOrder ? (
          <OrderStatusBadge status={latestOrder.status} />
        ) : (
          <span className="text-maroon font-semibold">–</span>
        )}
        <span className="text-maroon/60 text-sm">Track Your Order</span>
      </Link>
    </div>
  );
}
