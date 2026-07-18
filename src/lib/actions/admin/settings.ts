"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireRole, roleMatrix } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";
import { siteSettingsSchema } from "@/lib/zod-schemas/site-settings";
import { logAdminAction } from "@/lib/audit";

export async function updateSiteSettingsAction(_prevState: unknown, formData: FormData) {
  const session = await auth();
  requireRole(session, roleMatrix.settingsManage);

  const parsed = siteSettingsSchema.safeParse({
    whatsappEnabled: formData.get("whatsappEnabled") === "on",
    whatsappNumber: formData.get("whatsappNumber"),
    whatsappMessage: formData.get("whatsappMessage"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  await connectDB();
  const existing = await SiteSettings.findOne();
  if (existing) {
    await SiteSettings.findByIdAndUpdate(existing._id, parsed.data);
  } else {
    await SiteSettings.create(parsed.data);
  }

  await logAdminAction(session, {
    action: "update",
    entityType: "SiteSettings",
    entityLabel: "Site settings",
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { ok: true, error: null };
}
