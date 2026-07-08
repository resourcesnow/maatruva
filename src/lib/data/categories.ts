import "server-only";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import type { CategoryNode } from "@/types/catalog";

export async function getCategoryTree(): Promise<CategoryNode[]> {
  await connectDB();
  const docs = await Category.find({ isActive: true }).sort({ order: 1 }).lean();

  const nodes = new Map<string, CategoryNode>();
  docs.forEach((doc) => {
    nodes.set(doc._id.toString(), {
      id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      parent: doc.parent ? doc.parent.toString() : null,
      image: doc.image?.url
        ? { url: doc.image.url, publicId: doc.image.publicId ?? undefined }
        : undefined,
      order: doc.order ?? 0,
      isActive: doc.isActive,
      children: [],
    });
  });

  const roots: CategoryNode[] = [];
  nodes.forEach((node) => {
    if (node.parent && nodes.has(node.parent)) {
      nodes.get(node.parent)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export async function getCategoryBySlug(slug: string) {
  await connectDB();
  const doc = await Category.findOne({ slug, isActive: true }).lean();
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    parent: doc.parent ? doc.parent.toString() : null,
    image: doc.image?.url ? { url: doc.image.url, publicId: doc.image.publicId } : undefined,
    seo: doc.seo,
  };
}

export async function getCategoryDescendantIds(categoryId: string) {
  await connectDB();
  const all = await Category.find({}, { _id: 1, parent: 1 }).lean();
  const byParent = new Map<string, string[]>();
  all.forEach((c) => {
    const key = c.parent ? c.parent.toString() : "root";
    byParent.set(key, [...(byParent.get(key) ?? []), c._id.toString()]);
  });

  const ids = [categoryId];
  const queue = [categoryId];
  while (queue.length) {
    const current = queue.shift()!;
    const children = byParent.get(current) ?? [];
    children.forEach((childId) => {
      ids.push(childId);
      queue.push(childId);
    });
  }
  return ids;
}
