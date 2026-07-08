"use client";

import { ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore, cartCount } from "@/store/cart";
import { useUiStore } from "@/store/ui";

export function CartButton() {
  const items = useCartStore((s) => s.items);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const count = cartCount(items);

  return (
    <button
      type="button"
      onClick={() => setCartOpen(true)}
      className="hover:bg-muted relative flex size-9 items-center justify-center rounded-full"
      aria-label={`Cart, ${count} items`}
    >
      <ShoppingBag className="size-5" />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="bg-brand-secondary text-brand-secondary-foreground absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-medium"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
