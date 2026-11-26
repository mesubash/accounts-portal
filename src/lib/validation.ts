import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: "Enter your email address" })
  .email({ message: "That doesn't look like an email address" })
  .max(254, { message: "That email address is too long" });

export const passwordSchema = z
  .string()
  .min(8, { message: "Use at least 8 characters" })
  .max(128, { message: "That password is too long" });

export const codeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, { message: "Enter the 6-digit code" });

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Enter your password" }).max(128),
});

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Enter your full name" })
    .max(100, { message: "That name is too long" }),
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z.object({ password: passwordSchema });

export const codeFormSchema = z.object({ code: codeSchema });

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type CodeValues = z.infer<typeof codeFormSchema>;

/** Very simple, honest strength hint. */
export function passwordStrength(value: string): { score: 0 | 1 | 2 | 3; label: string } {
  if (!value) return { score: 0, label: "" };
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[^A-Za-z]/.test(value) && /[A-Za-z]/.test(value)) score++;
  const clamped = Math.min(score, 3) as 0 | 1 | 2 | 3;
  return { score: clamped, label: ["Too short", "Weak", "Okay", "Strong"][clamped] };
}
