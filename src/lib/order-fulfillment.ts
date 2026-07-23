import "server-only";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { Coupon } from "@/models/Coupon";
import "@/models/Category";
import {
  createShiprocketOrder,
  assignShiprocketAWB,
  classifyParcelCategory,
  ShiprocketConfigError,
  ShiprocketWalletBalanceError,
} from "@/lib/shiprocket";
import { brand } from "@/lib/brand";
import {
  notifyOrderConfirmed,
  notifyPaymentFailed,
  notifyPayAtStoreOrderPlaced,
} from "@/lib/order-notifications";
import { validateCouponAction } from "@/lib/actions/coupon";

export async function markOrderPaid(
  razorpayOrderId: string,
  paymentId: string,
  signature: string | undefined,
  note: string,
) {
  await connectDB();

  const order = await Order.findOneAndUpdate(
    { "payment.orderId": razorpayOrderId, "payment.status": { $ne: "paid" } },
    {
      $set: {
        "payment.paymentId": paymentId,
        "payment.signature": signature,
        "payment.status": "paid",
        status: "confirmed",
      },
      $push: { timeline: { status: "confirmed", at: new Date(), note } },
    },
    { returnDocument: "after" },
  );

  if (!order) return null;

  if (order.coupon?.code) {
    await Coupon.updateOne({ code: order.coupon.code }, { $inc: { usedCount: 1 } });
  }

  // Atomic, guarded decrement: only applies if enough stock is still available at this exact
  // moment. Without the stock: { $gte: qty } guard, two concurrent checkouts on the last unit(s)
  // could both pass the earlier pre-payment check and both decrement here, driving stock
  // negative (Mongoose's `min: 0` validator doesn't run on updateOne/$inc). Payment has already
  // been captured by Razorpay by this point, so a conflict here can't un-charge the customer —
  // instead it's logged and recorded on the order's timeline for manual follow-up (refund or
  // expedite restock) rather than silently oversold.
  const stockConflicts: string[] = [];
  for (const item of order.items) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.qty } },
      { $inc: { stock: -item.qty } },
    );
    if (!updated) stockConflicts.push(item.title);
  }
  if (stockConflicts.length > 0) {
    const conflictNote = `Payment succeeded but stock ran out for: ${stockConflicts.join(", ")} — needs manual review (refund or expedite restock).`;
    console.error(
      "[order-fulfillment] stock conflict on paid order",
      order.orderNo,
      stockConflicts,
    );
    await Order.updateOne(
      { _id: order._id },
      { $push: { timeline: { status: "confirmed", at: new Date(), note: conflictNote } } },
    );
  }

  // Fire-and-forget side effects: neither should block or fail the payment confirmation itself.
  notifyOrderConfirmed(order).catch((err) => {
    console.error("[order-fulfillment] order confirmation notification failed", order.orderNo, err);
  });

  if (order.deliveryMethod === "delivery") {
    createShipmentForOrder(order._id.toString()).catch((err) => {
      if (err instanceof ShiprocketConfigError) {
        console.error("[order-fulfillment]", err.message);
        return;
      }
      console.error("[order-fulfillment] shipment creation failed for", order.orderNo, err);
    });
  }

  return order;
}

export async function markOrderFailed(razorpayOrderId: string, note: string) {
  await connectDB();

  const order = await Order.findOneAndUpdate(
    { "payment.orderId": razorpayOrderId, "payment.status": { $ne: "paid" } },
    {
      $set: { "payment.status": "failed" },
      $push: { timeline: { status: "placed", at: new Date(), note } },
    },
    { returnDocument: "after" },
  );

  if (order) {
    notifyPaymentFailed(order).catch((err) => {
      console.error("[order-fulfillment] payment-failed notification failed", order.orderNo, err);
    });
  }

  return order;
}

export type PayAtStoreOrderInput = {
  items: { productId: string; qty: number }[];
  fullName: string;
  userId?: string;
  guestEmail?: string;
  couponCode?: string;
};

export class OrderValidationError extends Error {}

