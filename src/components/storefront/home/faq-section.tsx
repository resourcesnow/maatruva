"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";

export type FaqItem = {
  question: string;
  answer: string;
};

function FaqAccordionItem({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const baseId = useId();
  const buttonId = `${baseId}-button`;
  const panelId = `${baseId}-panel`;

  return (
    <div className="border-gold/40 bg-cream-light shadow-warm rounded-xl border">
      <button
        id={buttonId}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-center gap-4 px-5 py-4 text-left"
      >
        <span className="bg-gold flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white">
          {index + 1}
        </span>
        <span className="text-maroon flex-1 font-sans text-base font-medium">{item.question}</span>
        <Plus
          aria-hidden
          className={`text-maroon size-5 shrink-0 transition-transform duration-300 ease-out ${
            isOpen ? "rotate-45" : ""
          }`}
        />
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid transition-all duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-maroon/80 pr-5 pb-4 pl-16 font-sans text-sm leading-relaxed">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FaqSection({ items }: { items: FaqItem[] }) {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set());

  if (items.length === 0) return null;

  function toggle(index: number) {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  const indexed = items.map((item, index) => ({ item, index }));
  const left = indexed.slice(0, 5);
  const right = indexed.slice(5);

  return (
    <section className="bg-porcelain w-full pt-4 pb-16 md:pt-6 md:pb-24">
      <h2 className="text-maroon px-4 text-center font-serif text-3xl font-semibold sm:px-8 md:text-5xl">
        FAQ&apos;s
      </h2>

      <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 px-6 md:mt-16 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          {left.map(({ item, index }) => (
            <FaqAccordionItem
              key={index}
              item={item}
              index={index}
              isOpen={openIndices.has(index)}
              onToggle={() => toggle(index)}
            />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          {right.map(({ item, index }) => (
            <FaqAccordionItem
              key={index}
              item={item}
              index={index}
              isOpen={openIndices.has(index)}
              onToggle={() => toggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
