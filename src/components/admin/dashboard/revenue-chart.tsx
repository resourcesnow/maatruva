"use client";

import { useMemo, useRef, useState } from "react";
import { formatINR } from "@/lib/format";

type Point = { date: string; revenue: number };

const WIDTH = 720;
const HEIGHT = 220;
const PAD_LEFT = 56;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;

export function RevenueChart({ data }: { data: Point[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { points, yTicks } = useMemo(() => {
    const max = Math.max(1, ...data.map((d) => d.revenue));
    const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
    const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
    const step = data.length > 1 ? plotWidth / (data.length - 1) : 0;

    const pts = data.map((d, i) => ({
      x: PAD_LEFT + step * i,
      y: PAD_TOP + plotHeight - (d.revenue / max) * plotHeight,
      ...d,
    }));

    const ticks = [0, 0.5, 1].map((f) => Math.round(max * f));

    return { points: pts, yTicks: ticks };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="text-muted-foreground flex h-56 items-center justify-center text-sm">
        No revenue data yet.
      </div>
    );
  }

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${HEIGHT - PAD_BOTTOM} L ${points[0].x} ${HEIGHT - PAD_BOTTOM} Z`;

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * WIDTH;
    let closest = 0;
    let minDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - x);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setHoverIndex(closest);
  }

  const hovered = hoverIndex != null ? points[hoverIndex] : null;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Revenue over time"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((tick, i) => {
          const y = PAD_TOP + (HEIGHT - PAD_TOP - PAD_BOTTOM) * (1 - i / (yTicks.length - 1));
          return (
            <g key={i}>
              <line
                x1={PAD_LEFT}
                x2={WIDTH - PAD_RIGHT}
                y1={y}
                y2={y}
                stroke="var(--border)"
                strokeWidth={1}
              />
              <text
                x={PAD_LEFT - 8}
                y={y + 4}
                textAnchor="end"
                fontSize={10}
                fill="var(--muted-foreground)"
              >
                {formatINR(tick)}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#revenue-fill)" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {[0, points.length - 1].map((i) => (
          <text
            key={i}
            x={points[i].x}
            y={HEIGHT - 8}
            textAnchor={i === 0 ? "start" : "end"}
            fontSize={10}
            fill="var(--muted-foreground)"
          >
            {new Date(points[i].date).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              timeZone: "Asia/Kolkata",
            })}
          </text>
        ))}

        {hovered && (
          <g>
            <line
              x1={hovered.x}
              x2={hovered.x}
              y1={PAD_TOP}
              y2={HEIGHT - PAD_BOTTOM}
              stroke="var(--border)"
              strokeWidth={1}
            />
            <circle
              cx={hovered.x}
              cy={hovered.y}
              r={4}
              fill="var(--primary)"
              stroke="var(--background)"
              strokeWidth={2}
            />
          </g>
        )}
      </svg>

      {hovered && (
        <div
          className="border-border bg-popover pointer-events-none absolute top-2 rounded-md border px-2.5 py-1.5 text-xs shadow-md"
          style={{ left: `${(hovered.x / WIDTH) * 100}%`, transform: "translateX(-50%)" }}
        >
          <p className="font-medium">{formatINR(hovered.revenue)}</p>
          <p className="text-muted-foreground">
            {new Date(hovered.date).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              timeZone: "Asia/Kolkata",
            })}
          </p>
        </div>
      )}
    </div>
  );
}
