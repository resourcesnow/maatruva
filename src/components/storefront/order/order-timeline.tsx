import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

const STEPS: OrderStatus[] = ["placed", "confirmed", "packed", "shipped", "delivered"];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return <p className="text-destructive text-sm font-medium">This order was cancelled.</p>;
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => (
        <div key={step} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                "flex size-7 items-center justify-center rounded-full border-2 text-xs font-medium",
                i <= currentIndex
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground",
              )}
            >
              {i <= currentIndex ? <Check className="size-3.5" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-xs capitalize",
                i <= currentIndex ? "text-foreground font-medium" : "text-muted-foreground",
              )}
            >
              {step}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={cn("mx-1 h-0.5 flex-1", i < currentIndex ? "bg-primary" : "bg-border")}
            />
          )}
        </div>
      ))}
    </div>
  );
}
