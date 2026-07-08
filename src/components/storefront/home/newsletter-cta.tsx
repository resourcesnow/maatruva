import { Camera, MessageCircle } from "lucide-react";
import { NewsletterForm } from "../newsletter-form";
import { Reveal } from "@/components/motion/reveal";
import { brand } from "@/lib/brand";

export function NewsletterCta() {
  return (
    <section className="bg-primary text-primary-foreground py-16">
      <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 text-center">
        <h2 className="font-heading text-3xl font-semibold md:text-4xl">Join the Family</h2>
        <p className="text-primary-foreground/80">
          Subscribe for festive offers, new launches and stories from our artisans.
        </p>
        <NewsletterForm />
        <div className="mt-2 flex items-center gap-4">
          <a
            href={brand.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="border-primary-foreground/30 hover:bg-primary-foreground/10 flex size-9 items-center justify-center rounded-full border"
          >
            <Camera className="size-4" />
          </a>
          <a
            href={brand.social.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="border-primary-foreground/30 hover:bg-primary-foreground/10 flex size-9 items-center justify-center rounded-full border"
          >
            <MessageCircle className="size-4" />
          </a>
        </div>
      </Reveal>
    </section>
  );
}
