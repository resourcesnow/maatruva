"use server";

import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Lead } from "@/models/Lead";

const newsletterSchema = z.object({ email: z.string().email() });
const contactSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(3),
});

export async function subscribeNewsletterAction(_prevState: unknown, formData: FormData) {
  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email address." };
  }

  await connectDB();
  await Lead.create({ type: "newsletter", email: parsed.data.email });
  return { ok: true, error: null };
}

export async function submitContactAction(_prevState: unknown, formData: FormData) {
  const parsed = contactSchema.safeParse({
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  await connectDB();
  await Lead.create({ type: "contact", ...parsed.data });
  return { ok: true, error: null };
}
