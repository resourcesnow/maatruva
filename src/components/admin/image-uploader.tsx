"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export type UploadedImage = { url: string; publicId: string; alt: string; order: number };

export function ImageUploader({
  images,
  onChange,
  folder = "maatruva/products",
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  folder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: UploadedImage[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? "Upload failed.");
          continue;
        }
        uploaded.push({ url: data.url, publicId: data.publicId, alt: "", order: 0 });
      }
      const merged = [...images, ...uploaded].map((img, i) => ({ ...img, order: i }));
      onChange(merged);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((img, i) => ({ ...img, order: i })));
  }

  function remove(index: number) {
    onChange(images.filter((_, i) => i !== index).map((img, i) => ({ ...img, order: i })));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div
            key={img.publicId + i}
            className="border-border relative size-24 overflow-hidden rounded-lg border"
          >
            <Image src={img.url} alt={img.alt || ""} fill sizes="96px" className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 p-0.5">
              <button
                type="button"
                onClick={() => move(i, -1)}
                className="text-white disabled:opacity-30"
                disabled={i === 0}
              >
                <ArrowLeft className="size-3.5" />
              </button>
              <button type="button" onClick={() => remove(i)} className="text-white">
                <X className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                className="text-white disabled:opacity-30"
                disabled={i === images.length - 1}
              >
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
        <label className="border-border text-muted-foreground hover:bg-muted flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed">
          {uploading ? <Loader2 className="size-5 animate-spin" /> : <Upload className="size-5" />}
          <span className="text-xs">Upload</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Add Images"}
      </Button>
    </div>
  );
}
