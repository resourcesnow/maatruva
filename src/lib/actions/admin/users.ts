"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireRole, roleMatrix } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { logAdminAction } from "@/lib/audit";
import type { UserRole } from "@/types/next-auth";

// Only a super_admin may grant super_admin, or touch an existing super_admin's role/active
// status — otherwise a plain admin could escalate themselves/others via the shared users UI.
async function requireCanModifyTarget(
  actorRole: UserRole,
  targetRole: UserRole,
  newRole?: UserRole,
) {
  if ((targetRole === "super_admin" || newRole === "super_admin") && actorRole !== "super_admin") {
    throw new Error("Only a super admin can manage super admin accounts.");
  }
}

export async function updateUserRoleAction(userId: string, role: UserRole) {
  const session = await auth();
  requireRole(session, roleMatrix.usersManage);

  if (session!.user.id === userId) {
    throw new Error("You cannot change your own role.");
  }

  await connectDB();
  const target = await User.findById(userId).select("role");
  if (!target) return { ok: false, error: "User not found." };
  await requireCanModifyTarget(session!.user.role, target.role, role);

  const user = await User.findByIdAndUpdate(userId, {
    role,
    $inc: { sessionVersion: 1 }, // force re-login on any active sessions under the old role
  });
  if (user) {
    await logAdminAction(session, {
      action: "role_change",
      entityType: "User",
      entityId: userId,
      entityLabel: `${user.name} (${user.email ?? user.phone}) → ${role}`,
    });
  }
  revalidatePath("/admin/users");
  revalidatePath("/admin/admins");
  return { ok: true, error: null };
}

export async function toggleUserActiveAction(userId: string, isActive: boolean) {
  const session = await auth();
  requireRole(session, roleMatrix.usersManage);

  if (session!.user.id === userId) {
    throw new Error("You cannot deactivate your own account.");
  }

  await connectDB();
  const target = await User.findById(userId).select("role");
  if (!target) return { ok: false, error: "User not found." };
  await requireCanModifyTarget(session!.user.role, target.role);

  const user = await User.findByIdAndUpdate(userId, {
    isActive,
    $inc: { sessionVersion: 1 },
  });
  if (user) {
    await logAdminAction(session, {
      action: isActive ? "reactivate" : "deactivate",
      entityType: "User",
      entityId: userId,
      entityLabel: `${user.name} (${user.email ?? user.phone})`,
    });
  }
  revalidatePath("/admin/users");
  revalidatePath("/admin/admins");
  return { ok: true, error: null };
}
