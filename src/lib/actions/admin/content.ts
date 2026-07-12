"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireRole, roleMatrix } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import { HomeContent, type HomeContentDoc } from "@/models/HomeContent";
import { homeContentSchema, type HomeContentInput } from "@/lib/zod-schemas/content";
import { logAdminAction } from "@/lib/audit";
import { destroyCloudinaryAsset } from "@/lib/cloudinary";

// Belt-and-suspenders: the form already deletes an image from Cloudinary the moment it's
// swapped/removed client-side, but if that fetch silently failed (closed tab, network blip),
// this diff on save catches anything still orphaned so Mongo and Cloudinary never drift.
async function cleanupRemovedHomeContentImages(
  before: HomeContentDoc | null,
  after: HomeContentInput,
) {
  if (!before) return;

  const beforeIds = [
    ...before.heroSlides.map((s) => s.publicId),
    ...before.featuredBanners.map((b) => b.publicId),
    ...before.founders.map((f) => f.photoPublicId),
    before.brandStatement?.publicId,
  ].filter((id): id is string => !!id);

  const afterIds = new Set(
    [
      ...after.heroSlides.map((s) => s.publicId),
      ...after.featuredBanners.map((b) => b.publicId),
      ...after.founders.map((f) => f.photoPublicId),
      after.brandStatement?.publicId,
    ].filter(Boolean),
  );

  const removed = beforeIds.filter((id) => !afterIds.has(id) && !id.startsWith("placeholder-"));
  await Promise.all(
    removed.map((id) =>
      destroyCloudinaryAsset(id).catch((err) =>
        console.error("[cloudinary] failed to delete", id, err),
      ),
    ),
  );
}

export async function updateHomeContentAction(_prevState: unknown, formData: FormData) {
  const session = await auth();
  requireRole(session, roleMatrix.contentManage);

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
    await cleanupRemovedHomeContentImages(existing, parsed.data);
  } else {
    await HomeContent.create(parsed.data);
  }

  await logAdminAction(session, {
    action: "update",
    entityType: "HomeContent",
    entityLabel: "Homepage content",
  });

  revalidatePath("/");
  revalidatePath("/admin/content");
  return { ok: true, error: null };
}
