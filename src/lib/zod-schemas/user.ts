import { z } from "zod";

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["admin", "shop_manager", "customer"]),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name is required."),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{9,14}$/, "Enter a valid phone number.")
    .optional()
    .or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;
