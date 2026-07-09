import Link from "next/link";
import { cn } from "@/lib/utils";
import { PriceRangeSlider } from "@/components/ui/price-range-slider";
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
          <h3 className="font-heading mb-3 text-sm font-semibold tracking-wide uppercase">
            Categories
          </h3>
          <ul className="flex flex-col gap-1">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/product-category/${category.slug}`}
                  className={cn(
                    "hover:bg-muted flex items-center justify-between rounded-md px-2 py-1.5 text-sm",
                    activeCategorySlug === category.slug
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  <span>{category.name}</span>
                  <span className="text-xs">({category.count})</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <h3 className="font-heading text-sm font-semibold tracking-wide uppercase">Filters</h3>

        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-medium">Price</h4>
          <PriceRangeSlider min={0} max={PRICE_MAX} defaultMin={minPrice} defaultMax={maxPrice} />
        </div>

        {colours.length > 0 && (
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-medium">Colour</h4>
            {colours.map((colour) => (
              <label key={colour.value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="colour"
                  value={colour.value}
                  defaultChecked={selectedColours.includes(colour.value)}
                  className="border-border size-4 rounded"
                />
                {colour.value}
                <span className="text-muted-foreground text-xs">({colour.count})</span>
              </label>
            ))}
          </div>
        )}

        {showCategoryCheckboxes && categories.length > 0 && (
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-medium">Category</h4>
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="categories"
                  value={category.slug}
                  defaultChecked={selectedCategories.includes(category.slug)}
                  className="border-border size-4 rounded"
                />
                {category.name}
              </label>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-medium">Status</h4>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="inStock"
              value="1"
              defaultChecked={inStock}
              className="border-border size-4 rounded"
            />
            In stock
          </label>
        </div>

        {sort && <input type="hidden" name="sort" value={sort} />}

        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-2 text-sm font-medium"
        >
          Apply Filters
        </button>
        {hasActiveFilters && (
          <Link href={basePath} className="text-muted-foreground text-center text-xs underline">
            Clear filters
          </Link>
        )}
      </div>
    </form>
  );
}
