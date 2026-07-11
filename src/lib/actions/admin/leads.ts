"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireRole, roleMatrix } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import { Lead } from "@/models/Lead";
import { logAdminAction } from "@/lib/audit";

export async function toggleLeadActionedAction(leadId: string, isActioned: boolean) {
  const session = await auth();
  requireRole(session, roleMatrix.leadsManage);

  await connectDB();
  const lead = await Lead.findByIdAndUpdate(leadId, { isActioned });
  if (lead) {
    await logAdminAction(session, {
      action: "status_change",
      entityType: "Lead",
      entityId: leadId,
      entityLabel: `${lead.type} lead from ${lead.email ?? lead.phone} (${isActioned ? "actioned" : "reopened"})`,
    });
  }
  revalidatePath("/admin/leads");
  return { ok: true, error: null };
}
