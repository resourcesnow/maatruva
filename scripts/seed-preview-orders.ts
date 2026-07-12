import { config } from "dotenv";
config();

import { connectDB } from "../src/lib/db";
import { Order } from "../src/models/Order";
import { Product } from "../src/models/Product";

// Fake orders purely to preview the homepage "Bestsellers" rail before real sales exist.
// Clearly tagged (guestEmail + orderNo prefix + payment.provider) so they're easy to spot in
// /admin/orders and easy to remove with `npm run cleanup:preview-orders` once real orders start.
const PREVIEW_EMAIL = "preview@internal.test";
const PREVIEW_PREFIX = "PREVIEW-";

const PREVIEW_ADDRESS = {
  name: "Preview Data",
  line1: "Not a real address",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400001",
  phone: "+910000000000",
};

async function main() {
  await connectDB();
  console.log("Connected.");

  const existing = await Order.countDocuments({ guestEmail: PREVIEW_EMAIL });
  if (existing > 0) {
    console.log(
      `${existing} preview order(s) already exist — run \`npm run cleanup:preview-orders\` first if you want to regenerate them.`,
    );
    return;
  }

  const products = await Product.find({ status: "published" }).limit(12).lean();
  if (products.length === 0) {
    console.log("No published products found — nothing to seed.");
    return;
  }

  const orders = products.map((p, i) => ({
    orderNo: `${PREVIEW_PREFIX}${Date.now()}-${i}`,
    guestEmail: PREVIEW_EMAIL,
    items: [
      {
        product: p._id,
        title: p.title,
        sku: p.sku,
        image: p.images?.[0]?.url,
        price: p.price,
        qty: 1,
      },
    ],
    shippingAddress: PREVIEW_ADDRESS,
    subtotal: p.price,
    discount: 0,
    shippingFee: 0,
    total: p.price,
    payment: { provider: "preview-seed", status: "paid" as const },
    status: "delivered" as const,
  }));

  await Order.insertMany(orders);
  console.log(
    `Created ${orders.length} preview order(s) for: ${products.map((p) => p.title).join(", ")}`,
  );
  console.log(
    "Run `npm run cleanup:preview-orders` to remove them once real orders start coming in.",
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
