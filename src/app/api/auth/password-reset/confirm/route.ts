import { NextResponse } from "next/server";
import { customerResetPasswordSchema } from "@/lib/zod-schemas/auth";
import { applyPasswordResetWithOtp } from "@/lib/password-reset";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = customerResetPasswordSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { email, code, password } = parsed.data;
  const ok = await applyPasswordResetWithOtp(email, code, password);
  if (!ok) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
