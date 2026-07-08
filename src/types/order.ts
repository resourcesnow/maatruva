export type OrderStatus = "placed" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled";

export type OrderItem = {
  product: string;
  title: string;
  sku: string;
  image?: string;
  price: number;
  qty: number;
};

export type OrderSummary = {
  _id: string;
  orderNo: string;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  coupon?: { code?: string; value?: number };
  payment: {
    provider: string;
    status: "created" | "paid" | "failed" | "refunded";
  };
  status: OrderStatus;
  timeline: { status: string; at: string; note?: string }[];
  createdAt: string;
};
