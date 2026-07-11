import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { createResetToken } from "@/lib/otp";
import { sendPasswordResetEmail } from "@/lib/resend";
import { brand } from "@/lib/brand";
import { forgotPasswordSchema } from "@/lib/zod-schemas/auth";

// Always responds identically regardless of whether the account exists, is active, or is
// currently rate-limited — no signal that could be used to enumerate admin accounts.
const GENERIC_RESPONSE = NextResponse.json({
  ok: true,
  message: "If an account exists for that email, a reset link has been sent.",
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { email } = parsed.data;

  try {
    await connectDB();
    const user = await User.findOne({ email });
    if (user?.isActive) {
      const token = await createResetToken(email);
      const resetUrl = `${brand.siteUrl}/admin/reset-password?email=${encodeURIComponent(email)}&token=${token}`;
      await sendPasswordResetEmail(email, resetUrl);
    }
  } catch (err) {
    // Cooldown errors, send failures, etc. are all swallowed — the response must not vary.
    console.error("[auth] forgot-password error (suppressed from client)", err);
  }

  return GENERIC_RESPONSE;
}
