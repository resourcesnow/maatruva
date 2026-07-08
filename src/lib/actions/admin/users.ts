"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import type { UserRole } from "@/types/next-auth";

export async function updateUserRoleAction(userId: string, role: UserRole) {
  const session = await auth();
  requireRole(session, ["admin"]);

  if (session!.user.id === userId) {
    throw new Error("You cannot change your own role.");
  }

  await connectDB();
  await User.findByIdAndUpdate(userId, { role });
  revalidatePath("/admin/users");
}

export async function toggleUserActiveAction(userId: string, isActive: boolean) {
  const session = await auth();
  requireRole(session, ["admin"]);

  await connectDB();
  await User.findByIdAndUpdate(userId, { isActive });
  revalidatePath("/admin/users");
}
