import Link from "next/link";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { label: "All", value: undefined },
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
  { label: "Archived", value: "archived" },
] as const;

export function ProductStatusFilter({
  basePath,
  searchParams,
  activeStatus,
  counts,
}: {
  basePath: string;
  searchParams: Record<string, string | undefined>;
  activeStatus?: string;
  counts: { draft: number; published: number; archived: number };
}) {
  return (
    <div className="bg-muted inline-flex w-fit items-center gap-1 rounded-lg p-[3px]">
      {OPTIONS.map((option) => {
        const isActive = (activeStatus ?? undefined) === option.value;
        const count = option.value ? counts[option.value] : undefined;

        const params = new URLSearchParams();
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value && key !== "status" && key !== "page") params.set(key, value);
        });
        if (option.value) params.set("status", option.value);
        const query = params.toString();

        return (
          <Link
            key={option.label}
            href={query ? `${basePath}?${query}` : basePath}
            className={cn(
              "rounded-md px-2.5 py-1 text-sm font-medium whitespace-nowrap transition-colors",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
            {!!count && ` (${count})`}
          </Link>
        );
      })}
    </div>
  );
}
