export function resolveSort<T extends string>(
  sortBy: string | undefined,
  sortDir: string | undefined,
  allowed: readonly T[],
  fallback: T,
): { field: T; dir: 1 | -1; dirLabel: "asc" | "desc" } {
  const field = (allowed as readonly string[]).includes(sortBy ?? "") ? (sortBy as T) : fallback;
  const dirLabel = sortDir === "asc" ? "asc" : "desc";
  return { field, dir: dirLabel === "asc" ? 1 : -1, dirLabel };
}
