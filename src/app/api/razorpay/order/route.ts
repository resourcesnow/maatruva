import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { getRazorpayClient } from "@/lib/razorpay";
import { addressSchema } from "@/lib/zod-schemas/address";
import { validateCouponAction } from "@/lib/actions/coupon";

const SHIPPING_FEE = 0;

const bodySchema = z.object({
  items: z.array(z.object({ productId: z.string(), qty: z.number().int().positive() })).min(1),
  fullName: z.string().min(2),
  shippingAddress: addressSchema,
  guestEmail: z.string().email().optional(),
  couponCode: z.string().optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { items, fullName, shippingAddress, guestEmail, couponCode } = parsed.data;
  const session = await auth();

  if (!session?.user && !guestEmail) {
    return NextResponse.json({ error: "Email required for guest checkout." }, { status: 400 });
  }

  await connectDB();

  const products = await Product.find({
    _id: { $in: items.map((i) => i.productId) },
    status: "published",
  });
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = byId.get(item.productId);
    if (!product) {
      return NextResponse.json({ error: "One or more products are unavailable." }, { status: 400 });
    }
    if (product.stock < item.qty) {
      return NextResponse.json({ error: `${product.title} is out of stock.` }, { status: 400 });
    }
    const price = product.salePrice ?? product.price;
    subtotal += price * item.qty;
    orderItems.push({
      product: product._id,
      title: product.title,
      sku: product.sku,
      image: product.images[0]?.url,
      price,
      qty: item.qty,
    });
  }

  let discount = 0;
  let appliedCoupon: { code: string; value: number } | undefined;
  if (couponCode) {
    const result = await validateCouponAction(couponCode, subtotal);
    if (result.ok) {
      discount = result.discount;
      appliedCoupon = { code: result.code, value: result.discount };
    }
  }

  const total = Math.max(0, subtotal - discount + SHIPPING_FEE);
  const orderNo = `MTV${Date.now().toString().slice(-8)}`;

  const order = await Order.create({
    orderNo,
    user: session?.user?.id ?? null,
    guestEmail: session?.user ? null : guestEmail,
    items: orderItems,
    shippingAddress: {
      name: fullName,
      line1: shippingAddress.line1,
      line2: shippingAddress.line2,
      city: shippingAddress.city,
      state: shippingAddress.state,
      pincode: shippingAddress.pincode,
      phone: shippingAddress.phone,
    },
    subtotal,
    discount,
    shippingFee: SHIPPING_FEE,
    total,
    coupon: appliedCoupon,
    payment: { provider: "razorpay", status: "created" },
    status: "placed",
    timeline: [{ status: "placed", at: new Date() }],
  });

  const razorpayOrder = await getRazorpayClient().orders.create({
    amount: Math.round(total * 100),
    currency: "INR",
    receipt: orderNo,
  });

  order.payment!.orderId = razorpayOrder.id;
  await order.save();

  return NextResponse.json({
    mongoOrderId: order._id.toString(),
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    orderNo,
  });
}
