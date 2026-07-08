"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { CategoryNode } from "@/types/catalog";

const initialState = {
  ok: false,
  error: null as string | null,
  id: undefined as string | undefined,
};

type ProductFormValues = {
  title: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription: string;
  price: number;
  salePrice: number | null;
  categories: string[];
  images: UploadedImage[];
  stock: number;
  lowStockThreshold: number;
  isFeatured: boolean;
  isBestseller: boolean;
  badges: string[];
  status: "draft" | "published" | "archived";
};

function flattenCategories(
  categories: CategoryNode[],
  depth = 0,
): { id: string; name: string; depth: number }[] {
  return categories.flatMap((c) => [
    { id: c.id, name: c.name, depth },
    ...flattenCategories(c.children, depth + 1),
  ]);
}

export function ProductForm({
  categories,
  initialValues,
  action,
}: {
  categories: CategoryNode[];
  initialValues?: Partial<ProductFormValues>;
  action: (
    prevState: unknown,
    formData: FormData,
  ) => Promise<{ ok: boolean; error: string | null; id?: string }>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const router = useRouter();
  const flatCategories = flattenCategories(categories);

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initialValues?.slug);
  const [images, setImages] = useState<UploadedImage[]>(initialValues?.images ?? []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialValues?.categories ?? [],
  );
  const [status, setStatus] = useState(initialValues?.status ?? "draft");

  useEffect(() => {
    if (state.ok) {
      toast.success("Product saved.");
      router.push("/admin/products");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  function toggleCategory(id: string) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
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
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" required defaultValue={initialValues?.sku} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger id="status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="status" value={status} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min={0}
            required
            defaultValue={initialValues?.price}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="salePrice">Sale Price (₹, optional)</Label>
          <Input
            id="salePrice"
            name="salePrice"
            type="number"
            min={0}
            defaultValue={initialValues?.salePrice ?? undefined}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min={0}
            defaultValue={initialValues?.stock ?? 0}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
          <Input
            id="lowStockThreshold"
            name="lowStockThreshold"
            type="number"
            min={0}
            defaultValue={initialValues?.lowStockThreshold ?? 5}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="shortDescription">Short Description</Label>
        <Textarea
          id="shortDescription"
          name="shortDescription"
          rows={2}
          defaultValue={initialValues?.shortDescription}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={6}
          defaultValue={initialValues?.description}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Categories</Label>
        <div className="border-border flex flex-wrap gap-3 rounded-lg border p-3">
          {flatCategories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-1.5 text-sm"
              style={{ marginLeft: cat.depth * 12 }}
            >
              <input
                type="checkbox"
                name="categories"
                value={cat.id}
                checked={selectedCategories.includes(cat.id)}
                onChange={() => toggleCategory(cat.id)}
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Images</Label>
        <ImageUploader images={images} onChange={setImages} />
        <input type="hidden" name="images" value={JSON.stringify(images)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="badges">Badges (comma-separated)</Label>
        <Input
          id="badges"
          name="badges"
          defaultValue={initialValues?.badges?.join(", ")}
          placeholder="Sale, New"
        />
      </div>

      <div className="flex gap-8">
        <label className="flex items-center gap-2 text-sm">
          <Switch name="isFeatured" defaultChecked={initialValues?.isFeatured} /> Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch name="isBestseller" defaultChecked={initialValues?.isBestseller} /> Bestseller
        </label>
      </div>

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving..." : "Save Product"}
      </Button>
    </form>
  );
}
