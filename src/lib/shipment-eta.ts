// Shiprocket's tracking API returns EDD/ETD as a space-separated date-time string, e.g.
// "2026-07-22 20:00:00" — not ISO-8601, so Date can't parse it directly on all engines.
export function parseShiprocketEdd(edd: string | undefined): Date | undefined {
  if (!edd) return undefined;
  const isoLike = edd.trim().replace(" ", "T");
  const date = new Date(isoLike);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
