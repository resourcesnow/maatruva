"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export function CarouselArrow({
  direction,
  onClick,
  disabled,
  label,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="text-maroon hover:text-gold focus-visible:text-gold focus-visible:ring-gold flex shrink-0 items-center justify-center rounded-md p-2 transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-30 sm:p-2.5"
    >
      <Icon className="size-6 sm:size-7" strokeWidth={2.5} />
    </button>
  );
}
