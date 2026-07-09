import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { createOtp } from "@/lib/otp";
import { sendVerificationEmail } from "@/lib/resend";
import { resendVerificationSchema } from "@/lib/zod-schemas/auth";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = resendVerificationSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { email } = parsed.data;

  await connectDB();
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }
  if (user.emailVerified) {
    return NextResponse.json({ error: "Email is already verified." }, { status: 400 });
  }

  try {
    const code = await createOtp(email);
    await sendVerificationEmail(email, code);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send verification code.";
    return NextResponse.json({ error: message }, { status: 429 });
  }

  return NextResponse.json({ ok: true });
}
