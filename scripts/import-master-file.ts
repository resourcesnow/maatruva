import { config } from "dotenv";
config();

import mongoose from "mongoose";
import * as XLSX from "xlsx";
import { connectDB } from "../src/lib/db";
import { Category } from "../src/models/Category";
import { Product } from "../src/models/Product";
import { Review } from "../src/models/Review";
import { slugify } from "../src/lib/format";

type Row = {
  "Rakhi Sr No": string | null;
  "Product Name": string | null;
  Colour: string | null;
  "Product Description": string | null;
  "Product Highlights": string | null;
  "Short Website Description": string | null;
  Design: string | null;
  Price: number | null;
};

function placeholderImage(seed: string, w = 900, h = 900) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

function clean(value: string | null | undefined) {
  return value?.trim().replace(/\r\n/g, "\n") ?? "";
}

async function main() {
  const filePath = process.argv[2] ?? "public/Maatruva Master File.xlsx";
  console.log(`Reading ${filePath}...`);

  const wb = XLSX.readFile(filePath);
  await connectDB();
  console.log("Connected to MongoDB.");

  console.log("Wiping existing catalog data (Products, Categories, Reviews)...");
  await Product.deleteMany({});
  await Category.deleteMany({});
  await Review.deleteMany({});

  const parent = await Category.create({
    name: "Rakhi",
    slug: "rakhi",
    parent: null,
    order: 0,
    isActive: true,
  });
  console.log(`Created parent category: Rakhi (${parent._id})`);

  let created = 0;
  let skipped = 0;

  for (let sheetIndex = 0; sheetIndex < wb.SheetNames.length; sheetIndex++) {
    const sheetName = wb.SheetNames[sheetIndex];
    const sheet = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Row>(sheet, { defval: null });

    const childSlug = slugify(sheetName);
    const child = await Category.create({
      name: sheetName,
      slug: childSlug,
      parent: parent._id,
      order: sheetIndex,
      isActive: true,
    });
    console.log(`Created category: ${sheetName} (${child._id})`);

    for (const row of rows) {
      const title = clean(row["Product Name"]);
      const sku = clean(row["Rakhi Sr No"]);
      if (!title || !sku) {
        skipped++;
        continue;
      }

      const slug = slugify(title);
      const description = [clean(row["Product Description"]), clean(row["Product Highlights"])]
        .filter(Boolean)
        .join("\n\n");
      const shortDescription = clean(row["Short Website Description"]);
      const colour = clean(row.Colour);
      const design = clean(row.Design);
      const price = typeof row.Price === "number" ? row.Price : Number(row.Price) || 0;

      const attributes = [
        ...(colour ? [{ name: "Colour", value: colour }] : []),
        ...(design ? [{ name: "Design", value: design }] : []),
      ];

      await Product.create({
        title,
        slug,
        sku,
        description,
        shortDescription,
        price,
        salePrice: null,
        currency: "INR",
        categories: [child._id],
        attributes,
        images: [
          {
            url: placeholderImage(`${slug}-1`),
            publicId: `placeholder-${slug}-1`,
            alt: title,
            order: 0,
          },
          {
            url: placeholderImage(`${slug}-2`),
            publicId: `placeholder-${slug}-2`,
            alt: title,
            order: 1,
          },
        ],
        stock: 100,
        isFeatured: false,
        isBestseller: false,
        badges: [],
        status: "published",
      });
      created++;
      console.log(`  Created product: ${title} (${sku}) — ₹${price}`);
    }
  }

  console.log(
    `\nDone. Categories: ${wb.SheetNames.length + 1}. Products created: ${created}. Skipped blank rows: ${skipped}.`,
  );
  await mongoose.connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
