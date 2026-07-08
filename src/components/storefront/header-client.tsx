"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Search as SearchIcon, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MegaMenu } from "./mega-menu";
import { MobileMenu } from "./mobile-menu";
import { SearchBar } from "./search-bar";
import { CartButton } from "./cart-button";
import { UserMenu } from "./user-menu";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";
import type { CategoryNode } from "@/types/catalog";

export function HeaderClient({ categories }: { categories: CategoryNode[] }) {
  const pathname = usePathname();
  const transparent = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setScrolled(false);
    if (!transparent) return;
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparent]);

  const solid = !transparent || scrolled;

  return (
    <header
      className={cn(
        "top-0 z-40 w-full transition-colors duration-300",
        transparent ? "absolute" : "sticky",
        solid
          ? "border-border bg-background/95 text-foreground border-b backdrop-blur"
          : "border-b border-transparent bg-transparent text-white",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 md:h-20 md:px-8">
        <MobileMenu categories={categories} />

        <Link href="/" className="font-heading text-xl font-semibold tracking-tight md:text-2xl">
          {brand.name}
        </Link>

        <div className="hidden flex-1 justify-center lg:flex">
          <MegaMenu categories={categories} />
        </div>

        <div className="ml-auto flex items-center gap-1">
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
