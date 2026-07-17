import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { applyShiprocketStatusUpdate, SHIPROCKET_STATUS_MAP } from "@/lib/shipment-status";

// Shiprocket lets you set a custom header value when registering the webhook URL in their
// dashboard (Settings > API > Webhooks). Set SHIPROCKET_WEBHOOK_SECRET to that same value.
function isAuthorized(req: Request) {
  const expected = process.env.SHIPROCKET_WEBHOOK_SECRET;
  if (!expected) return false;
  const provided = req.headers.get("x-api-key") ?? req.headers.get("x-shiprocket-webhook-token");
  return provided === expected;
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    console.error("[shiprocket] webhook rejected: missing or invalid auth token");
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const awbCode: string | undefined = body.awb ?? body.awb_code;
  const shipmentId: string | undefined = body.shipment_id ? String(body.shipment_id) : undefined;
  const currentStatus: string | undefined = body.current_status ?? body.shipment_status;

  if (!awbCode && !shipmentId) {
    console.error("[shiprocket] webhook payload missing awb/shipment_id — raw payload:", body);
    return NextResponse.json({ ok: true });
  }

  await connectDB();

  const order = await Order.findOne(
    awbCode ? { "shipping.awbCode": awbCode } : { "shipping.shipmentId": shipmentId },
  );

  if (!order) {
    console.error("[shiprocket] webhook: no matching order for", { awbCode, shipmentId });
    return NextResponse.json({ ok: true });
  }

  if (!currentStatus) {
    console.error("[shiprocket] webhook missing current_status — raw payload:", body);
  } else if (!SHIPROCKET_STATUS_MAP[currentStatus.toLowerCase()]) {
    console.error("[shiprocket] webhook: unrecognized status string:", currentStatus);
  }

  await applyShiprocketStatusUpdate(order, { currentStatus });

  return NextResponse.json({ ok: true });
}
