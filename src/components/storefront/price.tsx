import { formatINR, discountPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Price({
  price,
  salePrice,
  className,
  size = "md",
  light = false,
}: {
  price: number;
  salePrice?: number | null;
  className?: string;
  size?: "sm" | "md" | "lg";
  light?: boolean;
}) {
  const hasSale = !!salePrice && salePrice < price;
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
  };

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className={cn("font-semibold", light ? "text-white" : "text-foreground", sizes[size])}>
        {formatINR(hasSale ? salePrice! : price)}
      </span>
      {hasSale && (
        <>
          <span
            className={cn(
              "text-sm line-through",
              light ? "text-white/70" : "text-muted-foreground",
            )}
          >
            {formatINR(price)}
          </span>
          <span
            className={cn("text-xs font-medium", light ? "text-white" : "text-brand-secondary")}
          >
            {discountPercent(price, salePrice)}% off
          </span>
        </>
      )}
    </div>
  );
}
