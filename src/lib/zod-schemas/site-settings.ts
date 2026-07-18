import { z } from "zod";

export const siteSettingsSchema = z.object({
  whatsappEnabled: z.coerce.boolean().default(false),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^$|^[1-9]\d{6,14}$/, "Enter digits only, with country code and no plus sign or spaces.")
    .default(""),
  whatsappMessage: z.string().trim().max(300).optional().default(""),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
