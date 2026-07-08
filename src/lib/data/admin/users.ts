import "server-only";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function getAdminUsers(filters: { q?: string; page?: number; perPage?: number }) {
  await connectDB();
  const query: Record<string, unknown> = {};
  if (filters.q) {
    query.$or = [
      { name: { $regex: filters.q, $options: "i" } },
      { email: { $regex: filters.q, $options: "i" } },
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
    users: docs.map((d) => ({
      id: d._id.toString(),
      name: d.name,
      email: d.email,
      role: d.role,
      isActive: d.isActive,
    })),
    total,
  };
}
