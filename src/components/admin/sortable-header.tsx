import Link from "next/link";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

export function SortableHeader({
  label,
  field,
  basePath,
  searchParams,
  currentField,
  currentDir,
}: {
  label: string;
  field: string;
  basePath: string;
  searchParams: Record<string, string | undefined>;
  currentField: string;
  currentDir: "asc" | "desc";
}) {
  const isActive = currentField === field;
  const nextDir = isActive && currentDir === "desc" ? "asc" : "desc";

  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && key !== "sortBy" && key !== "sortDir" && key !== "page") params.set(key, value);
  });
  params.set("sortBy", field);
  params.set("sortDir", nextDir);

  return (
    <Link
      href={`${basePath}?${params.toString()}`}
      className="hover:text-foreground flex items-center gap-1"
    >
      {label}
      {isActive ? (
        currentDir === "desc" ? (
          <ArrowDown className="size-3" />
        ) : (
          <ArrowUp className="size-3" />
        )
      ) : (
        <ArrowUpDown className="size-3 opacity-40" />
      )}
    </Link>
  );
}
