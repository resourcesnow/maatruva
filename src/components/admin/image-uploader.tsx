"use client";

import { CldUploadWidget, CldImage } from "next-cloudinary";
import { ArrowLeft, ArrowRight, Star, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type UploadedImage = { url: string; publicId: string; alt: string; order: number };

export function ImageUploader({
  images,
  onChange,
  folder = "maatruva/misc",
  maxFiles,
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  folder?: string;
  maxFiles?: number;
}) {
  const atLimit = typeof maxFiles === "number" && images.length >= maxFiles;

  function handleSuccess(result: { event?: string; info?: unknown }) {
    if (result.event !== "success") return;
    const info = result.info;
    if (!info || typeof info === "string") return;
    const asset = info as { secure_url: string; public_id: string };

    const next = [
      ...images,
      { url: asset.secure_url, publicId: asset.public_id, alt: "", order: images.length },
    ];
    onChange(maxFiles ? next.slice(-maxFiles) : next);
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((img, i) => ({ ...img, order: i })));
  }

  function setCover(index: number) {
    if (index === 0) return;
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    onChange(next.map((img, i) => ({ ...img, order: i })));
  }

  async function remove(index: number) {
    const target = images[index];
    onChange(images.filter((_, i) => i !== index).map((img, i) => ({ ...img, order: i })));

    if (!target.publicId) return;
    try {
      const res = await fetch("/api/cloudinary/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: target.publicId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Removed here, but failed to delete from Cloudinary.");
      }
    } catch {
      toast.error("Removed here, but failed to delete from Cloudinary.");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div
            key={img.publicId + i}
            className={cn(
              "border-border relative size-24 overflow-hidden rounded-lg border",
              i === 0 && "ring-primary ring-2",
            )}
          >
            {img.url.includes("res.cloudinary.com") ? (
              <CldImage
                src={img.publicId}
                alt={img.alt || ""}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img.url} alt={img.alt || ""} className="size-full object-cover" />
            )}
            {i === 0 && (
              <span className="bg-primary text-primary-foreground absolute top-0.5 left-0.5 rounded px-1 text-[10px] font-medium">
                Cover
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/50 p-0.5">
              <button
                type="button"
                onClick={() => move(i, -1)}
                className="text-white disabled:opacity-30"
                disabled={i === 0}
                aria-label="Move left"
              >
                <ArrowLeft className="size-3.5" />
              </button>
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => setCover(i)}
                  className="text-white"
                  aria-label="Set as cover image"
                  title="Set as cover image"
                >
                  <Star className="size-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-white"
                aria-label="Remove image"
              >
                <X className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                className="text-white disabled:opacity-30"
                disabled={i === images.length - 1}
                aria-label="Move right"
              >
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        ))}

        {!atLimit && (
          <CldUploadWidget
            signatureEndpoint="/api/cloudinary/sign"
            onSuccess={handleSuccess}
            options={{
              folder,
              multiple: !maxFiles || maxFiles > 1,
              maxFiles: maxFiles ? maxFiles - images.length : undefined,
              sources: ["local", "url", "camera"],
              clientAllowedFormats: ["image"],
              maxImageFileSize: 10 * 1024 * 1024,
            }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className="border-border text-muted-foreground hover:bg-muted flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed"
              >
                <Upload className="size-5" />
                <span className="text-xs">Upload</span>
              </button>
            )}
          </CldUploadWidget>
        )}
      </div>

      {images.length === 0 && (
        <p className="text-muted-foreground text-xs">
          {maxFiles === 1 ? "No image uploaded yet." : "No images uploaded yet."}
        </p>
      )}
    </div>
  );
}
