import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifyOtpRecord } from "@/lib/otp";
import { verifyEmailSchema } from "@/lib/zod-schemas/auth";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = verifyEmailSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { email, code } = parsed.data;

  const isValid = await verifyOtpRecord(email, code);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  user.emailVerified = new Date();
  await user.save();

  return NextResponse.json({ ok: true });
}
