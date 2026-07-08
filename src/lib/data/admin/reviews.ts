import "server-only";
import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review";

export async function getAdminReviews(filters: { status?: "pending" | "approved" }) {
  await connectDB();
  const query: Record<string, unknown> = {};
  if (filters.status === "pending") query.isApproved = false;
  if (filters.status === "approved") query.isApproved = true;

  const docs = await Review.find(query)
    .populate("user", "name")
    .populate("product", "title slug")
    .sort({ createdAt: -1 })
    .lean();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    rating: doc.rating,
    title: doc.title,
    comment: doc.comment,
    isApproved: doc.isApproved,
    createdAt: doc.createdAt?.toISOString() ?? "",
    userName: (doc.user as unknown as { name?: string })?.name ?? "Unknown",
    productTitle: (doc.product as unknown as { title?: string })?.title ?? "Unknown product",
    productSlug: (doc.product as unknown as { slug?: string })?.slug ?? "",
  }));
}
