import "server-only";
import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review";

export async function getUserReviews(userId: string) {
  await connectDB();
  const docs = await Review.find({ user: userId })
    .populate("product", "title slug images")
    .sort({ createdAt: -1 })
    .lean();

  return docs.map((doc) => {
    const product = doc.product as unknown as {
      _id: unknown;
      title?: string;
      slug?: string;
      images?: { url: string }[];
    } | null;
    return {
      id: doc._id.toString(),
      rating: doc.rating,
      title: doc.title,
      comment: doc.comment,
      isApproved: doc.isApproved,
      createdAt: doc.createdAt?.toISOString() ?? "",
      product: product
        ? {
            title: product.title ?? "",
            slug: product.slug ?? "",
            image: product.images?.[0]?.url,
          }
        : null,
    };
  });
}

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
