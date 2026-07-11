import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCustomerDetail } from "@/lib/data/admin/customers";
import { OrderStatusBadge } from "@/components/storefront/order/order-status-badge";
import { formatINR } from "@/lib/format";
import type { OrderStatus } from "@/types/order";

export const metadata: Metadata = { title: "Customer Detail" };
export const dynamic = "force-dynamic";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomerDetail(id);
  if (!customer) notFound();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">{customer.name}</h1>
        <p className="text-muted-foreground text-sm">
          {customer.email ?? "—"} · {customer.phone ?? "—"}
        </p>
      </div>

      <div className="border-border rounded-xl border p-5">
        <p className="text-muted-foreground text-sm">Lifetime Value</p>
        <p className="font-heading text-2xl font-semibold">{formatINR(customer.ltv)}</p>
      </div>

      <div className="border-border rounded-xl border p-5">
        <h2 className="font-heading mb-3 text-lg font-semibold">Addresses</h2>
        {customer.addresses.length === 0 ? (
          <p className="text-muted-foreground text-sm">No saved addresses.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {customer.addresses.map((addr, i) => (
              <li key={i} className="text-muted-foreground">
                {addr.label}: {addr.line1}, {addr.city}, {addr.state} - {addr.pincode}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-border rounded-xl border p-5">
        <h2 className="font-heading mb-3 text-lg font-semibold">Orders</h2>
        {customer.orders.length === 0 ? (
          <p className="text-muted-foreground text-sm">No orders yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {customer.orders.map(
              (order: { _id: string; orderNo: string; total: number; status: string }) => (
                <li key={order._id} className="flex items-center justify-between text-sm">
                  <span>#{order.orderNo}</span>
                  <span>{formatINR(order.total)}</span>
                  <OrderStatusBadge status={order.status as OrderStatus} />
                </li>
              ),
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
