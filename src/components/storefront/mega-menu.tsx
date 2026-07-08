"use client";

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import type { CategoryNode } from "@/types/catalog";

export function MegaMenu({ categories }: { categories: CategoryNode[] }) {
  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-1">
        {categories.map((category) =>
          category.children.length > 0 ? (
            <NavigationMenuItem key={category.id}>
              <NavigationMenuTrigger>{category.name}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid w-[420px] grid-cols-2 gap-1 p-2">
                  {category.children.map((child) => (
                    <NavigationMenuLink
                      key={child.id}
                      render={<Link href={`/product-category/${category.slug}/${child.slug}`} />}
                    >
                      {child.name}
                    </NavigationMenuLink>
                  ))}
                  <NavigationMenuLink
                    className="text-brand-secondary col-span-2 font-medium"
                    render={<Link href={`/product-category/${category.slug}`} />}
                  >
                    Shop all {category.name} →
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ) : (
            <NavigationMenuItem key={category.id}>
              <NavigationMenuLink
                className="px-2.5 py-1.5 text-sm font-medium"
                render={<Link href={`/product-category/${category.slug}`} />}
              >
                {category.name}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ),
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
