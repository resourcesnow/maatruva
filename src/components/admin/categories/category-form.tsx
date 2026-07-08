"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader, type UploadedImage } from "@/components/admin/image-uploader";
import { slugify } from "@/lib/format";

const initialState = { ok: false, error: null as string | null };

export function CategoryForm({
  flatCategories,
  initialValues,
  action,
  excludeId,
}: {
  flatCategories: { id: string; name: string }[];
  initialValues?: {
    name: string;
    slug: string;
    parent: string | null;
    image?: { url: string; publicId: string } | null;
    order: number;
    isActive: boolean;
  };
  action: (
    prevState: unknown,
    formData: FormData,
  ) => Promise<{ ok: boolean; error: string | null }>;
  excludeId?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const router = useRouter();

  const [name, setName] = useState(initialValues?.name ?? "");
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initialValues?.slug);
  const [parent, setParent] = useState(initialValues?.parent ?? "none");
  const [images, setImages] = useState<UploadedImage[]>(
    initialValues?.image ? [{ ...initialValues.image, alt: "", order: 0 }] : [],
  );

  useEffect(() => {
    if (state.ok) {
      toast.success("Category saved.");
      router.push("/admin/categories");
      router.refresh();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="parent">Parent Category</Label>
          <Select value={parent} onValueChange={(v) => setParent(v ?? "none")}>
            <SelectTrigger id="parent" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (top-level)</SelectItem>
              {flatCategories
                .filter((c) => c.id !== excludeId)
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="parent" value={parent === "none" ? "" : parent} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="order">Order</Label>
          <Input id="order" name="order" type="number" defaultValue={initialValues?.order ?? 0} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Category Image</Label>
        <ImageUploader
          images={images}
          onChange={(imgs) => setImages(imgs.slice(-1))}
          folder="maatruva/categories"
        />
        <input type="hidden" name="imageUrl" value={images[0]?.url ?? ""} />
        <input type="hidden" name="imagePublicId" value={images[0]?.publicId ?? ""} />
      </div>

      <label className="flex w-fit items-center gap-2 text-sm">
        <Switch name="isActive" defaultChecked={initialValues?.isActive ?? true} /> Active
      </label>

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving..." : "Save Category"}
      </Button>
    </form>
  );
}
