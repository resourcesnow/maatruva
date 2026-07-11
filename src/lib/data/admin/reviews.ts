import "server-only";
import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review";

export async function getAdminReviews(filters: {
  status?: "pending" | "approved";
  q?: string;
  page?: number;
  perPage?: number;
}) {
  await connectDB();
  const query: Record<string, unknown> = {};
  if (filters.status === "pending") query.isApproved = false;
  if (filters.status === "approved") query.isApproved = true;
  if (filters.q) {
    query.$or = [
      { title: { $regex: filters.q, $options: "i" } },
      { comment: { $regex: filters.q, $options: "i" } },
    ];
  }

  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 20;

  const [docs, total] = await Promise.all([
    Review.find(query)
      .populate("user", "name")
      .populate("product", "title slug")
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean(),
    Review.countDocuments(query),
  ]);

  return {
    reviews: docs.map((doc) => ({
      id: doc._id.toString(),
      rating: doc.rating,
      title: doc.title,
      comment: doc.comment,
      isApproved: doc.isApproved,
      createdAt: doc.createdAt?.toISOString() ?? "",
      userName: (doc.user as unknown as { name?: string })?.name ?? "Unknown",
      productTitle: (doc.product as unknown as { title?: string })?.title ?? "Unknown product",
      productSlug: (doc.product as unknown as { slug?: string })?.slug ?? "",
    })),
    total,
  };
}
