import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: "Enter your email address" })
  .email({ message: "That doesn't look like an email address" })
  .max(254, { message: "That email address is too long" });

// spring-iam requires at least 8 characters.
export const passwordSchema = z
  .string()
  .min(8, { message: "Use at least 8 characters" })
  .max(128, { message: "Use 128 characters or fewer" });

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Enter your password" }).max(128),
});

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Enter your name" })
    .max(150, { message: "Use 150 characters or fewer" }),
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({ password: passwordSchema, confirm: z.string() })
  .refine((v) => v.password === v.confirm, {
    message: "The passwords don't match",
    path: ["confirm"],
  });

export const codeFormSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, { message: "Enter the 6-digit code" }),
});

/** spring-iam recovery codes: 16 hex characters, dash-grouped (a1b2c3d4-e5f60718). */
export const recoveryFormSchema = z.object({
  code: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[0-9a-f]{8}-?[0-9a-f]{8}$/, {
      message: "Enter a recovery code like a1b2c3d4-e5f60718",
    }),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type CodeValues = z.infer<typeof codeFormSchema>;

export type Strength = { score: 0 | 1 | 2 | 3 | 4; label: string };

/**
 * A rough, honest hint, not a guarantee: length matters most, character
 * variety a little. ponytail: swap in zxcvbn if real entropy estimates matter.
 */
export function passwordStrength(value: string): Strength {
  if (!value) return { score: 0, label: "" };
  if (value.length < 8) return { score: 1, label: "Too short" };
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(value)).length;
  let score = 2;
  if (value.length >= 12) score++;
  if (value.length >= 16 || (value.length >= 12 && classes >= 3)) score++;
  if (classes <= 1 && value.length < 16) score = Math.min(score, 2);
  const s = Math.min(score, 4) as Strength["score"];
  return { score: s, label: ["", "Too short", "Fair", "Good", "Strong"][s] };
}
