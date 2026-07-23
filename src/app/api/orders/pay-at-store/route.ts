import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createPayAtStoreOrder, OrderValidationError } from "@/lib/order-fulfillment";

const bodySchema = z.object({
  items: z.array(z.object({ productId: z.string(), qty: z.number().int().positive() })).min(1),
  fullName: z.string().min(2),
  guestEmail: z.string().email().optional(),
  couponCode: z.string().optional(),
});

// Pickup-at-Store + Pay-at-Store only. No Razorpay order is ever created for this path — the
// order is created directly with payment.status: "pay_at_store", stock/coupon usage committed
// immediately (see createPayAtStoreOrder for why), and the customer pays in person at pickup.
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { items, fullName, guestEmail, couponCode } = parsed.data;
  const session = await auth();

  if (!session?.user && !guestEmail) {
    return NextResponse.json({ error: "Email required for guest checkout." }, { status: 400 });
  }

  try {
    const order = await createPayAtStoreOrder({
      items,
      fullName,
      userId: session?.user?.id,
      guestEmail,
      couponCode,
    });
    return NextResponse.json({ mongoOrderId: order._id.toString(), orderNo: order.orderNo });
  } catch (err) {
    if (err instanceof OrderValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
