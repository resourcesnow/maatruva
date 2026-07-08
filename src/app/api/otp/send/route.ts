import { NextResponse } from "next/server";
import { z } from "zod";
import { createOtp } from "@/lib/otp";
import { sms } from "@/lib/sms";

const bodySchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Enter a valid phone number with country code."),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { phone } = parsed.data;

  try {
    const code = await createOtp(phone);
    await sms.sendOtp(phone, code);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send OTP.";
    return NextResponse.json({ error: message }, { status: 429 });
  }
}
