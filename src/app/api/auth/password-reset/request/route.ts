import { NextResponse } from "next/server";
import { customerForgotPasswordSchema } from "@/lib/zod-schemas/auth";
import { sendPasswordResetOtp } from "@/lib/password-reset";

// Always returns the same generic response regardless of whether the email matched an
// account, so this endpoint can't be used to enumerate registered emails.
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = customerForgotPasswordSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  try {
    await sendPasswordResetOtp(parsed.data.email);
  } catch {
    // Resend-cooldown errors etc. — still return the generic response, don't leak details.
  }

  return NextResponse.json({
    ok: true,
    message: "If that account exists, we've sent a code to it.",
  });
}
