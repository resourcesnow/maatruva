import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";
import { isFolderAllowedForUser } from "@/lib/cloudinary-folders";

// Contract fixed by next-cloudinary's CldUploadWidget (see generateSignatureCallback in
// @cloudinary-util/url-loader): POST { paramsToSign } -> { signature }.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const paramsToSign = body?.paramsToSign;
  if (!paramsToSign || typeof paramsToSign !== "object") {
    return NextResponse.json({ error: "Missing paramsToSign." }, { status: 400 });
  }

  const folder = typeof paramsToSign.folder === "string" ? paramsToSign.folder : "";
  if (!folder || !isFolderAllowedForUser(folder, session.user.id, session.user.role)) {
    return NextResponse.json({ error: "Not allowed to upload to this folder." }, { status: 403 });
  }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET as string,
  );

  return NextResponse.json({ signature });
}
