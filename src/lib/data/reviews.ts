import "server-only";
import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review";

export async function getApprovedReviews(productId: string) {
  await connectDB();
  const docs = await Review.find({ product: productId, isApproved: true })
    .populate("user", "name image")
    .sort({ createdAt: -1 })
    .lean();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    rating: doc.rating,
    title: doc.title,
    comment: doc.comment,
    createdAt: doc.createdAt?.toISOString() ?? "",
    userName: (doc.user as unknown as { name?: string })?.name ?? "Anonymous",
  }));
}
