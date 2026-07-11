import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SmartImage as Image } from "@/components/ui/smart-image";
import { ChevronRight } from "lucide-react";
import { getProducts, getColourOptions, type ProductSort } from "@/lib/data/products";
import { getCategoryBySlug, getCategoriesWithCounts } from "@/lib/data/categories";
import { ProductGrid } from "@/components/storefront/product-grid";
import { FilterSidebar } from "@/components/storefront/filters/filter-sidebar";
import { MobileFilterDrawer } from "@/components/storefront/filters/mobile-filter-drawer";
import { SortSelect } from "@/components/storefront/filters/sort-select";
import { PaginationBar } from "@/components/storefront/pagination-bar";

export const dynamic = "force-dynamic";

const PER_PAGE = 12;

type Params = { slug: string[] };
type SearchParams = Record<string, string | string[] | undefined>;

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug[slug.length - 1]);
  if (!category) return {};
  return {
    title: category.seo?.title || category.name,
    description: category.seo?.description,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const currentSlug = slug[slug.length - 1];

  const category = await getCategoryBySlug(currentSlug);
  if (!category) notFound();

  const page = Number(sp.page) || 1;
  const basePath = `/product-category/${slug.join("/")}`;

  const [categories, colourOptions, { products, total }] = await Promise.all([
    getCategoriesWithCounts(),
    getColourOptions(),
    getProducts({
      categorySlug: currentSlug,
      colours: toArray(sp.colour),
      minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
      maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
      inStockOnly: toArray(sp.inStock).includes("1"),
      sort: (sp.sort as ProductSort) || "newest",
      page,
      perPage: PER_PAGE,
    }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <div className="bg-muted relative flex h-48 items-end overflow-hidden sm:h-64">
        {category.image?.url && (
          <Image
            src={category.image.url}
            alt={category.name}
            fill
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-6 text-white sm:px-8">
          <nav className="mb-2 flex items-center gap-1 text-xs text-white/80">
            <Link href="/">Home</Link>
            {slug.map((s, i) => (
              <span key={s} className="flex items-center gap-1">
                <ChevronRight className="size-3" />
                <Link href={`/product-category/${slug.slice(0, i + 1).join("/")}`}>
                  {i === slug.length - 1 ? category.name : s}
                </Link>
              </span>
            ))}
          </nav>
          <h1 className="font-heading text-3xl font-semibold sm:text-4xl">{category.name}</h1>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <FilterSidebar
            categories={categories}
            colours={colourOptions}
            basePath={basePath}
            activeCategorySlug={currentSlug}
            searchParams={sp}
            showCategoryCheckboxes={false}
          />
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <MobileFilterDrawer
                  categories={categories}
                  colours={colourOptions}
                  basePath={basePath}
                  activeCategorySlug={currentSlug}
                  searchParams={sp}
                  showCategoryCheckboxes={false}
                />
                <p className="text-muted-foreground text-sm">{total} products</p>
              </div>
              <SortSelect basePath={basePath} />
            </div>
            <ProductGrid products={products} />
            <PaginationBar
              basePath={basePath}
              searchParams={sp}
              currentPage={page}
              totalPages={totalPages}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
