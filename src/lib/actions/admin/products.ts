"use server";

import * as XLSX from "xlsx";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireRole, roleMatrix } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { productSchema } from "@/lib/zod-schemas/product";
import { bulkProductRowSchema } from "@/lib/zod-schemas/product-import";
import { logAdminAction } from "@/lib/audit";
import { destroyCloudinaryAsset } from "@/lib/cloudinary";
import { slugify } from "@/lib/format";

async function cleanupProductImages(images: { publicId: string }[]) {
  await Promise.all(
    images
      .filter((img) => img.publicId && !img.publicId.startsWith("placeholder-"))
      .map((img) =>
        destroyCloudinaryAsset(img.publicId).catch((err) =>
          console.error("[cloudinary] failed to delete", img.publicId, err),
        ),
      ),
  );
}

async function requireProductManager() {
  const session = await auth();
  requireRole(session, roleMatrix.productsManage);
  return session!;
}

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    sku: formData.get("sku"),
    description: formData.get("description") || "",
    shortDescription: formData.get("shortDescription") || "",
    price: formData.get("price"),
    salePrice: formData.get("salePrice") || null,
    categories: formData.getAll("categories"),
    images: JSON.parse((formData.get("images") as string) || "[]"),
    stock: formData.get("stock") || 0,
    lowStockThreshold: formData.get("lowStockThreshold") || 5,
    isFeatured: formData.get("isFeatured") === "on",
    isBestseller: formData.get("isBestseller") === "on",
    badges:
      (formData.get("badges") as string)
        ?.split(",")
        .map((b) => b.trim())
        .filter(Boolean) ?? [],
    status: formData.get("status") || "draft",
  });
}

export async function createProductAction(_prevState: unknown, formData: FormData) {
  const session = await requireProductManager();
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  await connectDB();
  const existing = await Product.findOne({
    $or: [{ slug: parsed.data.slug }, { sku: parsed.data.sku }],
  });
  if (existing) {
    return { ok: false, error: "A product with this slug or SKU already exists." };
  }

  // The form pre-generates this id client-side so uploaded images already sit in the right
  // Cloudinary folder before the document exists — no upload-then-relink step.
  const draftId = formData.get("_id");
  const validDraftId = typeof draftId === "string" && /^[0-9a-f]{24}$/i.test(draftId);

  const product = await Product.create({
    ...parsed.data,
    ...(validDraftId ? { _id: draftId } : {}),
  });
  await logAdminAction(session, {
    action: "create",
    entityType: "Product",
    entityId: product._id.toString(),
    entityLabel: product.title,
  });
  revalidatePath("/admin/products");
  return { ok: true, error: null, id: product._id.toString() };
}

export async function updateProductAction(
  productId: string,
  _prevState: unknown,
  formData: FormData,
) {
  const session = await requireProductManager();
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  await connectDB();
  const duplicate = await Product.findOne({
    _id: { $ne: productId },
    $or: [{ slug: parsed.data.slug }, { sku: parsed.data.sku }],
  });
  if (duplicate) {
    return { ok: false, error: "Another product already uses this slug or SKU." };
  }

  await Product.findByIdAndUpdate(productId, parsed.data);
  await logAdminAction(session, {
    action: "update",
    entityType: "Product",
    entityId: productId,
    entityLabel: parsed.data.title,
  });
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  return { ok: true, error: null };
}

export async function archiveProductAction(productId: string) {
  const session = await requireProductManager();
  await connectDB();
  const product = await Product.findByIdAndUpdate(productId, { status: "archived" });
  if (product) {
    await logAdminAction(session, {
      action: "status_change",
      entityType: "Product",
      entityId: productId,
      entityLabel: `${product.title} (archived)`,
    });
  }
  revalidatePath("/admin/products");
  return { ok: true, error: null };
}

export async function publishProductAction(productId: string) {
  const session = await requireProductManager();
  await connectDB();
  const product = await Product.findByIdAndUpdate(productId, { status: "published" });
  if (product) {
    await logAdminAction(session, {
      action: "status_change",
      entityType: "Product",
      entityId: productId,
      entityLabel: `${product.title} (published)`,
    });
  }
  revalidatePath("/admin/products");
  return { ok: true, error: null };
}

type ImportSkip = { row: number; title?: string; reason: string };

const MAX_IMPORT_FILE_SIZE_BYTES = 5 * 1024 * 1024;

// Reads a raw sheet cell as a string, treating an explicit "" (from sheet_to_json's `defval`) as
// "not provided" so Zod's own .optional().default(...) kicks in instead of failing validation.
function cellToOptional(value: unknown): unknown {
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}