// Pickup-at-Store + Pay-at-Store only (never delivery — that always goes through Razorpay).
// Stock and coupon usage are committed immediately, matching markOrderPaid's semantics for a
// *real, accepted* order — unlike the online flow, there's no separate "payment confirmed"
// moment to defer them to, since this order is real the instant it's placed even though money
// hasn't changed hands yet. Never touches Razorpay or Shiprocket at any point.
export async function createPayAtStoreOrder(input: PayAtStoreOrderInput) {
  await connectDB();

  const products = await Product.find({
    _id: { $in: input.items.map((i) => i.productId) },
    status: "published",
  });
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

  const orderItems = [];
  let subtotal = 0;

  for (const item of input.items) {
    const product = byId.get(item.productId);
    if (!product) throw new OrderValidationError("One or more products are unavailable.");
    if (product.stock < item.qty) {
      throw new OrderValidationError(`${product.title} is out of stock.`);
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
  if (input.couponCode) {
    const result = await validateCouponAction(input.couponCode, subtotal);
    if (result.ok) {
      discount = result.discount;
      appliedCoupon = { code: result.code, value: result.discount };
    }
  }

  const total = Math.max(0, subtotal - discount);
  const orderNo = `MTV${Date.now().toString().slice(-8)}`;

  const order = await Order.create({
    orderNo,
    user: input.userId ?? null,
    guestEmail: input.userId ? null : input.guestEmail,
    items: orderItems,
    shippingAddress: { name: input.fullName, ...brand.storeAddress },
    subtotal,
    discount,
    shippingFee: 0,
    total,
    coupon: appliedCoupon,
    payment: { provider: "pay_at_store", status: "pay_at_store" },
    deliveryMethod: "pickup",
    status: "placed",
    timeline: [{ status: "placed", at: new Date(), note: "Placed — to pay in person at pickup" }],
  });

  if (appliedCoupon) {
    await Coupon.updateOne({ code: appliedCoupon.code }, { $inc: { usedCount: 1 } });
  }

  // Same atomic guarded decrement as markOrderPaid — see that function's comment for why the
  // $gte guard matters. No payment has been captured here, so a conflict is lower-stakes than
  // the online path, but still logged for manual follow-up rather than silently oversold.
  const stockConflicts: string[] = [];
  for (const item of order.items) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.qty } },
      { $inc: { stock: -item.qty } },
    );
    if (!updated) stockConflicts.push(item.title);
  }
  if (stockConflicts.length > 0) {
    console.error(
      "[order-fulfillment] stock conflict on pay-at-store order",
      order.orderNo,
      stockConflicts,
    );
    await Order.updateOne(
      { _id: order._id },
      {
        $push: {
          timeline: {
            status: order.status,
            at: new Date(),
            note: `Stock ran out for: ${stockConflicts.join(", ")} — needs manual review.`,
          },
        },
      },
    );
  }

  notifyPayAtStoreOrderPlaced(order).catch((err) => {
    console.error(
      "[order-fulfillment] pay-at-store confirmation notification failed",
      order.orderNo,
      err,
    );
  });

  return order;
}

export async function createShipmentForOrder(orderId: string) {
  await connectDB();
  const order = await Order.findById(orderId);
  if (!order) throw new Error(`Order ${orderId} not found.`);
  if (order.deliveryMethod !== "delivery") return null;
  if (order.shipping?.shipmentId) return order; // already created — avoid duplicate shipments

  const products = await Product.find({ _id: { $in: order.items.map((i) => i.product) } })
    .populate("categories", "name slug")
    .lean();
  const productById = new Map(
    products.map((p) => [
      p._id.toString(),
      p as unknown as { categories: { name: string; slug: string }[] },
    ]),
  );

  const items = order.items.map((item) => {
    const product = productById.get(item.product.toString());
    const categoryLabel = product?.categories?.[0]?.slug ?? product?.categories?.[0]?.name ?? "";
    return {
      title: item.title,
      sku: item.sku,
      price: item.price,
      qty: item.qty,
      category: classifyParcelCategory(categoryLabel),
    };
  });

  // Step 1: create the order/shipment in Shiprocket. This succeeds regardless of wallet
  // balance — only AWB/courier assignment below actually spends wallet balance.
  let result;
  try {
    result = await createShiprocketOrder({
      orderNo: order.orderNo,
      orderDate: order.createdAt ?? new Date(),
      items,
      subtotal: order.subtotal,
      shippingAddress: {
        name: order.shippingAddress.name,
        line1: order.shippingAddress.line1,
        line2: order.shippingAddress.line2 ?? undefined,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        pincode: order.shippingAddress.pincode,
        phone: order.shippingAddress.phone,
      },
    });
  } catch (err) {
    if (err instanceof ShiprocketConfigError) throw err;
    const message = err instanceof Error ? err.message : String(err);
    order.shipping = {
      ...order.shipping,
      provider: "shiprocket",
      status: "creation_failed",
      lastError: message,
    };
    order.timeline.push({ status: order.status, at: new Date(), note: message });
    await order.save();
    throw err;
  }

  order.shipping = {
    ...order.shipping,
    provider: "shiprocket",
    shiprocketOrderId: result.shiprocketOrderId,
    shipmentId: result.shipmentId,
    status: "created",
  };
  await order.save();

  // Step 2: assign a courier/AWB — this is the step that requires wallet balance.
  try {
    const awb = await assignShiprocketAWB(result.shipmentId);
    order.shipping = {
      ...order.shipping,
      awbCode: awb.awbCode,
      courierName: awb.courierName,
      status: "awb_assigned",
    };
    order.timeline.push({
      status: order.status,
      at: new Date(),
      note: `Courier assigned: ${[awb.courierName, awb.awbCode].filter(Boolean).join(" ")}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    order.shipping = {
      ...order.shipping,
      status:
        err instanceof ShiprocketWalletBalanceError
          ? "awb_pending_wallet_balance"
          : "awb_assignment_failed",
      lastError: message,
    };
    order.timeline.push({ status: order.status, at: new Date(), note: message });
  }
  await order.save();

  return order;
}
