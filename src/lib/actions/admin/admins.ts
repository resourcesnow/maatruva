"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requireRole, roleMatrix } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { createResetToken } from "@/lib/otp";
import { sendAdminInviteEmail } from "@/lib/resend";
import { brand } from "@/lib/brand";
import { logAdminAction } from "@/lib/audit";

async function requireSuperAdmin() {
  const session = await auth();
  requireRole(session, roleMatrix.adminsManage);
  return session!;
}

const inviteSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  role: z.enum(["super_admin", "admin", "shop_manager"]),
});

export async function createAdminAction(_prevState: unknown, formData: FormData) {
  const session = await requireSuperAdmin();

  const parsed = inviteSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  await connectDB();
  const existing = await User.findOne({ email: parsed.data.email });
  if (existing) return { ok: false, error: "An account with this email already exists." };

  const user = await User.create({
    name: parsed.data.name,
    email: parsed.data.email,
    role: parsed.data.role,
    emailVerified: new Date(),
  });

  try {
    const token = await createResetToken(parsed.data.email);
    const setPasswordUrl = `${brand.siteUrl}/admin/reset-password?email=${encodeURIComponent(parsed.data.email)}&token=${token}`;
    await sendAdminInviteEmail(parsed.data.email, session.user.name ?? "An admin", setPasswordUrl);
  } catch (err) {
    console.error("[admin-invite] failed to send invite email", err);
  }

  await logAdminAction(session, {
    action: "create",
    entityType: "User",
    entityId: user._id.toString(),
    entityLabel: `${user.name} (${user.email}) as ${parsed.data.role}`,
  });

  revalidatePath("/admin/admins");
  return { ok: true, error: null };
}

export async function logoutAllDevicesAction() {
  const session = await requireSuperAdmin();

  await connectDB();
  await User.findByIdAndUpdate(session.user.id, { $inc: { sessionVersion: 1 } });

  await logAdminAction(session, {
    action: "update",
    entityType: "User",
    entityId: session.user.id,
    entityLabel: `${session.user.name} logged out all devices`,
  });
}

export async function resendAdminInviteAction(userId: string) {
  const session = await requireSuperAdmin();

  await connectDB();
  const user = await User.findById(userId);
  if (!user || !user.email) return { ok: false, error: "Admin not found." };
  if (user.password) return { ok: false, error: "This admin has already set a password." };

  try {
    const token = await createResetToken(user.email);
    const setPasswordUrl = `${brand.siteUrl}/admin/reset-password?email=${encodeURIComponent(user.email)}&token=${token}`;
    await sendAdminInviteEmail(user.email, session.user.name ?? "An admin", setPasswordUrl);
  } catch (err) {
    console.error("[admin-invite] failed to resend invite email", err);
    return { ok: false, error: "Failed to send invite email." };
  }

  await logAdminAction(session, {
    action: "update",
    entityType: "User",
    entityId: userId,
    entityLabel: `${user.name} (invite resent)`,
  });

  return { ok: true, error: null };
}
