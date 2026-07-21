import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/data/orders";
import { OrderStatusSelect } from "@/components/admin/orders/order-status-select";
import { RefreshTrackingButton } from "@/components/admin/orders/refresh-tracking-button";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = { title: "Order Detail" };
export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Order #{order.orderNo}</h1>
        <OrderStatusSelect orderId={order._id} orderNo={order.orderNo} status={order.status} />
      </div>

      <div className="border-border rounded-xl border p-5">
        <h2 className="font-heading mb-3 text-lg font-semibold">Items</h2>
        <div className="flex flex-col gap-2">
          {order.items.map((item) => (
            <div key={item.product} className="flex justify-between text-sm">
              <span>
                {item.title} ({item.sku}) × {item.qty}
              </span>
              <span>{formatINR(item.price * item.qty)}</span>
            </div>
          ))}
        </div>
        <div className="border-border mt-4 flex flex-col gap-1 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatINR(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount ({order.coupon?.code})</span>
              <span>-{formatINR(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatINR(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="border-border rounded-xl border p-5">
        <h2 className="font-heading mb-2 text-lg font-semibold">
          {order.deliveryMethod === "pickup" ? "Pickup Location" : "Shipping Address"}
        </h2>
        {order.deliveryMethod === "pickup" && (
          <p className="text-muted-foreground mb-2 text-sm">
            Customer will collect in person — this is our store address, not theirs.
          </p>
        )}
        <p className="text-sm">{order.shippingAddress.name}</p>
        <p className="text-muted-foreground text-sm">
          {order.shippingAddress.line1}
          {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""},{" "}
          {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
          {order.shippingAddress.pincode}
        </p>
        <p className="text-muted-foreground text-sm">{order.shippingAddress.phone}</p>
      </div>

      <div className="border-border rounded-xl border p-5">
        <h2 className="font-heading mb-2 text-lg font-semibold">Payment</h2>
        <p className="text-sm capitalize">Status: {order.payment.status}</p>
        <p className="text-muted-foreground text-sm">Provider: {order.payment.provider}</p>
      </div>

      {order.deliveryMethod === "delivery" && (
        <div className="border-border rounded-xl border p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">Shipping</h2>
            {order.shipping?.shipmentId && <RefreshTrackingButton orderId={order._id} />}
          </div>
          {order.shipping?.shipmentId ? (
            <div className="flex flex-col gap-1 text-sm">
              <p className="capitalize">Status: {order.shipping.status ?? "unknown"}</p>
              {order.shipping.courierName && <p>Courier: {order.shipping.courierName}</p>}
              {order.shipping.awbCode && <p>AWB: {order.shipping.awbCode}</p>}
              {order.shipping.lastError && (
                <p className="text-destructive mt-1">{order.shipping.lastError}</p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              {order.payment.status === "paid"
                ? "Shipment not created yet."
                : "Shipment will be created once payment is confirmed."}
            </p>
          )}
        </div>
      )}

      <div className="border-border rounded-xl border p-5">
        <h2 className="font-heading mb-2 text-lg font-semibold">Timeline</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {order.timeline.map((t, i) => (
            <li key={i} className="flex flex-col">
              <div className="flex justify-between">
                <span className="capitalize">{t.status}</span>
                <span className="text-muted-foreground">{new Date(t.at).toLocaleString()}</span>
              </div>
              {t.note && <span className="text-muted-foreground text-xs">{t.note}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
