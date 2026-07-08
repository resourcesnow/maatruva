import { Sparkles, Truck, ShieldCheck, Heart, Gift, Star, type LucideIcon } from "lucide-react";
import { SectionHeading } from "./featured-banners";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";

const ICONS: Record<string, LucideIcon> = {
  Sparkles,
  Truck,
  ShieldCheck,
  Heart,
  Gift,
  Star,
};

export type WhyChooseUsItem = {
  icon: string;
  title: string;
  text?: string;
};

export function WhyChooseUsSection({ items }: { items: WhyChooseUsItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
      <SectionHeading title="Why Choose Us" />
      <RevealGroup className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = ICONS[item.icon] ?? Sparkles;
          return (
            <RevealItem key={item.title} className="flex flex-col items-center gap-3 text-center">
              <div className="bg-brand-accent/15 text-brand-secondary flex size-14 items-center justify-center rounded-full">
                <Icon className="size-6" />
              </div>
              <h3 className="font-heading text-base font-semibold">{item.title}</h3>
              {item.text && <p className="text-muted-foreground text-sm">{item.text}</p>}
            </RevealItem>
          );
        })}
      </RevealGroup>
    </section>
  );
}
