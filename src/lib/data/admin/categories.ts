import "server-only";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import type { CategoryNode } from "@/types/catalog";

export async function getAllCategoriesTree(): Promise<CategoryNode[]> {
  await connectDB();
  const docs = await Category.find({}).sort({ order: 1 }).lean();

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

export async function getFlatCategories() {
  await connectDB();
  const docs = await Category.find({}).sort({ order: 1 }).lean();
  return docs.map((doc) => ({
    id: doc._id.toString(),
    name: doc.name,
    parent: doc.parent ? doc.parent.toString() : null,
  }));
}

export async function getCategoryForEdit(id: string) {
  await connectDB();
  const doc = await Category.findById(id).lean();
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc));
}
