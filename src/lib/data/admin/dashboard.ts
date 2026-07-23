import "server-only";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { User } from "@/models/User";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// Midnight IST, n days ago, expressed as the equivalent UTC instant — safe regardless of the
// server's own runtime timezone (Vercel runs UTC), since it only uses UTC-suffixed Date methods
// to do the day math rather than relying on the system timezone. Used both as query cutoffs and
// to build the day-bucket keys below, so they stay consistent with the $dateToString aggregation
// (which is given the same "Asia/Kolkata" timezone explicitly).
function daysAgo(n: number) {
  const istNow = new Date(Date.now() + IST_OFFSET_MS);
  istNow.setUTCHours(0, 0, 0, 0);
  istNow.setUTCDate(istNow.getUTCDate() - n);
  return new Date(istNow.getTime() - IST_OFFSET_MS);
}

// The "date" part of an IST midnight instant, as a plain YYYY-MM-DD string — matches the format
// $dateToString produces below when given the same timezone.
function istDateKey(date: Date) {
  return new Date(date.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
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
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Kolkata" },
        },
        revenue: { $sum: "$total" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const revenueByDay = new Map(dailyRevenueRaw.map((d) => [d._id, d.revenue]));
  const dailyRevenue = Array.from({ length: 30 }, (_, i) => {
    const key = istDateKey(daysAgo(29 - i));
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
