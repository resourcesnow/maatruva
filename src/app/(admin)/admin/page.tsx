import Link from "next/link";
import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { getDashboardData } from "@/lib/data/admin/dashboard";
import { StatTile } from "@/components/admin/dashboard/stat-tile";
import { RevenueChart } from "@/components/admin/dashboard/revenue-chart";
import { OrderStatusBadge } from "@/components/storefront/order/order-status-badge";
import { formatINR } from "@/lib/format";
import type { OrderSummary } from "@/types/order";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { kpis, dailyRevenue, topProducts, recentOrders, lowStockProducts } =
    await getDashboardData();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="Revenue Today"
          value={formatINR(kpis.today.revenue)}
          sublabel={`${kpis.today.orders} orders`}
        />
        <StatTile
          label="Revenue (7d)"
          value={formatINR(kpis.sevenDays.revenue)}
          sublabel={`${kpis.sevenDays.orders} orders`}
        />
        <StatTile
          label="Revenue (30d)"
          value={formatINR(kpis.thirtyDays.revenue)}
          sublabel={`AOV ${formatINR(kpis.thirtyDays.aov)}`}
        />
        <StatTile label="New Customers (30d)" value={String(kpis.newCustomers30d)} />
      </div>

      <div className="border-border bg-card rounded-xl border p-5">
        <h2 className="font-heading mb-4 text-lg font-semibold">Revenue — Last 30 Days</h2>
        <RevenueChart data={dailyRevenue} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border-border bg-card rounded-xl border p-5">
          <h2 className="font-heading mb-4 text-lg font-semibold">Top Products (30d)</h2>
          {topProducts.length === 0 ? (
            <p className="text-muted-foreground text-sm">No sales yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {topProducts.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span>{p.title}</span>
                  <span className="text-muted-foreground">
                    {p.qty} sold · {formatINR(p.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-border bg-card rounded-xl border p-5">
          <h2 className="font-heading mb-4 text-lg font-semibold">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No orders yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {(recentOrders as OrderSummary[]).map((order) => (
                <li key={order._id} className="flex items-center justify-between text-sm">
                  <Link href={`/admin/orders/${order._id}`} className="hover:underline">
                    #{order.orderNo}
                  </Link>
                  <span>{formatINR(order.total)}</span>
                  <OrderStatusBadge status={order.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="border-destructive/30 bg-destructive/5 rounded-xl border p-5">
          <h2 className="font-heading text-destructive mb-3 flex items-center gap-2 text-lg font-semibold">
            <AlertTriangle className="size-5" /> Low Stock Alerts
          </h2>
          <ul className="flex flex-col gap-2">
            {lowStockProducts.map((p: { _id: string; title: string; stock: number }) => (
              <li key={p._id} className="flex items-center justify-between text-sm">
                <Link href={`/admin/products/${p._id}`} className="hover:underline">
                  {p.title}
                </Link>
                <span className="text-destructive font-medium">{p.stock} left</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
