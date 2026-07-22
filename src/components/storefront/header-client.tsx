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
    <header className="text-maroon shadow-warm border-gold/25 sticky top-0 z-40 w-full border-b bg-white">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-3 items-center px-4 sm:px-6 md:h-20 md:px-8">
        <div className="flex items-center">
          <MobileMenu categories={categories} />
        </div>

        {logoImage ? (
          <Link
            href="/"
            aria-label={brand.name}
            className="relative h-[60px] w-40 justify-self-center overflow-hidden sm:w-48 md:h-[76px] md:w-64"
          >
            <SmartImage
              src={logoImage}
              alt={brand.name}
              fill
              sizes="256px"
              priority
              className="scale-125 object-contain"
            />
          </Link>
        ) : (
          <Link
            href="/"
            className="font-heading text-maroon justify-self-center text-xl font-semibold tracking-tight md:text-2xl"
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
            className="text-maroon hover:bg-cream hover:text-maroon"
          >
            {searchOpen ? <X className="size-5" /> : <SearchIcon className="size-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-maroon hover:bg-cream hover:text-maroon hidden sm:inline-flex"
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
