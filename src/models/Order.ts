import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    sku: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const shippingAddressSchema = new Schema(
  {
    name: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderNo: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null },
    guestEmail: { type: String, default: null },
    items: { type: [orderItemSchema], default: [] },
    shippingAddress: { type: shippingAddressSchema, required: true },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    coupon: {
      code: { type: String },
      value: { type: Number },
    },
    payment: {
      provider: { type: String, default: "razorpay" },
      orderId: { type: String },
      paymentId: { type: String },
      signature: { type: String },
      status: {
        // "pay_at_store": order placed and stock committed, but no money has changed hands yet
        // — Pickup-at-Store orders only, customer pays cash/UPI in person. Deliberately its own
        // distinct value (not "created", which means "mid-checkout, no order commitment yet",
        // and not "paid") so it can never be confused with either in admin views/reporting.
        type: String,
        enum: ["created", "paid", "failed", "refunded", "pay_at_store"],
        default: "created",
      },
    },
    deliveryMethod: {
      type: String,
      enum: ["delivery", "pickup"],
      default: "delivery",
    },
    shipping: {
      provider: { type: String, default: "shiprocket" },
      shiprocketOrderId: { type: String },
      shipmentId: { type: String },
      awbCode: { type: String },
      courierName: { type: String },
      trackingUrl: { type: String },
      status: { type: String },
      lastError: { type: String },
      estimatedDelivery: { type: Date },
      preDeliveryReminderSentAt: { type: Date },
    },
    status: {
      type: String,
      enum: ["placed", "confirmed", "packed", "shipped", "delivered", "cancelled"],
      default: "placed",
    },
    timeline: {
      type: [
        {
          status: { type: String },
          at: { type: Date, default: Date.now },
          note: { type: String },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ "payment.status": 1, status: 1 });

export type OrderDoc = InferSchemaType<typeof orderSchema>;

export const Order: Model<OrderDoc> = models.Order || model<OrderDoc>("Order", orderSchema);
