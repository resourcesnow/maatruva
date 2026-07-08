import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  sublabel,
  className,
}: {
  label: string;
  value: string;
  sublabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("border-border bg-card flex flex-col gap-1 rounded-xl border p-4", className)}
    >
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="font-heading text-2xl font-semibold">{value}</p>
      {sublabel && <p className="text-muted-foreground text-xs">{sublabel}</p>}
    </div>
  );
}
