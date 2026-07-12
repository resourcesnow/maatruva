"use client";

import Link from "next/link";
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
import { brand } from "@/lib/brand";
import type { CategoryNode } from "@/types/catalog";

export function MobileMenu({ categories }: { categories: CategoryNode[] }) {
  const mobileMenuOpen = useUiStore((s) => s.mobileMenuOpen);
  const setMobileMenuOpen = useUiStore((s) => s.setMobileMenuOpen);

  return (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open menu" />}>
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-xs">
        <SheetHeader>
          <SheetTitle className="font-heading text-lg">{brand.name}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 overflow-y-auto px-2 pb-4">
          {categories.length > 0 ? (
            <Accordion className="w-full">
              {categories.map((category) =>
                category.children.length > 0 ? (
                  <AccordionItem key={category.id} value={category.id}>
                    <AccordionTrigger className="text-sm font-medium">
                      {category.name}
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-1 pl-2">
                      {category.children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/product-category/${category.slug}/${child.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-muted-foreground hover:bg-muted rounded-md px-2 py-1.5 text-sm"
                        >
                          {child.name}
                        </Link>
                      ))}
                      <Link
                        href={`/product-category/${category.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-brand-secondary rounded-md px-2 py-1.5 text-sm font-medium"
                      >
                        Shop all {category.name}
                      </Link>
                    </AccordionContent>
                  </AccordionItem>
                ) : (
                  <Link
                    key={category.id}
                    href={`/product-category/${category.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="border-border flex items-center border-b py-3 text-sm font-medium"
                  >
                    {category.name}
                  </Link>
                ),
              )}
            </Accordion>
          ) : null}
          <Link
            href="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:bg-muted mt-2 rounded-md px-2 py-2 text-sm font-medium"
          >
            Shop All
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
