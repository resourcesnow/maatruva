import Link from "next/link";
import { Phone, MapPin } from "lucide-react";
import { SiInstagram, SiWhatsapp } from "react-icons/si";
import { brand } from "@/lib/brand";

const MAP_EMBED_SRC =
  "https://www.google.com/maps?q=Ashapuri%20Rakhi%20by%20Mamtaben%2C%20Adajan%2C%20opposite%20B.S.N.L%20office%2C%20behind%20Navyug%20College%20Road%2C%20Tirupati%20Society%2C%20Nahar%20Colony%2C%20Narotam%20Nagar%2C%20Surat%2C%20Gujarat%20395009&output=embed";

const shopLinks = [
  { label: "Bhai Rakhi", href: "/product-category/rakhi/bhai-rakhi" },
  { label: "Bhabhi Rakhi", href: "/product-category/rakhi/bhabhi-rakhi" },
  { label: "Couple Rakhi", href: "/product-category/rakhi/couple-rakhi" },
  { label: "Silver Rakhi", href: "/product-category/rakhi/silver-rakhi" },
  { label: "Kids Rakhi", href: "/product-category/rakhi/kids-rakhi" },
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
    <footer className="bg-cream border-maroon-dark/20 mt-20 border-t">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:grid-cols-2 md:px-8 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <span className="font-heading text-maroon-dark text-xl font-semibold">{brand.name}</span>
          <p className="text-maroon-dark/80 max-w-xs text-sm">{brand.tagline}</p>
          <div className="border-maroon-dark/20 mt-2 aspect-video w-full max-w-xs overflow-hidden rounded-lg border">
            <iframe
              src={MAP_EMBED_SRC}
              title="Store location"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full border-0"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-heading text-maroon-dark text-sm font-semibold tracking-wide uppercase">
            Shop
          </h3>
          {shopLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-maroon-dark/80 hover:text-maroon-dark text-sm"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-heading text-maroon-dark text-sm font-semibold tracking-wide uppercase">
            Browse More
          </h3>
          {browseLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-maroon-dark/80 hover:text-maroon-dark text-sm"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-heading text-maroon-dark text-sm font-semibold tracking-wide uppercase">
            Connect
          </h3>

          <a
            href={`tel:${brand.storeAddress.phone}`}
            className="text-maroon-dark/80 hover:text-maroon-dark flex items-center gap-2 text-sm"
          >
            <span className="border-maroon-dark/20 flex size-8 shrink-0 items-center justify-center rounded-full border bg-white">
              <Phone className="size-4" />
            </span>
            +91 81405 55585
          </a>

          <div className="text-maroon-dark/80 flex items-start gap-2 text-sm">
            <span className="border-maroon-dark/20 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border bg-white">
              <MapPin className="size-4" />
            </span>
            <span>
              {brand.storeAddress.line1}, {brand.storeAddress.city}, {brand.storeAddress.state} -{" "}
              {brand.storeAddress.pincode}
            </span>
          </div>

          <div className="flex items-center gap-3 pl-10">
            <a
              href={brand.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="border-maroon-dark/20 hover:bg-maroon-dark/5 flex size-9 items-center justify-center rounded-full border bg-white transition-colors"
            >
              <SiInstagram className="size-4.5" color="#E4405F" />
            </a>
            <a
              href={brand.social.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="border-maroon-dark/20 hover:bg-maroon-dark/5 flex size-9 items-center justify-center rounded-full border bg-white transition-colors"
            >
              <SiWhatsapp className="size-4.5" color="#25D366" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-maroon-dark/20 text-maroon-dark/70 border-t py-5 text-center text-xs">
        © {new Date().getFullYear()} {brand.name}. All rights reserved.
      </div>
    </footer>
  );
}
