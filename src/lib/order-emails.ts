// No "server-only" guard — needs to run from scripts/sync-shipment-status.ts (via tsx, outside
// Next's bundler). Never imported by a client component.
import { sendEmail } from "@/lib/resend";
import { brand } from "@/lib/brand";
import { formatINR, formatDate } from "@/lib/format";

const FOOTER_LINE =
  "This is an automated message. For any query, reach out to support@maatruva.com.";

function renderEmailLayout({ title, bodyHtml }: { title: string; bodyHtml: string }) {
  return `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #222;">
      <div style="margin-bottom: 24px;">
        <span style="font-size: 20px; font-weight: 700; color: #7a1f2e;">${brand.name}</span>
      </div>
      <h2 style="margin-bottom: 8px;">${title}</h2>
      ${bodyHtml}
      <p style="color: #999; font-size: 12px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
        ${FOOTER_LINE}
      </p>
    </div>
  `;
}

export type OrderEmailItem = { title: string; sku: string; price: number; qty: number };
export type OrderEmailAddress = {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
};

export type OrderConfirmationData = {
  orderNo: string;
  createdAt: Date;
  items: OrderEmailItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  shippingAddress: OrderEmailAddress;
  deliveryMethod: "delivery" | "pickup";
};

// Shared by sendOrderConfirmationEmail and sendPayAtStoreConfirmationEmail — same invoice-style
// item table, different framing text/subject around it.
function renderItemsTable(order: {
  items: OrderEmailItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
}) {
  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${item.title} (${item.sku})</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: center;">${item.qty}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${formatINR(item.price * item.qty)}</td>
        </tr>
      `,
    )
    .join("");

  const summaryRow = (label: string, value: string, bold = false) => `
    <tr>
      <td colspan="2" style="padding: 4px 0; text-align: right; ${bold ? "font-weight: 700;" : ""}">${label}</td>
      <td style="padding: 4px 0; text-align: right; ${bold ? "font-weight: 700;" : ""}">${value}</td>
    </tr>
  `;

  return `
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <thead>
        <tr style="border-bottom: 2px solid #7a1f2e;">
          <th style="text-align: left; padding: 8px 0;">Item</th>
          <th style="text-align: center; padding: 8px 0;">Qty</th>
          <th style="text-align: right; padding: 8px 0;">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        ${summaryRow("Subtotal", formatINR(order.subtotal))}
        ${order.discount > 0 ? summaryRow("Discount", `-${formatINR(order.discount)}`) : ""}
        ${order.shippingFee > 0 ? summaryRow("Shipping", formatINR(order.shippingFee)) : ""}
        ${summaryRow("Total", formatINR(order.total), true)}
      </tfoot>
    </table>
  `;
}

export async function sendOrderConfirmationEmail(email: string, order: OrderConfirmationData) {
  const addressHtml =
    order.deliveryMethod === "pickup"
      ? `<p style="color: #555;">You've chosen to pick up this order in person from our store.</p>`
      : `
        <p style="color: #555; margin: 0;">
          ${order.shippingAddress.name}<br/>
          ${order.shippingAddress.line1}${order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}<br/>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br/>
          ${order.shippingAddress.phone}
        </p>
      `;

  const html = renderEmailLayout({
    title: "Order Confirmed",
    bodyHtml: `
      <p style="color: #555;">
        Thanks for your order! Here's your invoice for order <strong>${order.orderNo}</strong>,
        placed on ${formatDate(order.createdAt)}.
      </p>
      ${renderItemsTable(order)}
      <h3 style="margin-bottom: 4px;">${order.deliveryMethod === "pickup" ? "Pickup" : "Shipping Address"}</h3>
      ${addressHtml}
    `,
  });

  await sendEmail({ to: email, subject: `Order Confirmed — ${order.orderNo}`, html });
}

export type PayAtStoreConfirmationData = {
  orderNo: string;
  createdAt: Date;
  items: OrderEmailItem[];
  subtotal: number;
  discount: number;
  total: number;
};

