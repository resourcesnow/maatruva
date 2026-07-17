import Image, { type ImageProps } from "next/image";
import { cloudinaryImageLoader } from "@/lib/cloudinary-image-loader";

// Drop-in replacement for next/image's <Image> — applies Cloudinary's f_auto/q_auto/width
// transformations via a plain URL loader for real Cloudinary-hosted assets, and falls back to
// plain next/image for anything else (legacy picsum placeholders, Google-hosted avatars, etc.)
// so existing data that predates the Cloudinary migration keeps rendering correctly. Uses a
// hand-rolled loader instead of next-cloudinary's <CldImage> to avoid shipping the
// @cloudinary/url-gen SDK to every route that renders a product image.
export function SmartImage({ alt, ...props }: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  const isCloudinary = src.includes("res.cloudinary.com");

  if (isCloudinary) {
    return <Image {...props} src={src} alt={alt} loader={cloudinaryImageLoader} />;
  }

  return <Image {...props} alt={alt} />;
}
