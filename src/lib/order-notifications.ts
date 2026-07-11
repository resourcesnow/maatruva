import "server-only";
import type { OrderDoc } from "@/models/Order";
import type { HydratedDocument } from "mongoose";

// Hook point for order-confirmation email/SMS once real templates are built (Resend is already
// wired up for auth emails — see src/lib/resend.ts — reuse that client here when ready).
// Intentionally a no-op today per product decision: don't build transactional templates yet.
export async function notifyOrderConfirmed(order: HydratedDocument<OrderDoc>) {
  console.log(
    `[order-notifications] order ${order.orderNo} confirmed — no email template wired yet.`,
  );
}