export async function bulkImportProductsAction(_prevState: unknown, formData: FormData) {
  const session = await requireProductManager();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Please choose a file to upload.", created: 0, skipped: [] };
  }
  if (!/\.(xlsx|xls)$/i.test(file.name)) {
    return {
      ok: false,
      error: "Please upload an Excel file (.xlsx or .xls).",
      created: 0,
      skipped: [],
    };
  }
  if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
    return { ok: false, error: "File is too large (max 5MB).", created: 0, skipped: [] };
  }

  let rawRows: Record<string, unknown>[];
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  } catch {
    return {
      ok: false,
      error: "Could not read that file — make sure it's a valid Excel file.",
      created: 0,
      skipped: [],
    };
  }

  if (rawRows.length === 0) {
    return { ok: false, error: "The file has no data rows.", created: 0, skipped: [] };
  }

  const skipped: ImportSkip[] = [];
  const staged: {
    rowNumber: number;
    title: string;
    slug: string;
    sku: string;
    status: "draft" | "published" | "archived";
    price: number;
    salePrice?: number;
    stock: number;
    lowStockThreshold: number;
    shortDescription: string;
    description: string;
  }[] = [];
  const seenSlugs = new Set<string>();
  const seenSkus = new Set<string>();

  rawRows.forEach((raw, i) => {
    const rowNumber = i + 2; // +1 for 0-index, +1 for the header row itself
    const rawTitle = String(raw["Title"] ?? "").trim();

    const parsed = bulkProductRowSchema.safeParse({
      title: rawTitle,
      slug: cellToOptional(raw["Slug"]),
      sku: String(raw["SKU"] ?? "").trim(),
      status: cellToOptional(
        typeof raw["Status"] === "string" ? raw["Status"].trim().toLowerCase() : raw["Status"],
      ),
      price: raw["Price"],
      salePrice: cellToOptional(raw["Sale Price"]),
      stock: cellToOptional(raw["Stock"]),
      lowStockThreshold: cellToOptional(raw["Low Stock Threshold"]),
      shortDescription: raw["Short Description"] ?? "",
      description: raw["Description"] ?? "",
    });

    if (!parsed.success) {
      skipped.push({
        row: rowNumber,
        title: rawTitle || undefined,
        reason: parsed.error.issues[0]?.message ?? "Invalid row.",
      });
      return;
    }

    const slug = parsed.data.slug || slugify(parsed.data.title);
    const sku = parsed.data.sku;

    if (seenSlugs.has(slug) || seenSkus.has(sku)) {
      skipped.push({
        row: rowNumber,
        title: parsed.data.title,
        reason: "Duplicate slug/SKU within this file.",
      });
      return;
    }

    seenSlugs.add(slug);
    seenSkus.add(sku);
    staged.push({ rowNumber, ...parsed.data, slug, sku });
  });

  if (staged.length === 0) {
    return { ok: true, error: null, created: 0, skipped };
  }

  await connectDB();

  // One round trip to find every existing slug/SKU collision, rather than one query per row.
  const existing = await Product.find(
    {
      $or: [
        { slug: { $in: staged.map((r) => r.slug) } },
        { sku: { $in: staged.map((r) => r.sku) } },
      ],
    },
    { slug: 1, sku: 1 },
  ).lean();
  const existingSlugs = new Set(existing.map((p) => p.slug));
  const existingSkus = new Set(existing.map((p) => p.sku));

  const toInsert = staged.filter((row) => {
    if (existingSlugs.has(row.slug) || existingSkus.has(row.sku)) {
      skipped.push({
        row: row.rowNumber,
        title: row.title,
        reason: "A product with this slug or SKU already exists.",
      });
      return false;
    }
    return true;
  });

  const results = await Promise.all(
    toInsert.map(async (row) => {
      try {
        // Deliberately no categories/images here — this import only covers the fields the
        // spreadsheet supplies; an admin adds category + photos per product afterward.
        await Product.create({
          title: row.title,
          slug: row.slug,
          sku: row.sku,
          status: row.status,
          price: row.price,
          salePrice: row.salePrice,
          stock: row.stock,
          lowStockThreshold: row.lowStockThreshold,
          shortDescription: row.shortDescription,
          description: row.description,
          currency: "INR",
          categories: [],
          images: [],
          attributes: [],
          badges: [],
          isFeatured: false,
          isBestseller: false,
        });
        return { ok: true as const };
      } catch {
        return {
          ok: false as const,
          row: row.rowNumber,
          title: row.title,
          reason: "Failed to save this row.",
        };
      }
    }),
  );

  const created = results.filter((r) => r.ok).length;
  results.forEach((r) => {
    if (!r.ok) skipped.push({ row: r.row, title: r.title, reason: r.reason });
  });
  skipped.sort((a, b) => a.row - b.row);

  if (created > 0) {
    await logAdminAction(session, {
      action: "create",
      entityType: "Product",
      entityLabel: `Bulk import: ${created} product${created === 1 ? "" : "s"}`,
    });
    revalidatePath("/admin/products");
  }

  return { ok: true, error: null, created, skipped };
}

export async function deleteProductAction(productId: string) {
  const session = await requireProductManager();
  await connectDB();
  const product = await Product.findByIdAndDelete(productId);
  if (product) {
    await cleanupProductImages(product.images);
    await logAdminAction(session, {
      action: "delete",
      entityType: "Product",
      entityId: productId,
      entityLabel: product.title,
    });
  }
  revalidatePath("/admin/products");
  return { ok: true, error: null };
}
