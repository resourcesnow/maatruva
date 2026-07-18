import Link from "next/link";
import { cn } from "@/lib/utils";
import { PriceRangeSlider } from "@/components/ui/price-range-slider";
import { CategoryTreeNav } from "./category-tree-nav";
import type { CategoryWithCount, ColourOption } from "@/types/catalog";

const PRICE_MAX = 5000;

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function FilterPanel({
  categories,
  colours,
  basePath,
  searchParams,
  activeCategorySlug,
  showCategoryCheckboxes = true,
}: {
  categories: CategoryWithCount[];
  colours: ColourOption[];
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
  activeCategorySlug?: string;
  showCategoryCheckboxes?: boolean;
}) {
  const selectedCategories = toArray(searchParams.categories);
  const selectedColours = toArray(searchParams.colour);
  const inStock = toArray(searchParams.inStock).includes("1");
  const minPrice = Number(firstValue(searchParams.minPrice)) || 0;
  const maxPrice = Number(firstValue(searchParams.maxPrice)) || PRICE_MAX;
  const sort = firstValue(searchParams.sort);

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedColours.length > 0 ||
    inStock ||
    !!searchParams.minPrice ||
    !!searchParams.maxPrice;

  return (
    <form method="get" action={basePath} className="flex flex-col gap-8">
      {categories.length > 0 && (
        <div>
          <h3 className="font-heading text-maroon mb-3 text-sm font-semibold tracking-wide uppercase">
            Categories
          </h3>
          <CategoryTreeNav categories={categories} activeCategorySlug={activeCategorySlug} />
        </div>
      )}

      <div className="flex flex-col gap-6">
        <h3 className="font-heading text-maroon text-sm font-semibold tracking-wide uppercase">
          Filters
        </h3>

        <div className="flex flex-col gap-3">
          <h4 className="text-maroon text-sm font-medium">Price</h4>
          <PriceRangeSlider min={0} max={PRICE_MAX} defaultMin={minPrice} defaultMax={maxPrice} />
        </div>

        {colours.length > 0 && (
          <div className="flex flex-col gap-2">
            <h4 className="text-maroon text-sm font-medium">Colour</h4>
            {colours.map((colour) => (
              <label key={colour.value} className="text-maroon/80 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="colour"
                  value={colour.value}
                  defaultChecked={selectedColours.includes(colour.value)}
                  className="accent-maroon border-border size-4 rounded"
                />
                {colour.value}
                <span className="text-maroon/50 text-xs">({colour.count})</span>
              </label>
            ))}
          </div>
        )}

        {showCategoryCheckboxes && categories.length > 0 && (
          <div className="flex flex-col gap-2">
            <h4 className="text-maroon text-sm font-medium">Category</h4>
            {categories.map((category) => (
              <label
                key={category.id}
                className={cn(
                  "flex items-center gap-2 text-sm",
                  category.parent ? "text-maroon/70 ml-4" : "text-maroon font-medium",
                )}
              >
                <input
                  type="checkbox"
                  name="categories"
                  value={category.slug}
                  defaultChecked={selectedCategories.includes(category.slug)}
                  className="accent-maroon border-border size-4 rounded"
                />
                {category.name}
              </label>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <h4 className="text-maroon text-sm font-medium">Status</h4>
          <label className="text-maroon/80 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="inStock"
              value="1"
              defaultChecked={inStock}
              className="accent-maroon border-border size-4 rounded"
            />
            In stock
          </label>
        </div>

        {sort && <input type="hidden" name="sort" value={sort} />}

        <button
          type="submit"
          className="bg-maroon hover:bg-maroon-dark rounded-md px-3 py-2 text-sm font-medium text-white transition-colors"
        >
          Apply Filters
        </button>
        {hasActiveFilters && (
          <Link
            href={basePath}
            className="text-maroon/60 hover:text-maroon text-center text-xs underline"
          >
            Clear filters
          </Link>
        )}
      </div>
    </form>
  );
}
