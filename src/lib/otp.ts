import { randomInt, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { connectDB } from "./db";
import { Otp } from "@/models/Otp";

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 30 * 1000;

function hashOtp(code: string, salt: string) {
  return scryptSync(code, salt, 64).toString("hex");
}

export function generateOtpCode() {
  return String(randomInt(100000, 999999));
}

export async function createOtp(identifier: string) {
  await connectDB();

  const recent = await Otp.findOne({ identifier }).sort({ createdAt: -1 });
  if (recent && Date.now() - new Date(recent.createdAt ?? 0).getTime() < RESEND_COOLDOWN_MS) {
    throw new Error("Please wait before requesting another code.");
  }

  const code = generateOtpCode();
  const salt = randomBytes(16).toString("hex");
  const codeHash = `${salt}:${hashOtp(code, salt)}`;

  await Otp.deleteMany({ identifier });
  await Otp.create({
    identifier,
    codeHash,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  });

  return code;
}

export async function verifyOtpRecord(identifier: string, code: string) {
  await connectDB();

  const record = await Otp.findOne({ identifier }).sort({ createdAt: -1 });
  if (!record) return false;

  if (record.expiresAt.getTime() < Date.now()) {
    await Otp.deleteOne({ _id: record._id });
    return false;
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await Otp.deleteOne({ _id: record._id });
    return false;
  }

  const [salt, storedHash] = record.codeHash.split(":");
  const candidateHash = hashOtp(code, salt);

  const isValid =
    storedHash.length === candidateHash.length &&
    timingSafeEqual(Buffer.from(storedHash, "hex"), Buffer.from(candidateHash, "hex"));

  if (!isValid) {
    await Otp.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
    return false;
  }

  await Otp.deleteOne({ _id: record._id });
  return true;
}
