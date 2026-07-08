"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review";
import { Product } from "@/models/Product";

async function recalculateProductRating(productId: string) {
  const stats = await Review.aggregate([
    { $match: { product: productId, isApproved: true } },
    { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] ?? {};
  await Product.findByIdAndUpdate(productId, { ratingAvg: avg, ratingCount: count });
}

export async function approveReviewAction(reviewId: string) {
  const session = await auth();
  requireRole(session, ["admin"]);

  await connectDB();
  const review = await Review.findByIdAndUpdate(reviewId, { isApproved: true });
  if (review) await recalculateProductRating(review.product.toString());
  revalidatePath("/admin/reviews");
}

export async function rejectReviewAction(reviewId: string) {
  const session = await auth();
  requireRole(session, ["admin"]);

  await connectDB();
  const review = await Review.findByIdAndUpdate(reviewId, { isApproved: false });
  if (review) await recalculateProductRating(review.product.toString());
  revalidatePath("/admin/reviews");
}

export async function deleteReviewAction(reviewId: string) {
  const session = await auth();
  requireRole(session, ["admin"]);

  await connectDB();
  const review = await Review.findByIdAndDelete(reviewId);
  if (review) await recalculateProductRating(review.product.toString());
  revalidatePath("/admin/reviews");
}
