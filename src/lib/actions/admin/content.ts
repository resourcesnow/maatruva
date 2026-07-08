"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import { HomeContent } from "@/models/HomeContent";
import { homeContentSchema } from "@/lib/zod-schemas/content";

export async function updateHomeContentAction(_prevState: unknown, formData: FormData) {
  const session = await auth();
  requireRole(session, ["admin"]);

  const raw = formData.get("payload");
  let payload;
  try {
    payload = JSON.parse(raw as string);
  } catch {
    return { ok: false, error: "Invalid form data." };
  }

  const parsed = homeContentSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  await connectDB();
  const existing = await HomeContent.findOne();
  if (existing) {
    await HomeContent.findByIdAndUpdate(existing._id, parsed.data);
  } else {
    await HomeContent.create(parsed.data);
  }

  revalidatePath("/");
  revalidatePath("/admin/content");
  return { ok: true, error: null };
}
