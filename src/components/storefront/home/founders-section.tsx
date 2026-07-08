import Image from "next/image";
import { SectionHeading } from "./featured-banners";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";

export type Founder = {
  name: string;
  role?: string;
  photo?: string;
  message?: string;
};

export function FoundersSection({ founders }: { founders: Founder[] }) {
  if (founders.length === 0) return null;

  return (
    <section className="bg-secondary/40 py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        <SectionHeading title="Our Message" />
        <RevealGroup className="flex flex-col gap-10">
          {founders.map((founder) => (
            <RevealItem
              key={founder.name}
              className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left"
            >
              {founder.photo && (
                <div className="bg-muted relative size-24 shrink-0 overflow-hidden rounded-full sm:size-28">
                  <Image src={founder.photo} alt={founder.name} fill className="object-cover" />
                </div>
              )}
              <div className="flex flex-col gap-2">
                {founder.message && (
                  <p className="font-heading text-foreground/90 text-lg leading-relaxed italic">
                    “{founder.message}”
                  </p>
                )}
                <p className="text-sm font-semibold">
                  {founder.name}
                  {founder.role && (
                    <span className="text-muted-foreground font-normal"> · {founder.role}</span>
                  )}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
