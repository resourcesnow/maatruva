"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Search as SearchIcon, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SmartImage } from "@/components/ui/smart-image";
import { MobileMenu } from "./mobile-menu";
import { SearchBar } from "./search-bar";
import { CartButton } from "./cart-button";
import { UserMenu } from "./user-menu";
import { brand } from "@/lib/brand";
import type { CategoryNode } from "@/types/catalog";

export function HeaderClient({
  categories,
  logoImage,
}: {
  categories: CategoryNode[];
  logoImage?: string;
}) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="bg-maroon text-cream-light sticky top-0 z-40 w-full">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-3 items-center px-4 md:h-20 md:px-8">
        <div className="flex items-center">
          <MobileMenu categories={categories} />
        </div>

        {logoImage ? (
          <Link
            href="/"
            aria-label={brand.name}
            className="relative h-12 w-32 justify-self-center sm:w-36 md:h-16 md:w-44"
          >
            <SmartImage
              src={logoImage}
              alt={brand.name}
              fill
              sizes="176px"
              priority
              className="object-contain"
            />
          </Link>
        ) : (
          <Link
            href="/"
            className="font-heading justify-self-center text-xl font-semibold tracking-tight md:text-2xl"
          >
            {brand.name}
          </Link>
        )}

        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Toggle search"
          >
            {searchOpen ? <X className="size-5" /> : <SearchIcon className="size-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            render={<Link href="/account/wishlist" aria-label="Wishlist" />}
          >
            <Heart className="size-5" />
          </Button>
          <CartButton />
          <UserMenu />
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-border bg-background text-foreground overflow-hidden border-t"
          >
            <div className="mx-auto max-w-2xl px-4 py-3">
              <SearchBar onClose={() => setSearchOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
