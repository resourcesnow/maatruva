import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getUserOrders } from "@/lib/data/orders";
import { OrderStatusBadge } from "@/components/storefront/order/order-status-badge";
import { ReorderButton } from "@/components/storefront/order/reorder-button";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = { title: "My Orders" };
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await auth();
  const orders = session?.user ? await getUserOrders(session.user.id) : [];

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-heading text-xl font-semibold">Orders</h2>

      {orders.length === 0 ? (
        <p className="text-muted-foreground text-sm">You haven&apos;t placed any orders yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((order) => (
            <li key={order._id} className="border-border rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Link href={`/order/${order._id}`} className="font-medium hover:underline">
                    #{order.orderNo}
                  </Link>
                  <p className="text-muted-foreground text-xs">
                    {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-semibold">{formatINR(order.total)}</span>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <ReorderButton orderId={order._id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
