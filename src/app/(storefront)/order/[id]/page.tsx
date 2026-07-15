import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getOrderById } from "@/lib/data/orders";
import { OrderStatusBadge } from "@/components/storefront/order/order-status-badge";
import { OrderTimeline } from "@/components/storefront/order/order-timeline";
import { SmartImage as Image } from "@/components/ui/smart-image";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = { title: "Order Confirmation" };
export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-8">
      {order.payment.status === "paid" && (
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <CheckCircle2 className="text-brand-secondary size-12" />
          <h1 className="font-heading text-2xl font-semibold">Thank you for your order!</h1>
          <p className="text-muted-foreground">Order confirmation has been sent to your email.</p>
        </div>
      )}

      <div className="border-border rounded-2xl border p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-muted-foreground text-sm">Order Number</p>
            <p className="font-heading text-xl font-semibold">#{order.orderNo}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="my-6">
          <OrderTimeline status={order.status} />
        </div>

        <div className="border-border flex flex-col gap-3 border-t pt-4">
          {order.items.map((item) => (
            <div key={item.product} className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="bg-muted relative size-12 shrink-0 overflow-hidden rounded-lg">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  )}
                </div>
                <span>
                  {item.title} × {item.qty}
                </span>
              </div>
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
            <div className="text-brand-secondary flex justify-between">
              <span>Discount</span>
              <span>-{formatINR(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatINR(order.total)}</span>
          </div>
        </div>

        {order.deliveryMethod === "pickup" ? (
          <div className="border-border text-muted-foreground mt-4 border-t pt-4 text-sm">
            <p className="text-foreground font-medium">Pickup at Store</p>
            <p>Collect this order in person once it&apos;s confirmed. No shipping will occur.</p>
          </div>
        ) : (
          <div className="border-border text-muted-foreground mt-4 border-t pt-4 text-sm">
            <p className="text-foreground font-medium">Shipping to</p>
            <p>{order.shippingAddress.name}</p>
            <p>
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""},{" "}
              {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
              {order.shippingAddress.pincode}
            </p>
            <p>{order.shippingAddress.phone}</p>
          </div>
        )}

        {order.shipping?.awbCode && (
          <div className="border-border text-muted-foreground mt-4 border-t pt-4 text-sm">
            <p className="text-foreground font-medium">Tracking</p>
            {order.shipping.courierName && <p>Courier: {order.shipping.courierName}</p>}
            <p>AWB: {order.shipping.awbCode}</p>
            {order.shipping.status && <p>Status: {order.shipping.status}</p>}
            {order.shipping.trackingUrl && (
              <a
                href={order.shipping.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-secondary underline"
              >
                Track shipment
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
