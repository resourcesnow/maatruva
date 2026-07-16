import { NextResponse } from "next/server";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/zod-schemas/auth";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { email, password } = parsed.data;

  try {
    await signIn("email-password", { email, password, redirect: false });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (!(err instanceof AuthError)) throw err;

    // authorize() (src/lib/auth.ts) already ran above and is the single source of truth for
    // lockout tracking — it increments failedLoginAttempts / sets lockedUntil regardless of
    // *why* sign-in failed. This is a read-only re-check purely to choose which client-facing
    // message to show; it must never run before signIn(), or a wrong-password attempt would
    // never reach authorize() and lockout tracking would silently never trigger.
    await connectDB();
    const user = await User.findOne({ email }).select("+password emailVerified");
    if (user?.password && verifyPassword(password, user.password) && !user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before logging in.", code: "not_verified" },
        { status: 403 },
      );
    }
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
}
