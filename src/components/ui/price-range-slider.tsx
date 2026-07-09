"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function PriceRangeSlider({
  min,
  max,
  defaultMin,
  defaultMax,
  minName = "minPrice",
  maxName = "maxPrice",
}: {
  min: number;
  max: number;
  defaultMin?: number;
  defaultMax?: number;
  minName?: string;
  maxName?: string;
}) {
  const [low, setLow] = React.useState(defaultMin ?? min);
  const [high, setHigh] = React.useState(defaultMax ?? max);

  function handleLowChange(value: number) {
    setLow(Math.min(value, high));
  }

  function handleHighChange(value: number) {
    setHigh(Math.max(value, low));
  }

  const lowPct = ((low - min) / (max - min || 1)) * 100;
  const highPct = ((high - min) / (max - min || 1)) * 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-5">
        <div className="bg-muted absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full" />
        <div
          className="bg-primary absolute top-1/2 h-1 -translate-y-1/2 rounded-full"
          style={{ left: `${lowPct}%`, right: `${100 - highPct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={low}
          onChange={(e) => handleLowChange(Number(e.target.value))}
          className={cn(
            "range-thumb pointer-events-none absolute inset-0 w-full appearance-none bg-transparent",
          )}
          aria-label="Minimum price"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={high}
          onChange={(e) => handleHighChange(Number(e.target.value))}
          className={cn(
            "range-thumb pointer-events-none absolute inset-0 w-full appearance-none bg-transparent",
          )}
          aria-label="Maximum price"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          name={minName}
          min={min}
          max={high}
          value={low}
          onChange={(e) => handleLowChange(Number(e.target.value))}
          className="border-border bg-background w-full rounded-md border px-2 py-1.5 text-sm"
        />
        <span className="text-muted-foreground">–</span>
        <input
          type="number"
          name={maxName}
          min={low}
          max={max}
          value={high}
          onChange={(e) => handleHighChange(Number(e.target.value))}
          className="border-border bg-background w-full rounded-md border px-2 py-1.5 text-sm"
        />
      </div>
    </div>
  );
}
