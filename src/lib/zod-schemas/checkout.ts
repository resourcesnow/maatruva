import { z } from "zod";
import { addressSchema } from "./address";

export const checkoutSchema = z.object({
  guestEmail: z.string().email().optional(),
  shippingAddress: addressSchema,
  couponCode: z.string().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
