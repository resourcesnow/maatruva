import { NextResponse } from "next/server";
import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn } from "@/lib/auth";

const bodySchema = z.object({
  phone: z.string().min(10),
  otp: z.string().length(6),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { phone, otp } = parsed.data;

  try {
    await signIn("phone-otp", { phone, otp, redirect: false });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: "Invalid or expired OTP." }, { status: 401 });
    }
    throw err;
  }
}
