import { FilterPanel } from "./filter-panel";
import type { CategoryWithCount, ColourOption } from "@/types/catalog";

export function FilterSidebar({
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
    <aside className="hidden w-64 shrink-0 lg:block">
      <FilterPanel
        categories={categories}
        colours={colours}
        basePath={basePath}
        searchParams={searchParams}
        activeCategorySlug={activeCategorySlug}
        showCategoryCheckboxes={showCategoryCheckboxes}
      />
    </aside>
  );
}
