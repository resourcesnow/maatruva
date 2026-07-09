import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FilterPanel } from "./filter-panel";
import type { CategoryWithCount, ColourOption } from "@/types/catalog";

export function MobileFilterDrawer({
  categories,
  colours,
  basePath,
  activeCategorySlug,
  searchParams,
  showCategoryCheckboxes = true,
}: {
  categories: CategoryWithCount[];
  colours: ColourOption[];
  basePath: string;
  activeCategorySlug?: string;
  searchParams: Record<string, string | string[] | undefined>;
  showCategoryCheckboxes?: boolean;
}) {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" size="sm" className="lg:hidden" />}>
        <SlidersHorizontal className="size-4" />
        Filter
      </SheetTrigger>
      <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-xs">
        <SheetHeader>
          <SheetTitle>Search</SheetTitle>
        </SheetHeader>
        <div className="px-4">
          <form action="/search" method="get" className="flex gap-2">
            <input
              type="text"
              name="q"
              placeholder="Search products..."
              className="border-border bg-background w-full rounded-md border px-2.5 py-1.5 text-sm"
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 rounded-md px-4 py-1.5 text-sm font-medium"
            >
              Search
            </button>
          </form>
        </div>

        <div className="px-4 pb-6">
          <FilterPanel
            categories={categories}
            colours={colours}
            basePath={basePath}
            searchParams={searchParams}
            activeCategorySlug={activeCategorySlug}
            showCategoryCheckboxes={showCategoryCheckboxes}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
