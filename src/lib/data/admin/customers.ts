import "server-only";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Order } from "@/models/Order";

export async function getAdminCustomers(filters: { q?: string; page?: number; perPage?: number }) {
  await connectDB();
  const query: Record<string, unknown> = { role: "customer" };
  if (filters.q) {
    query.$or = [
      { name: { $regex: filters.q, $options: "i" } },
      { email: { $regex: filters.q, $options: "i" } },
      { phone: { $regex: filters.q, $options: "i" } },
    ];
  }

  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 20;

  const [docs, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean(),
    User.countDocuments(query),
  ]);

  return {
    customers: docs.map((d) => ({
      id: d._id.toString(),
      name: d.name,
      email: d.email,
      phone: d.phone,
      createdAt: d.createdAt?.toISOString() ?? "",
    })),
    total,
  };
}

export async function getCustomerDetail(id: string) {
  await connectDB();
  const user = await User.findById(id).lean();
  if (!user) return null;

  const orders = await Order.find({ user: id }).sort({ createdAt: -1 }).lean();
  const ltv = orders
    .filter((o) => o.payment?.status === "paid")
    .reduce((sum, o) => sum + o.total, 0);

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    addresses: user.addresses,
    orders: JSON.parse(JSON.stringify(orders)),
    ltv,
  };
}
