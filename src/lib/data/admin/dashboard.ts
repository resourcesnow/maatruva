import "server-only";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { User } from "@/models/User";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getDashboardData() {
  await connectDB();

  const [today, sevenDays, thirtyDays] = await Promise.all([
    aggregateRevenue(daysAgo(1)),
    aggregateRevenue(daysAgo(7)),
    aggregateRevenue(daysAgo(30)),
  ]);

  const newCustomers30d = await User.countDocuments({
    role: "customer",
    createdAt: { $gte: daysAgo(30) },
  });

  const dailyRevenueRaw = await Order.aggregate([
    { $match: { "payment.status": "paid", createdAt: { $gte: daysAgo(30) } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$total" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const revenueByDay = new Map(dailyRevenueRaw.map((d) => [d._id, d.revenue]));
  const dailyRevenue = Array.from({ length: 30 }, (_, i) => {
    const date = daysAgo(29 - i);
    const key = date.toISOString().slice(0, 10);
    return { date: key, revenue: revenueByDay.get(key) ?? 0 };
  });

  const topProductsRaw = await Order.aggregate([
    { $match: { "payment.status": "paid", createdAt: { $gte: daysAgo(30) } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        title: { $first: "$items.title" },
        qty: { $sum: "$items.qty" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
  ]);

  const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(5).lean();

  const lowStockProducts = await Product.find({
    status: "published",
    $expr: { $lte: ["$stock", "$lowStockThreshold"] },
  })
    .select("title stock lowStockThreshold slug")
    .limit(10)
    .lean();

  return {
    kpis: { today, sevenDays, thirtyDays, newCustomers30d },
    dailyRevenue,
    topProducts: topProductsRaw.map((p) => ({
      id: p._id.toString(),
      title: p.title,
      qty: p.qty,
      revenue: p.revenue,
    })),
    recentOrders: JSON.parse(JSON.stringify(recentOrders)),
    lowStockProducts: JSON.parse(JSON.stringify(lowStockProducts)),
  };
}

async function aggregateRevenue(since: Date) {
  const result = await Order.aggregate([
    { $match: { "payment.status": "paid", createdAt: { $gte: since } } },
    { $group: { _id: null, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
  ]);
  const revenue = result[0]?.revenue ?? 0;
  const orders = result[0]?.orders ?? 0;
  const aov = orders > 0 ? revenue / orders : 0;
  return { revenue, orders, aov };
}
