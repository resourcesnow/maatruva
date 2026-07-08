import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "./featured-banners";
import { Reveal } from "@/components/motion/reveal";

export type FaqItem = { q: string; a: string };

export function FaqSection({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
      <SectionHeading title="Frequently Asked Questions" />
      <Reveal>
        <Accordion className="w-full">
          {items.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  );
}
