import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
  .regex(/[0-9]/, "Password must contain at least one number.");

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const verifyEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  code: z.string().length(6, "Enter the 6-digit code."),
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});
