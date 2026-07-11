"use client";

import Image, { type ImageProps } from "next/image";
import { CldImage } from "next-cloudinary";

// Drop-in replacement for next/image's <Image> — renders CldImage (Cloudinary's on-the-fly
// transformations/optimization) for real Cloudinary-hosted assets, and falls back to plain
// next/image for anything else (legacy picsum placeholders, Google-hosted avatars, etc.) so
// existing data that predates the Cloudinary migration keeps rendering correctly.
export function SmartImage({ alt, ...props }: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  const isCloudinary = src.includes("res.cloudinary.com");

  if (isCloudinary) {
    return <CldImage {...props} src={src} alt={alt} />;
  }

  return <Image {...props} alt={alt} />;
}
