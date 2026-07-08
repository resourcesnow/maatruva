"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";

export async function getReorderItemsAction(orderId: string) {
  const session = await auth();
  if (!session?.user) return { ok: false as const, error: "Not authenticated" };

  await connectDB();
  const order = await Order.findOne({ _id: orderId, user: session.user.id }).lean();
  if (!order) return { ok: false as const, error: "Order not found" };

  const productIds = order.items.map((i) => i.product);
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const bySlug = new Map(products.map((p) => [p._id.toString(), p]));

  const items = order.items
    .map((item) => {
      const product = bySlug.get(item.product.toString());
      if (!product) return null;
      return {
        productId: product._id.toString(),
        slug: product.slug,
        title: product.title,
        image: product.images[0]?.url ?? "",
        price: product.price,
        salePrice: product.salePrice ?? null,
        qty: item.qty,
        stock: product.stock,
      };
    })
    .filter((i): i is NonNullable<typeof i> => i !== null);

  return { ok: true as const, items };
}
