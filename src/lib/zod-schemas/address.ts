import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().min(1).default("Home"),
  line1: z.string().min(3, "Address line is required."),
  line2: z.string().optional().default(""),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State is required."),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode."),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Enter a valid phone number."),
  isDefault: z.boolean().optional().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;
