import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/password";
import { createOtp } from "@/lib/otp";
import { sendVerificationEmail } from "@/lib/resend";
import { signupSchema } from "@/lib/zod-schemas/auth";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing?.emailVerified) {
    return NextResponse.json(
      { error: "An account with this email already exists. Try logging in." },
      { status: 409 },
    );
  }

  const passwordHash = hashPassword(password);

  if (existing) {
    existing.name = name;
    existing.password = passwordHash;
    await existing.save();
  } else {
    await User.create({ name, email, password: passwordHash });
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
