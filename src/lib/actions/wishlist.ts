"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function toggleWishlistAction(productId: string) {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "LOGIN_REQUIRED" as const };
  }

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) return { ok: false, error: "NOT_FOUND" as const };

  const exists = user.wishlist.some((id) => id.toString() === productId);
  if (exists) {
    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
  } else {
    user.wishlist.push(productId as unknown as (typeof user.wishlist)[number]);
  }
  await user.save();

  revalidatePath("/account/wishlist");
  return { ok: true, wishlisted: !exists };
}

export async function getWishlistIds() {
  const session = await auth();
  if (!session?.user) return [];
  await connectDB();
  const user = await User.findById(session.user.id).select("wishlist").lean();
  return user?.wishlist.map((id) => id.toString()) ?? [];
}
