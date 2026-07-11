"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireRole, roleMatrix } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review";
import { Product } from "@/models/Product";
import { logAdminAction } from "@/lib/audit";

async function requireAdmin() {
  const session = await auth();
  requireRole(session, roleMatrix.reviewsModerate);
  return session!;
}

async function recalculateProductRating(productId: string) {
  const stats = await Review.aggregate([
    { $match: { product: productId, isApproved: true } },
    { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] ?? {};
  await Product.findByIdAndUpdate(productId, { ratingAvg: avg, ratingCount: count });
}

export async function approveReviewAction(reviewId: string) {
  const session = await requireAdmin();

  await connectDB();
  const review = await Review.findByIdAndUpdate(reviewId, { isApproved: true });
  if (review) {
    await recalculateProductRating(review.product.toString());
    await logAdminAction(session, {
      action: "status_change",
      entityType: "Review",
      entityId: reviewId,
      entityLabel: `Review approved (rating ${review.rating})`,
    });
  }
  revalidatePath("/admin/reviews");
  return { ok: true, error: null };
}

export async function rejectReviewAction(reviewId: string) {
  const session = await requireAdmin();

  await connectDB();
  const review = await Review.findByIdAndUpdate(reviewId, { isApproved: false });
  if (review) {
    await recalculateProductRating(review.product.toString());
    await logAdminAction(session, {
      action: "status_change",
      entityType: "Review",
      entityId: reviewId,
      entityLabel: `Review rejected (rating ${review.rating})`,
    });
  }
  revalidatePath("/admin/reviews");
  return { ok: true, error: null };
}

export async function deleteReviewAction(reviewId: string) {
  const session = await requireAdmin();

  await connectDB();
  const review = await Review.findByIdAndDelete(reviewId);
  if (review) {
    await recalculateProductRating(review.product.toString());
    await logAdminAction(session, {
      action: "delete",
      entityType: "Review",
      entityId: reviewId,
      entityLabel: `Review by ${review.user} (rating ${review.rating})`,
    });
  }
  revalidatePath("/admin/reviews");
  return { ok: true, error: null };
}