// Deliberately distinct from sendOrderConfirmationEmail — this must never claim payment was
// received, since none was. Pickup-at-Store + Pay at Store only; shippingFee is always 0 for
// this path so it's omitted from the type entirely rather than passed as a fake zero.
export async function sendPayAtStoreConfirmationEmail(
  email: string,
  order: PayAtStoreConfirmationData,
) {
  const html = renderEmailLayout({
    title: "Order Placed — Pay at Store",
    bodyHtml: `
      <p style="color: #555;">
        Thanks for your order! Here's a summary of order <strong>${order.orderNo}</strong>,
        placed on ${formatDate(order.createdAt)}.
      </p>
      <p style="color: #7a1f2e; font-weight: 700; background: #faf0f1; padding: 12px 16px; border-radius: 8px;">
        No payment has been made yet — please pay ${formatINR(order.total)} in cash or UPI when
        you collect your order at our store.
      </p>
      ${renderItemsTable({ ...order, shippingFee: 0 })}
      <h3 style="margin-bottom: 4px;">Pickup</h3>
      <p style="color: #555;">
        ${brand.name} Store<br/>
        ${brand.storeAddress.line1}<br/>
        ${brand.storeAddress.city}, ${brand.storeAddress.state} - ${brand.storeAddress.pincode}<br/>
        ${brand.storeAddress.phone}
      </p>
    `,
  });

  await sendEmail({ to: email, subject: `Order Placed (Pay at Store) — ${order.orderNo}`, html });
}

export async function sendPaymentFailedEmail(
  email: string,
  order: { orderNo: string; total: number },
) {
  const html = renderEmailLayout({
    title: "Payment Didn't Go Through",
    bodyHtml: `
      <p style="color: #555;">
        We couldn't complete the payment of ${formatINR(order.total)} for your order
        <strong>${order.orderNo}</strong>. This can happen for a number of reasons — your bank
        may have declined the transaction, or the payment session may have timed out.
      </p>
      <p style="color: #555;">
        No charge was made. You're welcome to try again whenever you're ready — just head back
        to your cart and check out again.
      </p>
      <a href="${brand.siteUrl}/cart" style="display: inline-block; padding: 12px 24px; background: #7a1f2e; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 8px;">
        Return to cart
      </a>
    `,
  });

  await sendEmail({ to: email, subject: `Payment issue for order ${order.orderNo}`, html });
}

export async function sendOrderShippedEmail(
  email: string,
  order: { orderNo: string; awbCode?: string; courierName?: string; trackingUrl?: string },
) {
  const html = renderEmailLayout({
    title: "Your Order Has Shipped",
    bodyHtml: `
      <p style="color: #555;">
        Good news — order <strong>${order.orderNo}</strong> is on its way!
      </p>
      ${
        order.courierName || order.awbCode
          ? `<p style="color: #555;">
              ${order.courierName ? `Courier: <strong>${order.courierName}</strong><br/>` : ""}
              ${order.awbCode ? `Tracking / AWB: <strong>${order.awbCode}</strong>` : ""}
            </p>`
          : ""
      }
      ${
        order.trackingUrl
          ? `<a href="${order.trackingUrl}" style="display: inline-block; padding: 12px 24px; background: #7a1f2e; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 8px;">
              Track your order
            </a>`
          : ""
      }
    `,
  });

  await sendEmail({ to: email, subject: `Order ${order.orderNo} has shipped`, html });
}

export async function sendPreDeliveryReminderEmail(
  email: string,
  order: { orderNo: string; estimatedDelivery: Date },
) {
  const html = renderEmailLayout({
    title: "Your Order Arrives Soon",
    bodyHtml: `
      <p style="color: #555;">
        Order <strong>${order.orderNo}</strong> is expected to arrive around
        <strong>${formatDate(order.estimatedDelivery)}</strong>.
        Someone should be available to receive it.
      </p>
    `,
  });

  await sendEmail({ to: email, subject: `Arriving soon — order ${order.orderNo}`, html });
}

export async function sendOrderDeliveredEmail(email: string, order: { orderNo: string }) {
  const html = renderEmailLayout({
    title: "Delivered! Thank You",
    bodyHtml: `
      <p style="color: #555;">
        Order <strong>${order.orderNo}</strong> has been delivered. We hope you and your loved
        ones enjoy it!
      </p>
      <p style="color: #555;">
        Thank you for choosing ${brand.name} — it means a lot to us, especially for the moments
        this gift is a part of.
      </p>
    `,
  });

  await sendEmail({
    to: email,
    subject: `Delivered — thank you for choosing ${brand.name}!`,
    html,
  });
}

export async function sendPasswordResetOtpEmail(email: string, code: string) {
  const html = renderEmailLayout({
    title: "Reset your password",
    bodyHtml: `
      <p style="color: #555; margin-bottom: 24px;">
        Enter this code to reset your ${brand.name} account password. It expires in 10 minutes.
      </p>
      <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; text-align: center; padding: 16px; background: #f4f4f5; border-radius: 8px;">
        ${code}
      </div>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">
        If you didn't request this, you can safely ignore this email — your password won't change.
      </p>
    `,
  });

  await sendEmail({
    to: email,
    subject: `${code} is your ${brand.name} password reset code`,
    html,
  });
}
