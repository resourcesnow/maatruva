import Link from "next/link";
import { Camera, MessageCircle, MapPin } from "lucide-react";
import { NewsletterForm } from "./newsletter-form";
import { brand } from "@/lib/brand";

const shopLinks = [
  { label: "Rakhi Collection", href: "/product-category/rakhi" },
  { label: "Jewellery", href: "/product-category/jewellery" },
  { label: "Gift Hampers", href: "/product-category/gift-hampers" },
  { label: "Combo", href: "/product-category/combo" },
  { label: "All Products", href: "/shop" },
];

const browseLinks = [
  { label: "Track Order", href: "/account/orders" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Refund Policy", href: "/refund" },
];

export function Footer() {
  return (
    <footer className="border-border bg-secondary/60 mt-20 border-t">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:grid-cols-2 md:px-8 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <span className="font-heading text-xl font-semibold">{brand.name}</span>
          <p className="text-muted-foreground max-w-xs text-sm">{brand.tagline}</p>
          <div className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
            <MapPin className="size-4 shrink-0" />
            <span>Mumbai, Maharashtra, India</span>
          </div>
          <NewsletterForm />
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-heading text-sm font-semibold tracking-wide uppercase">Shop</h3>
          {shopLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-heading text-sm font-semibold tracking-wide uppercase">
            Browse More
          </h3>
          {browseLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-heading text-sm font-semibold tracking-wide uppercase">Connect</h3>
          <div className="flex items-center gap-3">
            <a
              href={brand.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="border-border hover:bg-muted flex size-9 items-center justify-center rounded-full border"
            >
              <Camera className="size-4" />
            </a>
            <a
              href={brand.social.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="border-border hover:bg-muted flex size-9 items-center justify-center rounded-full border"
            >
              <MessageCircle className="size-4" />
            </a>
          </div>
          <a
            href={brand.social.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="border-border hover:bg-muted mt-1 inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
          >
            <MessageCircle className="size-4" />
            Chat on WhatsApp
          </a>
        </div>
      </div>

      <div className="border-border text-muted-foreground border-t py-5 text-center text-xs">
        © {new Date().getFullYear()} {brand.name}. All rights reserved.
      </div>
    </footer>
  );
}
