"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useUiStore } from "@/store/ui";
import { cn } from "@/lib/utils";
import { brand } from "@/lib/brand";
import type { CategoryNode } from "@/types/catalog";

export function MobileMenu({ categories }: { categories: CategoryNode[] }) {
  const mobileMenuOpen = useUiStore((s) => s.mobileMenuOpen);
  const setMobileMenuOpen = useUiStore((s) => s.setMobileMenuOpen);
  const pathname = usePathname();

  // Auto-expand whichever parent contains the category the visitor is currently on, so
  // opening the menu never hides the active item inside a collapsed accordion.
  const defaultOpen = categories
    .filter((category) =>
      category.children.some(
        (child) => pathname === `/product-category/${category.slug}/${child.slug}`,
      ),
    )
    .map((category) => category.id);

  return (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            className="text-maroon hover:bg-cream hover:text-maroon"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-xs">
        <SheetHeader className="border-border border-b">
          <SheetTitle className="font-heading text-maroon text-lg">{brand.name}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-0.5 overflow-y-auto px-2 pb-4">
          {categories.length > 0 ? (
            <Accordion className="w-full" defaultValue={defaultOpen}>
              {categories.map((category) => {
                const parentHref = `/product-category/${category.slug}`;
                const parentActive = pathname === parentHref;

                return category.children.length > 0 ? (
                  <AccordionItem key={category.id} value={category.id} className="border-none">
                    <AccordionTrigger
                      className={cn(
                        "text-maroon hover:bg-cream min-h-11 rounded-lg px-2 text-base font-semibold no-underline hover:no-underline",
                        parentActive && "bg-gold/10",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {parentActive && (
                          <span className="bg-gold size-1.5 shrink-0 rounded-full" />
                        )}
                        {category.name}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="[&_a]:no-underline [&_a]:hover:no-underline">
                      <ul className="border-cream-dark ml-4 flex flex-col gap-0.5 border-l-2 pl-3">
                        {category.children.map((child) => {
                          const childHref = `/product-category/${category.slug}/${child.slug}`;
                          const childActive = pathname === childHref;
                          return (
                            <li key={child.id}>
                              <Link
                                href={childHref}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                  "flex min-h-11 items-center gap-2 rounded-md px-2 text-sm transition-colors",
                                  childActive
                                    ? "text-maroon bg-gold/10 font-semibold"
                                    : "text-maroon/70 hover:bg-cream hover:text-maroon",
                                )}
                              >
                                {childActive && (
                                  <span className="bg-gold size-1.5 shrink-0 rounded-full" />
                                )}
                                {child.name}
                              </Link>
                            </li>
                          );
                        })}
                        <li>
                          <Link
                            href={parentHref}
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-gold hover:text-maroon flex min-h-11 items-center rounded-md px-2 text-sm font-medium"
                          >
                            Shop all {category.name}
                          </Link>
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ) : (
                  <Link
                    key={category.id}
                    href={parentHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "border-border text-maroon flex min-h-11 items-center gap-2 border-b px-2 text-base font-semibold",
                      parentActive ? "bg-gold/10" : "hover:bg-cream",
                    )}
                  >
                    {parentActive && <span className="bg-gold size-1.5 shrink-0 rounded-full" />}
                    {category.name}
                  </Link>
                );
              })}
            </Accordion>
          ) : null}
          <Link
            href="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "text-maroon mt-2 flex min-h-11 items-center rounded-lg px-2 text-base font-semibold",
              pathname === "/shop" ? "bg-gold/10" : "hover:bg-cream",
            )}
          >
            Shop All
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
