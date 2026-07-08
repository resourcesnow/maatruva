import { config } from "dotenv";
config();

import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { Category } from "../src/models/Category";
import { Product } from "../src/models/Product";
import { slugify } from "../src/lib/format";

type Row = Record<string, string>;

function placeholderImage(seed: string, w = 900, h = 900) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

function parseBool(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

function parseNumber(value: string | undefined) {
  if (!value || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function safeJsonParse<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

const categoryCache = new Map<string, string>(); // "parentId|name" -> categoryId

async function findOrCreateCategory(name: string, parentId: string | null, order: number) {
  const cacheKey = `${parentId ?? "root"}|${name.toLowerCase()}`;
  const cached = categoryCache.get(cacheKey);
  if (cached) return cached;

  const slug = slugify(name);
  let category = await Category.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
    parent: parentId,
  });

  if (!category) {
    category = await Category.create({
      name,
      slug,
      parent: parentId,
      order,
      isActive: true,
    });
    console.log(`  Created category: ${name} (parent: ${parentId ?? "none"})`);
  }

  const id = category._id.toString();
  categoryCache.set(cacheKey, id);
  return id;
}

async function resolveCategoryPath(pathStr: string) {
  const segments = pathStr
    .split(">")
    .map((s) => s.trim())
    .filter(Boolean);

  let parentId: string | null = null;
  let leafId: string | null = null;

  for (let i = 0; i < segments.length; i++) {
    const id = await findOrCreateCategory(segments[i], parentId, i);
    parentId = id;
    leafId = id;
  }

  return leafId;
}

async function main() {
  const filePath = process.argv[2] ?? "scripts/data/products-import.csv";
  console.log(`Reading CSV from ${filePath}...`);

  const csvContent = readFileSync(filePath, "utf-8");
  const rows: Row[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`Parsed ${rows.length} rows.`);

  await connectDB();
  console.log("Connected to MongoDB.");

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const title = row.target_product_title?.trim();
    const slug = row.target_product_slug?.trim() || slugify(title ?? "");
    const sku = row.target_sku?.trim();

    if (!title || !slug || !sku) {
      console.warn(`  Skipping row (missing title/slug/sku): ${row.source_product_name}`);
      skipped++;
      continue;
    }

    const targetPrice = parseNumber(row.target_price);
    const compareAt = parseNumber(row.target_compare_at_price);

    let price: number;
    let salePrice: number | null = null;
    if (compareAt != null && targetPrice != null && compareAt > targetPrice) {
      price = compareAt;
      salePrice = targetPrice;
    } else {
      price = targetPrice ?? 0;
    }

    const categoryPath = row.source_category_path?.trim();
    const categoryId = categoryPath ? await resolveCategoryPath(categoryPath) : null;

    const attributesJson = safeJsonParse<Record<string, string>>(row.source_attributes_json, {});
    const attributes = Object.entries(attributesJson).map(([name, value]) => ({
      name,
      value: String(value),
    }));

    const isFeatured = parseBool(row.target_featured);
    const status = ["draft", "published", "archived"].includes(row.target_status)
      ? row.target_status
      : "draft";

    const existing = await Product.findOne({ slug });
    const hasRealImages = existing?.images?.some((img) => !!img.publicId);

    const images = hasRealImages
      ? existing!.images
      : [
          { url: placeholderImage(`${slug}-1`), publicId: "", alt: title, order: 0 },
          { url: placeholderImage(`${slug}-2`), publicId: "", alt: title, order: 1 },
        ];

    const doc = {
      title,
      slug,
      sku,
      description: row.target_description?.trim() || "",
      shortDescription: row.target_short_description?.trim() || "",
      price,
      salePrice,
      currency: row.target_currency?.trim() || "INR",
      categories: categoryId ? [categoryId] : [],
      attributes,
      images,
      stock: parseNumber(row.target_stock_qty) ?? 0,
      isFeatured,
      badges: salePrice ? ["Sale"] : [],
      status,
      seo: {
        title: row.target_seo_title?.trim() || undefined,
        description: row.target_seo_description?.trim() || undefined,
      },
    };

    const result = await Product.findOneAndUpdate(
      { slug },
      { $set: doc },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );

    if (existing) {
      updated++;
      console.log(`  Updated: ${title}`);
    } else {
      created++;
      console.log(`  Created: ${title} (${result._id})`);
    }
  }

  console.log(`\nDone. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}.`);
  await mongoose.connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
