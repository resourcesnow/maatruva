import { z } from "zod";

export const couponSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  type: z.enum(["flat", "percent"]),
  value: z.coerce.number().positive(),
  minOrder: z.coerce.number().min(0).default(0),
  maxDiscount: z.coerce.number().positive().nullable().optional(),
  startsAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
  usageLimit: z.coerce.number().int().positive().nullable().optional(),
  isActive: z.boolean().default(true),
});

export type CouponInput = z.infer<typeof couponSchema>;
