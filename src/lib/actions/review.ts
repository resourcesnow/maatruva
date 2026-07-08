"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review";
import { Product } from "@/models/Product";
import { reviewSchema } from "@/lib/zod-schemas/review";

export async function submitReviewAction(_prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "Please login to write a review." };
  }

  const parsed = reviewSchema.safeParse({
    product: formData.get("product"),
    rating: formData.get("rating"),
    title: formData.get("title"),
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  await connectDB();
  await Review.create({
    product: parsed.data.product,
    user: session.user.id,
    rating: parsed.data.rating,
    title: parsed.data.title,
    comment: parsed.data.comment,
    isApproved: false,
  });

  const product = await Product.findById(parsed.data.product).select("slug").lean();
  if (product) revalidatePath(`/product/${product.slug}`);

  return { ok: true, error: null };
}
