import { config } from "dotenv";
config();

import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { Order } from "../src/models/Order";
import { getShiprocketTracking, ShiprocketConfigError } from "../src/lib/shiprocket";
import { applyShiprocketStatusUpdate } from "../src/lib/shipment-status";
import { parseShiprocketEdd } from "../src/lib/shipment-eta";
import { notifyPreDeliveryReminder } from "../src/lib/order-notifications";

const REMINDER_WINDOW_MIN_MS = 20 * 60 * 60 * 1000;
const REMINDER_WINDOW_MAX_MS = 28 * 60 * 60 * 1000;

// Polls Shiprocket tracking for every order with an active shipment, applies status
// transitions (firing shipped/delivered emails via the shared shipment-status logic), and
// sends the ~1-day-out pre-delivery reminder once per order. There's no webhook registered
// yet (no public URL), so this script is the actual trigger mechanism for now — run it
// periodically via Windows Task Scheduler / cron once deployed:
//   npx tsx scripts/sync-shipment-status.ts
async function main() {
  await connectDB();

  const orders = await Order.find({
    "shipping.shipmentId": { $exists: true },
    status: { $nin: ["delivered", "cancelled"] },
  });

  console.log(`Found ${orders.length} active shipment(s) to sync.`);

  for (const order of orders) {
    try {
      const data = await getShiprocketTracking(order.shipping!.shipmentId!);
      const track = data.tracking_data?.shipment_track?.[0];
      const estimatedDelivery = parseShiprocketEdd(
        data.tracking_data?.edd ?? data.tracking_data?.etd,
      );

      await applyShiprocketStatusUpdate(order, {
        currentStatus: track?.current_status ?? data.tracking_data?.shipment_status,
        awbCode: track?.awb_code,
        courierName: track?.courier_name,
        estimatedDelivery,
      });

      console.log(
        `  ${order.orderNo}: status now "${order.status}" (shipping: ${order.shipping?.status})`,
      );

      const edd = order.shipping?.estimatedDelivery;
      if (
        edd &&
        !order.shipping?.preDeliveryReminderSentAt &&
        order.status !== "delivered" &&
        order.status !== "cancelled"
      ) {
        const msUntilDelivery = edd.getTime() - Date.now();
        if (
          msUntilDelivery >= REMINDER_WINDOW_MIN_MS &&
          msUntilDelivery <= REMINDER_WINDOW_MAX_MS
        ) {
          await notifyPreDeliveryReminder(order);
          order.shipping!.preDeliveryReminderSentAt = new Date();
          await order.save();
          console.log(`  ${order.orderNo}: pre-delivery reminder sent.`);
        }
      }
    } catch (err) {
      if (err instanceof ShiprocketConfigError) {
        console.error(err.message);
        break; // config-wide problem, no point retrying the rest
      }
      console.error(`  ${order.orderNo}: sync failed —`, err instanceof Error ? err.message : err);
    }
  }

  await mongoose.connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
