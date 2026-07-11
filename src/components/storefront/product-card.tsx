"use client";

import Link from "next/link";
import { SmartImage as Image } from "@/components/ui/smart-image";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { Price } from "./price";
import { WishlistButton } from "./wishlist-button";
import { AddToCartButton } from "./add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/store/ui";
import type { ProductCard as ProductCardType } from "@/types/catalog";

export function ProductCard({ product }: { product: ProductCardType }) {
  const openQuickView = useUiStore((s) => s.openQuickView);
  const primaryImage = product.images[0];
  const secondaryImage = product.images[1] ?? primaryImage;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group border-border bg-card relative flex flex-col overflow-hidden rounded-2xl border"
    >
      <div className="bg-muted relative aspect-square overflow-hidden">
        <Link href={`/product/${product.slug}`} className="block h-full w-full">
          {primaryImage && (
            <>
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt || product.title}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-opacity duration-300 group-hover:opacity-0"
              />
              <Image
                src={secondaryImage.url}
                alt={secondaryImage.alt || product.title}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            </>
          )}
        </Link>

        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.badges.map((badge) => (
            <Badge key={badge} className="bg-brand-accent text-brand-accent-foreground">
              {badge}
            </Badge>
          ))}
          {product.stock === 0 && <Badge variant="secondary">Sold out</Badge>}
        </div>

        <div className="absolute top-3 right-3">
          <WishlistButton productId={product.id} />
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => openQuickView(product.slug)}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-4 gap-1.5 opacity-0 shadow-md transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Eye className="size-3.5" /> Quick View
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-heading text-foreground line-clamp-2 text-sm font-medium">
            {product.title}
          </h3>
        </Link>
        <Price price={product.price} salePrice={product.salePrice} size="sm" />
        <AddToCartButton product={product} size="sm" className="mt-1 w-full" />
      </div>
    </motion.div>
  );
}
