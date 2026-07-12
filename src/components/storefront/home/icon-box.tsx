import {
  Award,
  Sparkles,
  HeartHandshake,
  Truck,
  ShieldCheck,
  Heart,
  Gift,
  Star,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Award,
  Sparkles,
  HeartHandshake,
  Truck,
  ShieldCheck,
  Heart,
  Gift,
  Star,
};

export type IconBoxItem = {
  icon: string;
  title: string;
  text?: string;
};

export function IconBox({ icon, title, text }: IconBoxItem) {
  const Icon = ICONS[icon] ?? Sparkles;
  return (
    <div
      tabIndex={0}
      className="group bg-cream-light shadow-warm hover:bg-maroon hover:shadow-warm-lg focus-visible:bg-maroon focus-visible:shadow-warm-lg focus-visible:ring-gold focus-visible:ring-offset-cream relative flex h-80 flex-col overflow-hidden rounded-2xl transition-all duration-500 ease-out outline-none hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="bg-gold/15 text-gold group-hover:bg-cream-light/15 group-hover:text-cream-light group-focus-visible:bg-cream-light/15 group-focus-visible:text-cream-light mb-6 flex h-16 w-16 items-center justify-center rounded-full transition-all duration-500 ease-out group-hover:mb-3 group-hover:h-14 group-hover:w-14 group-focus-visible:mb-3 group-focus-visible:h-14 group-focus-visible:w-14">
          <Icon aria-hidden className="size-7" />
        </div>

        <h3 className="text-maroon group-hover:text-cream-light group-focus-visible:text-cream-light font-serif text-lg font-semibold transition-colors duration-500 ease-out">
          {title}
        </h3>

        <div className="grid grid-rows-[0fr] transition-all duration-500 ease-out group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr]">
          <div className="overflow-hidden">
            <p className="text-maroon-dark group-hover:text-cream-light group-focus-visible:text-cream-light mt-3 translate-y-3 font-sans text-sm opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
              {text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function IconBoxGrid({ items }: { items: IconBoxItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="bg-porcelain w-full pt-16 pb-4 md:pt-24 md:pb-6">
      <h2 className="text-maroon px-4 text-center font-serif text-3xl font-semibold sm:px-8 md:text-5xl">
        Why Choose Us
      </h2>

      <div className="mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 sm:px-8 md:mt-16 lg:grid-cols-4">
        {items.map((item) => (
          <IconBox key={item.title} {...item} />
        ))}
      </div>
    </section>
  );
}
