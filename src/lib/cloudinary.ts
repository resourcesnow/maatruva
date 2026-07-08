import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export async function uploadToCloudinary(
  file: File,
  options: { folder: string; resourceType?: "image" | "video" | "auto" } = { folder: "maatruva" },
) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: options.folder,
    resource_type: options.resourceType ?? "auto",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
  };
}

export async function destroyCloudinaryAsset(
  publicId: string,
  resourceType: "image" | "video" = "image",
) {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
