"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { deleteCategoryAction, toggleCategoryActiveAction } from "@/lib/actions/admin/categories";
import type { CategoryNode } from "@/types/catalog";

function Row({ category, depth }: { category: CategoryNode; depth: number }) {
  const [pending, startTransition] = useTransition();

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      await toggleCategoryActiveAction(category.id, checked);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteCategoryAction(category.id);
      if (!res.ok) toast.error(res.error ?? "Could not delete category.");
      else toast.success("Category deleted.");
    });
  }

  return (
    <>
      <div
        className="border-border flex items-center justify-between gap-3 border-b py-3"
        style={{ paddingLeft: depth * 24 }}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium">{category.name}</span>
          <span className="text-muted-foreground text-xs">/{category.slug}</span>
          {!category.isActive && <Badge variant="secondary">Inactive</Badge>}
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={category.isActive} onCheckedChange={handleToggle} disabled={pending} />
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/admin/categories/${category.id}`} />}
          >
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={pending}>
            Delete
          </Button>
        </div>
      </div>
      {category.children.map((child) => (
        <Row key={child.id} category={child} depth={depth + 1} />
      ))}
    </>
  );
}

export function CategoryTreeList({ categories }: { categories: CategoryNode[] }) {
  if (categories.length === 0) {
    return (
      <div className="border-border text-muted-foreground rounded-xl border border-dashed p-12 text-center text-sm">
        No categories yet.
      </div>
    );
  }

  return (
    <div className="border-border rounded-xl border px-4">
      {categories.map((category) => (
        <Row key={category.id} category={category} depth={0} />
      ))}
    </div>
  );
}
