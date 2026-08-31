import { z } from "zod";

export const signUpSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  email: z.email("Enter a vlaid email.").trim().min(1, "Email is required."),
  password: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters")
    .regex(/^[A-Z]/, "Password must start with an uppercase letter")
    .regex(/[0-9]/, "Password must include at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must include at least one special character",
    ),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.email("Enter a vlaid email.").trim().min(1, "Email is required."),
  password: z.string().min(1, "Password is required"),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

export const codeSchema = z.object({
  code: z.string().min(1, "Enter the verification code"),
});

export type CodeFormValue = z.infer<typeof codeSchema>;
