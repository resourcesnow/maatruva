import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifyResetToken } from "@/lib/otp";
import { hashPassword } from "@/lib/password";
import { logAdminAction } from "@/lib/audit";
import { resetPasswordSchema } from "@/lib/zod-schemas/auth";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { email, token, password } = parsed.data;

  const isValid = await verifyResetToken(email, token);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 401 });
  }

  user.password = hashPassword(password);
  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  user.sessionVersion = (user.sessionVersion ?? 0) + 1; // invalidate any existing sessions
  if (!user.emailVerified) user.emailVerified = new Date();
  await user.save();

  await logAdminAction(
    { id: user._id.toString(), name: user.name, role: user.role },
    {
      action: "update",
      entityType: "User",
      entityId: user._id.toString(),
      entityLabel: `${email} (password reset)`,
    },
  );

  return NextResponse.json({ ok: true });
}
