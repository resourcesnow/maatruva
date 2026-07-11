import "server-only";
import { connectDB } from "@/lib/db";
import { Lead } from "@/models/Lead";

export async function getAdminLeads(filters: {
  type?: "newsletter" | "contact";
  page?: number;
  perPage?: number;
}) {
  await connectDB();
  const query: Record<string, unknown> = {};
  if (filters.type) query.type = filters.type;

  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 20;

  const [docs, total] = await Promise.all([
    Lead.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean(),
    Lead.countDocuments(query),
  ]);

  return {
    leads: docs.map((d) => ({
      id: d._id.toString(),
      type: d.type,
      email: d.email ?? null,
      phone: d.phone ?? null,
      message: d.message,
      isActioned: d.isActioned,
      createdAt: d.createdAt?.toISOString() ?? "",
    })),
    total,
  };
}
