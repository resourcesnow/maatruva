import type { ImageLoaderProps } from "next/image";

// Builds a Cloudinary delivery URL with f_auto/q_auto/width transformations applied
// via plain URL string manipulation — avoids shipping the @cloudinary/url-gen SDK
// (~150kB) to the client just to render an <img> tag. Cloudinary always accepts
// transformation params as the path segment immediately after "/upload/".
export function cloudinaryImageLoader({ src, width, quality }: ImageLoaderProps): string {
  const uploadMarker = "/upload/";
  const uploadIndex = src.indexOf(uploadMarker);
  if (uploadIndex === -1) return src;

  const base = src.slice(0, uploadIndex + uploadMarker.length);
  const path = src.slice(uploadIndex + uploadMarker.length);
  const params = ["f_auto", `q_${quality ?? "auto"}`, `w_${width}`, "c_limit"].join(",");
  return `${base}${params}/${path}`;
}
