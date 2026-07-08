import Link from "next/link";
import { cn } from "@/lib/utils";
import type { CategoryNode } from "@/types/catalog";

export function FilterSidebar({
  categories,
  basePath,
  activeCategorySlug,
  searchParams,
}: {
  categories: CategoryNode[];
  basePath: string;
  activeCategorySlug?: string;
  searchParams: Record<string, string | undefined>;
}) {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-8 lg:w-64">
      {categories.length > 0 && (
        <div>
          <h3 className="font-heading mb-3 text-sm font-semibold tracking-wide uppercase">
            Categories
          </h3>
          <ul className="flex flex-col gap-1">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/product-category/${category.slug}`}
                  className={cn(
                    "hover:bg-muted block rounded-md px-2 py-1.5 text-sm",
                    activeCategorySlug === category.slug
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  {category.name}
                </Link>
                {category.children.length > 0 && (
                  <ul className="border-border ml-3 flex flex-col gap-1 border-l pl-2">
                    {category.children.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={`/product-category/${category.slug}/${child.slug}`}
                          className={cn(
                            "hover:bg-muted block rounded-md px-2 py-1 text-sm",
                            activeCategorySlug === child.slug
                              ? "bg-muted text-foreground font-medium"
                              : "text-muted-foreground",
                          )}
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form method="get" action={basePath} className="flex flex-col gap-3">
        <h3 className="font-heading text-sm font-semibold tracking-wide uppercase">Price</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            name="minPrice"
            placeholder="Min"
            defaultValue={searchParams.minPrice}
            min={0}
            className="border-border bg-background w-full rounded-md border px-2 py-1.5 text-sm"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            name="maxPrice"
            placeholder="Max"
            defaultValue={searchParams.maxPrice}
            min={0}
            className="border-border bg-background w-full rounded-md border px-2 py-1.5 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="inStock"
            value="1"
            defaultChecked={searchParams.inStock === "1"}
            className="border-border size-4 rounded"
          />
          In stock only
        </label>

        {searchParams.sort && <input type="hidden" name="sort" value={searchParams.sort} />}

        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-1 rounded-md px-3 py-1.5 text-sm font-medium"
        >
          Apply Filters
        </button>
        {(searchParams.minPrice || searchParams.maxPrice || searchParams.inStock) && (
          <Link href={basePath} className="text-muted-foreground text-center text-xs underline">
            Clear filters
          </Link>
        )}
      </form>
    </aside>
  );
}
