import "server-only";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { createOtp, verifyOtpRecord, generateOtpCode } from "@/lib/otp";
import { hashPassword } from "@/lib/password";
import { sendPasswordResetOtpEmail } from "@/lib/order-emails";

const OTP_TTL_MS = 10 * 60 * 1000;

// Shared by both the unauthenticated "forgot password" flow and the logged-in "change
// password" flow in account settings — same OTP-to-email mechanism, just a different source
// for which email to target (user-typed vs. the current session's email).
function otpIdentifier(email: string) {
  return `pwreset:${email}`;
}

export async function sendPasswordResetOtp(email: string) {
  await connectDB();
  const user = await User.findOne({ email });
  if (!user) return; // no enumeration — caller always returns a generic response

  const code = await createOtp(otpIdentifier(email), {
    ttlMs: OTP_TTL_MS,
    generate: generateOtpCode,
  });
  await sendPasswordResetOtpEmail(email, code);
}

export async function applyPasswordResetWithOtp(email: string, code: string, newPassword: string) {
  const isValid = await verifyOtpRecord(otpIdentifier(email), code);
  if (!isValid) return false;

  await connectDB();
  const user = await User.findOne({ email });
  if (!user) return false;

  user.password = hashPassword(newPassword);
  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  user.sessionVersion = (user.sessionVersion ?? 0) + 1; // invalidate any existing sessions
  await user.save();

  return true;
}
