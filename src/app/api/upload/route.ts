import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/rbac";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(req: Request) {
  const session = await auth();
  if (!hasRole(session, ["admin", "shop_manager"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const folder = (formData.get("folder") as string) || "maatruva/products";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const MAX_BYTES = 20 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 20MB)." }, { status: 400 });
  }

  try {
    const uploaded = await uploadToCloudinary(file, { folder });
    return NextResponse.json(uploaded);
  } catch {
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
