import { Badge } from "@/components/ui/badge";

// Only rendered for payment states staff need to actively notice — "paid"/"created" don't need
// a second badge alongside the order status badge, but "pay_at_store" and "failed" do, so they
// can never be mistaken for a paid order at a glance.
export function PaymentStatusBadge({ status }: { status: string }) {
  if (status === "pay_at_store") {
    return (
      <Badge variant="destructive" className="whitespace-nowrap">
        Unpaid — Pay at Store
      </Badge>
    );
  }
  if (status === "failed") {
    return (
      <Badge variant="destructive" className="whitespace-nowrap">
        Payment Failed
      </Badge>
    );
  }
  return null;
}
