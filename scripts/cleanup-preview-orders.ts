import { config } from "dotenv";
config();

import { connectDB } from "../src/lib/db";
import { Order } from "../src/models/Order";

const PREVIEW_EMAIL = "preview@internal.test";

async function main() {
  await connectDB();
  const result = await Order.deleteMany({ guestEmail: PREVIEW_EMAIL });
  console.log(`Deleted ${result.deletedCount} preview order(s).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
