import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { destroyCloudinaryAsset } from "@/lib/cloudinary";
import { cloudinaryFolders } from "@/lib/cloudinary-folders";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const publicId = body?.publicId;
  if (!publicId || typeof publicId !== "string") {
    return NextResponse.json({ error: "Missing publicId." }, { status: 400 });
  }

  // Placeholder seed data was never actually uploaded to Cloudinary — nothing to delete.
  if (publicId.startsWith("placeholder-")) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const isOwnProfilePicture = publicId.startsWith(
    cloudinaryFolders.profilePicture(session.user.id),
  );
  const isCatalogManager = ["super_admin", "admin", "shop_manager"].includes(session.user.role);
  const isAdmin = ["super_admin", "admin"].includes(session.user.role);

  const allowed =
    isOwnProfilePicture ||
    (publicId.startsWith("maatruva/products/") && isCatalogManager) ||
    (publicId.startsWith("maatruva/categories/") && isAdmin) ||
    (publicId.startsWith("maatruva/homepage/") && isAdmin) ||
    (publicId.startsWith(cloudinaryFolders.misc) && isAdmin);

  if (!allowed) {
    return NextResponse.json({ error: "Not allowed to delete this asset." }, { status: 403 });
  }

  try {
    await destroyCloudinaryAsset(publicId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[cloudinary] delete failed for", publicId, err);
    return NextResponse.json({ error: "Failed to delete asset." }, { status: 500 });
  }
}
